const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const cleanAccount = v => String(v || '').trim().toLowerCase();
const validAccount = a => /^[a-zA-Z0-9_-]{3,32}$/.test(a);
const validPassword = p => typeof p === 'string' && p.length >= 6 && p.length <= 128;

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function randomHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return bytesToHex(a);
}
async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : new Uint8Array(16);
  if (!saltHex) crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return { salt: bytesToHex(salt), hash: bytesToHex(new Uint8Array(bits)) };
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}
async function verifyPassword(password, salt, expected) {
  const hp = await hashPassword(password, salt);
  return safeEqual(hp.hash, expected);
}
function publicUser(u) { return { id: u.id, account: u.account, createdAt: u.createdAt }; }
function requestMeta(req, device = {}) {
  const cf = req.cf || {};
  const forwarded = req.headers.get('CF-Connecting-IP') || req.headers.get('x-forwarded-for') || '';
  return {
    ip: String(forwarded).split(',')[0].trim().slice(0, 100),
    userAgent: String(req.headers.get('user-agent') || device.userAgent || '').slice(0, 1000),
    platform: String(device.platform || '').slice(0, 200),
    language: String(device.language || '').slice(0, 50),
    languages: Array.isArray(device.languages) ? device.languages.slice(0, 8) : [],
    timezone: String(device.timezone || '').slice(0, 100),
    country: String(cf.country || '').slice(0, 20),
    countryName: String(cf.country || '').slice(0, 20),
    city: String(cf.city || '').slice(0, 100),
    subdivision: String(cf.region || '').slice(0, 100),
    screenWidth: Number(device.screenWidth) || 0,
    screenHeight: Number(device.screenHeight) || 0,
    colorDepth: Number(device.colorDepth) || 0,
    viewportWidth: Number(device.viewportWidth) || 0,
    viewportHeight: Number(device.viewportHeight) || 0,
    deviceMemory: Number(device.deviceMemory) || 0,
    hardwareConcurrency: Number(device.hardwareConcurrency) || 0,
    maxTouchPoints: Number(device.maxTouchPoints) || 0,
    cookieEnabled: !!device.cookieEnabled,
    referrer: String(device.referrer || req.headers.get('referer') || '').slice(0, 1000)
  };
}
function bearer(req) {
  const h = req.headers.get('authorization') || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

export class AuthStore {
  constructor(state, env) { this.state = state; this.env = env; }
  async fetch(request) {
    return this.state.blockConcurrencyWhile(async () => {
      const url = new URL(request.url);
      const path = url.pathname;
      try {
        if (request.method === 'POST' && path === '/register') {
          const body = await request.json();
          const account = cleanAccount(body.account);
          const password = String(body.password || '');
          if (!validAccount(account)) return json({ ok:false, message:'账号只能使用3～32位字母、数字、下划线或短横线' },400);
          if (!validPassword(password)) return json({ ok:false, message:'密码至少6位' },400);
          if (await this.state.storage.get('acct:' + account)) return json({ ok:false, message:'账号已存在，请直接登录' },409);
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          const meta = requestMeta(request, body.device || {});
          const hp = await hashPassword(password);
          const user = { id, account, createdAt:now, lastLoginAt:now, passwordHash:hp.hash, passwordSalt:hp.salt, registration:{...meta,at:now}, lastLogin:{...meta,at:now} };
          await this.state.storage.put('acct:' + account, id);
          await this.state.storage.put('user:' + id, user);
          const token = randomHex(32);
          await this.state.storage.put('session:' + token, { userId:id, expiresAt:Date.now()+30*24*60*60*1000 });
          return json({ok:true, token, user:publicUser(user)});
        }
        if (request.method === 'POST' && path === '/login') {
          const body = await request.json();
          const account = cleanAccount(body.account);
          const password = String(body.password || '');
          if (!validAccount(account) || !validPassword(password)) return json({ok:false,message:'账号或密码错误'},401);
          const id = await this.state.storage.get('acct:' + account);
          if (!id) return json({ok:false,message:'账号或密码错误'},401);
          const user = await this.state.storage.get('user:' + id);
          if (!user || !(await verifyPassword(password,user.passwordSalt,user.passwordHash))) return json({ok:false,message:'账号或密码错误'},401);
          const now = new Date().toISOString();
          user.lastLoginAt = now;
          user.lastLogin = {...requestMeta(request,body.device || {}),at:now};
          await this.state.storage.put('user:' + id,user);
          const token = randomHex(32);
          await this.state.storage.put('session:' + token,{userId:id,expiresAt:Date.now()+30*24*60*60*1000});
          return json({ok:true,token,user:publicUser(user)});
        }
        if (request.method === 'GET' && path === '/me') {
          const session = await this.state.storage.get('session:' + bearer(request));
          if (!session || !session.userId || Date.now() > Number(session.expiresAt || 0)) return json({ok:false,message:'未登录'},401);
          const user = await this.state.storage.get('user:' + session.userId);
          if (!user) return json({ok:false,message:'账号不存在'},401);
          return json({ok:true,user:publicUser(user)});
        }
        if (request.method === 'GET' && path === '/admin/users') {
          const expected = String(this.env.ADMIN_TOKEN || '');
          if (!expected || bearer(request) !== expected) return json({ok:false,message:'无权限'},401);
          const users = [];
          const listed = await this.state.storage.list({prefix:'user:'});
          for (const [, u] of listed) {
            if (u && u.account) users.push({id:u.id,account:u.account,createdAt:u.createdAt,lastLoginAt:u.lastLoginAt,registration:u.registration||{},lastLogin:u.lastLogin||{}});
          }
          users.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
          return json({ok:true,total:users.length,users});
        }
        return json({ok:false,message:'Not Found'},404);
      } catch (e) {
        console.error(e);
        return json({ok:false,message:e?.message || '服务器错误'},500);
      }
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/auth/') || url.pathname === '/api/admin/users') {
      const stub = env.AUTH_STORE.get(env.AUTH_STORE.idFromName('global'));
      const internal = new URL(request.url);
      if (url.pathname === '/api/auth/register') internal.pathname = '/register';
      else if (url.pathname === '/api/auth/login') internal.pathname = '/login';
      else if (url.pathname === '/api/auth/me') internal.pathname = '/me';
      else if (url.pathname === '/api/admin/users') internal.pathname = '/admin/users';
      return stub.fetch(new Request(internal, request));
    }
    return env.ASSETS.fetch(request);
  }
};

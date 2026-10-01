(function(){
  'use strict';
  var TOKEN_KEY='qd_auth_token';
  var overlay=document.getElementById('authGate');
  var app=document.getElementById('app');
  if(!overlay){return;}
  document.documentElement.classList.add('auth-required');
  var tabRegister=document.getElementById('authTabRegister');
  var tabLogin=document.getElementById('authTabLogin');
  var title=document.getElementById('authTitle');
  var submit=document.getElementById('authSubmit');
  var account=document.getElementById('authAccount');
  var password=document.getElementById('authPassword');
  var msg=document.getElementById('authMsg');
  var mode='register';
  function showMsg(t,ok){msg.textContent=t||'';msg.className='auth-msg'+(ok?' ok':'');}
  function setMode(next){
    mode=next;
    tabRegister.classList.toggle('active',mode==='register');
    tabLogin.classList.toggle('active',mode==='login');
    title.textContent=mode==='register'?'注册问鼎国际娱乐':'登录问鼎国际娱乐';
    submit.textContent=mode==='register'?'注册并进入':'登录并进入';
    password.autocomplete=mode==='register'?'new-password':'current-password';
    showMsg('');
  }
  tabRegister.onclick=function(){setMode('register');};
  tabLogin.onclick=function(){setMode('login');};
  async function callApi(path,payload){
    var r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    var data={}; try{data=await r.json();}catch(e){}
    if(!r.ok||data.ok===false)throw new Error(data.message||'请求失败');
    return data;
  }
  function deviceInfo(){
    var n=navigator||{};
    var s=screen||{};
    return {
      userAgent:String(n.userAgent||'').slice(0,1000),
      platform:String(n.platform||'').slice(0,200),
      language:String(n.language||'').slice(0,50),
      languages:Array.isArray(n.languages)?n.languages.slice(0,8).map(String):[],
      timezone:(Intl.DateTimeFormat().resolvedOptions().timeZone||'').slice(0,100),
      screenWidth:Number(s.width)||0,
      screenHeight:Number(s.height)||0,
      colorDepth:Number(s.colorDepth)||0,
      viewportWidth:Number(window.innerWidth)||0,
      viewportHeight:Number(window.innerHeight)||0,
      deviceMemory:Number(n.deviceMemory)||0,
      hardwareConcurrency:Number(n.hardwareConcurrency)||0,
      maxTouchPoints:Number(n.maxTouchPoints)||0,
      cookieEnabled:!!n.cookieEnabled,
      online:!!n.onLine,
      referrer:String(document.referrer||'').slice(0,1000)
    };
  }
  async function enter(data){
    localStorage.setItem(TOKEN_KEY,data.token);
    overlay.style.display='none';
    document.documentElement.classList.remove('auth-required');
    window.dispatchEvent(new CustomEvent('qd-auth-ready',{detail:data.user||null}));
  }
  submit.onclick=async function(){
    var a=String(account.value||'').trim();
    var p=String(password.value||'');
    if(!a||!p){showMsg('请输入账号和密码');return;}
    if(mode==='register' && (a.length<3||a.length>32)){showMsg('账号长度需为 3～32 个字符');return;}
    if(mode==='register' && p.length<6){showMsg('密码至少 6 位');return;}
    submit.disabled=true;showMsg('正在处理…');
    try{
      var path=mode==='register'?'/api/auth/register':'/api/auth/login';
      var data=await callApi(path,{account:a,password:p,device:deviceInfo()});
      await enter(data);
    }catch(e){showMsg(e.message||'操作失败');}
    finally{submit.disabled=false;}
  };
  password.addEventListener('keydown',function(e){if(e.key==='Enter')submit.click();});
  account.addEventListener('keydown',function(e){if(e.key==='Enter')password.focus();});
  (async function restore(){
    var token=localStorage.getItem(TOKEN_KEY);
    if(!token){return;}
    try{
      var r=await fetch('/api/auth/me',{headers:{Authorization:'Bearer '+token}});
      var data=await r.json();
      if(r.ok&&data.ok){await enter(data);}
      else{localStorage.removeItem(TOKEN_KEY);}
    }catch(e){
      showMsg('请注册或登录');
    }
  })();
})();

// ================================================================
// 【工具函数】
// ================================================================
function $(id){return document.getElementById(id);}
function setText(el,t){if(el&&el.textContent!==String(t))el.textContent=String(t);}
function padZero(n,len){var s=String(n);while(s.length<len)s='0'+s;return s;}

      function shuffle(a){var x=a.slice();for(var i=x.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var
      t=x[i];x[i]=x[j];x[j]=t;}return x;}
    
function vibrate(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}

      function fmtTime(ts){var d=new Date(ts);return padZero(d.getMonth()+1,2)+'-'+padZero(d.getDate(),2)+' '+padZero(d.getHours(),2)+':'+padZero(d.getMinutes(),2);}
    

      function todayStr(){var d=new Date();return
      d.getFullYear()+'-'+padZero(d.getMonth()+1,2)+'-'+padZero(d.getDate(),2);}
    

      function fmtMoney(n){return Number(n).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2});}
    
function maskId(id){
var s=String(id);
if(s.length<=2)return s.charAt(0)+'*';
return s.charAt(0)+'***'+s.charAt(s.length-1);
}
function maskName(name){
if(!name)return '***';
if(name.length<=2)return name.charAt(0)+'*';
if(name.length<=4)return name.charAt(0)+'**'+name.charAt(name.length-1);
return name.charAt(0)+'***'+name.charAt(name.length-1);
}
function getWeekRange(weekOffset){
var now=new Date();
var day=now.getDay()||7;
var monday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-day+1+weekOffset*7);
var sunday=new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+6);
monday.setHours(0,0,0,0);
sunday.setHours(23,59,59,999);
return [monday.getTime(),sunday.getTime()];
}
function inLastTwoWeeks(ts){
var range=getWeekRange(-1);
return ts>=range[0];
}
// 生成期号 20261001-A3K9
function genRoundNo(){
var d=new Date();
var dateStr=d.getFullYear()+padZero(d.getMonth()+1,2)+padZero(d.getDate(),2);
var chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
var suffix='';
for(var i=0;i<4;i++)suffix+=chars.charAt(Math.floor(Math.random()*chars.length));
return dateStr+'-'+suffix;
}

// ================================================================
// 【Api 层】所有后台接口统一走这里
// ================================================================
var Api={
baseUrl:'/api/v1',
async:function(path,data){return this.request('POST',path,data);},
get:function(path,data){return this.request('GET',path,data);},
request:function(method,path,data){
console.log('[Api]',method,path,data);
return Promise.resolve({code:0,data:null,msg:'接口未接入'});
},
// 用户
userInfo:function(){return Api.get('/user/info');},
updateProfile:function(d){return Api.async('/user/update',d);},
realNameAuth:function(d){return Api.async('/user/realname',d);},
// 资金
balance:function(){return Api.get('/user/balance');},
fundLog:function(p){return Api.get('/fund/log',p);},
recharge:function(d){return Api.async('/fund/recharge',d);},
withdraw:function(d){return Api.async('/fund/withdraw',d);},
withdrawConfirm:function(d){return Api.async('/fund/withdraw/confirm',d);},
// 订单
rechargeOrder:function(d){return Api.async('/order/recharge',d);},
withdrawOrder:function(d){return Api.async('/order/withdraw',d);},
orderDetail:function(id){return Api.get('/order/detail',{id:id});},
orderCancel:function(id){return Api.async('/order/cancel',{id:id});},
// 通道
channels:function(){return Api.get('/pay/channels');},
rechargeNotice:function(){return Api.get('/pay/notice');},
exchangeRate:function(){return Api.get('/pay/rate');},
// 签到
signInfo:function(){return Api.get('/sign/info');},
signDo:function(){return Api.async('/sign/do');},
signBonus88:function(){return Api.async('/sign/bonus88');},
// 活动
activityList:function(){return Api.get('/activity/list');},
activityClaim:function(id){return Api.async('/activity/claim',{id:id});},
// VIP
vipInfo:function(){return Api.get('/vip/info');},
vipRebate:function(){return Api.get('/vip/rebate');}, // 反水记录
vipUpgrade:function(){return Api.async('/vip/upgrade');},
// 排行榜
rankList:function(type){return Api.get('/rank/list',{type:type});},
// 公告
announcementList:function(){return Api.get('/announcement/list');},
announcementLatest:function(){return Api.get('/announcement/latest');},
announcementRead:function(id){return Api.async('/announcement/read',{id:id});},
// 消息
messageList:function(){return Api.get('/message/list');},
messageRead:function(id){return Api.async('/message/read',{id:id});},
// 邀请
inviteInfo:function(){return Api.get('/invite/info');},
inviteLink:function(){return Api.get('/invite/link');},
inviteSub:function(){return Api.get('/invite/sub');},
// 统计
stats:function(p){return Api.get('/stats/summary',p);},
betsLog:function(p){return Api.get('/stats/bets',p);},
// 彩金
newbieClaim:function(){return Api.async('/newbie/claim');},
// 转盘
wheelConfig:function(){return Api.get('/wheel/config');},
wheelSpin:function(){return Api.async('/wheel/spin');},
// 风控（后台自动检测）
riskCheck:function(d){return Api.async('/risk/check',d);},
// 对冲/违规
violationReport:function(d){return Api.async('/risk/violation',d);},
// 报警
alertAdmin:function(d){return Api.async('/alert/admin',d);}
};

// ================================================================
// 【常量】
// ================================================================
var ROUND_SECONDS=60, START_COINS=0, DRAW_DELAY=900, NEXT_DELAY=3000, LOCK_BEFORE=10;
var MAX_BET=5000, MAX_BET_WARN=3000, MAX_PER_ROUND=50000, MAX_PER_MODE=10000;
var STORAGE_KEY='animal_3d_v4', HISTORY_LIMIT=100;

// 赔率调整
var ODDS={
animal:33, // 35 → 33
size:1.95, // 1.98 → 1.95
oddeven:1.95, // 1.98 → 1.95
tail:8.5 // 9.8 → 8.5
};

var PLAY_MODES=[
{key:'animal',label:'动物',emoji:'🐾',icon:'🐾'},
{key:'size',label:'大小',emoji:'⚖️',icon:'⚖️'},
{key:'oddeven',label:'单双',emoji:'🎲',icon:'🎲'},
{key:'tail',label:'尾数',emoji:'🔢',icon:'🔢'}
];


      var ANIMALS=[[1,'🦆','鹭鸶','assets/animals/01_鹭鸶.png'],[2,'🐱','家猫','assets/animals/02_家猫.png'],[3,'🐝','蜂子','assets/animals/03_蜂子.png'],[4,'🐭','老鼠','assets/animals/04_老鼠.png'],[5,'🐈','野猫','assets/animals/05_野猫.png'],[6,'🐴','马','assets/animals/06_马.png'],[7,'🐘','大象','assets/animals/07_大象.png'],[8,'🐶','狗','assets/animals/08_狗.png'],[9,'🐲','飞龙','assets/animals/09_飞龙.png'],[10,'🐮','牛','assets/animals/10_牛.png'],[11,'🐷','猪','assets/animals/11_猪.png'],[12,'🐰','兔子','assets/animals/12_兔子.png'],[13,'🐯','老虎','assets/animals/13_老虎.png'],[14,'🪱','蚯蚓','assets/animals/14_蚯蚓.png'],[15,'🦚','孔雀','assets/animals/15_孔雀.png'],[16,'🦢','鹅','assets/animals/16_鹅.png'],[17,'🐌','螺蛳','assets/animals/17_螺蛳.png'],[18,'🐟','白鱼','assets/animals/18_白鱼.png'],[19,'🧘‍♀️','尼姑','assets/animals/19_尼姑.png'],[20,'🐠','金鱼','assets/animals/20_金鱼.png'],[21,'🐍','黄鳝','assets/animals/21_黄鳝.png'],[22,'🐔','鸡','assets/animals/22_鸡.png'],[23,'🐢','乌龟','assets/animals/23_乌龟.png'],[24,'🐑','羊','assets/animals/24_羊.png'],[25,'🕷️','蜘蛛','assets/animals/25_蜘蛛.png'],[26,'🦌','马鹿','assets/animals/26_马鹿.png'],[27,'🦀','螃蟹','assets/animals/27_螃蟹.png'],[28,'🐍','蛇','assets/animals/28_蛇.png'],[29,'🐦','红鸟','assets/animals/29_红鸟.png'],[30,'🕊️','鸽子','assets/animals/30_鸽子.png'],[31,'💎','宝石','assets/animals/31_宝石.png'],[32,'🦋','蝴蝶','assets/animals/32_蝴蝶.png'],[33,'🐸','青蛙','assets/animals/33_青蛙.png'],[34,'🐦‍⬛','乌鸦','assets/animals/34_乌鸦.png'],[35,'🐒','猴子','assets/animals/35_猴子.png'],[36,'🐉','金龙','assets/animals/36_金龙.png']];
    
var byId={};ANIMALS.forEach(function(a){byId[a[0]]={id:a[0],emoji:a[1],name:a[2],image:a[3]};});

// VIP 表（不累积）
var VIP_RULES=[

      {level:0, upRecharge:0, upFlow:0, keepFlow:0, withdrawTimes:3, singleLimit:1000, platformRebate:0.1,
      selfRebate:1.0},
    

      {level:1, upRecharge:500, upFlow:600, keepFlow:3000, withdrawTimes:3, singleLimit:5000, platformRebate:0.2,
      selfRebate:1.0},
    

      {level:2, upRecharge:1000,upFlow:1500, keepFlow:6000, withdrawTimes:5, singleLimit:10000, platformRebate:0.3,
      selfRebate:1.2},
    

      {level:3, upRecharge:2000,upFlow:3000, keepFlow:15000, withdrawTimes:5, singleLimit:20000, platformRebate:0.4,
      selfRebate:1.4},
    

      {level:4, upRecharge:5000,upFlow:8000, keepFlow:40000, withdrawTimes:8, singleLimit:50000, platformRebate:0.5,
      selfRebate:1.5},
    

      {level:5, upRecharge:10000,upFlow:15000, keepFlow:80000, withdrawTimes:8, singleLimit:100000, platformRebate:0.6,
      selfRebate:1.6},
    

      {level:6, upRecharge:20000,upFlow:30000, keepFlow:150000, withdrawTimes:10, singleLimit:200000,
      platformRebate:0.7, selfRebate:1.8},
    

      {level:7, upRecharge:50000,upFlow:80000, keepFlow:400000, withdrawTimes:10, singleLimit:500000,
      platformRebate:0.8, selfRebate:2.0},
    

      {level:8, upRecharge:100000,upFlow:150000,keepFlow:800000, withdrawTimes:15, singleLimit:500000,
      platformRebate:0.9, selfRebate:2.2},
    

      {level:9, upRecharge:200000,upFlow:300000,keepFlow:1500000,withdrawTimes:15, singleLimit:800000,
      platformRebate:1.0, selfRebate:2.4},
    

      {level:10,upRecharge:500000,upFlow:800000,keepFlow:4000000,withdrawTimes:20, singleLimit:1000000,
      platformRebate:1.2, selfRebate:2.5}
    
];

// ================================================================
// 【Storage】完整持久化
// ================================================================
var Storage={
save:function(){
try{
var d={
coins:state.coins,
round:state.round,
roundNo:state.roundNo,
phase:state.phase,
timeLeft:state.timeLeft,
phaseStartTs:state.phaseStartTs,
bets:state.bets,
playerMarked:playerMarked,
winId:state.winId,
lastWinId:state.lastWinId,
lastWinEmoji:state.lastWinEmoji,
soundOn:state.soundOn,
history:state.history.slice(0,HISTORY_LIMIT),
myBets:state.myBets.slice(0,HISTORY_LIMIT),
favorites:state.favorites,
consecutiveSigns:state.consecutiveSigns,
lastSignDate:state.lastSignDate,
bonus88ClaimedDate:state.bonus88ClaimedDate,
todayRecharge:state.todayRecharge,
todayFlow:state.todayFlow,
todayNetFlow:state.todayNetFlow,
realName:state.realName,
userInfo:state.userInfo,
nickChanged:state.nickChanged,
fundLog:state.fundLog.slice(0,200),
// VIP
vipLevel:state.vipLevel,
vipUpgradeDate:state.vipUpgradeDate,
vipPeriodStart:state.vipPeriodStart,
vipPeriodFlow:state.vipPeriodFlow,
vipLevelRecharge:state.vipLevelRecharge,
vipLevelFlow:state.vipLevelFlow,
// 反水
pendingRebate:state.pendingRebate,
rebateClaimed:state.rebateClaimed,
// 风控
violations:state.violations,
frozen:state.frozen
};
localStorage.setItem(STORAGE_KEY,JSON.stringify(d));
}catch(e){console.error('[Storage.save]',e);}
},
load:function(){
try{
var raw=localStorage.getItem(STORAGE_KEY);
if(!raw)return null;
var d=JSON.parse(raw);
if(typeof d.coins!=='number'||d.coins<0)return null;
return d;
}catch(e){console.error('[Storage.load]',e);return null;}
}
};

var saved=null;
try{saved=Storage.load();}catch(e){}

// ================================================================
// 【State】
// ================================================================
var state={
coins:saved?saved.coins:START_COINS,
round:saved?saved.round:0,
roundNo:saved?saved.roundNo:genRoundNo(),
phase:saved?saved.phase:'idle',
timeLeft:saved?saved.timeLeft:ROUND_SECONDS,
phaseStartTs:saved?saved.phaseStartTs:0,
chip:1,
playMode:'animal',
bets:saved&&saved.bets?saved.bets:{animal:{},size:{},oddeven:{},tail:{}},
winId:saved?saved.winId:null,
lastWinId:saved?saved.lastWinId:null,
lastWinEmoji:saved?saved.lastWinEmoji:null,
start5sBetCount:0,
end5sBetCount:0,
soundOn:false, // 默认关闭
isLocked:false,
history:(saved&&saved.history)?saved.history:[],
myBets:(saved&&saved.myBets)?saved.myBets:[],
favorites:(saved&&saved.favorites)?saved.favorites:[],
consecutiveSigns:saved?(saved.consecutiveSigns||0):0,
lastSignDate:saved?saved.lastSignDate:null,
bonus88ClaimedDate:saved?saved.bonus88ClaimedDate:null,
todayRecharge:saved?(saved.todayRecharge||0):0,
todayFlow:saved?(saved.todayFlow||0):0,
todayNetFlow:saved?(saved.todayNetFlow||0):0,
realName:saved?saved.realName:null,
userInfo:(saved&&saved.userInfo)?saved.userInfo:{nickname:'玩家8888',avatar:'🦄'},
nickChanged:saved?saved.nickChanged:false,
fundLog:(saved&&saved.fundLog)?saved.fundLog:[],
// VIP
vipLevel:saved?(saved.vipLevel||0):0,
vipUpgradeDate:saved?saved.vipUpgradeDate:null,
vipPeriodStart:saved?saved.vipPeriodStart:null,
vipPeriodFlow:saved?(saved.vipPeriodFlow||0):0,
vipLevelRecharge:saved?(saved.vipLevelRecharge||0):0,
vipLevelFlow:saved?(saved.vipLevelFlow||0):0,
// 反水
pendingRebate:saved?(saved.pendingRebate||0):0,
rebateClaimed:saved?(saved.rebateClaimed||0):0,
// 风控
violations:(saved&&saved.violations)?saved.violations:[],
frozen:saved?saved.frozen:false
};


      var fakeStats={}, playerMarked=(saved&&saved.playerMarked)?saved.playerMarked:{}, hotAnimals=[],
      fakeTimer=null, mainTimer=null, drawTimer=null, nextRoundTimer=null, toastTimer=null, lastBetTime=0, cellEls={};
    

// 当前期的对压标记
var roundHedgeFlags={big:false,small:false,odd:false,even:false,tailKeys:{}};

// ================================================================
// 【Audio】
// ================================================================
var AudioCtx={
ctx:null,
init:function(){
if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){this.ctx=null;}}
if(this.ctx&&this.ctx.state==='suspended'){try{this.ctx.resume();}catch(e){}}
},
play:function(type){
if(!this.ctx||!state.soundOn)return;
try{
var now=this.ctx.currentTime;
if(type==='coin'){
var o1=this.ctx.createOscillator(),g1=this.ctx.createGain();
o1.connect(g1);g1.connect(this.ctx.destination);
o1.type='sine';o1.frequency.setValueAtTime(880,now);
g1.gain.setValueAtTime(0,now);
g1.gain.linearRampToValueAtTime(0.15,now+0.01);
g1.gain.exponentialRampToValueAtTime(0.001,now+0.08);
o1.start(now);o1.stop(now+0.1);
}else if(type==='tick'){
var o3=this.ctx.createOscillator(),g3=this.ctx.createGain();
o3.connect(g3);g3.connect(this.ctx.destination);
o3.type='square';o3.frequency.setValueAtTime(800,now);
g3.gain.setValueAtTime(0,now);
g3.gain.linearRampToValueAtTime(0.14,now+0.002);
g3.gain.exponentialRampToValueAtTime(0.001,now+0.03);
o3.start(now);o3.stop(now+0.04);
}else if(type==='lock'){
var o4=this.ctx.createOscillator(),g4=this.ctx.createGain();
o4.connect(g4);g4.connect(this.ctx.destination);
o4.type='sawtooth';o4.frequency.setValueAtTime(440,now);
o4.frequency.exponentialRampToValueAtTime(220,now+0.2);
g4.gain.setValueAtTime(0,now);
g4.gain.linearRampToValueAtTime(0.18,now+0.02);
g4.gain.exponentialRampToValueAtTime(0.001,now+0.25);
o4.start(now);o4.stop(now+0.3);
}else if(type==='win'){
var notes=[523,659,784];
for(var i=0;i<notes.length;i++){
var o=this.ctx.createOscillator(),g=this.ctx.createGain();
o.connect(g);g.connect(this.ctx.destination);
o.type='sine';
var t=now+i*0.1;
o.frequency.setValueAtTime(notes[i],t);
g.gain.setValueAtTime(0,t);
g.gain.linearRampToValueAtTime(0.2,t+0.02);
g.gain.exponentialRampToValueAtTime(0.001,t+0.3);
o.start(t);o.stop(t+0.35);
}
}
}catch(e){}
}
};

// ================================================================
// 【Toast / Modal / 公告弹窗】
// ================================================================
function toast(text,type){
type=type||'';
var el=$('toast');
if(!el)return;
setText(el,text);
el.className='toast show '+type;
if(toastTimer)clearTimeout(toastTimer);
toastTimer=setTimeout(function(){el.className='toast '+type;},1500);
}

function openModal(title,content,options){
options=options||{};
var titleEl=$('modalTitle');
titleEl.textContent='';
var txt=document.createTextNode(title);
titleEl.appendChild(txt);
if(options.helpFn){
var hb=document.createElement('button');
hb.className='help-btn';
hb.type='button';
hb.textContent='?';
hb.onclick=function(e){e.stopPropagation();options.helpFn();};
titleEl.appendChild(hb);
}
var body=$('modalBody');
body.textContent='';
if(typeof content==='string'){
var tmp=document.createElement('div');
tmp.innerHTML=content;
while(tmp.firstChild)body.appendChild(tmp.firstChild);
}else if(content){body.appendChild(content);}
$('modalOverlay').classList.add('show');
}
function closeModal(){$('modalOverlay').classList.remove('show');}

// 公告弹窗
var announceQueue=[];
function showAnnounce(title,body){
var el=$('announceBody');
if(!el)return;

      el.innerHTML='<div style="font-weight:800;color:var(--gold);margin-bottom:8px;">'+title+'</div>'+body;
    
$('announceOverlay').classList.add('show');
}
function closeAnnounce(){
$('announceOverlay').classList.remove('show');
// 显示下一条
if(announceQueue.length>0){
var next=announceQueue.shift();
setTimeout(function(){showAnnounce(next.title,next.body);},400);
}
}// ================================================================
// 【游戏逻辑】判断中奖
// ================================================================
function isWinKey(mode,key,winId){
if(mode==='animal')return Number(key)===winId;
if(mode==='size')return key===(winId<=18?'small':'big');
if(mode==='oddeven')return key===(winId%2===1?'odd':'even');
if(mode==='tail')return Number(key)===(winId%10);
return false;
}

// ================================================================
// 【筹码统计】当前玩法
// ================================================================
function betTotalCurrent(){
var t=0,bets=state.bets[state.playMode]||{};
for(var k in bets)t+=bets[k];
return t;
}
function betTotalAll(){
var t=0;
for(var mode in state.bets){for(var k in state.bets[mode])t+=state.bets[mode][k];}
return t;
}
function betTotalMode(mode){
var t=0,bets=state.bets[mode]||{};
for(var k in bets)t+=bets[k];
return t;
}

// ================================================================
// 【对压检测】同玩法对立面
// ================================================================
function detectHedge(){
var hedges=[];
// 大小
if((state.bets.size.small||0)>0 && (state.bets.size.big||0)>0)hedges.push('大小对压');
// 单双
if((state.bets.oddeven.odd||0)>0 && (state.bets.oddeven.even||0)>0)hedges.push('单双对压');
// 尾数 ≥5 个
var tailCount=0;
for(var k in state.bets.tail){if(state.bets.tail[k]>0)tailCount++;}
if(tailCount>=5)hedges.push('尾数刷水('+tailCount+')');
return hedges;
}
function isHedged(){
return detectHedge().length>0;
}

// ================================================================
// 【棋盘构建】
// ================================================================
function buildBoard(){
var board=$('boardGrid');
board.textContent='';
cellEls={};
board.className='board-grid mode-'+state.playMode;

if(state.playMode==='animal'){
ANIMALS.forEach(function(a){
var id=a[0],emoji=a[1];
var btn=document.createElement('button');
btn.type='button';
btn.className='animal-cell';
btn.setAttribute('data-key',String(id));
var e=document.createElement('img');e.className='emoji';e.alt=byId[id].name||('动物'+id);e.src=byId[id].image||'';e.onerror=function(){this.style.display='none';var fb=document.createElement('span');fb.className='emoji-fallback';fb.textContent=emoji;this.parentNode.insertBefore(fb,this);};
var n=document.createElement('span');n.className='number';n.textContent=padZero(id,3);
var fd=document.createElement('span');fd.className='fake-data';
var fp=document.createElement('span');fp.className='fake-players';fp.style.display='none';
var fm=document.createElement('span');fm.className='fake-money';fm.style.display='none';
fd.appendChild(fp);fd.appendChild(fm);
var b=document.createElement('span');b.className='my-bet-badge';
btn.appendChild(e);btn.appendChild(n);btn.appendChild(fd);btn.appendChild(b);
btn.onclick=function(){placeBet(String(id));};
board.appendChild(btn);
cellEls[String(id)]=btn;
});
}else if(state.playMode==='size'){

      [{key:'small',label:'小',sub:'001 ~ 018',emoji:'🐣'},{key:'big',label:'大',sub:'019 ~ 036',emoji:'🐘'}].forEach(function(item){
    
var btn=document.createElement('button');
btn.type='button';btn.className='animal-cell big-cell';
btn.setAttribute('data-key',item.key);
var l=document.createElement('span');l.className='big-label';l.textContent=item.emoji+' '+item.label;
var s=document.createElement('span');s.className='big-sub';s.textContent=item.sub;
var fd=document.createElement('span');fd.className='fake-data';
var fp=document.createElement('span');fp.className='fake-players';fp.style.display='none';
var fm=document.createElement('span');fm.className='fake-money';fm.style.display='none';
fd.appendChild(fp);fd.appendChild(fm);
var b=document.createElement('span');b.className='my-bet-badge';
btn.appendChild(l);btn.appendChild(s);btn.appendChild(fd);btn.appendChild(b);
btn.onclick=function(){placeBet(item.key);};
board.appendChild(btn);
cellEls[item.key]=btn;
});
}else if(state.playMode==='oddeven'){

      [{key:'odd',label:'单',sub:'1 · 3 · 5 · ...',emoji:'🔵'},{key:'even',label:'双',sub:'2 · 4 · 6 · ...',emoji:'🔴'}].forEach(function(item){
    
var btn=document.createElement('button');
btn.type='button';btn.className='animal-cell big-cell';
btn.setAttribute('data-key',item.key);
var l=document.createElement('span');l.className='big-label';l.textContent=item.emoji+' '+item.label;
var s=document.createElement('span');s.className='big-sub';s.textContent=item.sub;
var fd=document.createElement('span');fd.className='fake-data';
var fp=document.createElement('span');fp.className='fake-players';fp.style.display='none';
var fm=document.createElement('span');fm.className='fake-money';fm.style.display='none';
fd.appendChild(fp);fd.appendChild(fm);
var b=document.createElement('span');b.className='my-bet-badge';
btn.appendChild(l);btn.appendChild(s);btn.appendChild(fd);btn.appendChild(b);
btn.onclick=function(){placeBet(item.key);};
board.appendChild(btn);
cellEls[item.key]=btn;
});
}else if(state.playMode==='tail'){
for(var ti=0;ti<10;ti++){
(function(i){
var btn=document.createElement('button');
btn.type='button';btn.className='animal-cell tail-cell';
btn.setAttribute('data-key',String(i));
var num=document.createElement('span');num.className='tail-num';num.textContent=i;
var sub=document.createElement('span');sub.className='tail-sub';sub.textContent='尾'+i;
var fd=document.createElement('span');fd.className='fake-data';
var fp=document.createElement('span');fp.className='fake-players';fp.style.display='none';
var fm=document.createElement('span');fm.className='fake-money';fm.style.display='none';
fd.appendChild(fp);fd.appendChild(fm);
var b=document.createElement('span');b.className='my-bet-badge';
btn.appendChild(num);btn.appendChild(sub);btn.appendChild(fd);btn.appendChild(b);
btn.onclick=function(){placeBet(String(i));};
board.appendChild(btn);
cellEls[String(i)]=btn;
})(ti);
}
}
if(state.isLocked){
for(var k in cellEls)cellEls[k].classList.add('locked');
board.classList.add('locked-board');
}
}

// ================================================================
// 【单元格更新】
// ================================================================
function updateCell(mode,key){
if(mode!==state.playMode)return;
var el=cellEls[key];
if(!el)return;
var bet=(state.bets[mode][key]||0);
var fk=mode+'_'+key;
var fake=fakeStats[fk]||{players:0,money:0};
var pc=playerMarked[fk]?1:0;
var tp=fake.players+pc;
var tm=fake.money+bet;
var pe=el.querySelector('.fake-players');
var me=el.querySelector('.fake-money');
if(pe){
if(tp>0){pe.style.display='inline';setText(pe,tp+'👤');}
else pe.style.display='none';
}
if(me){
if(tm>0){me.style.display='inline';setText(me,tm+'¥');}
else me.style.display='none';
}
var cls='animal-cell';
if(mode==='size'||mode==='oddeven')cls+=' big-cell';
if(mode==='tail')cls+=' tail-cell';
if(tm>0)cls+=' has-data';
if(bet>0)cls+=' has-bet';
if(state.phase==='result'&&state.winId&&isWinKey(mode,key,state.winId))cls+=' winner';
el.className=cls;
var badge=el.querySelector('.my-bet-badge');
if(badge)setText(badge,bet>0?bet:'');
}

// ================================================================
// 【汇总更新】
// ================================================================
function updateSummary(){
setText($('coins'),fmtMoney(state.coins));
var tCurrent=betTotalCurrent();
setText($('betTotal'),tCurrent);
setText($('expectWin'),Math.floor(tCurrent*ODDS[state.playMode]));
setText($('mineBalance'),'');
var mb=$('mineBalance');
if(mb){
mb.textContent='';
var unit=document.createElement('span');unit.className='unit';unit.textContent='¥';
mb.appendChild(unit);
mb.appendChild(document.createTextNode(fmtMoney(state.coins)));
}
}

function renderAll(){
setText($('roundNo'),state.roundNo);
updateSummary();
for(var k in cellEls)updateCell(state.playMode,k);
}

// ================================================================
// 【发现页同步】
// ================================================================
function syncDiscover(){
setText($('heroRound'),state.roundNo);
}
function updateDiscoverTimer(){
var heroEl=$('heroTimer');
if(!heroEl)return;
var text;
if(state.phase==='betting')text=state.timeLeft+'s';
else if(state.phase==='drawing')text='开奖中';
else if(state.phase==='result')text='已开奖';
else text='--';
setText(heroEl,text);
}
function isPlayingViewActive(){
var v=$('view-playing');
return v&&v.classList.contains('active');
}

// ================================================================
// 【每日重置】
// ================================================================
function checkDailyReset(){
var today=todayStr();
var lastDate=localStorage.getItem(STORAGE_KEY+'_lastDate');
if(lastDate!==today){
state.todayRecharge=0;
state.todayFlow=0;
state.todayNetFlow=0;
localStorage.setItem(STORAGE_KEY+'_lastDate',today);
Storage.save();
}
}

// ================================================================
// 【下注】
// ================================================================
function placeBet(key){
if(state.frozen){toast('账号已冻结，无法下注','lose');return;}
if(state.isLocked||state.timeLeft<=LOCK_BEFORE){toast('已封盘，禁止下注','lose');return;}
if(state.phase!=='betting')return;
var now=Date.now();
if(now-lastBetTime<150)return;
lastBetTime=now;
if(state.coins<state.chip){toast('余额不足','lose');return;}
// 单格上限检查
var mode=state.playMode;
var curBet=state.bets[mode][key]||0;
if(curBet+state.chip>MAX_BET){toast('单格上限 '+MAX_BET,'lose');return;}
// 单玩法上限
if(betTotalMode(mode)+state.chip>MAX_PER_MODE){toast('单玩法上限 '+MAX_PER_MODE,'lose');return;}
// 单期上限
if(betTotalAll()+state.chip>MAX_PER_ROUND){toast('单期总上限 '+MAX_PER_ROUND,'lose');return;}
AudioCtx.play('coin');vibrate(15);
state.coins-=state.chip;
state.todayFlow+=state.chip;
state.bets[mode][key]=curBet+state.chip;
playerMarked[mode+'_'+key]=true;
// 大额报警
if(state.bets[mode][key]>=MAX_BET_WARN){
Api.alertAdmin({round:state.roundNo,mode:mode,key:key,amount:state.bets[mode][key]});
console.warn('[Alert] 单格 ≥'+MAX_BET_WARN+' 已报警给管理员');
}
updateCell(mode,key);
updateSummary();
Storage.save();
// 3秒刷新数据
refreshDataDebounced();
}

// 3秒内不重复刷新
var refreshTimer=null;
function refreshDataDebounced(){
if(refreshTimer)return;
refreshTimer=setTimeout(function(){
refreshTimer=null;
updateSummary();
Storage.save();
},3000);
}

// ================================================================
// 【模拟下注】
// ================================================================
function startFakeBetting(){
stopFakeBetting();
function next(){
if(state.isLocked||state.phase!=='betting'||state.timeLeft<=0){stopFakeBetting();return;}
var delay=30+Math.random()*500;
var isWarmup=state.timeLeft>55;
var isLast5s=state.timeLeft<=5;
if(isWarmup){
if(state.start5sBetCount>=3){fakeTimer=setTimeout(next,1000);return;}
state.start5sBetCount++;
delay=800+Math.random()*800;
}
if(isLast5s){
if(state.end5sBetCount>=3){stopFakeBetting();return;}
state.end5sBetCount++;
delay=800+Math.random()*1000;
}
fakeTimer=setTimeout(function(){
if(state.isLocked||state.phase!=='betting'||state.timeLeft<=0){stopFakeBetting();return;}
var isSolo=Math.random()<0.3;
var wr=Math.random();
var players=1,money=0;
if(wr<0.1)money=500+Math.floor(Math.random()*1500);
else if(wr<0.3){players=Math.floor(Math.random()*3)+1;money=players*(20+Math.floor(Math.random()*80));}
else{players=Math.floor(Math.random()*5)+1;money=players*(1+Math.floor(Math.random()*9));}
if((isWarmup||isLast5s)&&money>100){players=1;money=10+Math.floor(Math.random()*20);}
var modes=['animal','size','oddeven','tail'];
var weights=[0.6,0.15,0.15,0.1];
var r=Math.random(),cum=0,mode='animal';
for(var i=0;i<modes.length;i++){cum+=weights[i];if(r<cum){mode=modes[i];break;}}
var key;

      if(mode==='animal')key=isSolo?String(Math.floor(Math.random()*36)+1):String(hotAnimals[Math.floor(Math.random()*hotAnimals.length)]);
    
else if(mode==='size')key=Math.random()<0.5?'small':'big';
else if(mode==='oddeven')key=Math.random()<0.5?'odd':'even';
else key=String(Math.floor(Math.random()*10));
var fk=mode+'_'+key;
if(!fakeStats[fk])fakeStats[fk]={players:0,money:0};
fakeStats[fk].players+=players;
fakeStats[fk].money+=money;
if(mode===state.playMode)updateCell(mode,key);
next();
},delay);
}
next();
}
function stopFakeBetting(){if(fakeTimer){clearTimeout(fakeTimer);fakeTimer=null;}}

// ================================================================
// 【开始新一轮】
// ================================================================
function startRound(){
if(state.winId){state.lastWinId=state.winId;}
state.round++;
state.roundNo=genRoundNo();
state.phase='betting';
state.timeLeft=ROUND_SECONDS;
state.phaseStartTs=Date.now();
state.bets={animal:{},size:{},oddeven:{},tail:{}};
state.winId=null;
playerMarked={};
state.isLocked=false;
state.start5sBetCount=0;
state.end5sBetCount=0;
roundHedgeFlags={big:false,small:false,odd:false,even:false,tailKeys:{}};
setText($('timerLabel'),'开奖倒计时');
$('timer').classList.remove('draw-result');
document.body.classList.remove('danger-zone');
$('progressBar').style.background='';
$('progressBar').style.width='100%';
fakeStats={};
var board=$('boardGrid');
if(board)board.classList.remove('locked-board');
for(var k in cellEls){
cellEls[k].classList.remove('winner');
cellEls[k].classList.remove('winner-anim');
cellEls[k].classList.remove('scrolling');
cellEls[k].classList.remove('locked');
}
var hotCount=10+Math.floor(Math.random()*16);
var all=[];for(var i=1;i<=36;i++)all.push(i);
hotAnimals=shuffle(all).slice(0,hotCount);
drawTimer=setTimeout(function(){
drawTimer=null;
if(state.phase==='betting'&&!state.isLocked)startFakeBetting();
},1500+Math.random()*1500);
renderAll();
syncDiscover();
updateDiscoverTimer();
Storage.save();
}

// ================================================================
// 【开奖】滚动动画 + 定格 + 放大
// ================================================================
function draw(){
state.phase='drawing';
state.isLocked=true;
stopFakeBetting();
setText($('timer'),'核对中');
$('timer').className='stat-value timer-value';
$('progressBar').style.width='0%';
document.body.classList.remove('danger-zone');
// 棋盘封盘样式
var board=$('boardGrid');
if(board)board.classList.add('locked-board');
updateDiscoverTimer();
drawTimer=setTimeout(function(){
drawTimer=null;
var winId=Math.floor(Math.random()*36)+1;
state.winId=winId;
state.lastWinEmoji=byId[winId].emoji;
// 动画：先滚动
playScrollAnimation(winId);
},DRAW_DELAY);
}

function playScrollAnimation(winId){
// 滚动动画 0.8s 后定格
var scrollCount=0;
var scrollTimer=setInterval(function(){
// 清除上次高亮
for(var k in cellEls){
cellEls[k].classList.remove('scrolling');
}
// 随机高亮几个
for(var i=0;i<3;i++){
var randId=Math.floor(Math.random()*36)+1;
var el=cellEls[String(randId)];
if(el)el.classList.add('scrolling');
}
scrollCount++;
if(scrollCount>=8){
clearInterval(scrollTimer);
// 清除所有高亮
for(var k in cellEls)cellEls[k].classList.remove('scrolling');
// 定格中奖
finalizeDraw(winId);
}
},100);
}

function finalizeDraw(winId){
settle(winId);
state.phase='result';
var emoji=byId[winId].emoji;
var num=padZero(winId,3);
// 顶部上期开奖 展示 动物emoji+号码
var lr=$('lastResult');
lr.textContent='';
var sp=document.createElement('span');
sp.style.fontSize='20px';
sp.textContent=emoji+' '+num;
lr.appendChild(sp);
setText($('timerLabel'),'本期开奖');
var t=$('timer');
t.textContent='';
var s2=document.createElement('span');
s2.style.fontSize='20px';
s2.textContent=emoji+' '+num;
t.appendChild(s2);
t.className='stat-value timer-value draw-result';
// 高亮中奖格
if(state.playMode==='animal'&&cellEls[String(winId)]){
cellEls[String(winId)].classList.add('winner','winner-anim');
}else{
// 其他玩法
for(var k in cellEls){
if(isWinKey(state.playMode,k,winId)){
cellEls[k].classList.add('winner','winner-anim');
}
}
}
renderAll();
syncDiscover();
updateDiscoverTimer();
nextRoundTimer=setTimeout(function(){nextRoundTimer=null;startRound();},NEXT_DELAY);
}

// ================================================================
// 【结算】有效流水 = 净亏损
// ================================================================
function settle(winId){
var totalPayout=0,details=[];
var totalBet=betTotalAll();
for(var mode in state.bets){
for(var key in state.bets[mode]){
var bet=state.bets[mode][key];
if(bet>0&&isWinKey(mode,key,winId)){
var payout=Math.floor(bet*ODDS[mode]);
totalPayout+=payout;
details.push({mode:mode,key:key,bet:bet,payout:payout});
}
}
}
state.history.unshift({round:state.roundNo,winId:winId,emoji:byId[winId].emoji,ts:Date.now()});
if(state.history.length>HISTORY_LIMIT)state.history.pop();
// 有效流水 = max(0, 总输 - 总赢)
var netFlow=Math.max(0,totalBet-totalPayout);
// 对压：有效流水 = 0
var hedged=isHedged();
if(hedged){
netFlow=0;
// 记录违规
var hedgeList=detectHedge();
hedgeList.forEach(function(type){
state.violations.push({game:'问鼎国际娱乐3D',type:type,round:state.roundNo,ts:Date.now()});
});
Api.violationReport({round:state.roundNo,types:hedgeList});
console.warn('[Violation] 对压/刷水:',hedgeList);
toast('检测到对压/刷水，本局无效','lose');
}
// 累加有效流水
state.todayNetFlow+=netFlow;
// VIP 升级进度累加
state.vipLevelFlow+=netFlow;
state.vipPeriodFlow+=netFlow;
if(totalPayout>0){
state.coins+=totalPayout;
details.forEach(function(d){

      state.myBets.unshift({round:state.roundNo,winId:winId,emoji:byId[winId].emoji,mode:d.mode,key:d.key,bet:d.bet,payout:d.payout,ts:Date.now()});
    
});
if(state.myBets.length>HISTORY_LIMIT)state.myBets.length=HISTORY_LIMIT;
state.fundLog.unshift({type:'中奖',amount:totalPayout,round:state.roundNo,ts:Date.now()});
if(state.fundLog.length>200)state.fundLog.pop();
AudioCtx.play('win');
toast('+¥'+fmtMoney(totalPayout),'win');
var wAmount=$('winAmount');
if(wAmount)wAmount.textContent='+¥'+fmtMoney(totalPayout);
// 中奖明细
var detailHtml='';
details.forEach(function(d){
var keyLabel=d.key;

      if(d.mode==='animal'&&byId[Number(d.key)])keyLabel=byId[Number(d.key)].emoji+' '+padZero(Number(d.key),3);
    
else if(d.mode==='size')keyLabel=d.key==='small'?'🐣 小':'🐘 大';
else if(d.mode==='oddeven')keyLabel=d.key==='odd'?'🔵 单':'🔴 双';
else if(d.mode==='tail')keyLabel='尾 '+d.key;

      detailHtml+=keyLabel+' × '+ODDS[d.mode]+'倍 = <span style="color:var(--gold)">+¥'+fmtMoney(d.payout)+'</span><br>';
    
});
var wd=$('winDetail');
if(wd)wd.innerHTML=detailHtml;
$('winOverlay').classList.add('show');
}else if(totalBet>0){

      state.myBets.unshift({round:state.roundNo,winId:winId,emoji:byId[winId].emoji,mode:state.playMode,key:'-',bet:totalBet,payout:0,ts:Date.now()});
    
if(state.myBets.length>HISTORY_LIMIT)state.myBets.length=HISTORY_LIMIT;
state.fundLog.unshift({type:'投注',amount:-totalBet,round:state.roundNo,ts:Date.now()});
if(state.fundLog.length>200)state.fundLog.pop();
toast('未猜中','lose');
}
// 检查 VIP 升级
checkVipUpgrade();
Storage.save();
}

// ================================================================
// 【VIP 升级检查】
// ================================================================
function checkVipUpgrade(){
var cur=state.vipLevel;
if(cur>=10)return;
var next=VIP_RULES[cur+1];
if(!next)return;
if(state.vipLevelRecharge>=next.upRecharge&&state.vipLevelFlow>=next.upFlow){
state.vipLevel=cur+1;
state.vipUpgradeDate=Date.now();
state.vipPeriodStart=Date.now();
state.vipPeriodFlow=0;
state.vipLevelRecharge=0;
state.vipLevelFlow=0;
toast('🎉 恭喜晋升 VIP '+state.vipLevel+'！','win');
console.log('[VIP] 晋升到 VIP',state.vipLevel);
Storage.save();
updateProfileUI();
}
}
// 90 天保级检查
function checkVipKeep(){
if(state.vipLevel<=0)return;
var rule=VIP_RULES[state.vipLevel];
if(!rule||!state.vipPeriodStart)return;
var elapsed=Date.now()-state.vipPeriodStart;
if(elapsed<90*24*3600*1000)return;
if(state.vipPeriodFlow<rule.keepFlow){
state.vipLevel=Math.max(0,state.vipLevel-1);
state.vipPeriodStart=Date.now();
state.vipPeriodFlow=0;
toast('VIP 保级失败，降为 VIP '+state.vipLevel,'lose');
Storage.save();
updateProfileUI();
}else{
state.vipPeriodStart=Date.now();
state.vipPeriodFlow=0;
}
}

// ================================================================
// 【Tick】基于时间戳
// ================================================================
function tick(){
if(state.phase!=='betting'){updateDiscoverTimer();return;}
if(state.phaseStartTs){
var elapsed=Math.floor((Date.now()-state.phaseStartTs)/1000);
state.timeLeft=Math.max(0,ROUND_SECONDS-elapsed);
}
if(state.timeLeft<=0){
state.timeLeft=0;
setText($('timer'),'0s');
$('progressBar').style.width='0%';
draw();
updateDiscoverTimer();
return;
}
setText($('timer'),state.timeLeft+'s');
$('progressBar').style.width=(state.timeLeft/ROUND_SECONDS*100)+'%';
if(state.timeLeft<=LOCK_BEFORE&&!state.isLocked){
if(isPlayingViewActive())toast('封盘，数据核对中...','lose');
state.isLocked=true;
$('timer').className='stat-value timer-value warn';
$('progressBar').style.background='var(--red)';
document.body.classList.add('danger-zone');
AudioCtx.play('lock');
var board=$('boardGrid');
if(board)board.classList.add('locked-board');
for(var k in cellEls)cellEls[k].classList.add('locked');
}else if(state.timeLeft<=LOCK_BEFORE){
AudioCtx.play('tick');
}
updateDiscoverTimer();
}

// ================================================================
// 【切换 Tab】
// ================================================================
function switchTab(name){
closeModal();
var views=document.querySelectorAll('.view');
for(var i=0;i<views.length;i++)views[i].classList.remove('active');
var v=$('view-'+name);
if(v)v.classList.add('active');
var tabs=document.querySelectorAll('.tab-btn');
for(var j=0;j<tabs.length;j++){
if(tabs[j].getAttribute('data-tab')===name)tabs[j].classList.add('active');
else tabs[j].classList.remove('active');
}
if(name==='playing')document.body.classList.add('playing');
else document.body.classList.remove('playing');
// 音效控制：进入游戏页才默认关闭；离开游戏页保持不变
if(name==='playing'&&!state.soundOn){
// 进入游戏页，音效仍保持关闭（默认关闭状态）
updateSoundBtnState();
}
try{window.scrollTo(0,0);}catch(e){}
if(name==='discover'||name==='mine'){syncDiscover();updateSummary();updateProfileUI();}
updateDiscoverTimer();
}
function updateSoundBtnState(){
var btns=document.querySelectorAll('.tool-btn');
for(var i=0;i<btns.length;i++){
var lbl=btns[i].querySelector('.t-label');
if(lbl&&lbl.textContent==='音效'){
if(state.soundOn)btns[i].classList.add('active');
else btns[i].classList.remove('active');
}
}
}

// ================================================================
// 【VIP / 头像更新】
// ================================================================
function getVipLevel(){return state.vipLevel;}
function updateProfileUI(){
var vip=state.vipLevel;
setText($('vipBadge'),'VIP '+vip);
var rv=$('verifyBadge');
if(rv){
if(state.realName){rv.textContent='已实名';rv.classList.remove('pending');}
else{rv.textContent='未实名';rv.classList.add('pending');}
}
var nameEl=$('profileNameEl');
if(nameEl){
nameEl.textContent='';
nameEl.appendChild(document.createTextNode(state.userInfo.nickname+' '));
var ic=document.createElement('span');
ic.className='edit-icon';
ic.textContent='✎';
nameEl.appendChild(ic);
}
var av=$('avatarEl');
if(av){
var firstChild=av.firstChild;
if(firstChild&&firstChild.nodeType===3){
firstChild.textContent=state.userInfo.avatar;
}
}
// 冻结横幅
renderFrozenBanner();
}
function renderFrozenBanner(){
var wrap=$('frozenBannerWrap');
if(!wrap)return;
wrap.textContent='';
if(state.frozen){
var ban=document.createElement('div');
ban.className='frozen-banner';

      ban.innerHTML='<div class="fb-icon">🚫</div><div class="fb-text">账号已冻结：因检测到违规行为，请联系客服解除限制</div>';
    
wrap.appendChild(ban);
}
}

// ================================================================
// 【横幅轮播】
// ================================================================
var BANNERS=[

      {emoji:'🦄',tag:'🔥 热门',title:'问鼎国际娱乐3D',desc:'36 动物竞猜 · 60秒一局',cls:'b1',action:function(){switchTab('playing');}},
    

      {emoji:'🎡',tag:'即将上线',title:'幸运大转盘',desc:'转动圆盘 · 赢取丰厚奖励',cls:'b2',action:function(){comingSoon('幸运大转盘');}},
    

      {emoji:'🎁',tag:'活动',title:'新人注册送 88 彩金',desc:'完成认证即可申请领取',cls:'b3',action:function(){openNewbie();}},
    

      {emoji:'👥',tag:'活动',title:'邀请好友得人头费',desc:'邀请好友充值，最高得 5% 返利',cls:'b4',action:function(){openInvite();}}
    
];
var bannerIndex=0,bannerTimer=null;
function buildBanner(){
var track=$('bannerTrack'),dots=$('bannerDots');
if(!track||!dots)return;
track.textContent='';dots.textContent='';
BANNERS.forEach(function(b,i){
var slide=document.createElement('div');
slide.className='banner-slide '+b.cls;

      slide.innerHTML='<div class="banner-emoji">'+b.emoji+'</div><div class="banner-info"><div class="banner-tag">'+b.tag+'</div><div class="banner-title">'+b.title+'</div><div class="banner-desc">'+b.desc+'</div></div>';
    
slide.onclick=function(){AudioCtx.init();vibrate(10);b.action();};
track.appendChild(slide);
var dot=document.createElement('div');
dot.className='banner-dot'+(i===0?' active':'');
dots.appendChild(dot);
});
startBannerAuto();
}
function startBannerAuto(){
stopBannerAuto();
bannerTimer=setInterval(function(){
bannerIndex=(bannerIndex+1)%BANNERS.length;
updateBannerPos();
},4000);
}
function stopBannerAuto(){if(bannerTimer){clearInterval(bannerTimer);bannerTimer=null;}}
function updateBannerPos(){
var track=$('bannerTrack'),dots=$('bannerDots');
if(!track)return;
track.style.transform='translateX(-'+(bannerIndex*100)+'%)';
if(dots){
var ds=dots.querySelectorAll('.banner-dot');
for(var i=0;i<ds.length;i++){
if(i===bannerIndex)ds[i].classList.add('active');
else ds[i].classList.remove('active');
}
}
}

// ================================================================
// 【在线人数浮动】
// ================================================================
function updateOnlineCount(){
var hour=new Date().getHours();
var baseMin,baseMax;
if(hour>=0&&hour<6){baseMin=3;baseMax=30;}
else if(hour>=6&&hour<12){baseMin=100;baseMax=600;}
else if(hour>=12&&hour<18){baseMin=500;baseMax=1800;}
else{baseMin=800;baseMax=3500;}
if(!state.onlineCount){
state.onlineCount=Math.floor(Math.random()*(baseMax-baseMin+1))+baseMin;
}else{
var delta=Math.floor(Math.random()*11)-5;
state.onlineCount+=delta;
if(state.onlineCount<baseMin)state.onlineCount=baseMin;
if(state.onlineCount>baseMax)state.onlineCount=baseMax;
}
var el=$('heroOnline');
if(el)setText(el,state.onlineCount.toLocaleString());
}

// ================================================================
// 【公告】爆奖滚动（账号打码）
// ================================================================
var announcements=[];
function generateAnnouncements(){
var prefixes=['1','2','3','5','6','7','8','9'];
var prizes=[10,20,50,100,200,500,1000,2000,5000,10000];
for(var i=0;i<999;i++){
var uid='';
for(var j=0;j<7;j++)uid+=Math.floor(Math.random()*10);
var masked=maskId(uid);
var prize=prizes[Math.floor(Math.random()*prizes.length)];
announcements.push({id:masked,prize:prize});
}
announcements=shuffle(announcements);
}
function pushAnnouncement(id,prize){
announcements.unshift({id:id,prize:prize});
if(announcements.length>1000)announcements.pop();
renderMarquee();
}
function renderMarquee(){
var text='';
for(var i=0;i<announcements.length;i++){
text+='🎉恭喜 '+announcements[i].id+' 赢得'+announcements[i].prize+'元 ';
}
var el=$('noticeText');
if(!el)return;
setText(el,text);
var dur=Math.max(120,Math.min(600,text.length/3));
el.style.animation='none';
setTimeout(function(){el.style.animation='scroll '+dur+'s linear infinite';},50);
}

// ================================================================
// 【走势图】
// ================================================================
function openTrendChart(){
var wrap=document.createElement('div');
if(state.history.length===0){

      wrap.innerHTML='<div class="empty-tip"><span class="big-icon">📈</span>暂无数据</div>';
    
}else{
var table=document.createElement('table');
table.className='trend-table';

      var
      html='<thead><tr><th>期号</th><th>开奖</th><th>号码</th><th>大小</th><th>单双</th><th>尾数</th></tr></thead><tbody>';
    
state.history.slice(0,50).forEach(function(h){

      html+='<tr><td style="font-size:9px;">'+h.round+'</td><td class="trend-emoji">'+h.emoji+'</td><td class="trend-win">'+padZero(h.winId,3)+'</td><td>'+(h.winId<=18?'小':'大')+'</td><td>'+(h.winId%2===1?'单':'双')+'</td><td>'+(h.winId%10)+'</td></tr>';
    
});
html+='</tbody>';
table.innerHTML=html;
wrap.appendChild(table);
}
openModal('📈 走势图（近50期）',wrap);
}

// ================================================================
// 【我的记录】
// ================================================================
function openMyRecords(){
var wrap=document.createElement('div');
if(state.myBets.length===0){

      wrap.innerHTML='<div class="empty-tip"><span class="big-icon">📋</span>还没有下注记录</div>';
    
}else{
state.myBets.slice(0,50).forEach(function(r){
var item=document.createElement('div');
item.className='record-item';
var isWin=r.payout>0;
var modeLabel={animal:'动物',size:'大小',oddeven:'单双',tail:'尾数'}[r.mode]||'下注';
var keyLabel=r.key;

      if(r.mode==='animal'&&byId[Number(r.key)])keyLabel=byId[Number(r.key)].emoji+padZero(Number(r.key),3);
    

      item.innerHTML='<div style="flex:1;display:flex;gap:10px;align-items:center;"><div style="font-size:22px;">'+r.emoji+'</div><div style="display:flex;flex-direction:column;gap:2px;"><div style="font-size:9px;color:var(--dim);">'+r.round+' · '+modeLabel+' '+keyLabel+'</div><div style="font-size:12px;color:var(--text);font-weight:600;">开奖 '+padZero(r.winId,3)+'</div></div></div><div style="text-align:right;"><div style="font-size:13px;font-weight:800;color:'+(isWin?'var(--green)':'var(--red)')+';">'+(isWin?'+¥'+fmtMoney(r.payout):'-¥'+fmtMoney(r.bet))+'</div><div style="font-size:9px;color:var(--dim);margin-top:2px;">'+fmtTime(r.ts)+'</div></div>';
    
wrap.appendChild(item);
});
}
openModal('📋 我的记录',wrap);
}

// ================================================================
// 【账户明细】仅两周
// ================================================================
function openAccountLog(){
var wrap=document.createElement('div');
var list=(state.fundLog||[]).filter(function(f){return inLastTwoWeeks(f.ts);});
if(list.length===0){

      wrap.innerHTML='<div class="empty-tip"><span class="big-icon">💰</span>暂无资金记录<br><span style="font-size:10px;">（仅展示近两周）</span></div>';
    
}else{
var income=0,outcome=0;
list.forEach(function(f){if(f.amount>0)income+=f.amount;else outcome+=Math.abs(f.amount);});
var sum=document.createElement('div');
sum.className='stat-summary';

      sum.innerHTML='<div class="stat-sum-card"><div class="sc-label">总收入</div><div class="sc-val green">+¥'+fmtMoney(income)+'</div></div><div class="stat-sum-card"><div class="sc-label">总支出</div><div class="sc-val red">-¥'+fmtMoney(outcome)+'</div></div>';
    
wrap.appendChild(sum);
list.slice(0,100).forEach(function(f){
var item=document.createElement('div');
item.className='record-item';
item.style.justifyContent='space-between';

      item.innerHTML='<div><div style="font-size:12px;font-weight:700;">'+f.type+'</div><div style="font-size:10px;color:var(--dim);margin-top:3px;">'+fmtTime(f.ts)+'</div></div><div style="font-size:14px;font-weight:900;color:'+(f.amount>0?'var(--green)':'var(--red)')+';">'+(f.amount>0?'+¥':'-¥')+fmtMoney(Math.abs(f.amount))+'</div>';
    
wrap.appendChild(item);
});
}
openModal('💰 账户明细（近两周）',wrap);
}

// ================================================================
// 【玩法说明】
// ================================================================
function openHelp(){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="help-section"><h4>🐾 动物玩法</h4><p>从 001~036 共 36 个动物中选择一个或多个下注。开奖时若开出的号码就是你押的动物，即中奖。</p><div class="kv"><span class="k">赔率</span><span class="v">33 倍</span></div></div><div class="help-section"><h4>⚖️ 大小玩法</h4><p>小：001~018，大：019~036。押中即中奖。</p><div class="kv"><span class="k">赔率</span><span class="v">1.95 倍</span></div></div><div class="help-section"><h4>🎲 单双玩法</h4><p>单：号码为奇数，双：号码为偶数。押中即中奖。</p><div class="kv"><span class="k">赔率</span><span class="v">1.95 倍</span></div></div><div class="help-section"><h4>🔢 尾数玩法</h4><p>看号码的个位数（0~9）。押中尾数即中奖。</p><div class="kv"><span class="k">赔率</span><span class="v">8.5 倍</span></div></div><div class="help-section"><h4>⏰ 时间规则</h4><p>每期 60 秒。最后 10 秒封盘，不可下注。</p></div><div class="help-section"><h4>⚠️ 风控提示</h4><p>• 同一期押大+小、单+双、≥5个尾数 视为对压/刷水<br>• 对压/刷水不计有效流水，不参与反水<br>• 单格上限 ¥5,000 · 单期上限 ¥50,000<br>• 单格 ≥ ¥3,000 自动报警后台</p></div>';
    
openModal('❓ 玩法说明',wrap);
}

// ================================================================
// 【签到】
// ================================================================
var SIGN_REWARDS=[10,20,30,50,80,120,200];
var SIGN_BONUS=88;
function openSignRule(){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="help-section"><h4>📅 签到规则</h4><p>1. 每日需完成 <b style="color:var(--gold)">充值 ≥ 100</b> 且 <b style="color:var(--gold)">打满 1 倍流水</b>，方可签到。</p><p>2. 每日 <b>23:59:59</b> 之前必须签到，逾期作废，连续天数从第 1 天重新计算。</p><p>3. 连续签到 7 天，可额外领取 <b style="color:var(--pink)">88 元彩金</b>。</p><p>4. 额外彩金需在 <b>第 7 天当日 23:59:59 前</b> 领取，逾期作废。</p><p>5. 领取的彩金需按活动规则打满流水后方可提现。</p></div>';
    
openModal('📅 签到规则',wrap);
}
function openSign(){
var today=todayStr();
var signedToday=state.lastSignDate===today;
var qualified=state.todayRecharge>=100&&state.todayFlow>=100;
var wrap=document.createElement('div');
var cond=document.createElement('div');
cond.className='sign-cond';

      cond.innerHTML='<div class="sc-row"><span>今日充值</span><span class="v '+(state.todayRecharge>=100?'ok':'no')+'">¥'+fmtMoney(state.todayRecharge)+' / ¥100</span></div><div class="sc-row"><span>今日流水</span><span class="v '+(state.todayFlow>=100?'ok':'no')+'">¥'+fmtMoney(state.todayFlow)+' / ¥100</span></div><div class="sc-row"><span>连续签到</span><span class="v">'+state.consecutiveSigns+' 天</span></div>';
    
wrap.appendChild(cond);
var grid=document.createElement('div');
grid.className='sign-grid';
for(var i=0;i<7;i++){
var day=document.createElement('div');
day.className='sign-day';
var idx=i+1;
if(state.consecutiveSigns>=idx)day.classList.add('done');
if(!signedToday&&idx===state.consecutiveSigns+1&&qualified)day.classList.add('today');
if(idx===7)day.classList.add('bonus');
var bonusTag=idx===7?'<span class="bonus-tag">+88</span>':'';

      day.innerHTML='<div>Day'+idx+'</div><div style="font-size:9px;">+'+(idx===7?SIGN_REWARDS[i]+'+88':SIGN_REWARDS[i])+'</div>'+bonusTag;
    
grid.appendChild(day);
}
wrap.appendChild(grid);
var tip=document.createElement('p');
tip.style.cssText='text-align:center;font-size:12px;color:var(--dim);margin-bottom:14px;';
if(signedToday)tip.textContent='今日已签到，连续 '+state.consecutiveSigns+' 天';
else if(!qualified)tip.textContent='需完成充值 100 且打满 1 倍流水后方可签到';
else tip.textContent='连续签到 '+state.consecutiveSigns+' 天 · 今日可签到';
wrap.appendChild(tip);
var btn=document.createElement('button');
btn.className='sign-btn';btn.type='button';
if(signedToday){btn.textContent='今日已签到';btn.disabled=true;}
else if(!qualified){btn.textContent='未达条件';btn.disabled=true;}
else{btn.textContent='立即签到 +'+SIGN_REWARDS[Math.min(state.consecutiveSigns,6)];}
btn.onclick=function(){
var t=todayStr();
if(state.lastSignDate===t)return;
if(state.todayRecharge<100||state.todayFlow<100){toast('未达签到条件','lose');return;}
var y=new Date();y.setDate(y.getDate()-1);
var ys=y.getFullYear()+'-'+padZero(y.getMonth()+1,2)+'-'+padZero(y.getDate(),2);
if(state.lastSignDate===ys)state.consecutiveSigns=Math.min(state.consecutiveSigns+1,7);
else state.consecutiveSigns=1;
state.lastSignDate=t;
var reward=SIGN_REWARDS[Math.min(state.consecutiveSigns-1,6)];
state.coins+=reward;
state.fundLog.unshift({type:'签到奖励',amount:reward,ts:Date.now()});
AudioCtx.play('win');vibrate(20);
toast('签到成功 +¥'+reward,'win');
Storage.save();updateSummary();updateProfileUI();
closeModal();
setTimeout(openSign,200);
};
wrap.appendChild(btn);

      if(state.consecutiveSigns>=7&&state.bonus88ClaimedDate!==today&&state.lastSignDate===today){
    
var bonusBtn=document.createElement('button');
bonusBtn.className='sign-btn bonus';bonusBtn.type='button';
bonusBtn.style.marginTop='10px';
bonusBtn.textContent='🎁 领取第7天额外 88 彩金';
bonusBtn.onclick=function(){
if(state.bonus88ClaimedDate===today)return;
state.bonus88ClaimedDate=today;
state.coins+=SIGN_BONUS;
state.fundLog.unshift({type:'7天连签彩金',amount:SIGN_BONUS,ts:Date.now()});
AudioCtx.play('win');vibrate(30);
toast('彩金 +¥'+SIGN_BONUS,'win');
Storage.save();updateSummary();updateProfileUI();
closeModal();
};
wrap.appendChild(bonusBtn);
}
openModal('📅 每日签到',wrap,{helpFn:openSignRule});
}

// ================================================================
// 【排行榜】昵称打码
// ================================================================
function openRank(){
var wrap=document.createElement('div');

      var
      names=['锦鲤附体','一掷千金','稳如老狗','欧皇本皇','上岸翻身','小试牛刀','夜神月','猛虎下山','风一样的男','数据帝','财神爷','小赌怡情','大吉大利','一夜暴富','稳赚不亏','钱多多','开心就好','随便玩玩'];
    
var list=[];
for(var i=0;i<20;i++){

      list.push({name:maskName(names[i%names.length]+(i>9?'·'+i:'')),score:50000-i*1800-Math.floor(Math.random()*800),isMe:false});
    
}
var myScore=state.coins+state.todayFlow;
if(myScore>=20000){
list.push({name:maskName(state.userInfo.nickname),score:myScore,isMe:true});
}
list.sort(function(a,b){return b.score-a.score;});
list=list.slice(0,20);
wrap.className='rank-list';
list.forEach(function(item,idx){
var row=document.createElement('div');
row.className='rank-item'+(idx<3?' top'+(idx+1):'')+(item.isMe?' me':'');

      row.innerHTML='<div class="rank-num">'+(idx+1)+'</div><div class="rank-name">'+item.name+(item.isMe?' <span style="font-size:9px;color:#60a5fa;">(我)</span>':'')+'</div><div class="rank-score">'+item.score.toLocaleString()+'</div>';
    
wrap.appendChild(row);
});
openModal('🏆 排行榜',wrap);
}

// ================================================================
// 【消息中心】
// ================================================================
var MESSAGES=[

      {icon:'🎉',title:'恭喜获得新人礼包',desc:'欢迎来到动物总动员·3D',content:'欢迎来到动物总动员·3D！<br><br>您已获得新人礼包。<br>完善实名认证后还可申请 88 元彩金。<br><br>祝您游戏愉快！',time:'刚刚',read:false},
    

      {icon:'📢',title:'系统公告',desc:'新版问鼎国际娱乐3D 已上线',content:'新版问鼎国际娱乐3D 已正式上线！<br><br>新增玩法：<br>· 大小（1.95 倍）<br>· 单双（1.95 倍）<br>· 尾数（8.5 倍）<br>· 动物（33 倍）<br><br>祝您好运！',time:'1小时前',read:false},
    

      {icon:'🎁',title:'每日任务提醒',desc:'完成今日签到可获得奖励',content:'每日签到可获得 10~200 金币奖励。<br><br>连续签到 7 天，还可额外领取 88 元彩金。<br><br>签到条件：<br>1. 今日充值 ≥ 100<br>2. 打满 1 倍流水',time:'2小时前',read:false},
    

      {icon:'🔒',title:'安全提示',desc:'建议尽快完成实名认证',content:'为了您的账户安全，建议尽快完成实名认证。<br><br>实名认证后可享受：<br>· 提现通道开启<br>· 新人彩金申请<br>· 账户安全保障',time:'1天前',read:true},
    

      {icon:'💬',title:'客服回复',desc:'您提交的反馈已处理完成',content:'您提交的反馈已处理完成。<br><br>如有疑问，请联系在线客服。<br>工作时间：7×24 小时。',time:'2天前',read:true}
    
];
function openMessages(){
var wrap=document.createElement('div');
wrap.className='msg-list';
MESSAGES.forEach(function(m,idx){
var item=document.createElement('div');
item.className='msg-item';

      item.innerHTML='<div class="msg-icon">'+m.icon+'</div><div class="msg-content"><div class="msg-title">'+m.title+(m.read?'':'<span class="dot-red"></span>')+'</div><div class="msg-desc">'+m.desc+'</div><div class="msg-time">'+m.time+'</div></div>';
    
item.onclick=function(){m.read=true;openMessageDetail(m);};
wrap.appendChild(item);
});
openModal('📬 消息中心',wrap);
}
function openMessageDetail(m){
var wrap=document.createElement('div');

      wrap.innerHTML='<div style="text-align:center;font-size:50px;margin-bottom:14px;">'+m.icon+'</div><div style="font-size:16px;font-weight:800;text-align:center;margin-bottom:6px;">'+m.title+'</div><div style="font-size:10px;color:var(--dim);text-align:center;margin-bottom:16px;">'+m.time+'</div><div style="font-size:13px;line-height:1.8;color:var(--text);">'+m.content+'</div>';
    
openModal('消息详情',wrap);
}

// ================================================================
// 【实名认证】
// ================================================================
function openRealName(){
var wrap=document.createElement('div');
if(state.realName){
var masked=state.realName.name.charAt(0)+'**';
var maskedId=state.realName.id.slice(0,4)+'**********'+state.realName.id.slice(-4);
var maskedPhone=state.realName.phone.slice(0,3)+'****'+state.realName.phone.slice(-4);

      wrap.innerHTML='<div style="text-align:center;padding:20px 0;"><div style="font-size:50px;margin-bottom:14px;">✅</div><div style="font-size:15px;color:var(--green);font-weight:800;margin-bottom:14px;">已实名认证</div></div><div class="help-section"><div class="kv"><span class="k">姓名</span><span class="v">'+masked+'</span></div><div class="kv"><span class="k">身份证</span><span class="v">'+maskedId+'</span></div><div class="kv"><span class="k">手机号</span><span class="v">'+maskedPhone+'</span></div><div class="kv"><span class="k">性别</span><span class="v">'+state.realName.gender+'</span></div></div><div style="text-align:center;font-size:11px;color:var(--dim);margin-top:12px;">为保护您的隐私，信息已脱敏展示<br>认证后不可修改</div>';
    
}else{

      wrap.innerHTML='<div class="form-item"><label>真实姓名</label><input type="text" id="rnInput" placeholder="请输入真实姓名" autocomplete="off"></div><div class="form-item"><label>身份证号</label><input type="text" id="idInput" placeholder="请输入18位身份证号" autocomplete="off" maxlength="18"></div><div class="form-item"><label>手机号</label><input type="tel" id="phoneInput" placeholder="请输入手机号" autocomplete="off" maxlength="11"></div><div class="form-item"><label>性别</label><select id="genderInput"><option value="">请选择</option><option value="男">男</option><option value="女">女</option></select></div><button class="form-btn" id="rnSubmit" type="button">提交认证</button><div style="text-align:center;font-size:11px;color:var(--dim);margin-top:12px;">⚠️ 认证后信息不可修改，请谨慎填写</div>';
    
}
openModal('🪪 实名认证',wrap);
if(!state.realName){
setTimeout(function(){
var btn=$('rnSubmit');
if(!btn)return;
btn.onclick=function(){
var name=($('rnInput').value||'').trim();
var id=($('idInput').value||'').trim();
var phone=($('phoneInput').value||'').trim();
var gender=$('genderInput').value;
if(name.length<2){toast('请输入真实姓名','lose');return;}
if(!/^\d{17}[\dXx]$/.test(id)){toast('请输入正确的18位身份证号','lose');return;}
if(!/^1\d{10}$/.test(phone)){toast('请输入正确的手机号','lose');return;}
if(!gender){toast('请选择性别','lose');return;}
state.realName={name:name,id:id,phone:phone,gender:gender};
Storage.save();AudioCtx.play('win');
toast('实名认证成功','win');
updateProfileUI();
closeModal();
setTimeout(openRealName,200);
};
},50);
}
}

// ================================================================
// 【银行卡管理】
// ================================================================
var BANK_METHODS=[
{key:'usdt',icon:'₮',label:'USDT',enabled:true},
{key:'alipay',icon:'💙',label:'支付宝',enabled:true},
{key:'wechat',icon:'💚',label:'微信',enabled:true},
{key:'bank',icon:'🏦',label:'银行卡',enabled:true}
];
var userBanks=[];
function openBank(){
var wrap=document.createElement('div');
if(userBanks.length===0){

      wrap.innerHTML='<div class="empty-tip"><span class="big-icon">💳</span>暂无绑定收款方式</div>';
    
}else{
userBanks.forEach(function(b,i){
var row=document.createElement('div');
row.className='order-card';

      row.innerHTML='<div class="oc-row"><span class="k">'+b.label+'</span><span class="v" style="font-size:11px;word-break:break-all;">'+b.value+'</span></div><button class="form-btn ghost" style="margin-top:8px;padding:8px;" data-del="'+i+'" type="button">删除</button>';
    
wrap.appendChild(row);
});
}
var addBtn=document.createElement('button');
addBtn.className='form-btn';addBtn.type='button';addBtn.textContent='+ 添加收款方式';
addBtn.onclick=function(){openAddBank();};
wrap.appendChild(addBtn);
openModal('💳 银行卡管理',wrap);
setTimeout(function(){
var delBtns=wrap.querySelectorAll('[data-del]');
for(var i=0;i<delBtns.length;i++){
delBtns[i].onclick=function(){
var idx=Number(this.getAttribute('data-del'));
userBanks.splice(idx,1);
closeModal();setTimeout(openBank,150);
};
}
},50);
}
function openAddBank(){
var wrap=document.createElement('div');

      var opts=BANK_METHODS.map(function(b){return '<option value="'+b.key+'">'+b.icon+' '+b.label+'</option>';}).join('');
    

      wrap.innerHTML='<div class="form-item"><label>收款方式</label><select id="bankType">'+opts+'</select></div><div class="form-item"><label>收款账号/地址</label><input type="text" id="bankValue" placeholder="请输入账号或地址" autocomplete="off"></div><button class="form-btn" id="bankSubmit" type="button">保存</button>';
    
openModal('添加收款方式',wrap);
setTimeout(function(){
var btn=$('bankSubmit');
if(btn)btn.onclick=function(){
var type=$('bankType').value;
var value=($('bankValue').value||'').trim();
if(!value){toast('请输入账号/地址','lose');return;}
var m=BANK_METHODS.filter(function(x){return x.key===type;})[0];
userBanks.push({key:type,icon:m.icon,label:m.label,value:value});
toast('已添加','win');
closeModal();setTimeout(openBank,150);
};
},50);
}

// ================================================================
// 【关于】
// ================================================================
function openAbout(){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="about-box"><div class="about-logo">🦄</div><div class="about-title">动物总动员 · 3D</div><div class="about-version">Version 2.0.0</div><div class="about-desc">一款轻松有趣的动物竞猜小游戏，<br>36 个可爱动物，多种玩法等你体验。<br><br>本应用仅供娱乐，请理性游戏。</div></div>';
    
openModal('ℹ️ 关于我们',wrap);
}

// ================================================================
// 【VIP 中心】
// ================================================================
function openVIP(){
var level=state.vipLevel;
var cur=VIP_RULES[level];
var next=VIP_RULES[level+1]||null;
var wrap=document.createElement('div');
var html='<div class="vip-card"><div class="vip-level">VIP '+level+'</div>';
if(next){
html+='<div class="vip-desc">距 VIP '+(level+1)+' 还差</div>';
var pctR=Math.min(100,Math.round(state.vipLevelRecharge/next.upRecharge*100));
var pctF=Math.min(100,Math.round(state.vipLevelFlow/next.upFlow*100));

      html+='<div class="vip-progress-wrap"><div class="vip-progress-label"><span>充值进度</span><span class="cur">¥'+fmtMoney(state.vipLevelRecharge)+' / ¥'+fmtMoney(next.upRecharge)+'</span></div><div class="vip-progress"><div class="vip-progress-fill" style="width:'+pctR+'%"></div></div></div>';
    

      html+='<div class="vip-progress-wrap"><div class="vip-progress-label"><span>流水进度</span><span class="cur">¥'+fmtMoney(state.vipLevelFlow)+' / ¥'+fmtMoney(next.upFlow)+'</span></div><div class="vip-progress"><div class="vip-progress-fill blue" style="width:'+pctF+'%"></div></div></div>';
    
}else{
html+='<div class="vip-desc">已达最高等级 VIP 10</div>';
}
// 保级
if(level>0){
var rule=VIP_RULES[level];
var elapsed=state.vipPeriodStart?Math.floor((Date.now()-state.vipPeriodStart)/(24*3600*1000)):0;
var remain=Math.max(0,90-elapsed);
var keepPct=Math.min(100,Math.round(state.vipPeriodFlow/rule.keepFlow*100));

      html+='<div class="vip-progress-wrap" style="margin-top:14px;"><div class="vip-progress-label"><span>保级流水(90天)</span><span class="cur">¥'+fmtMoney(state.vipPeriodFlow)+' / ¥'+fmtMoney(rule.keepFlow)+'</span></div><div class="vip-progress"><div class="vip-progress-fill" style="width:'+keepPct+'%;background:linear-gradient(90deg,#10b981,#34d399);"></div></div><div class="vip-pct" style="margin-top:4px;">剩余 '+remain+' 天</div></div>';
    
}
html+='</div>';

      html+='<div class="help-section"><h4>💰 反水点位</h4><div class="kv"><span class="k">平台游戏</span><span class="v">'+cur.platformRebate+'%</span></div><div class="kv"><span class="k">自研游戏</span><span class="v">'+cur.selfRebate+'%</span></div><div class="kv"><span class="k">待领反水</span><span class="v">¥'+fmtMoney(state.pendingRebate)+'</span></div></div>';
    

      html+='<div class="help-section"><h4>💸 提现权益</h4><div class="kv"><span class="k">每日次数</span><span class="v">'+cur.withdrawTimes+' 次</span></div><div class="kv"><span class="k">单笔上限</span><span class="v">¥'+fmtMoney(cur.singleLimit)+'</span></div></div>';
    
html+='<div class="help-section"><h4>👑 等级权益一览</h4>';
VIP_RULES.forEach(function(v){
var isActive=v.level<=level;

      html+='<div style="padding:8px 10px;border-radius:8px;background:'+(isActive?'rgba(251,191,36,.1)':'rgba(0,0,0,.15)')+';border:1px solid '+(isActive?'rgba(251,191,36,.4)':'var(--line)')+';margin-bottom:6px;"><div style="font-size:12px;font-weight:800;color:'+(isActive?'var(--gold)':'var(--dim)')+';">VIP '+v.level+(isActive?' ✓':'')+'</div><div style="font-size:10px;color:var(--dim);margin-top:4px;">晋升：充值 ¥'+fmtMoney(v.upRecharge)+' + 流水 ¥'+fmtMoney(v.upFlow)+'</div><div style="font-size:10px;color:var(--dim);">保级：¥'+fmtMoney(v.keepFlow)+' / 90天</div><div style="font-size:10px;color:#60a5fa;margin-top:2px;">反水：平台 '+v.platformRebate+'% · 自研 '+v.selfRebate+'%</div></div>';
    
});
html+='</div>';
wrap.innerHTML=html;
openModal('👑 VIP 特权',wrap);
}

// ================================================================
// 【活动中心】
// ================================================================
var activityClaimed={};
function openActivity(){
var wrap=document.createElement('div');
var acts=[

      {id:'newbie',icon:'🎁',title:'新人礼包',desc:'完善认证后申请 88 彩金',check:function(){return !!state.realName;}},
    

      {id:'sign',icon:'📅',title:'每日签到',desc:'每日签到领彩金',check:function(){return
      state.lastSignDate===todayStr();}},
    

      {id:'recharge',icon:'💰',title:'首充奖励',desc:'首次充值 100 送 20',check:function(){return
      state.todayRecharge>=100;}},
    

      {id:'flow',icon:'🔥',title:'流水挑战',desc:'当日流水满 1000 送 50',check:function(){return
      state.todayFlow>=1000;}},
    
{id:'invite',icon:'🤝',title:'邀请返利',desc:'邀请好友充值得 5% 返利',check:function(){return false;}}
];
acts.forEach(function(a){
var done=a.check();
var claimed=activityClaimed[a.id];
var status=claimed?'已领取':(done?'可领取':'未达标');
var statusCls=claimed?'done':(done?'done':'todo');
var row=document.createElement('div');
row.className='activity-card '+(a.id==='newbie'?'gift':'task');
row.style.marginBottom='10px';

      row.innerHTML='<div class="activity-icon">'+a.icon+'</div><div class="activity-title">'+a.title+'</div><div class="activity-desc">'+a.desc+'</div><span class="activity-status '+statusCls+'">'+status+'</span>';
    
if(done&&!claimed){
var btn=document.createElement('button');
btn.className='form-btn';btn.type='button';btn.style.marginTop='10px';btn.style.padding='8px';
btn.textContent='申请领取';
btn.onclick=function(e){
e.stopPropagation();
activityClaimed[a.id]=true;
toast('已提交审核','win');
closeModal();setTimeout(openActivity,200);
};
row.appendChild(btn);
}
wrap.appendChild(row);
});
openModal('🎉 活动中心',wrap);
}

// ================================================================
// 【新人彩金】
// ================================================================
function openNewbie(){
var wrap=document.createElement('div');
var claimed=activityClaimed.newbie;
var qualified=!!state.realName;
var status=claimed?'已申请':(qualified?'可申请':'需实名认证');

      wrap.innerHTML='<div style="text-align:center;padding:14px 0;"><div style="font-size:60px;margin-bottom:12px;">🎁</div><div style="font-size:18px;font-weight:900;color:var(--gold);margin-bottom:6px;">新人注册送 88 彩金</div><div style="font-size:12px;color:var(--dim);line-height:1.7;margin-bottom:16px;">完成实名认证后点击申请领取<br>后台审核通过后派发</div></div><div class="help-section"><div class="kv"><span class="k">当前状态</span><span class="v">'+status+'</span></div><div class="kv"><span class="k">彩金金额</span><span class="v">¥88</span></div><div class="kv"><span class="k">流水要求</span><span class="v">3 倍流水</span></div></div>';
    
var btn=document.createElement('button');
btn.className='form-btn';btn.type='button';
if(claimed){btn.textContent='已申请，等待审核';btn.disabled=true;}
else if(!qualified){btn.textContent='请先完成实名认证';btn.disabled=true;}

      else{btn.textContent='申请领取';btn.onclick=function(){activityClaimed.newbie=true;toast('已提交，等待审核','win');Storage.save();closeModal();};}
    
wrap.appendChild(btn);
openModal('🎁 新人彩金',wrap);
}

// ================================================================
// 【优惠券】
// ================================================================
function openCoupon(){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="empty-tip"><span class="big-icon">🎫</span>暂无可用优惠券</div>';
    
openModal('🎫 我的优惠券',wrap);
}

// ================================================================
// 【邀请】
// ================================================================
function getUserInviteCode(){
var uid=10008888;
return 'ANML'+uid.toString(36).toUpperCase();
}
function openInvite(){
var code=getUserInviteCode();
var wrap=document.createElement('div');

      wrap.innerHTML='<div style="text-align:center;padding:10px 0 20px;"><div style="font-size:50px;margin-bottom:12px;">🤝</div><div style="font-size:15px;font-weight:800;color:var(--gold);margin-bottom:10px;">邀请好友 · 双方得奖励</div><div style="font-size:12px;color:var(--dim);line-height:1.8;margin-bottom:16px;">好友注册后首次充值<br>你获得 5% 返利，好友获赠 ¥100</div><div style="background:rgba(0,0,0,.2);border:1px dashed var(--gold);padding:14px;border-radius:10px;font-size:20px;font-weight:900;color:var(--gold);letter-spacing:2px;margin-bottom:16px;">'+code+'</div></div>';
    
var btn1=document.createElement('button');
btn1.className='form-btn';btn1.type='button';btn1.textContent='复制邀请码';
btn1.onclick=function(){
try{
if(navigator.clipboard&&navigator.clipboard.writeText){

      navigator.clipboard.writeText(code).then(function(){toast('邀请码已复制','win');}).catch(function(){toast('邀请码：'+code,'win');});
    
}else{toast('邀请码：'+code,'win');}
}catch(e){toast('邀请码：'+code,'win');}
};
wrap.appendChild(btn1);
var btn2=document.createElement('button');
btn2.className='form-btn ghost';btn2.type='button';btn2.textContent='📥 下载 APP 邀请';
btn2.style.marginTop='8px';
btn2.onclick=function(){toast('下载链接维护中','win');};
wrap.appendChild(btn2);
openModal('🤝 邀请好友',wrap);
}
function openMySub(){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="maintain-tip"><div class="mt-icon">👥</div><div class="mt-title">下级详情</div><div class="mt-desc">功能维护中，敬请期待～<br>后期可查看下级账号、充值、流水等信息</div></div>';
    
openModal('👥 我的下级',wrap);
}

// ================================================================
// 【意见反馈】
// ================================================================
function openFeedback(){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="form-item"><label>反馈类型</label><input type="text" id="fbType" placeholder="例如：功能建议 / bug 反馈"></div><div class="form-item"><label>详细描述</label><input type="text" id="fbDesc" placeholder="请描述您遇到的问题或建议"></div><button class="form-btn" id="fbSubmit" type="button">提交反馈</button>';
    
openModal('💬 意见反馈',wrap);
setTimeout(function(){
var btn=$('fbSubmit');
if(btn)btn.onclick=function(){
var t=($('fbType').value||'').trim();
var d=($('fbDesc').value||'').trim();
if(!t||!d){toast('请填写完整信息','lose');return;}
toast('感谢您的反馈','win');
closeModal();
};
},50);
}

// ================================================================
// 【数据统计】近两周
// ================================================================
function openStats(){
var wrap=document.createElement('div');
var recentBets=state.myBets.filter(function(b){return inLastTwoWeeks(b.ts);});
var totalBet=0,totalWin=0;
recentBets.forEach(function(b){totalBet+=b.bet;totalWin+=b.payout;});
var profit=totalWin-totalBet;
var html='<div class="stat-summary">';

      html+='<div class="stat-sum-card"><div class="sc-label">总投注</div><div class="sc-val gold">¥'+fmtMoney(totalBet)+'</div></div>';
    

      html+='<div class="stat-sum-card"><div class="sc-label">总中奖</div><div class="sc-val green">¥'+fmtMoney(totalWin)+'</div></div>';
    

      html+='<div class="stat-sum-card"><div class="sc-label">盈亏</div><div class="sc-val '+(profit>=0?'green':'red')+'">'+(profit>=0?'+¥':'-¥')+fmtMoney(Math.abs(profit))+'</div></div>';
    

      html+='<div class="stat-sum-card"><div class="sc-label">投注局数</div><div class="sc-val blue">'+recentBets.length+'</div></div>';
    
html+='</div>';

      html+='<div style="font-size:11px;color:var(--dim);text-align:center;margin-bottom:12px;">📊 仅展示近两周数据</div>';
    
html+='<div class="help-section"><h4>📋 最近投注</h4>';
if(recentBets.length===0)html+='<div class="empty-tip">暂无投注记录</div>';
else{
recentBets.slice(0,20).forEach(function(b){
var isWin=b.payout>0;

      html+='<div class="kv"><span class="k">'+b.round+' '+b.emoji+'</span><span class="v" style="color:'+(isWin?'var(--green)':'var(--red)')+'">'+(isWin?'+¥'+fmtMoney(b.payout):'-¥'+fmtMoney(b.bet))+'</span></div>';
    
});
}
html+='</div>';
wrap.innerHTML=html;
openModal('📊 数据统计',wrap);
}

// ================================================================
// 【充值】
// ================================================================

      function svgWechat(){return '<svg viewBox="0 0 24 24" fill="#07C160"><path d="M8.7 4C4.5 4 1 6.9 1 10.4c0 2 1.2 3.8 3 5l-.7 2.2 2.6-1.4c.9.3 1.8.4 2.8.4h.5c-.1-.4-.2-.9-.2-1.4 0-3.4 3.3-6.2 7.4-6.2h.4C16.3 6 12.8 4 8.7 4zm-2.5 3.4c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zm5 0c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9z"/><path d="M23 15.2c0-2.9-2.9-5.2-6.5-5.2s-6.5 2.3-6.5 5.2 2.9 5.2 6.5 5.2c.8 0 1.5-.1 2.2-.3l2 1.1-.6-1.8c1.7-1 2.9-2.5 2.9-4.2zm-8.7-1.4c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm4.4 0c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z"/></svg>';}
    

      function svgAlipay(){return '<svg viewBox="0 0 24 24" fill="#1677FF"><path d="M22 2H2v20h11c-.6-1-1.4-2.2-2.3-3.4-2 1.2-4.6 1.8-6.6 1.8-2.6 0-3.5-1.2-3.4-3 .1-2.3 2-4 5-3.7 1.8.2 3.5.8 5.2 1.5.4-.9.8-1.9 1.1-3H6v-1.3h4.5V9.5H5V8.2h5.5V6h2v2.2H18v1.3h-5.5v1.4H17c-.3 1.2-.8 2.4-1.3 3.5.9.4 1.8.8 2.6 1 .9.3 1.7.5 2.4.6.1 0 .5.1.6.1V2zm-9 13.7c-1.6-.8-3.3-1.4-5-1.5-2.3-.2-3.7 1-3.8 2.6-.1 1.4.7 2.2 2.5 2.2 1.7 0 4-.5 5.8-1.6-.1-.5-.2-1.1-.2-1.7h.7z"/></svg>';}
    

      function svgUSDT(){return '<svg viewBox="0 0 24 24" fill="#26A17B"><circle cx="12" cy="12" r="11"/><text x="12" y="16" font-size="11" font-weight="900" fill="#fff" text-anchor="middle">₮</text></svg>';}
    

      function svgBank(){return '<svg viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2L2 8v2h20V8L12 2zM4 12v8H2v2h20v-2h-2v-8h-3v8h-3v-8h-3v8H7v-8H4z"/></svg>';}
    

      function svgRMB(){return '<svg viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="11"/><text x="12" y="17" font-size="14" font-weight="900" fill="#fff" text-anchor="middle">¥</text></svg>';}
    

function openRecharge(){
var wrap=document.createElement('div');
var channels=[
{key:'usdt',label:'USDT',enabled:true,svg:svgUSDT()},
{key:'wechat',label:'微信',enabled:false,svg:svgWechat()},
{key:'alipay',label:'支付宝',enabled:false,svg:svgAlipay()},
{key:'bank',label:'银行卡',enabled:false,svg:svgBank()},
{key:'rmb',label:'数字人民币',enabled:false,svg:svgRMB()}
];
var chHtml='<div class="channel-grid">';
channels.forEach(function(c){

      chHtml+='<div class="channel-item '+(c.enabled?'active':'')+'" data-ch="'+c.key+'">'+(c.enabled?'':'<span class="ch-maintain">维护</span>')+'<div class="ch-icon">'+c.svg+'</div><div class="ch-label">'+c.label+'</div></div>';
    
});
chHtml+='</div>';

      var formHtml='<div class="form-item"><label>充值金额（元）</label><input type="number" id="rcAmount" placeholder="最低 100" min="100" inputmode="numeric"></div><button class="form-btn" id="rcNext" type="button">下一步</button><div style="text-align:center;font-size:11px;color:var(--dim);margin-top:10px;">仅 USDT 通道开放，其他通道维护中</div>';
    
wrap.innerHTML=chHtml+formHtml;
openModal('💰 充值',wrap);
var selected='usdt';
setTimeout(function(){
var items=wrap.querySelectorAll('.channel-item');
for(var i=0;i<items.length;i++){
(function(it){
it.onclick=function(){
var key=it.getAttribute('data-ch');
if(key!=='usdt'){toast('该通道维护中','lose');return;}
for(var j=0;j<items.length;j++)items[j].classList.remove('active');
it.classList.add('active');
selected=key;
};
})(items[i]);
}
var btn=$('rcNext');
if(btn)btn.onclick=function(){
var amt=parseInt($('rcAmount').value,10);
if(!amt||amt<100){toast('最低充值 100','lose');return;}
openRechargeOrder(selected,amt);
};
},50);
}
function openRechargeOrder(channel,amount){
var orderId='RC'+Date.now()+Math.floor(Math.random()*1000);
var rate=7.2;
var usdt=(amount/rate).toFixed(2);
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="order-card"><div class="oc-row"><span class="k">订单号</span><span class="v" style="font-size:10px;">'+orderId+'</span></div><div class="oc-row"><span class="k">充值金额</span><span class="v gold">¥'+fmtMoney(amount)+'</span></div><div class="oc-row"><span class="k">应付 USDT</span><span class="v gold">'+usdt+' USDT</span></div><div class="oc-row"><span class="k">汇率</span><span class="v">1 USDT = ¥'+rate+'</span></div></div><div class="oc-countdown" id="rcCountdown">30:00</div><div class="qr-box"><div class="qr-img">📱 收款二维码<br>（后台上传）</div><div class="qr-text">USDT-TRC20 收款地址</div></div><div class="addr-box">TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX<span class="copy-mini" data-copy="TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX">复制</span></div><div class="help-section" style="margin-top:14px;"><h4>📌 充值须知</h4><p>1. 请使用 USDT-TRC20 通道转账</p><p>2. 转账金额必须与订单一致</p><p>3. 30 分钟内未付款订单自动关闭</p><p>4. 付款后请点击「我已付款」提交凭证</p></div>';
    
var btn=document.createElement('button');
btn.className='form-btn';btn.type='button';btn.textContent='✅ 我已付款';
btn.style.marginTop='10px';
btn.onclick=function(){
// 模拟：充值成功
state.coins+=amount;
state.todayRecharge+=amount;
state.vipLevelRecharge+=amount;
state.fundLog.unshift({type:'充值',amount:amount,ts:Date.now()});
toast('已提交，等待审核','win');
Storage.save();updateSummary();updateProfileUI();
closeModal();
};
wrap.appendChild(btn);
openModal('💰 充值订单',wrap);
// 复制按钮
setTimeout(function(){
var cp=wrap.querySelector('[data-copy]');
if(cp)cp.onclick=function(){

      try{navigator.clipboard.writeText(cp.getAttribute('data-copy'));toast('已复制','win');}catch(e){toast('复制失败','lose');}
    
};
},50);
var left=30*60;
var t=setInterval(function(){
left--;
if(left<=0){clearInterval(t);closeModal();toast('订单已关闭','lose');return;}
var m=Math.floor(left/60),s=left%60;
var el=$('rcCountdown');
if(el)setText(el,padZero(m,2)+':'+padZero(s,2));
else clearInterval(t);
},1000);
}

// ================================================================
// 【提现】
// ================================================================
function openWithdraw(){
var wrap=document.createElement('div');
var channels=[
{key:'usdt',label:'USDT',enabled:true,svg:svgUSDT()},
{key:'wechat',label:'微信',enabled:false,svg:svgWechat()},
{key:'alipay',label:'支付宝',enabled:false,svg:svgAlipay()},
{key:'bank',label:'银行卡',enabled:false,svg:svgBank()},
{key:'rmb',label:'数字人民币',enabled:false,svg:svgRMB()}
];
var chHtml='<div class="channel-grid">';
channels.forEach(function(c){

      chHtml+='<div class="channel-item '+(c.enabled?'active':'')+'" data-ch="'+c.key+'">'+(c.enabled?'':'<span class="ch-maintain">维护</span>')+'<div class="ch-icon">'+c.svg+'</div><div class="ch-label">'+c.label+'</div></div>';
    
});
chHtml+='</div>';
var vip=VIP_RULES[state.vipLevel];

      var formHtml='<div class="form-item"><label>提现金额（元）</label><input type="number" id="wdAmount" placeholder="最低 100" min="100" inputmode="numeric"></div><div class="form-item"><label>收款地址</label><input type="text" id="wdAddr" placeholder="请输入 USDT 收款地址"></div><button class="form-btn" id="wdNext" type="button">提交提现</button><div style="text-align:center;font-size:11px;color:var(--dim);margin-top:10px;line-height:1.6;">最低提现 100 元<br>需打满 1 倍流水<br>需完成实名认证<br>VIP'+state.vipLevel+' 每日 '+vip.withdrawTimes+' 次 · 单笔上限 ¥'+fmtMoney(vip.singleLimit)+'</div>';
    
wrap.innerHTML=chHtml+formHtml;
openModal('💸 提现',wrap);
setTimeout(function(){
var items=wrap.querySelectorAll('.channel-item');
for(var i=0;i<items.length;i++){
(function(it){
it.onclick=function(){
var key=it.getAttribute('data-ch');
if(key!=='usdt'){toast('该通道维护中','lose');return;}
for(var j=0;j<items.length;j++)items[j].classList.remove('active');
it.classList.add('active');
};
})(items[i]);
}
var btn=$('wdNext');
if(btn)btn.onclick=function(){
var amt=parseInt($('wdAmount').value,10);
var addr=($('wdAddr').value||'').trim();
if(!state.realName){toast('请先完成实名认证','lose');return;}
if(!amt||amt<100){toast('最低提现 100','lose');return;}
if(amt>state.coins){toast('余额不足','lose');return;}
if(amt>vip.singleLimit){toast('单笔上限 ¥'+fmtMoney(vip.singleLimit),'lose');return;}
if(!addr){toast('请输入收款地址','lose');return;}
var needFlow=state.todayRecharge;
if(state.todayNetFlow<needFlow){toast('有效流水不足，需 ¥'+fmtMoney(needFlow),'lose');return;}
var orderId='WD'+Date.now();
state.coins-=amt;
state.fundLog.unshift({type:'提现',amount:-amt,ts:Date.now()});
Storage.save();updateSummary();updateProfileUI();
openWithdrawOrder(orderId,amt,addr);
};
},50);
}
function openWithdrawOrder(orderId,amount,addr){
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="order-card"><div class="oc-row"><span class="k">订单号</span><span class="v" style="font-size:10px;">'+orderId+'</span></div><div class="oc-row"><span class="k">提现金额</span><span class="v gold">¥'+fmtMoney(amount)+'</span></div><div class="oc-row"><span class="k">收款地址</span><span class="v" style="font-size:10px;word-break:break-all;">'+addr+'</span></div><div class="oc-row"><span class="k">状态</span><span class="v" style="color:var(--gold);">审核中</span></div></div><div style="text-align:center;font-size:11px;color:var(--dim);line-height:1.7;margin-bottom:14px;">预计 1~30 分钟到账<br>到账后请在 30 分钟内确认<br>超时自动确认到账</div><div style="font-size:12px;color:var(--text);margin-bottom:8px;">请选择到账情况：</div>';
    
var btns=[
{key:'ok',label:'✅ 确认到账',cls:''},
{key:'less',label:'⚠️ 到账不足',cls:'ghost'},
{key:'none',label:'❌ 全部未到账',cls:'ghost'}
];
btns.forEach(function(b){
var btn=document.createElement('button');
btn.className='form-btn '+(b.cls||'');btn.type='button';btn.textContent=b.label;
btn.style.marginTop='6px';
btn.onclick=function(){
if(b.key==='ok'){toast('已确认到账','win');closeModal();}
else{
var v=prompt('请输入实际收到的金额（元）');
if(v!==null){toast('已提交，等待处理','win');closeModal();}
}
};
wrap.appendChild(btn);
});
openModal('💸 提现订单',wrap);
}

// ================================================================
// 【反水中心】
// ================================================================
function openRebate(){
var rule=VIP_RULES[state.vipLevel];
var wrap=document.createElement('div');

      wrap.innerHTML='<div class="help-section"><h4>💰 我的反水</h4><div class="kv"><span class="k">当前等级</span><span class="v">VIP '+state.vipLevel+'</span></div><div class="kv"><span class="k">平台游戏点位</span><span class="v">'+rule.platformRebate+'%</span></div><div class="kv"><span class="k">自研游戏点位</span><span class="v">'+rule.selfRebate+'%</span></div><div class="kv"><span class="k">待领反水</span><span class="v">¥'+fmtMoney(state.pendingRebate)+'</span></div><div class="kv"><span class="k">累计已领</span><span class="v">¥'+fmtMoney(state.rebateClaimed)+'</span></div></div><div class="help-section"><h4>📌 反水规则</h4><p>• 次日 3~6 点统一派发<br>• 需再打 1 倍流水才可提现<br>• 有效流水 = max(0, 总输 - 总赢)<br>• 对冲/刷水不计入有效流水<br>• 彩金产生的流水，反水按 50% 计</p></div>';
    
var btn=document.createElement('button');
btn.className='form-btn';btn.type='button';btn.textContent='领取反水（¥'+fmtMoney(state.pendingRebate)+'）';
if(state.pendingRebate<=0){btn.disabled=true;btn.textContent='暂无可领取反水';}
btn.onclick=function(){
if(state.pendingRebate<=0)return;
state.coins+=state.pendingRebate;
state.fundLog.unshift({type:'反水',amount:state.pendingRebate,ts:Date.now()});
state.rebateClaimed+=state.pendingRebate;
state.pendingRebate=0;
toast('已领取反水','win');
Storage.save();updateSummary();
closeModal();
};
wrap.appendChild(btn);
openModal('💰 反水中心',wrap);
}

// ================================================================

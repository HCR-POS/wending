/* ============================================================
🎡 幸运大转盘 · 4 游戏
============================================================ */
(function(){
'use strict';

// ---------- CSS ----------
var css = document.createElement('style');
css.textContent = '.wheel-hub-list{display:flex;flex-direction:column;gap:12px}'

      +'.wheel-hub-card{position:relative;height:100px;border-radius:18px;padding:0 20px;display:flex;align-items:center;gap:18px;cursor:pointer;overflow:hidden;border:1px solid rgba(255,255,255,.08)}'
    
+'.wheel-hub-card:active{transform:scale(.98)}'
+'.wheel-hub-card.w-animal{background:linear-gradient(135deg,#fbbf24,#f59e0b)}'
+'.wheel-hub-card.w-classic{background:linear-gradient(135deg,#ef4444,#b91c1c)}'
+'.wheel-hub-card.w-multi{background:linear-gradient(135deg,#8b5cf6,#6d28d9)}'
+'.wheel-hub-card.w-rainbow{background:linear-gradient(135deg,#10b981,#047857)}'
+'.whc-icon{font-size:56px;line-height:1;flex-shrink:0}'
+'.whc-info{flex:1;min-width:0}'
+'.whc-name{font-size:18px;font-weight:900;color:#fff;margin-bottom:6px}'
+'.whc-desc{font-size:12px;color:rgba(255,255,255,.85)}'
+'.whc-arrow{font-size:28px;color:rgba(255,255,255,.8);font-weight:300}'
+'.wheel-canvas-wrap{position:relative;width:100%;max-width:360px;margin:8px auto;aspect-ratio:1}'

      +'.wheel-canvas-wrap canvas{width:100%;height:100%;display:block;border-radius:50%;box-shadow:0 8px 40px rgba(0,0,0,.5),0 0 0 8px rgba(20,30,50,.9),0 0 0 10px rgba(251,191,36,.4)}'
    

      +'.wheel-pointer{position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:32px;color:#fbbf24;text-shadow:0 0 12px rgba(251,191,36,.8);z-index:5;pointer-events:none}'
    

      +'.wheel-center-btn{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fbbf24,#f59e0b,#b45309);border:3px solid #fff;color:#000;font-size:18px;font-weight:900;cursor:pointer;font-family:inherit;box-shadow:0 6px 20px rgba(0,0,0,.5);z-index:6}'
    
+'.wheel-center-btn:disabled{opacity:.7;cursor:not-allowed}'

      +'.wheel-bet-panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:10px;margin-top:10px}'
    
+'.wheel-options{display:flex;flex-wrap:wrap;gap:6px;max-height:220px;overflow-y:auto}'

      +'.wheel-opt{border-radius:8px;background:var(--glass-bg);border:1px solid var(--glass-border);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:inherit;color:var(--text);padding:6px 8px;font-size:13px;font-weight:700;min-width:42px;min-height:42px}'
    
+'.wheel-opt.on{background:linear-gradient(145deg,#fbbf24,#f59e0b);border-color:#fff;color:#000}'
+'.wheel-opt .num{font-size:9px;color:var(--dim);font-weight:600;margin-top:2px}'
+'.wheel-opt.on .num{color:#000}'
+'.wheel-opt.red{background:linear-gradient(145deg,#dc2626,#991b1b);color:#fff;border-color:#7f1d1d}'
+'.wheel-opt.black{background:linear-gradient(145deg,#1f2937,#111827);color:#fff;border-color:#000}'
+'.wheel-opt.green{background:linear-gradient(145deg,#059669,#047857);color:#fff;border-color:#065f46}'
+'.wheel-opt.wide{min-width:64px}'
+'.wheel-status{text-align:center;font-size:12px;color:var(--dim);padding:6px 0}'

      +'.wheel-result-pop{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.6);background:radial-gradient(circle at 50% 0%,#1a2540,#060b14);padding:24px 32px;border-radius:16px;border:2px solid var(--gold);text-align:center;opacity:0;pointer-events:none;transition:all .35s;z-index:1300}'
    
+'.wheel-result-pop.show{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}'
+'.wr-emoji{font-size:60px;margin-bottom:10px}'
+'.wr-title{font-size:16px;color:var(--gold);font-weight:900;margin-bottom:6px}'
+'.wr-amount{font-size:24px;font-weight:900;color:var(--green)}'

      +'.wr-close{margin-top:16px;padding:10px 24px;border-radius:10px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#000;font-size:14px;font-weight:900;border:none;cursor:pointer;font-family:inherit}';
    
document.head.appendChild(css);

// ---------- HTML ----------
function inject(){
var app = document.getElementById('app');
if(!app || document.getElementById('view-wheel-hub')) return;
app.insertAdjacentHTML('beforeend',

      '<section class="view" id="view-wheel-hub"><div class="page-title"><button class="back-btn" id="btnWheelHubBack" type="button" style="width:auto;padding:0 12px;font-size:14px;">‹ 返回</button><h2>🎡 幸运大转盘</h2><span class="badge">4 款游戏</span></div><div class="wheel-hub-list" id="wheelHubList"></div></section>'
    

      +'<section class="view" id="view-wheel-play"><div class="playing-bar"><button class="back-btn" id="btnWheelPlayBack" type="button">‹</button><div class="playing-title" id="wheelPlayTitle">动物大转盘</div><div class="playing-live">LIVE</div></div><div class="wheel-canvas-wrap"><div class="wheel-pointer">▼</div><canvas id="wheelCanvas"></canvas><button class="wheel-center-btn" id="wheelSpinBtn" type="button">旋转</button></div><div class="wheel-status" id="wheelStatus">请选择下注项</div><div class="wheel-bet-panel"><div class="info-row"><div class="info-item">余 <span class="val gold" id="wheelCoins">¥0</span></div><div class="info-item">押 <span class="val white" id="wheelBet">0</span></div><div class="info-item">奖 <span class="val green" id="wheelWin">0</span></div><input type="number" class="manual-input" id="wheelManualInput" placeholder="自填" min="1" max="1000" inputmode="numeric" autocomplete="off"></div><div class="chip-grid" id="wheelChipGrid"><button class="chip" data-v="1" type="button">1</button><button class="chip" data-v="10" type="button">10</button><button class="chip" data-v="50" type="button">50</button><button class="chip" data-v="100" type="button">100</button><button class="chip" data-v="500" type="button">500</button><button class="chip" data-v="1000" type="button">1000</button></div><div class="wheel-options" id="wheelOptions"></div><button class="form-btn" id="wheelConfirmBet" type="button">下注</button></div></section>'
    
);
document.body.insertAdjacentHTML('beforeend',

      '<div class="wheel-result-pop" id="wheelResultPop"><div class="wr-emoji" id="wheelResultEmoji">🎉</div><div class="wr-title" id="wheelResultTitle">恭喜中奖</div><div class="wr-amount" id="wheelResultAmount">+¥0</div><button class="wr-close" id="wheelResultClose" type="button">知道了</button></div>'
    
);
}

// ---------- 配置 ----------
var GAMES = [
{key:'animal', name:'🐾 动物大转盘', desc:'36 格 · 33 倍赔率', icon:'🐾', cls:'w-animal', slots:36},
{key:'classic',name:'🎡 经典轮盘', desc:'37 格 · 单号/红黑/大小/单双', icon:'🎡', cls:'w-classic', slots:37},
{key:'multi', name:'💎 倍率转盘', desc:'24 格 · 8 档倍率', icon:'💎', cls:'w-multi', slots:24},
{key:'rainbow',name:'🌈 综合轮盘', desc:'48 格 · 颜色/大小/区域', icon:'🌈', cls:'w-rainbow', slots:48}
];

var COLORS = {
animal: function(i){ var h=(i*360/36); return {bg:'hsl('+h+',65%,'+(i%2?32:42)+'%)', fg:'#fff'}; },

      classic: function(i){ if(i===0)return {bg:'#059669',fg:'#fff'}; return {bg:(i%2?'#dc2626':'#1f2937'),fg:'#fff'};
      },
    
multi: function(i){ var h=(i*360/24); return {bg:'hsl('+h+',70%,'+(i%2?35:45)+'%)', fg:'#fff'}; },

      rainbow: function(i){ var cs=['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];
      return {bg:cs[i%8],fg:'#fff'}; }
    
};

function label(k,i){

      if(k==='animal'){ var a=window.ANIMALS&&ANIMALS[i]; return a?a[1]+' '+('00'+a[0]).slice(-3):String(i+1); }
    
if(k==='classic')return String(i);
if(k==='multi')return ['0.5x','1x','2x','3x','5x','10x','20x','50x'][i%8];
return String(i+1);
}

// ---------- 工具 ----------
function $(id){return document.getElementById(id);}
function setText(el,t){if(el&&el.textContent!==String(t))el.textContent=String(t);}
function T(t,ty){try{if(window.toast)toast(t,ty);}catch(e){}}
function V(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function AI(){try{if(window.AudioCtx)AudioCtx.init();}catch(e){}}
function AP(t){try{if(window.AudioCtx)AudioCtx.play(t);}catch(e){}}
function show(id){
var vs=document.querySelectorAll('.view');
for(var i=0;i<vs.length;i++)vs[i].classList.remove('active');
var v=$(id);if(v)v.classList.add('active');
document.body.classList.remove('playing');
try{window.scrollTo(0,0);}catch(e){}
}

var cur=null, chip=1;

      var
      W={canvas:null,ctx:null,rot:0,spin:false,anim:null,slots:36,items:[],bet:0,sel:null,lastTick:-1,size:320,cb:null};
    

// ---------- 入口列表 ----------
function buildHub(){
var el=$('wheelHubList');if(!el)return;
el.textContent='';
GAMES.forEach(function(g){
var c=document.createElement('div');
c.className='wheel-hub-card '+g.cls;

      c.innerHTML='<div class="whc-icon">'+g.icon+'</div><div class="whc-info"><div class="whc-name">'+g.name+'</div><div class="whc-desc">'+g.desc+'</div></div><div class="whc-arrow">›</div>';
    
c.onclick=function(){AI();V(10);enter(g);};
el.appendChild(c);
});
}

function enter(g){
cur=g;W.slots=g.slots;W.rot=0;W.bet=0;W.sel=null;
setText($('wheelPlayTitle'),g.name);
W.items=[];
for(var i=0;i<g.slots;i++)W.items.push(label(g.key,i));
show('view-wheel-play');

      setTimeout(function(){initCanvas();draw();buildOpts();updateInfo();setText($('wheelStatus'),'请选择下注项');},100);
    
}

// ---------- Canvas ----------
function initCanvas(){
var c=$('wheelCanvas');if(!c)return;
W.canvas=c;W.ctx=c.getContext('2d');
var dpr=window.devicePixelRatio||1,size=c.offsetWidth||320;
c.width=size*dpr;c.height=size*dpr;
W.ctx.scale(dpr,dpr);W.size=size;
}

function draw(){
var ctx=W.ctx;if(!ctx)return;
var s=W.size,cx=s/2,cy=s/2,R=s/2-4,N=W.slots,arc=2*Math.PI/N;
var scheme=COLORS[cur.key];
ctx.clearRect(0,0,s,s);
ctx.beginPath();ctx.arc(cx,cy,R,0,2*Math.PI);ctx.fillStyle='#0a1220';ctx.fill();
for(var i=0;i<N;i++){
var sa=i*arc-Math.PI/2+W.rot,ea=sa+arc;
ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R-2,sa,ea);ctx.closePath();
var cs=scheme(i);
ctx.fillStyle=cs.bg;ctx.fill();
ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;ctx.stroke();
ctx.save();ctx.translate(cx,cy);ctx.rotate(sa+arc/2);
ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillStyle=cs.fg;
ctx.font='bold '+Math.max(9,Math.round(13-N/10))+'px sans-serif';
ctx.fillText(W.items[i],R-12,0);ctx.restore();
}
ctx.beginPath();ctx.arc(cx,cy,52,0,2*Math.PI);ctx.fillStyle='#0a1220';ctx.fill();
}

function ease(t){
if(t<0.15)return (t*t)/(0.15*0.15)*0.15;
if(t<0.85)return 0.15+(t-0.15);
var p=(t-0.85)/0.15;return 0.85+(1-(1-p)*(1-p));
}

// ---------- 中奖判定 ----------
function isWin(i){
var sel=W.sel;if(!sel)return false;
var k=cur.key;
if(k==='animal')return String(i)===sel;
if(k==='classic'){
if(sel==='red')return i>0&&i%2===1;
if(sel==='black')return i>0&&i%2===0;
if(sel==='green')return i===0;
if(sel==='small')return i>=1&&i<=18;
if(sel==='big')return i>=19&&i<=36;
if(sel==='odd')return i>0&&i%2===1;
if(sel==='even')return i>0&&i%2===0;
if(sel==='1st')return i>=1&&i<=12;
if(sel==='2nd')return i>=13&&i<=24;
if(sel==='3rd')return i>=25&&i<=36;
if(sel.indexOf('n_')===0)return i===+sel.slice(2);
}
if(k==='multi'){
if(sel.indexOf('b_')===0)return (i%8)===+sel.slice(2);
if(sel.indexOf('u_')===0)return (i%8)>=+sel.slice(2);
}
if(k==='rainbow'){
if(sel==='red')return i%8===0||i%8===7;
if(sel==='black')return i%8>=1&&i%8<=6;
if(sel==='small')return i<24;
if(sel==='big')return i>=24;
if(sel==='odd')return i%2===0;
if(sel==='even')return i%2===1;
if(sel.indexOf('z_')===0)return Math.floor(i/12)===+sel.slice(2);
if(sel.indexOf('n_')===0)return i===+sel.slice(2);
}
return false;
}

function odds(){
var sel=W.sel,k=cur.key;
if(k==='animal')return 33;
if(k==='classic'){
if(sel==='red'||sel==='black')return 1.95;
if(sel==='green')return 35;
if(sel==='small'||sel==='big'||sel==='odd'||sel==='even')return 1.95;
if(sel==='1st'||sel==='2nd'||sel==='3rd')return 2.9;
if(sel&&sel.indexOf('n_')===0)return 33;
}
if(k==='multi'){
if(sel&&sel.indexOf('b_')===0)return [1.7,1.9,2.2,2.6,3.3,4.5,7.5,12][+sel.slice(2)];
if(sel&&sel.indexOf('u_')===0)return [1.95,1.95,2.05,2.2,2.4,2.75,3.6,7.5][+sel.slice(2)];
}
if(k==='rainbow'){
if(sel==='red'||sel==='black')return 2.3;
if(sel==='small'||sel==='big'||sel==='odd'||sel==='even')return 1.95;
if(sel&&sel.indexOf('z_')===0)return 3.9;
if(sel&&sel.indexOf('n_')===0)return 45;
}
return 2;
}

// ---------- 旋转音效 ----------
var spinOsc=null,spinGain=null;
function startSpinSound(){
try{
if(!window.AudioCtx||!AudioCtx.ctx)return;
if(window.state&&!state.soundOn)return;
var ctx=AudioCtx.ctx,osc=ctx.createOscillator(),g=ctx.createGain();
osc.connect(g);g.connect(ctx.destination);osc.type='sawtooth';
osc.frequency.setValueAtTime(60,ctx.currentTime);
osc.frequency.linearRampToValueAtTime(110,ctx.currentTime+1);
g.gain.setValueAtTime(0,ctx.currentTime);
g.gain.linearRampToValueAtTime(0.05,ctx.currentTime+0.15);
osc.start();spinOsc=osc;spinGain=g;
}catch(e){}
}
function stopSpinSound(){

      try{if(spinOsc&&AudioCtx.ctx){spinGain.gain.exponentialRampToValueAtTime(0.001,AudioCtx.ctx.currentTime+0.3);spinOsc.stop(AudioCtx.ctx.currentTime+0.35);spinOsc=null;spinGain=null;}}catch(e){}
    
}

// ---------- 旋转 ----------
function spin(){
if(W.spin)return;
if(W.bet<=0){T('请先下注','lose');return;}
if(!W.sel){T('请选择下注项','lose');return;}
var target=Math.floor(Math.random()*W.slots);
doSpin(target,6000);
}

function doSpin(target,dur){
if(W.spin)return;
W.spin=true;W.lastTick=-1;
var N=W.slots,arc=2*Math.PI/N;
var ta=-(target+0.5)*arc;
ta+=(Math.random()-0.5)*arc*0.5;
var turns=8+Math.floor(Math.random()*5);
ta+=turns*2*Math.PI;
var sr=W.rot;
while(ta<sr+4*Math.PI)ta+=2*Math.PI;
var td=ta-sr,st=performance.now();
var btn=$('wheelSpinBtn');
if(btn){btn.disabled=true;btn.textContent='转动中';}
startSpinSound();
function step(now){
var t=Math.min(1,(now-st)/dur);
W.rot=sr+td*ease(t);draw();
var r=((W.rot%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
var ps=Math.floor(((2*Math.PI-r)%(2*Math.PI))/arc);
if(ps!==W.lastTick){W.lastTick=ps;AP('tick');}
if(t<1){W.anim=requestAnimationFrame(step);}
else{
W.rot=ta;draw();W.spin=false;stopSpinSound();
if(btn){btn.disabled=false;btn.textContent='旋转';}
onStop(target);
}
}
W.anim=requestAnimationFrame(step);
}

// ---------- 下注选项 ----------
function buildOpts(){
var el=$('wheelOptions');if(!el)return;
el.textContent='';
function add(labelTxt,sub,selKey,cls){
var b=document.createElement('button');
b.type='button';b.className='wheel-opt'+(cls?' '+cls:'');
b.innerHTML='<div>'+labelTxt+'</div>'+(sub?'<div class="num">'+sub+'</div>':'');
b.onclick=function(){
AI();V(8);
var all=el.querySelectorAll('.wheel-opt');
for(var i=0;i<all.length;i++)all[i].classList.remove('on');
b.classList.add('on');W.sel=selKey;
setText($('wheelStatus'),'已选：'+labelTxt+(sub?' '+sub:''));
};
el.appendChild(b);
}
var k=cur.key;
if(k==='animal'){
if(!window.ANIMALS)return;
ANIMALS.forEach(function(a){add(a[1],('00'+a[0]).slice(-3),String(a[0]),'');});
}else if(k==='classic'){
add('🔴 红','1.95x','red','red');
add('⚫ 黑','1.95x','black','black');
add('🟢 绿0','35x','green','green');
add('小 1-18','1.95x','small','wide');
add('大 19-36','1.95x','big','wide');
add('奇','1.95x','odd','');
add('偶','1.95x','even','');
add('1st 12','2.9x','1st','wide');
add('2nd 12','2.9x','2nd','wide');
add('3rd 12','2.9x','3rd','wide');
for(var i=0;i<37;i++){
var c=i===0?'green':(i%2?'red':'black');
add(String(i),'','n_'+i,c);
}
}else if(k==='multi'){
var rr=['0.5x','1x','2x','3x','5x','10x','20x','50x'];
for(var b=0;b<8;b++)add(rr[b],'档','b_'+b,'wide');
add('≥2x','2.05x','u_2','');
add('≥3x','2.2x','u_3','');
add('≥5x','2.4x','u_4','');
add('≥10x','2.75x','u_5','');
add('≥20x','3.6x','u_6','');
add('50x','7.5x','u_7','');
}else if(k==='rainbow'){
add('🔴 红','2.3x','red','red');
add('⚫ 黑','2.3x','black','black');
add('小 1-24','1.95x','small','wide');
add('大 25-48','1.95x','big','wide');
add('奇','1.95x','odd','');
add('偶','1.95x','even','');
add('区1','3.9x','z_0','wide');
add('区2','3.9x','z_1','wide');
add('区3','3.9x','z_2','wide');
add('区4','3.9x','z_3','wide');
for(var j=0;j<48;j++)add(String(j+1),'','n_'+j,'');
}
}

// ---------- 下注 ----------
function placeBet(){
if(W.spin){T('转动中','lose');return;}
if(!W.sel){T('请选择下注项','lose');return;}
if(!window.state){T('状态未加载','lose');return;}
if(state.coins<chip){T('余额不足','lose');return;}
state.coins-=chip;state.todayFlow+=chip;W.bet+=chip;
state.fundLog.unshift({type:'转盘下注',amount:-chip,ts:Date.now()});
if(state.fundLog.length>200)state.fundLog.pop();
try{if(window.Storage)Storage.save();}catch(e){}
updateInfo();spin();
}

// ---------- 结算 ----------
function onStop(slot){
var win=isWin(slot),od=odds(),pay=win?Math.floor(W.bet*od):0;
var e=$('wheelResultEmoji'),t=$('wheelResultTitle'),a=$('wheelResultAmount');
if(e)e.textContent=win?'🎉':(cur.key==='animal'&&window.ANIMALS?ANIMALS[slot][1]:'🎯');
if(win){
if(window.state){
state.coins+=pay;
state.fundLog.unshift({type:'转盘中奖',amount:pay,ts:Date.now()});
if(state.fundLog.length>200)state.fundLog.pop();
}
AP('win');
if(t)t.textContent='🎉 恭喜中奖！';
if(a){a.textContent='+¥'+pay.toFixed(2);a.style.color='var(--green)';}
T('+¥'+pay.toFixed(2),'win');
}else{
if(t)t.textContent='未中奖';
if(a){a.textContent='-¥'+W.bet.toFixed(2);a.style.color='var(--red)';}
T('未中奖','lose');
}
var pop=$('wheelResultPop');if(pop)pop.classList.add('show');
W.bet=0;W.sel=null;
var opts=$('wheelOptions').querySelectorAll('.wheel-opt');
for(var i=0;i<opts.length;i++)opts[i].classList.remove('on');
updateInfo();setText($('wheelStatus'),'请选择下注项');
try{if(window.Storage)Storage.save();}catch(e){}
try{if(window.updateSummary)updateSummary();}catch(e){}
}

function updateInfo(){
var el=$('wheelCoins');
if(el)el.textContent='¥'+(window.state?state.coins.toFixed(2):'0.00');
setText($('wheelBet'),W.bet);
setText($('wheelWin'),Math.floor(W.bet*(W.sel?odds():2)));
}

// ---------- 筹码 ----------
function bindChips(){
var grid=$('wheelChipGrid');if(!grid)return;
var chips=grid.querySelectorAll('.chip');
for(var i=0;i<chips.length;i++){
(function(c){
c.onclick=function(){
AI();V(10);
for(var j=0;j<chips.length;j++)chips[j].classList.remove('on');
c.classList.add('on');chip=Number(c.getAttribute('data-v'));
var mi=$('wheelManualInput');if(mi)mi.value='';
};
})(chips[i]);
}
if(chips[0])chips[0].classList.add('on');
var inp=$('wheelManualInput');
if(inp){
inp.oninput=function(){
var v=parseInt(inp.value,10);
if(isNaN(v)||v<=0){
for(var j=0;j<chips.length;j++)chips[j].classList.remove('on');
if(chips[0])chips[0].classList.add('on');
chip=1;inp.value='';return;
}
if(v>1000){v=1000;inp.value='1000';}
for(var k=0;k<chips.length;k++)chips[k].classList.remove('on');
chip=v;
};
}
}

// ---------- 事件 ----------
function bindEvents(){
var b1=$('btnWheelHubBack');if(b1)b1.onclick=function(){show('view-games');};
var b2=$('btnWheelPlayBack');if(b2)b2.onclick=function(){show('view-wheel-hub');};
var sb=$('wheelSpinBtn');if(sb)sb.onclick=function(){spin();};
var cb=$('wheelConfirmBet');if(cb)cb.onclick=function(){placeBet();};
var rc=$('wheelResultClose');if(rc)rc.onclick=function(){$('wheelResultPop').classList.remove('show');};
}

function bindEntry(){
document.addEventListener('click',function(e){
var t=e.target;
while(t&&t!==document.body){
if(t.classList&&t.classList.contains('game-card')&&t.getAttribute('data-game')==='wheel'){
e.stopPropagation();e.preventDefault();
show('view-wheel-hub');
return false;
}
t=t.parentNode;
}
},true);
}

// ---------- 启动 ----------
function init(){
inject();
buildHub();
bindChips();
bindEvents();
bindEntry();
console.log('[Wheel] 4 游戏转盘已加载');
}

setTimeout(init,800);
})();

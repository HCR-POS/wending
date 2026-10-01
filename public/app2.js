// 【UI 构建】
// ================================================================
var QUICK_ACTIONS=[
{key:'signin',icon:'📅',label:'每日签到',color:'gold',dot:true,fn:openSign},
{key:'rank',icon:'🏆',label:'排行榜',color:'gold',fn:openRank},
{key:'msg',icon:'📬',label:'消息',color:'blue',dot:true,fn:openMessages},
{key:'coupon',icon:'🎫',label:'优惠券',color:'purple',fn:openCoupon},
{key:'invite',icon:'🤝',label:'邀请好友',color:'green',fn:openInvite},
{key:'activity',icon:'🎉',label:'活动中心',color:'red',fn:openActivity},
{key:'vip',icon:'👑',label:'VIP 中心',color:'gold',fn:openVIP},
{key:'stats',icon:'📊',label:'数据统计',color:'blue',fn:openStats}
];

var CATEGORIES=[
{key:'all',label:'全部'},
{key:'self',label:'🏆 独家尊享'},
{key:'hot',label:'🔥 热门'},
{key:'slot',label:'电子'},
{key:'chess',label:'棋牌'},
{key:'fish',label:'捕鱼'},
{key:'sport',label:'体育'},
{key:'fav',label:'⭐ 收藏'}
];

var MENU_ITEMS=[
{key:'realname',icon:'🪪',label:'实名认证',color:'gold',fn:openRealName},
{key:'bank',icon:'💳',label:'银行卡管理',color:'blue',fn:openBank},
{key:'rebate',icon:'💰',label:'反水中心',color:'gold',fn:openRebate},
{key:'mycoupon',icon:'🎫',label:'我的优惠券',color:'purple',extra:'0 张',fn:openCoupon},
{key:'invite',icon:'🤝',label:'邀请好友',color:'green',fn:openInvite},
{key:'mysub',icon:'👥',label:'我的下级',color:'green',fn:openMySub},
{key:'agent',icon:'👔',label:'代理中心',color:'gold',fn:function(){comingSoon('代理中心');}},
{key:'security',icon:'🔒',label:'安全中心',color:'red',fn:function(){comingSoon('安全中心');}},
{key:'stats',icon:'📊',label:'数据统计',color:'blue',fn:openStats},
{key:'message',icon:'📬',label:'消息中心',color:'blue',fn:openMessages},
{key:'feedback',icon:'💬',label:'意见反馈',color:'purple',fn:openFeedback},
{key:'about',icon:'ℹ️',label:'关于我们',color:'blue',extra:'v2.0.0',fn:openAbout}
];

var GAME_TOOLS=[
{key:'sound',icon:'🔇',label:'音效',fn:null},
{key:'chart',icon:'📈',label:'走势图',fn:openTrendChart},
{key:'record',icon:'📋',label:'我的记录',fn:openMyRecords},
{key:'help',icon:'❓',label:'玩法说明',fn:openHelp}
];

function buildQuickGrid(){
var el=$('quickGrid');
if(!el)return;
el.textContent='';
QUICK_ACTIONS.forEach(function(q){
var item=document.createElement('div');
item.className='quick-item';
var icon=document.createElement('div');
icon.className='quick-icon '+q.color;
icon.textContent=q.icon;
if(q.dot){var d=document.createElement('span');d.className='dot';icon.appendChild(d);}
var label=document.createElement('div');
label.className='quick-label';label.textContent=q.label;
item.appendChild(icon);item.appendChild(label);
item.onclick=function(){AudioCtx.init();vibrate(10);if(q.fn)q.fn();};
el.appendChild(item);
});
}

function buildDiscoverActivity(){
var el=$('discoverActivityGrid');
if(!el)return;
el.textContent='';
var items=[
{icon:'🎁',title:'新人礼包',desc:'完善认证领 88 彩金',cls:'gift',fn:openNewbie},
{icon:'📅',title:'每日签到',desc:'连签 7 天得 88',cls:'task',fn:openSign},
{icon:'🔥',title:'流水挑战',desc:'当日满 1000 送 50',cls:'gift',fn:openActivity},
{icon:'🤝',title:'邀请返利',desc:'好友充值得 5%',cls:'task',fn:openInvite}
];
items.forEach(function(a){
var card=document.createElement('div');
card.className='activity-card '+a.cls;

      card.innerHTML='<div class="activity-icon">'+a.icon+'</div><div class="activity-title">'+a.title+'</div><div class="activity-desc">'+a.desc+'</div>';
    
card.onclick=function(){AudioCtx.init();vibrate(10);a.fn();};
el.appendChild(card);
});
}

function buildCategoryTabs(){
var el=$('categoryTabs');
if(!el)return;
el.textContent='';
CATEGORIES.forEach(function(c,i){
var chip=document.createElement('div');
chip.className='cat-chip'+(i===0?' active':'');
chip.textContent=c.label;
chip.onclick=function(){
var all=el.querySelectorAll('.cat-chip');
for(var j=0;j<all.length;j++)all[j].classList.remove('active');
chip.classList.add('active');
filterGames(c.key);
};
el.appendChild(chip);
});
}

function filterGames(cat){
var cards=document.querySelectorAll('.game-card');
for(var i=0;i<cards.length;i++){
var card=cards[i];
var show=true;
var cardCat=card.getAttribute('data-cat')||'';
if(cat==='fav')show=state.favorites.indexOf(card.getAttribute('data-game'))>=0;
else if(cat==='all')show=true;
else if(cat==='hot'||cat==='slot')show=cardCat==='slot';
else show=cardCat===cat;
if(show)card.classList.remove('hidden');
else card.classList.add('hidden');
}
}

function buildMenuList(){
var el=$('menuList');
if(!el)return;
el.textContent='';
MENU_ITEMS.forEach(function(m){
var item=document.createElement('div');
item.className='menu-item';
var icon=document.createElement('div');
icon.className='m-icon '+m.color;icon.textContent=m.icon;
var label=document.createElement('div');
label.className='m-label';label.textContent=m.label;
item.appendChild(icon);item.appendChild(label);
if(m.extra){
var extra=document.createElement('div');
extra.className='m-extra';extra.textContent=m.extra;
item.appendChild(extra);
}
var arrow=document.createElement('div');
arrow.className='m-arrow';arrow.textContent='›';
item.appendChild(arrow);
item.onclick=function(){AudioCtx.init();vibrate(10);if(m.fn)m.fn();};
el.appendChild(item);
});
}

function buildPlayTabs(){
var el=$('playTabs');
if(!el)return;
el.textContent='';
PLAY_MODES.forEach(function(p){
var chip=document.createElement('div');
chip.className='play-chip'+(p.key===state.playMode?' active':'');
var emojiEl=document.createElement('div');emojiEl.className='pc-emoji';emojiEl.textContent=p.emoji;
var txtEl=document.createElement('div');txtEl.className='pc-text';txtEl.textContent=p.label;
chip.appendChild(emojiEl);chip.appendChild(txtEl);
chip.onclick=function(){
// 封盘后可以切换玩法
if(state.phase==='drawing'){toast('开奖中，请稍候','lose');return;}
AudioCtx.init();vibrate(8);
var all=el.querySelectorAll('.play-chip');
for(var j=0;j<all.length;j++)all[j].classList.remove('active');
chip.classList.add('active');
state.playMode=p.key;
buildBoard();
renderAll();
};
el.appendChild(chip);
});
}

function buildToolBar(){
var el=$('toolBar');
if(!el)return;
el.textContent='';
GAME_TOOLS.forEach(function(t){
var btn=document.createElement('button');
btn.type='button';
btn.className='tool-btn'+(t.key==='sound'&&state.soundOn?' active':'');
var icon=document.createElement('span');
icon.className='t-icon';icon.textContent=t.key==='sound'?(state.soundOn?'🔊':'🔇'):t.icon;
var label=document.createElement('span');
label.className='t-label';label.textContent=t.label;
btn.appendChild(icon);btn.appendChild(label);
btn.onclick=function(){
AudioCtx.init();vibrate(10);
if(t.key==='sound'){
state.soundOn=!state.soundOn;
icon.textContent=state.soundOn?'🔊':'🔇';
if(state.soundOn)btn.classList.add('active');
else btn.classList.remove('active');
toast(state.soundOn?'音效已开启':'音效已关闭',state.soundOn?'win':'lose');
Storage.save();
}else if(t.fn){t.fn();}
};
el.appendChild(btn);
});
}

function bindChips(){
var grid=$('chipGrid');
if(!grid)return;
var chips=grid.querySelectorAll('.chip');
for(var i=0;i<chips.length;i++){
(function(chip){
chip.onclick=function(){
AudioCtx.init();vibrate(10);
for(var j=0;j<chips.length;j++)chips[j].classList.remove('on');
chip.classList.add('on');
state.chip=Number(chip.getAttribute('data-v'));
var mi=$('manualInput');
if(mi)mi.value='';
};
})(chips[i]);
}
if(chips[0])chips[0].classList.add('on');
}

function bindManualInput(){
var input=$('manualInput');
if(!input)return;
var grid=$('chipGrid');
input.oninput=function(){
var val=parseInt(input.value,10);
var chips=grid?grid.querySelectorAll('.chip'):[];
if(isNaN(val)||val<=0){
for(var j=0;j<chips.length;j++)chips[j].classList.remove('on');
if(chips[0])chips[0].classList.add('on');
state.chip=1;
input.value='';
return;
}
if(val>MAX_BET){val=MAX_BET;input.value=String(val);}
for(var k=0;k<chips.length;k++)chips[k].classList.remove('on');
state.chip=val;
};
}

// ================================================================
// 【事件绑定】
// ================================================================
function bindEvents(){
var tabs=document.querySelectorAll('.tab-btn');
for(var i=0;i<tabs.length;i++){
(function(tab){
tab.onclick=function(){
AudioCtx.init();vibrate(8);
switchTab(tab.getAttribute('data-tab'));
};
})(tabs[i]);
}

var back=$('btnBack');
if(back)back.onclick=function(){AudioCtx.init();vibrate(10);switchTab('games');};
var sback=$('btnServiceBack');
if(sback)sback.onclick=function(){AudioCtx.init();vibrate(10);switchTab('mine');};

var si=$('searchInput');
if(si){
si.oninput=function(){
var q=si.value.trim().toLowerCase();
var cards=document.querySelectorAll('.game-card');
for(var i=0;i<cards.length;i++){
var name=(cards[i].getAttribute('data-name')||'').toLowerCase();
if(!q||name.indexOf(q)>=0)cards[i].classList.remove('hidden');
else cards[i].classList.add('hidden');
}
};
}

var gameCards=document.querySelectorAll('.game-card');
for(var j=0;j<gameCards.length;j++){
(function(card){
var fav=card.querySelector('.fav-btn');
if(fav){
if(state.favorites.indexOf(card.getAttribute('data-game'))>=0){
fav.classList.add('on');fav.textContent='★';
}
fav.onclick=function(e){
if(e.stopPropagation)e.stopPropagation();
var id=card.getAttribute('data-game');
var idx=state.favorites.indexOf(id);
if(idx>=0){state.favorites.splice(idx,1);fav.classList.remove('on');fav.textContent='☆';}
else{state.favorites.push(id);fav.classList.add('on');fav.textContent='★';}
Storage.save();
};
}
card.onclick=function(){
if(card.getAttribute('data-game')==='lucky'){
AudioCtx.init();vibrate(10);switchTab('playing');
}else{
comingSoon(card.getAttribute('data-name')||'该游戏');
}
};
})(gameCards[j]);
}

var bd=$('btnDeposit');
if(bd)bd.onclick=function(){AudioCtx.init();vibrate(15);openRecharge();};
var bw=$('btnWithdraw');
if(bw)bw.onclick=function(){AudioCtx.init();vibrate(15);openWithdraw();};
var bs=$('btnService');
if(bs)bs.onclick=function(){AudioCtx.init();vibrate(15);switchTab('service');};
var bv=$('btnVip');
if(bv)bv.onclick=function(){AudioCtx.init();vibrate(15);openVIP();};

var bMyBets=$('btnMyBets');
if(bMyBets)bMyBets.onclick=function(){AudioCtx.init();vibrate(10);openMyRecords();};
var bLog=$('btnAccountLog');
if(bLog)bLog.onclick=function(){AudioCtx.init();vibrate(10);openAccountLog();};

var av=$('avatarEl');
if(av)av.onclick=function(){AudioCtx.init();vibrate(10);openEditProfile('avatar');};
var pn=$('profileNameEl');
if(pn)pn.onclick=function(){AudioCtx.init();vibrate(10);openEditProfile('nickname');};

var mc=$('modalClose');
if(mc)mc.onclick=closeModal;
var mo=$('modalOverlay');
if(mo)mo.onclick=function(e){if(e.target===mo)closeModal();};

var wo=$('winOverlay');
if(wo)wo.onclick=function(){wo.classList.remove('show');};

var ab=$('announceBtn');
if(ab)ab.onclick=closeAnnounce;

document.body.addEventListener('touchstart',function(){AudioCtx.init();},{passive:true});
document.body.addEventListener('click',function(){AudioCtx.init();});

document.addEventListener('visibilitychange',function(){
if(document.hidden){if(AudioCtx.ctx&&AudioCtx.ctx.suspend)AudioCtx.ctx.suspend();}
else{AudioCtx.init();tick();}
});

window.addEventListener('pagehide',function(){
Storage.save();
stopFakeBetting();
stopBannerAuto();
if(drawTimer)clearTimeout(drawTimer);
if(nextRoundTimer)clearTimeout(nextRoundTimer);
if(mainTimer)clearInterval(mainTimer);
});
}

// ================================================================
// 【编辑头像/昵称】
// ================================================================
function openEditProfile(type){
if(state.nickChanged){toast('已修改过，不可再改','lose');return;}
if(state.todayRecharge<100&&state.todayFlow<100){toast('需充值 100 后才可修改','lose');return;}
var wrap=document.createElement('div');
if(type==='avatar'){

      var emojis=['🦄','🐯','🐲','🦁','🐼','🐸','🐵','🐺','🦊','🐻','🐨','🐮','🐷','🐔','🦅','🦉','🐬','🐳','🦈','🐙'];
    

      wrap.innerHTML='<div style="text-align:center;margin-bottom:14px;font-size:12px;color:var(--dim);">选择一个头像</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">'+emojis.map(function(e){return '<div class="avatar-opt" data-emoji="'+e+'" style="aspect-ratio:1;border-radius:14px;background:rgba(0,0,0,.2);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;">'+e+'</div>';}).join('')+'</div>';
    
openModal('更换头像',wrap);
setTimeout(function(){
var opts=wrap.querySelectorAll('.avatar-opt');
for(var i=0;i<opts.length;i++){
opts[i].onclick=function(){
var e=this.getAttribute('data-emoji');
state.userInfo.avatar=e;
state.nickChanged=true;
Storage.save();updateProfileUI();
toast('头像已更换','win');
closeModal();
};
}
},50);
}else{

      wrap.innerHTML='<div class="form-item"><label>新昵称</label><input type="text" id="nickInput" placeholder="请输入新昵称（2~12字）" maxlength="12" value="'+state.userInfo.nickname+'"></div><button class="form-btn" id="nickSubmit" type="button">保存</button><div style="text-align:center;font-size:11px;color:var(--dim);margin-top:10px;">⚠️ 仅可修改一次</div>';
    
openModal('修改昵称',wrap);
setTimeout(function(){
var btn=$('nickSubmit');
if(btn)btn.onclick=function(){
var v=($('nickInput').value||'').trim();
if(v.length<2||v.length>12){toast('昵称 2~12 字','lose');return;}
state.userInfo.nickname=v;
state.nickChanged=true;
Storage.save();updateProfileUI();
toast('昵称已修改','win');
closeModal();
};
},50);
}
}

// ================================================================
// 【模拟公告推送】30秒推送一条公告
// ================================================================
var announceTimer=null;
function startAnnouncePush(){
// 首次推送
setTimeout(function(){

      showAnnounce('欢迎回来','欢迎来到动物总动员·3D！<br><br>今日活动：<br>· 新人认证领 88 彩金<br>· 连签 7 天得 88 彩金<br><br>祝您游戏愉快！');
    
},1500);
// 每60秒推一条
announceTimer=setInterval(function(){
var list=[
{title:'活动通知',body:'今日充值满 100 即可参与签到活动，连签 7 天得 88 彩金！'},
{title:'系统公告',body:'平台新增「独家尊享」游戏分类，欢迎体验自研游戏！'},
{title:'风控提醒',body:'请勿对压/刷水，系统自动检测，违规将冻结账号。'},
{title:'VIP 特权',body:'充值越多，VIP 等级越高，反水点位越高，提现额度越大！'}
];
var pick=list[Math.floor(Math.random()*list.length)];
showAnnounce(pick.title,pick.body);
},60000);
}

// ================================================================
// 【启动】
// ================================================================
function boot(){
try{checkDailyReset();}catch(e){console.error('[boot]checkDailyReset',e);}
try{checkVipKeep();}catch(e){console.error('[boot]checkVipKeep',e);}
try{generateAnnouncements();}catch(e){console.error('[boot]generateAnnouncements',e);}
try{renderMarquee();}catch(e){console.error('[boot]renderMarquee',e);}
try{buildBanner();}catch(e){console.error('[boot]buildBanner',e);}
try{buildQuickGrid();}catch(e){console.error('[boot]buildQuickGrid',e);}
try{buildDiscoverActivity();}catch(e){console.error('[boot]buildDiscoverActivity',e);}
try{buildCategoryTabs();}catch(e){console.error('[boot]buildCategoryTabs',e);}
try{buildMenuList();}catch(e){console.error('[boot]buildMenuList',e);}
try{buildPlayTabs();}catch(e){console.error('[boot]buildPlayTabs',e);}
try{buildToolBar();}catch(e){console.error('[boot]buildToolBar',e);}
try{buildBoard();}catch(e){console.error('[boot]buildBoard',e);}
try{bindChips();}catch(e){console.error('[boot]bindChips',e);}
try{bindManualInput();}catch(e){console.error('[boot]bindManualInput',e);}
try{bindEvents();}catch(e){console.error('[boot]bindEvents',e);}
try{renderAll();}catch(e){console.error('[boot]renderAll',e);}
try{syncDiscover();}catch(e){console.error('[boot]syncDiscover',e);}
try{updateDiscoverTimer();}catch(e){console.error('[boot]updateDiscoverTimer',e);}
try{updateProfileUI();}catch(e){console.error('[boot]updateProfileUI',e);}
// 在线人数
updateOnlineCount();
setInterval(updateOnlineCount,5000);
// 公告推送
startAnnouncePush();
// 恢复游戏
setTimeout(function(){
try{
if(state.phase==='idle'||state.phase==='result'||state.phase==='drawing'){
startRound();
}else if(state.phase==='betting'){
if(state.phaseStartTs){
var elapsed=Math.floor((Date.now()-state.phaseStartTs)/1000);
state.timeLeft=Math.max(0,ROUND_SECONDS-elapsed);
if(state.timeLeft<=0){draw();}
else{startFakeBetting();}
}else{startRound();}
}
}catch(e){console.error('[boot]startRound',e);}
},600);
mainTimer=setInterval(tick,500);
// 定期检查 VIP 保级（每小时一次）
setInterval(checkVipKeep,3600*1000);
}

if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',boot);
}else{
boot();
}

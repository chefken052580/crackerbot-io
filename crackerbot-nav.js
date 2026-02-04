(function(){
'use strict';
var APPS=[
{id:'chat',icon:null,img:'/images/crackerbot-icon.png',label:'CrackerBot',isHome:true},
{id:'meme-forge',icon:'🪙',label:'Meme Forge',desc:'Create and launch meme coins'},
{id:'nft-lab',icon:'🖼️',label:'NFT Lab',desc:'NFT creation and evolution'},
{id:'degen-quest',icon:'🎮',label:'Degen Quest',desc:'Crypto adventure game'},
{id:'token-scanner',icon:'📡',label:'Token Scanner',desc:'Live token prices and trends'},
{id:'settings',icon:'⚙️',label:'Settings',desc:'Customize your experience'}
];
var currentApp='chat';
function init(){
var c=document.querySelector('.app-container');
if(!c){setTimeout(init,200);return;}
buildNav(c);buildAppViews(c);switchApp('chat');
console.log('[Nav] Initialized with '+APPS.length+' apps');
}
function buildNav(container){
var nav=document.createElement('div');nav.className='nav-sidebar';
for(var i=0;i<APPS.length;i++){
var app=APPS[i];
if(i===1){var d=document.createElement('div');d.className='nav-divider';nav.appendChild(d);}
var btn=document.createElement('button');
btn.className='nav-icon'+(app.id==='chat'?' active':'');
btn.setAttribute('data-app',app.id);btn.setAttribute('data-tooltip',app.label);
if(app.img){var img=document.createElement('img');img.src=app.img;img.alt=app.label;img.onerror=function(){this.parentElement.textContent='🚀';};btn.appendChild(img);}
else{btn.textContent=app.icon;}
(function(id){btn.addEventListener('click',function(){switchApp(id);})})(app.id);
nav.appendChild(btn);
}
var ticker=document.createElement('div');ticker.className='nav-token-ticker';
ticker.innerHTML='<div class="nav-ticker-item"><span class="sym">SOL</span><span class="price" id="nav-sol">--</span></div><div class="nav-ticker-item"><span class="sym">BONK</span><span class="price" id="nav-bonk">--</span></div>';
nav.appendChild(ticker);
container.insertBefore(nav,container.firstChild);
updateNavPrices();setInterval(updateNavPrices,30000);
}
function buildAppViews(container){
var chat=document.querySelector('.chat-container');if(!chat)return;
for(var i=0;i<APPS.length;i++){
var app=APPS[i];if(app.id==='chat')continue;
var v=document.createElement('div');v.className='app-view';v.id='app-'+app.id;
v.innerHTML='<h2>'+app.icon+' '+app.label+'</h2><p class="app-desc">'+(app.desc||'')+'</p><div class="app-coming-soon"><div class="icon">'+app.icon+'</div><div class="title">Coming Soon</div><div class="sub">This app is under development</div></div>';
chat.parentNode.insertBefore(v,chat.nextSibling);
}
}
function switchApp(appId){
currentApp=appId;
var icons=document.querySelectorAll('.nav-icon');
for(var i=0;i<icons.length;i++){
if(icons[i].getAttribute('data-app')===appId)icons[i].classList.add('active');
else icons[i].classList.remove('active');
}
var chat=document.querySelector('.chat-container');
if(chat)chat.style.display=(appId==='chat')?'flex':'none';
var views=document.querySelectorAll('.app-view');
for(var j=0;j<views.length;j++){
if(views[j].id==='app-'+appId)views[j].classList.add('active');
else views[j].classList.remove('active');
}
for(var k=0;k<APPS.length;k++){
if(APPS[k].id===appId){document.title='CrackerBot - '+APPS[k].label;break;}
}
console.log('[Nav] Switched to: '+appId);
}
function updateNavPrices(){
var solEl=document.getElementById('nav-sol');
var bonkEl=document.getElementById('nav-bonk');
if(window.tokenPrices){
if(solEl&&window.tokenPrices.SOL)solEl.textContent='$'+window.tokenPrices.SOL;
if(bonkEl&&window.tokenPrices.BONK)bonkEl.textContent='$'+window.tokenPrices.BONK;
return;
}
try{fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112')
.then(function(r){return r.json();}).then(function(data){
if(data&&data.pairs&&data.pairs[0]){var p=parseFloat(data.pairs[0].priceUsd);
if(solEl&&p){solEl.textContent='$'+p.toFixed(2);solEl.className='price up';}}
}).catch(function(){});}catch(e){}
}
window.switchToApp=switchApp;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
})();

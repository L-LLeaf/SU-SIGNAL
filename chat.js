(() => {
  const KEY="su-signal-chat-v1", $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const uid=()=> "m-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
  const now=()=>new Date().toISOString();
  let root=null, messages=[], timer=null, activeTimer=null, pending=false, lastTrigger=0, specialDates={};
  const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||"null")??d}catch{return d}};
  const write=()=>localStorage.setItem(KEY,JSON.stringify(messages));
  const engine=()=>({...((window.SUSignalEngine?.getSettings?.())||{})});
  const profile=()=>read("su-signal-profile-v1",{});
  const style=()=>read("su-signal-style-v1",{});
  const defaults={delayMin:3,delayMax:8,activeMin:30,activeMax:90,noReplyChance:15,quoteChance:20,combineEnabled:false,combineChance:15,inputStateEnabled:true,inputStateText:"SU IS TYPING...",animationEnabled:true,connectionText:"CONNECTION ESTABLISHED",cooldown:0};
  const cfg=()=>({...defaults,...engine()});
  function avatar(who){const p=profile();return who==="su"?(p.suAvatar||""):(p.playerAvatar||"");}
  function name(who){const p=profile();return who==="su"?(p.suName||"苏新皓"):(p.playerName||"LIGHT");}
  function formatTime(v){const d=new Date(v);return d.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});}
  function dateKey(v){const d=new Date(v);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function dateLabel(v){const d=new Date(v),t=new Date();if(dateKey(v)===dateKey(t))return"今天";const y=new Date(t);y.setDate(t.getDate()-1);if(dateKey(v)===dateKey(y))return"昨天";return d.toLocaleDateString("zh-CN",{month:"long",day:"numeric"});}
  function scrollBottom(){const el=$("#chat-scroll",root);if(el)el.scrollTop=el.scrollHeight;}
  function render(){
    if(!root)return;
    const s=style(), showNames=s.showNames!==false, showAvatars=s.showAvatars!==false, showTime=s.showTimestamps===true;
    const sorted=[...messages].sort((a,b)=>new Date(a.time)-new Date(b.time));
    let lastDate="";
    const rows=sorted.map(m=>{
      const day=dateKey(m.time);let sep="";
      if(day!==lastDate){sep='<div class="chat-date-sep"><span>'+esc(dateLabel(m.time))+'</span></div>';lastDate=day;}
      const own=m.who==="player", cls=own?"player":"su";
      const avatarHtml=showAvatars?'<div class="chat-avatar">'+(avatar(m.who)?'<img src="'+esc(avatar(m.who))+'" alt="">':(own?"L":"SU"))+'</div>':"";
      const quoted=m.quote?'<div class="chat-quoted">'+esc(m.quote)+'</div>':"";
      const recalled=m.recalled?'<em class="chat-recalled">这条消息已撤回</em>':esc(m.text);
      return sep+'<article class="chat-message '+cls+(m.favorite?' is-favorite':'')+'" data-id="'+esc(m.id)+'">'+(!own?avatarHtml:"")+'<div class="chat-message-main">'+(showNames?'<div class="chat-name">'+esc(name(m.who))+'</div>':"")+'<div class="chat-bubble-wrap">'+quoted+'<div class="chat-bubble">'+recalled+'</div></div>'+(showTime||m.showTime?'<time>'+formatTime(m.time)+'</time>':"")+'</div>'+(own?avatarHtml:"")+'</article>';
    }).join("");
    root.innerHTML='<header class="app-view-header"><button class="back-button" data-chat-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — PRIVATE LINE</span></header>'+
      '<section class="chat-topline"><div><p class="eyebrow">PRIVATE CHANNEL / 001</p><h2>CHAT <em>对话</em></h2></div><div class="chat-online"><i></i> SIGNAL READY</div></section>'+
      '<section class="chat-panel"><div class="chat-contact"><div class="chat-contact-avatar">'+(avatar("su")?'<img src="'+esc(avatar("su"))+'" alt="">':"SU")+'</div><div><strong>'+esc(name("su"))+'</strong><small>ONLY YOU & ME / 001</small></div><span class="chat-contact-status">PRIVATE</span></div>'+
      '<div class="chat-scroll" id="chat-scroll">'+(rows||'<div class="chat-empty">这里还没有消息。<br>发送一句话，开始你们的对话。</div>')+'</div>'+
      '<div class="chat-connection" id="chat-connection" hidden></div>'+
      '<div class="chat-input-area"><textarea id="chat-input" rows="2" placeholder="发送消息…"></textarea><div class="chat-input-actions"><span>每次点击「连接」最多触发一条回复</span><div><button data-chat-act="send" class="chat-send">发送</button><button data-chat-act="speak" class="chat-speak">连接 ↗</button></div></div></div></section>'+
      '<div class="chat-bottom-tools"><div class="chat-bottom-actions"><button data-chat-act="clear">清空聊天</button><button data-chat-act="export">导出聊天</button></div><span>消息仅保存在当前设备</span></div>'+
      '<div class="chat-modal" id="chat-modal" hidden><div class="chat-dialog" id="chat-dialog"></div></div>';
    scrollBottom();
  }
  function append(who,text,extra={}){const m={id:uid(),who,text,time:now(),...extra};messages.push(m);write();render();return m;}
  function filtered(){return messages.filter(m=>!m.recalled&&m.text);}
  function getCards(){const all=window.SUSignalCards?.getAll?.()||[];return all.filter(c=>c&&c.text&&!c.disabled);}
  function chooseCard(){const all=getCards();if(!all.length)return null;const custom=all.filter(c=>c.source==="custom"),built=all.filter(c=>c.source!=="custom");const pool=[...built,...custom];return pool[Math.floor(Math.random()*pool.length)];}
  function chooseReply(){
    const s=cfg(), all=getCards();if(!all.length)return{text:"我看到你的消息啦。",id:null};
    if(Math.random()*100<s.noReplyChance)return{noReply:true};
    const recent=messages.filter(m=>m.who==="player"&&!m.recalled).slice(-10);
    let quote=null;if(recent.length&&Math.random()*100<s.quoteChance)quote=recent[Math.floor(Math.random()*recent.length)].text;
    const card=chooseCard();if(!card)return{text:"我看到你的消息啦。"};
    if(s.combineEnabled&&Math.random()*100<s.combineChance){
      const second=chooseCard();if(second&&second.id!==card.id)return{text:card.text+" "+second.text,id:card.id,secondId:second.id,quote};
    }
    return{text:card.text,id:card.id,quote};
  }
  function markUsage(reply){if(reply?.id)window.SUSignalCards?.markUsed?.(reply.id);if(reply?.secondId)window.SUSignalCards?.markUsed?.(reply.secondId);}
  function setConnection(text,show=true){const el=$("#chat-connection",root);if(!el)return;el.hidden=!show;el.textContent=text||"";}
  function delay(ms){return new Promise(r=>timer=setTimeout(r,ms));}
  async function speak(){
    if(pending)return;
    const s=cfg(),cd=Math.max(0,Number(s.cooldown)||0),remain=cd*1000-(Date.now()-lastTrigger);
    if(remain>0){setConnection("请稍等 "+Math.ceil(remain/1000)+" 秒后再触发。");return;}
    pending=true;lastTrigger=Date.now();
    const reply=chooseReply();
    if(s.animationEnabled){setConnection("SIGNAL CONNECTING...");await delay(550);setConnection("ESTABLISHING CONNECTION...");await delay(500);}
    if(s.inputStateEnabled){setConnection(s.inputStateText||"SU IS TYPING...");}
    const min=Math.max(0,Number(s.delayMin)||0),max=Math.max(min,Number(s.delayMax)||min);
    await delay((min+Math.random()*(max-min))*1000);
    if(reply.noReply){setConnection("CONNECTION ESTABLISHED · 已读");await delay(900);setConnection("",false);pending=false;return;}
    markUsage(reply);
    append("su",reply.text,{quote:reply.quote||null,cardId:reply.id||null});
    setConnection(s.connectionText||"CONNECTION ESTABLISHED");await delay(1100);setConnection("",false);pending=false;
  }
  function showModal(html){const m=$("#chat-modal",root),d=$("#chat-dialog",root);d.innerHTML=html;m.hidden=false;}
  function closeModal(){$("#chat-modal",root).hidden=true;}
  function action(a,id){
    const m=messages.find(x=>x.id===id);
    if(a==="back"){clearTimeout(timer);clearInterval(activeTimer);window.SUSignalCloseApp?.();return;}
    if(a==="send"){const input=$("#chat-input",root),text=input.value.trim();if(!text)return;append("player",text);input.value="";return;}
    if(a==="speak"){speak();return;}
    if(a==="export"){const body=messages.map(m=>'['+new Date(m.time).toLocaleString("zh-CN")+'] '+(m.who==="player"?"LIGHT":"SU")+': '+(m.recalled?"[已撤回]":m.text)).join("\\n");const u=URL.createObjectURL(new Blob([body],{type:"text/plain;charset=utf-8"}));const link=document.createElement("a");link.href=u;link.download="SU-SIGNAL-聊天记录.txt";link.click();URL.revokeObjectURL(u);return;}
    if(a==="clear"&&confirm("确定清空全部聊天记录吗？此操作无法撤销。")){messages=[];write();render();return;}
    if(a==="modal-close"){closeModal();return;}
    if(a==="favorite"&&m){m.favorite=!m.favorite;write();render();return;}
    if(a==="recall"&&m&&confirm("确定撤回这条消息吗？")){m.recalled=true;write();render();return;}
    if(a==="edit"&&m&&m.who==="player"){showModal('<div class="chat-dialog-head"><strong>编辑消息</strong><button data-chat-act="modal-close">×</button></div><textarea id="chat-edit-text">'+esc(m.text)+'</textarea><div class="chat-dialog-actions"><button data-chat-act="modal-close">取消</button><button data-chat-act="edit-save" data-id="'+esc(id)+'">保存修改</button></div>');return;}
    if(a==="edit-save"&&m){const v=$("#chat-edit-text",root).value.trim();if(v){m.text=v;write();closeModal();render();}return;}
    if(a==="quote"&&m){const input=$("#chat-input",root);input.value="引用："+m.text+"\\n";input.focus();return;}
  }
  function messageMenu(e){const item=e.target.closest(".chat-message");if(!item)return;const id=item.dataset.id,m=messages.find(x=>x.id===id);if(!m)return;showModal('<div class="chat-dialog-head"><strong>消息操作</strong><button data-chat-act="modal-close">×</button></div><p class="chat-menu-preview">'+esc(m.text||"这条消息已撤回")+'</p><div class="chat-menu-grid">'+(m.who==="player"?'<button data-chat-act="edit" data-id="'+id+'">编辑</button><button data-chat-act="recall" data-id="'+id+'">撤回</button>':"")+'<button data-chat-act="quote" data-id="'+id+'">引用</button><button data-chat-act="favorite" data-id="'+id+'">'+(m.favorite?"取消收藏":"收藏")+'</button><button data-chat-act="modal-close">关闭</button></div>');}
  function startActive(){clearInterval(activeTimer);const s=cfg(),min=Math.max(1,Number(s.activeMin)||30),max=Math.max(min,Number(s.activeMax)||90);const ms=(min+Math.random()*(max-min))*60000;activeTimer=setTimeout(()=>{if(!document.hidden&&!pending&&root?.isConnected){const c=chooseCard();if(c){append("su",c.text,{cardId:c.id,proactive:true});window.SUSignalCards?.markUsed?.(c.id);}}startActive();},ms);}
  async function init(el){root=el;messages=read(KEY,[]);if(!Array.isArray(messages))messages=[];render();if(root.dataset.chatBound)return;root.dataset.chatBound="1";
    root.addEventListener("click",e=>{const b=e.target.closest("[data-chat-act]");if(b){action(b.dataset.chatAct,b.dataset.id);return;}if(e.target.closest(".chat-message"))messageMenu(e);});
    root.addEventListener("keydown",e=>{if(e.target.id==="chat-input"&&e.key==="Enter"&&!e.shiftKey){e.preventDefault();action("send");}});
    startActive();
  }
  window.SUSignalChat={init,getMessages:()=>messages,append};
})();
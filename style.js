(() => {
  const KEY="su-signal-style-v1";
  const defaults={theme:"system",fontSize:16,fontUrl:"",fontCss:"",bubbleCss:"",bubbleUrl:"",chatBackground:"",showNames:true,showAvatars:true,showTimestamps:false,showReadState:true,showInputState:true,inputStateText:"对方正在输入…"};
  let root=null,state=null;
  const $=(s,r=root)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function load(){try{state={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{state={...defaults}}}
  function persist(){localStorage.setItem(KEY,JSON.stringify(state));apply();status("设置已保存");}
  function addStyle(id,css){let el=document.getElementById(id);if(!el){el=document.createElement("style");el.id=id;document.head.appendChild(el)}el.textContent=css||""}
  function apply(){
    const html=document.documentElement;
    html.dataset.suTheme=state.theme;
    html.style.setProperty("--su-chat-font-size",Math.max(12,Math.min(22,Number(state.fontSize)||16))+"px");
    const bg=state.chatBackground;
    addStyle("su-style-custom",`
      .chat-panel{background-image:none}
      .chat-scroll{background-color:#fffafa;background-image:${bg?'url("'+bg+'")':'none'};background-size:cover;background-position:center;background-repeat:no-repeat}
      .chat-date-sep span{background:rgba(255,250,250,.82)}
      .chat-scroll{font-size:var(--su-chat-font-size,16px)}
      ${state.fontCss||""}
      ${state.bubbleCss||""}
    `);
    let link=document.getElementById("su-style-font-link");
    if(state.fontUrl){if(!link){link=document.createElement("link");link.id="su-style-font-link";link.rel="stylesheet";document.head.appendChild(link)}link.href=state.fontUrl}else if(link)link.remove();
    let bubble=document.getElementById("su-style-bubble-link");
    if(state.bubbleUrl){if(!bubble){bubble=document.createElement("link");bubble.id="su-style-bubble-link";bubble.rel="stylesheet";document.head.appendChild(bubble)}bubble.href=state.bubbleUrl}else if(bubble)bubble.remove();
  }
  function status(t){const el=$("#style-status");if(el)el.textContent=t}
  function render(){
    root.innerHTML=`
      <header class="app-view-header"><button class="back-button" data-style-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — STYLE</span></header>
      <section class="style-heading"><p class="eyebrow">APPEARANCE / 05</p><h2>STYLE<br><em>外观设置</em></h2><p>调整聊天界面与整体显示方式。设置保存在当前设备，可随时恢复默认。</p></section>
      <section class="style-section"><div class="style-section-title"><span>01 / THEME</span><strong>主题模式</strong></div><div class="style-choice-row">
        <label><input type="radio" name="style-theme" value="light" ${state.theme==="light"?"checked":""}><span>日间</span></label>
        <label><input type="radio" name="style-theme" value="dark" ${state.theme==="dark"?"checked":""}><span>夜间</span></label>
        <label><input type="radio" name="style-theme" value="system" ${state.theme==="system"?"checked":""}><span>跟随系统</span></label>
      </div></section>
      <section class="style-section"><div class="style-section-title"><span>02 / TYPOGRAPHY</span><strong>字体</strong></div><label class="style-label">聊天字号 <output id="style-font-output">${Number(state.fontSize)||16}px</output></label><input class="style-range" id="style-font-size" type="range" min="12" max="22" value="${Number(state.fontSize)||16}"><label class="style-label">自定义字体样式表 URL</label><input class="style-input" id="style-font-url" type="url" placeholder="https://…/font.css" value="${esc(state.fontUrl)}"><label class="style-label">自定义字体 CSS</label><textarea class="style-textarea" id="style-font-css" rows="3" placeholder="例如：@font-face { font-family: MyFont; src: url(...); }\nbody { font-family: MyFont, serif; }">${esc(state.fontCss)}</textarea></section>
      <section class="style-section"><div class="style-section-title"><span>03 / CHAT BUBBLES</span><strong>聊天气泡</strong></div><label class="style-label">气泡 CSS 样式表 URL</label><input class="style-input" id="style-bubble-url" type="url" placeholder="https://…/bubble.css" value="${esc(state.bubbleUrl)}"><label class="style-label">自定义气泡 CSS</label><textarea class="style-textarea" id="style-bubble-css" rows="4" placeholder=".chat-bubble { border-radius: 18px; }">${esc(state.bubbleCss)}</textarea><p class="style-hint">CSS 仅作用于当前页面；请使用可信来源的样式表。</p></section>
      <section class="style-section"><div class="style-section-title"><span>04 / CHAT BACKGROUND</span><strong>聊天背景</strong></div><div class="style-background-preview">${state.chatBackground?'<img src="'+esc(state.chatBackground)+'" alt="聊天背景预览">':'<span>RED / WHITE DEFAULT</span>'}</div><label class="style-upload">上传聊天背景图片<input id="style-bg-file" type="file" accept="image/*"></label><button class="style-text-button" data-style-act="reset-bg">恢复红白默认背景</button></section>
      <section class="style-section"><div class="style-section-title"><span>05 / CHAT DISPLAY</span><strong>聊天显示</strong></div>
        ${toggle("showNames","显示双方昵称")}${toggle("showAvatars","显示双方头像")}${toggle("showTimestamps","显示消息时间")}${toggle("showReadState","显示已读状态")}${toggle("showInputState","显示输入状态")}
        <label class="style-label">输入状态自定义内容</label><input class="style-input" id="style-input-text" value="${esc(state.inputStateText)}" placeholder="对方正在输入…">
      </section>
      <section class="style-section"><div class="style-section-title"><span>06 / PREVIEW</span><strong>实时预览</strong></div><div class="style-preview"><div class="style-preview-head"><span class="style-preview-avatar">SU</span><strong>苏新皓</strong><small>ONLY YOU &amp; ME</small></div><div class="style-preview-msg"><span>今天过得怎么样？</span><small>12:08</small></div><div class="style-preview-msg own"><span>还不错，你呢？</span><small>12:09 · 已读</small></div><div class="style-preview-typing">对方正在输入…</div></div></section>
      <div class="style-actions"><span id="style-status" role="status"></span><button data-style-act="save">保存设置 ↗</button></div>
      <div class="style-footer-actions"><button data-style-act="export">导出外观设置</button><button data-style-act="import">导入设置</button><button data-style-act="reset">全部恢复默认</button><input id="style-import-file" type="file" accept="application/json" hidden></div>
      <p class="style-hint">导出文件包含主题、字体、气泡、显示选项与聊天背景图片。背景图会一起打包在 JSON 中。</p>`;
    bindValues();
  }
  function toggle(key,label){return '<label class="style-toggle"><span>'+label+'</span><input type="checkbox" data-style-toggle="'+key+'" '+(state[key]?"checked":"")+'><i></i></label>'}
  function bindValues(){
    root.querySelectorAll("[data-style-toggle]").forEach(el=>el.addEventListener("change",()=>{state[el.dataset.styleToggle]=el.checked;applyPreview()}));
    root.querySelectorAll('input[name="style-theme"]').forEach(el=>el.addEventListener("change",()=>{state.theme=el.value;applyPreview()}));
    $("#style-font-size").addEventListener("input",e=>{$("#style-font-output").textContent=e.target.value+"px";state.fontSize=Number(e.target.value);applyPreview()});
    ["style-font-url","style-font-css","style-bubble-url","style-bubble-css","style-input-text"].forEach(id=>$("#"+id).addEventListener("input",()=>{const map={"style-font-url":"fontUrl","style-font-css":"fontCss","style-bubble-url":"bubbleUrl","style-bubble-css":"bubbleCss","style-input-text":"inputStateText"};state[map[id]]=$("#"+id).value;applyPreview()}));
    $("#style-bg-file").addEventListener("change",e=>readBackground(e.target.files?.[0]));
  }
  function applyPreview(){apply();const p=$("#style-preview",root);if(p){p.classList.toggle("is-dark",state.theme==="dark"||(state.theme==="system"&&matchMedia("(prefers-color-scheme: dark)").matches));p.querySelector(".style-preview-head").style.display=state.showNames||state.showAvatars?"flex":"none";p.querySelector(".style-preview-avatar").style.display=state.showAvatars?"grid":"none";p.querySelector(".style-preview-head strong").style.display=state.showNames?"":"none";p.querySelectorAll(".style-preview-msg small").forEach(x=>x.style.display=state.showTimestamps?"":"none");p.querySelector(".style-preview-typing").style.display=state.showInputState?"":"none";}}
  function readBackground(file){if(!file)return;if(!file.type.startsWith("image/")){status("请选择图片文件");return}if(file.size>8*1024*1024){status("图片请控制在 8MB 以内");return}const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas"),max=1400,scale=Math.min(1,max/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);state.chatBackground=canvas.toDataURL("image/jpeg",.78);const box=$(".style-background-preview");box.innerHTML='<img src="'+state.chatBackground+'" alt="聊天背景预览">';applyPreview();status("背景已更换，记得保存");};img.onerror=()=>status("图片读取失败");img.src=reader.result};reader.onerror=()=>status("图片读取失败");reader.readAsDataURL(file)}
  function download(name,data,type){const u=URL.createObjectURL(new Blob([data],{type})),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  function action(a){if(a==="back"){window.SUSignalCloseApp?.();return}if(a==="save"){persist();return}if(a==="reset-bg"){state.chatBackground="";render();apply();status("已恢复红白默认背景，请保存设置");return}if(a==="reset"){if(confirm("确定恢复全部外观默认设置吗？")){state={...defaults};persist();render()}return}if(a==="export"){persist();download("SU-SIGNAL-外观设置.json",JSON.stringify({version:1,settings:state},null,2),"application/json");return}if(a==="import"){$("#style-import-file").click();return}}
  function init(el){root=el;load();render();apply();if(root.dataset.styleBound)return;root.dataset.styleBound="1";root.addEventListener("click",e=>{const b=e.target.closest("[data-style-act]");if(b)action(b.dataset.styleAct)});root.addEventListener("change",e=>{if(e.target.id==="style-import-file"){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.settings||typeof x.settings!=="object")throw Error();state={...defaults,...x.settings};persist();render()}catch{status("文件格式不正确，导入失败")}};r.readAsText(f);e.target.value=""}})}
  window.SUSignalStyle={init,getSettings:()=>({...state}),apply};
})();
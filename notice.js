(() => {
  const KEY="su-signal-notice-v1";
  const defaults={enabled:true,proactiveEnabled:true,displayName:"苏新皓",preview:"给你发来一条新消息"};
  let root=null,state=null;
  const $=(s,r=root)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function load(){try{state={...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{state={...defaults}}}
  function save(){localStorage.setItem(KEY,JSON.stringify(state));render();status("设置已保存")}
  function permission(){if(!("Notification"in window))return"unsupported";return Notification.permission}
  function status(t){const el=$("#notice-status");if(el)el.textContent=t}
  function render(){
    root.innerHTML='<header class="app-view-header"><button class="back-button" data-notice-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — NOTICE</span></header>'+
    '<section class="notice-heading"><p class="eyebrow">NOTIFICATION / 06</p><h2>NOTICE<br><em>通知</em></h2><p>管理主动消息提醒，以及浏览器是否可以向你发送通知。</p></section>'+
    '<section class="notice-section"><div class="notice-section-title"><span>01 / MASTER SWITCH</span><strong>通知总开关</strong></div>'+toggle("enabled","启用通知")+'<p class="notice-hint">关闭后，SU / SIGNAL 不会主动弹出浏览器通知。</p></section>'+
    '<section class="notice-section"><div class="notice-section-title"><span>02 / PROACTIVE MESSAGE</span><strong>主动消息提醒</strong></div>'+toggle("proactiveEnabled","收到苏新皓主动消息时提醒")+'<p class="notice-hint">仅对聊天中由系统主动触发的新消息生效，不影响你手动连接后的回复。</p><button class="notice-permission-button" data-notice-act="test">立即测试主动消息 ↗</button><p class="notice-hint">点击后会在 CHAT 中生成一条测试主动消息，并尝试发送系统通知。</p></section>'+
    '<section class="notice-section"><div class="notice-section-title"><span>03 / DISPLAY</span><strong>通知显示内容</strong></div><label class="notice-label">通知显示名称</label><input class="notice-input" id="notice-name" maxlength="32" value="'+esc(state.displayName)+'" placeholder="苏新皓"><label class="notice-label">通知预览文字</label><input class="notice-input" id="notice-preview" maxlength="100" value="'+esc(state.preview)+'" placeholder="给你发来一条新消息"><div class="notice-preview"><span class="notice-preview-icon">SU</span><div><strong id="notice-preview-name">'+esc(state.displayName||"苏新皓")+'</strong><p id="notice-preview-text">'+esc(state.preview||"给你发来一条新消息")+'</p><small>现在</small></div></div></section>'+
    '<section class="notice-section"><div class="notice-section-title"><span>04 / BROWSER PERMISSION</span><strong>浏览器通知权限</strong></div><div class="notice-permission"><span>当前权限</span><strong id="notice-permission-value">'+permissionLabel()+'</strong></div><button class="notice-permission-button" data-notice-act="permission">请求 / 检查通知权限 ↗</button><p class="notice-hint">需要浏览器支持并允许通知。若此前选择了拒绝，请到浏览器的网站设置中手动修改。</p></section>'+
    '<div class="notice-actions"><span id="notice-status" role="status"></span><button data-notice-act="save">保存设置 ↗</button></div>'+
    '<p class="notice-footnote">通知仅在本设备本浏览器中生效。网页关闭或浏览器限制后台运行时，无法保证送达。</p>';
    bind();
  }
  function permissionLabel(){const p=permission();return p==="granted"?"已允许":p==="denied"?"已拒绝":p==="default"?"尚未决定":"浏览器不支持"}
  function toggle(k,label){return '<label class="notice-toggle"><span>'+label+'</span><input type="checkbox" data-notice-toggle="'+k+'" '+(state[k]?"checked":"")+'><i></i></label>'}
  function bind(){
    root.querySelectorAll("[data-notice-toggle]").forEach(el=>el.addEventListener("change",()=>{state[el.dataset.noticeToggle]=el.checked}));
    $("#notice-name").addEventListener("input",e=>{$("#notice-preview-name").textContent=e.target.value||"苏新皓";state.displayName=e.target.value});
    $("#notice-preview").addEventListener("input",e=>{$("#notice-preview-text").textContent=e.target.value||"给你发来一条新消息";state.preview=e.target.value});
  }
  async function requestPermission(){
    if(!("Notification"in window)){status("当前浏览器不支持通知");return}
    if(!window.isSecureContext){status("请通过 HTTPS 页面使用浏览器通知");return}
    try{const p=await Notification.requestPermission();$("#notice-permission-value").textContent=permissionLabel();status(p==="granted"?"通知权限已允许":p==="denied"?"通知权限被拒绝":"尚未获得通知权限")}catch{status("权限请求失败，请检查浏览器设置")}
  }
  async function action(a){if(a==="back"){window.SUSignalCloseApp?.();return}if(a==="save"){save();return}if(a==="permission"){requestPermission();return}if(a==="test"){const result=await window.SUSignalChat?.testProactive?.();if(!result?.sent){status("测试消息未生成，请先确认字卡库已加载。");return}status(result.notified?"测试消息已生成，系统通知已尝试发送。":"测试消息已生成；当前没有可用的通知权限，请先允许通知。");return}}
  function init(el){root=el;load();render();if(root.dataset.noticeBound)return;root.dataset.noticeBound="1";root.addEventListener("click",e=>{const b=e.target.closest("[data-notice-act]");if(b)action(b.dataset.noticeAct)})}
  window.SUSignalNotice={init,getSettings:()=>{try{return{...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return{...defaults}}},notifyProactive(message){const s=window.SUSignalNotice.getSettings();if(!s.enabled||!s.proactiveEnabled||!("Notification"in window)||Notification.permission!=="granted")return false;try{const n=new Notification(s.displayName||"苏新皓",{body:s.preview||"给你发来一条新消息",tag:"su-signal-proactive",renotify:true});n.onclick=()=>{window.focus();n.close()};return true}catch{return false}}};
})();
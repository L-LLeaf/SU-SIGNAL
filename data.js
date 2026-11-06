(() => {
  const KEYS = {
    cards:"su-signal-cards-v1",
    chat:"su-signal-chat-v1",
    profile:"su-signal-profile-v1",
    engine:"su-signal-engine-v1",
    style:"su-signal-style-v1",
    moments:"su-signal-moments-v1"
  };
  const $=(s,r=document)=>r.querySelector(s);
  let root=null;
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function collect(){const data={};for(const [name,key] of Object.entries(KEYS)){const value=localStorage.getItem(key);if(value!==null)data[name]=value;}return data;}
  function stats(data){const parse=(name,fallback)=>{try{return JSON.parse(data[name]??"null")??fallback}catch{return fallback}};const cards=parse("cards",{}),chat=parse("chat",[]),moments=parse("moments",[]);return {cards:Array.isArray(cards.custom)?cards.custom.length:0,messages:Array.isArray(chat)?chat.length:0,moments:Array.isArray(moments)?moments.length:0};}
  function download(){
    const backup={app:"SU / SIGNAL",formatVersion:1,exportedAt:new Date().toISOString(),data:collect()};
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="SU-SIGNAL-backup-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    status("备份文件已生成，请检查浏览器下载记录。");
  }
  function status(t){const el=$("#data-status");if(el)el.textContent=t;}
  function render(){
    if(!root)return;
    const snap=stats(collect());
    root.innerHTML='<header class="app-view-header"><button class="back-button" data-data-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — DATA</span></header>'+
      '<section class="data-heading"><p class="eyebrow">LOCAL DATA / 07</p><h2>DATA<br><em>数据管理</em></h2><p>备份或恢复这台设备上的 SU / SIGNAL 数据。头像与聊天背景等图片也会一并保存。</p></section>'+
      '<section class="data-section"><div class="data-section-title"><span>01 / LOCAL SNAPSHOT</span><strong>当前本地数据</strong></div><div class="data-stats"><div><strong>'+snap.messages+'</strong><span>聊天消息</span></div><div><strong>'+snap.cards+'</strong><span>自定义字卡</span></div><div><strong>'+snap.moments+'</strong><span>自定义瞬间</span></div></div><p class="data-hint">内置字卡和系统隐藏特殊日期由程序提供，不需要备份。</p></section>'+
      '<section class="data-section"><div class="data-section-title"><span>02 / EXPORT</span><strong>导出完整备份</strong></div><p class="data-copy">将聊天记录、字卡及使用统计、个人资料、头像、回复引擎、外观设置、聊天背景和自定义瞬间打包成一个 JSON 文件。</p><button class="data-primary" data-data-act="export">导出备份文件 ↗</button></section>'+
      '<section class="data-section"><div class="data-section-title"><span>03 / RESTORE</span><strong>从备份恢复</strong></div><p class="data-copy">选择此前导出的 SU / SIGNAL JSON 备份。恢复会替换当前设备中对应的项目数据，建议先导出一份当前备份。</p><label class="data-file-label">选择备份文件<input id="data-file" type="file" accept=".json,application/json"></label><p class="data-hint">只接受本应用生成的有效备份；恢复完成后页面会自动刷新。</p></section>'+
      '<div class="data-actions"><span id="data-status" role="status"></span></div>'+
      '<p class="data-footnote">数据默认只保存在当前浏览器的本地存储中，不会自动同步到其他设备。更换浏览器或清理网站数据前，请先导出备份。</p>';
  }
  async function importFile(file){
    if(!file)return;
    try{
      if(file.size>30*1024*1024)throw new Error("备份文件超过 30 MB，请检查文件。");
      const backup=JSON.parse(await file.text());
      if(backup?.app!=="SU / SIGNAL"||backup?.formatVersion!==1||!backup.data||typeof backup.data!=="object"||Array.isArray(backup.data))throw new Error("这不是有效的 SU / SIGNAL 备份文件。");
      const allowed=new Set(Object.keys(KEYS));
      for(const [name,value] of Object.entries(backup.data)){if(!allowed.has(name)||typeof value!=="string")throw new Error("备份内容不完整或格式不受支持。");JSON.parse(value);}
      if(!Object.keys(backup.data).length)throw new Error("备份文件中没有可恢复的数据。");
      const count=stats(backup.data);
      const ok=confirm("确认恢复这份备份吗？\n\n聊天消息："+count.messages+" 条\n自定义字卡："+count.cards+" 条\n自定义瞬间："+count.moments+" 条\n\n这会覆盖当前设备中对应的数据。建议先导出当前备份。");
      if(!ok)return;
      for(const [name,key] of Object.entries(KEYS)){if(Object.prototype.hasOwnProperty.call(backup.data,name))localStorage.setItem(key,backup.data[name]);else localStorage.removeItem(key);}
      status("恢复成功，正在刷新页面……");
      setTimeout(()=>location.reload(),350);
    }catch(e){status(e?.message||"读取备份失败，请检查文件。");}
  }
  function init(el){
    root=el;render();
    if(root.dataset.dataBound)return;
    root.dataset.dataBound="1";
    root.addEventListener("click",e=>{const b=e.target.closest("[data-data-act]");if(!b)return;const a=b.dataset.dataAct;if(a==="back"){window.SUSignalCloseApp?.();return;}if(a==="export")download();});
    root.addEventListener("change",e=>{if(e.target.id==="data-file")importFile(e.target.files?.[0]);});
  }
  window.SUSignalData={init};
})();
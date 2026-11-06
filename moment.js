(() => {
  const KEY="su-signal-moments-v1";
  let root=null,items=[];
  const $=(s,r=root)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const uid=()=>"moment-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}};
  const write=()=>localStorage.setItem(KEY,JSON.stringify(items));
  const today=()=>{const d=new Date();return String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
  const label=item=>item.repeatYearly?("每年 "+item.date.slice(5).replace("-","月")+"日"):(item.date.replace(/-/g," / "));
  function render(){
    if(!root)return;
    const todayText=new Intl.DateTimeFormat("zh-CN",{year:"numeric",month:"long",day:"numeric",weekday:"long"}).format(new Date());
    root.innerHTML='<header class="app-view-header"><button class="back-button" data-moment-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — MOMENT</span></header>'+
      '<section class="moment-heading"><p class="eyebrow">PERSONAL MOMENTS / 06</p><h2>MOMENT<br><em>瞬间</em></h2><p>把重要的日子和想听见的话，留给未来某一天的随机回复。</p><div class="moment-today"><span>DEVICE LOCAL DATE</span><strong>'+esc(todayText)+'</strong></div></section>'+
      '<section class="moment-section"><div class="moment-section-title"><span>01 / CREATE A MOMENT</span><strong>添加一个瞬间</strong></div><form id="moment-form"><label class="moment-label" for="moment-date">日期</label><input class="moment-input" id="moment-date" type="date" required><label class="moment-repeat"><input id="moment-repeat" type="checkbox" checked><span>每年重复（适合生日、纪念日）</span></label><label class="moment-label" for="moment-text">那一天，希望苏新皓对你说</label><textarea class="moment-input moment-message" id="moment-text" maxlength="180" rows="3" placeholder="例如：生日快乐，希望你新的一岁每天都开心。" required></textarea><button class="moment-add" type="submit">保存这个瞬间 ↗</button><p class="moment-hint">保存后仅存在当前设备和浏览器。日期到来时，这句话会加入当天的随机回复。</p></form></section>'+
      '<section class="moment-section"><div class="moment-section-title"><span>02 / YOUR MOMENTS</span><strong>已保存的瞬间 <i>'+items.length+'</i></strong></div>'+
      (items.length?'<div class="moment-list">'+items.map(item=>'<article class="moment-item"><div class="moment-item-top"><strong>'+esc(label(item))+'</strong><button data-moment-act="delete" data-id="'+esc(item.id)+'" aria-label="删除">删除 ×</button></div><p>'+esc(item.text)+'</p><small>'+(item.repeatYearly?"每年生效":"仅在设定年份生效")+'</small></article>').join("")+'</div>':'<div class="moment-empty">还没有保存任何瞬间。<br>先为一个重要的日子写下一句话吧。</div>')+
      '</section><p class="moment-footnote">当日有已生效的瞬间时，随机回复会优先从瞬间内容中抽取（约 50% 概率）；其余回复仍来自原有字卡库。它不会保证每次连接都触发。</p><p class="moment-footnote">日期读取设备本地日历，不需要联网；请确保手机日期和时区设置正确。</p>';
    const form=$("#moment-form");
    form.addEventListener("submit",e=>{e.preventDefault();const date=$("#moment-date").value,text=$("#moment-text").value.trim(),repeatYearly=$("#moment-repeat").checked;if(!date||!text)return;items.push({id:uid(),date,text,repeatYearly,createdAt:new Date().toISOString()});write();render();});
  }
  function init(el){root=el;items=read();render();if(root.dataset.momentBound)return;root.dataset.momentBound="1";root.addEventListener("click",e=>{const b=e.target.closest("[data-moment-act]");if(!b)return;const a=b.dataset.momentAct;if(a==="back"){window.SUSignalCloseApp?.();return;}if(a==="delete"&&confirm("确定删除这个瞬间吗？")){items=items.filter(x=>x.id!==b.dataset.id);write();render();}});}
  function getTodayMoments(){const key=today(),full=new Date().getFullYear()+"-"+key;return read().filter(x=>x&&x.text&&(x.repeatYearly?String(x.date).slice(5)===key:x.date===full)).map(x=>({id:x.id,text:x.text,source:"moment"}));}
  window.SUSignalMoment={init,getTodayMoments, getAll:read};
})();
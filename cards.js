(() => {
  const KEY='su-signal-cards-v1', $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let db={custom:[],usage:{}}, builtins=[], cats=[], category='全部分类', query='', sort='category', selected=new Set(), editId=null, root=null;
  try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');db={custom:Array.isArray(old.custom)?old.custom:[],usage:old.usage&&typeof old.usage==='object'?old.usage:{}};}catch{}
  const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
  const list=()=>{let a=[...db.custom];if(category!=='全部分类')a=a.filter(c=>c.category===category);if(query)a=a.filter(c=>(c.text+' '+c.category).toLowerCase().includes(query.toLowerCase()));if(sort==='newest')a=[...a].reverse();if(sort==='used')a=[...a].sort((x,y)=>(db.usage[y.id]||0)-(db.usage[x.id]||0));return a;};
  function render(){
    if(!root)return;const rows=list(), allCats=[...new Set(db.custom.map(c=>c.category))];
    root.innerHTML='<header class="app-view-header"><button class="back-button" data-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — CARDS</span></header>'+
    '<div class="cards-heading"><div><p class="eyebrow">PRIVATE COMMUNICATION SYSTEM / PERSONAL LIBRARY</p><h2>CARDS<br><em>我的字卡</em></h2></div><div class="cards-count"><strong>'+db.custom.length+'</strong><span>MY CARDS</span><small>'+allCats.length+' CATEGORIES</small></div></div>'+
    ''+
    '<div class="cards-tools"><label class="cards-search">⌕ <input id="card-search" type="search" placeholder="搜索文字或分类" value="'+esc(query)+'"></label><select id="card-category">'+['全部分类',...allCats].map(x=>'<option '+(x===category?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select><select id="card-sort"><option value="category" '+(sort==='category'?'selected':'')+'>默认排序</option><option value="newest" '+(sort==='newest'?'selected':'')+'>最新添加</option><option value="used" '+(sort==='used'?'selected':'')+'>使用次数</option></select></div>'+
    '<div class="cards-summary"><span>仅显示你创建或导入的自定义字卡</span><span>显示 '+rows.length+' 条</span></div>'+
    '<div class="cards-actions"><button class="cards-primary" data-act="add">＋ 新增字卡</button><button data-act="batch">批量添加</button><button data-act="import">导入 TXT</button><button data-act="export">导出 TXT</button><button data-act="json">备份 JSON</button></div>'+
    '<div class="cards-import-help"><strong>TXT 导入格式说明</strong><span>每行一条字卡；格式为 <code>【分类名称】字卡内容</code>，例如 <code>【日常】今天吃饭了吗？</code>。</span><span>不写分类时默认归入「未分类」；空行忽略，重复字卡自动跳过。</span></div>'+
    '<div class="cards-bulkbar"><label><input type="checkbox" id="select-visible"> 全选当前列表</label><span>'+selected.size+' 已选择</span><div><button data-act="move">移动分类</button> '+'<button class="danger" data-act="delete-many">删除</button>'+'</div></div>'+
    '<div class="cards-list">'+(rows.length?rows.map(c=>'<article class="card-row"><label><input type="checkbox" data-select="'+esc(c.id)+'" '+(selected.has(c.id)?'checked':'')+'></label><div class="card-copy"><div class="card-meta"><span>'+esc(c.category)+'</span><small>'+'CUSTOM · '+(db.usage[c.id]||0)+' 次使用'+'</small></div><p>'+esc(c.text)+'</p></div><div class="card-buttons"><button data-act="edit" data-id="'+esc(c.id)+'">修改</button><button class="danger" data-act="delete" data-id="'+esc(c.id)+'">删除</button></div></article>').join(''):'<div class="cards-empty">没有找到字卡。试试其他关键词或分类。</div>')+'</div>'+
    '<div class="cards-footnote"><span>自定义字卡 '+db.custom.length+' 条</span><span>使用次数仅统计实际发送</span></div>'+
    '<input id="card-file" type="file" accept=".txt,text/plain" hidden><div class="cards-modal" id="card-modal" hidden><form id="card-form" class="cards-dialog"><div class="cards-dialog-top"><strong>'+(editId?'编辑自定义字卡':'新增自定义字卡')+'</strong><button type="button" data-act="close">×</button></div><label>分类<input name="category" list="card-categories" required></label><datalist id="card-categories">'+allCats.map(x=>'<option value="'+esc(x)+'"></option>').join('')+'</datalist><label>字卡内容<textarea name="text" rows="4" required></textarea></label><p class="cards-form-hint">内置字卡不可修改；这里仅管理你的自定义字卡。</p><div class="cards-dialog-actions"><button type="button" data-act="close">取消</button><button class="cards-primary" type="submit">保存</button></div></form></div>';
  }
  function modal(c){editId=c?.id||null;const box=$('#card-modal',root);box.hidden=false;const f=$('#card-form',root);f.elements.category.value=c?.category||(category!=='全部分类'?category:'');f.elements.text.value=c?.text||'';f.elements.category.focus();}
  function parse(s){return s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(?:【([^】]+)】|\[([^\]]+)\])\s*(.+)$/);return {category:(m?.[1]||m?.[2]||'未分类').trim(),text:(m?.[3]||x).trim()};}).filter(x=>x.text);}
  function add(items){let n=0,d=0;for(const x of items){if([...builtins,...db.custom].some(c=>c.category===x.category&&c.text.trim()===x.text.trim())){d++;continue;}db.custom.push({id:'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),category:x.category,text:x.text,source:'custom'});n++;}save();return {n,d};}
  const download=(name,body,type)=>{const u=URL.createObjectURL(new Blob([body],{type:type||'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);};
  function action(a,id,tabName){
    const c=[...builtins,...db.custom].find(x=>x.id===id);
    if(a==='back'){window.SUSignalCloseApp?.();return;}
    
    if(a==='add'){modal();return;}
    if(a==='close'){$('#card-modal',root).hidden=true;editId=null;return;}
    if(a==='batch'){const s=prompt('每行一条。可用 【分类】内容 指定分类；否则归入“未分类”。');if(s!==null){const r=add(parse(s));alert('新增 '+r.n+' 条，跳过重复 '+r.d+' 条。');render();}return;}
    if(a==='import'){$('#card-file',root).click();return;}
    if(a==='export'){download('SU-SIGNAL-自定义字卡.txt',db.custom.map(x=>'【'+x.category+'】'+x.text).join('\n'));return;}
    if(a==='json'){download('SU-SIGNAL-自定义字卡备份.json',JSON.stringify({version:1,custom:db.custom,usage:db.usage},null,2),'application/json');return;}
    
    if(a==='edit'&&c?.source==='custom'){modal(c);return;}
    if(a==='delete'&&c&&confirm('确定永久删除这条自定义字卡吗？')){db.custom=db.custom.filter(x=>x.id!==id);delete db.usage[id];selected.delete(id);save();render();return;}
    if(a==='delete-many'&&selected.size&&confirm('确定永久删除选中的 '+selected.size+' 条自定义字卡吗？此操作无法撤销。')){db.custom=db.custom.filter(x=>!selected.has(x.id));selected.clear();save();render();return;}

    if(a==='move'&&selected.size){const cat=prompt('移动到哪个分类？');if(cat?.trim()){db.custom=db.custom.map(x=>selected.has(x.id)?{...x,category:cat.trim()}:x);selected.clear();save();render();}return;}
  }
  async function init(el){root=el;try{const r=await fetch('./cards.json');const j=await r.json();builtins=j.cards||[];cats=j.categories||[];}catch{builtins=[];cats=[];}render();if(root.dataset.cardsBound)return;root.dataset.cardsBound='1';
    root.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b)action(b.dataset.act,b.dataset.id,b.dataset.tab);});
    root.addEventListener('change',e=>{if(e.target.id==='card-category'){category=e.target.value;selected.clear();render();}if(e.target.id==='card-sort'){sort=e.target.value;render();}if(e.target.matches('[data-select]')){e.target.checked?selected.add(e.target.dataset.select):selected.delete(e.target.dataset.select);render();}if(e.target.id==='select-visible'){list().forEach(x=>e.target.checked?selected.add(x.id):selected.delete(x.id));render();}if(e.target.id==='card-file'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{const r=add(parse(String(fr.result)));alert('导入完成：新增 '+r.n+' 条，跳过重复 '+r.d+' 条。');render();};fr.readAsText(e.target.files[0]);e.target.value='';}});
    root.addEventListener('input',e=>{if(e.target.id==='card-search'){query=e.target.value;render();const f=$('#card-search',root);f.focus();f.setSelectionRange(query.length,query.length);}});
    root.addEventListener('submit',e=>{if(e.target.id!=='card-form')return;e.preventDefault();const category=e.target.elements.category.value.trim(),text=e.target.elements.text.value.trim();if(!category||!text)return;if(editId){db.custom=db.custom.map(x=>x.id===editId?{...x,category,text}:x);}else{const r=add([{category,text}]);if(!r.n){alert('相同分类和内容的字卡已存在，没有重复添加。');return;}}save();$('#card-modal',root).hidden=true;editId=null;render();});
  }
  window.SUSignalCards={init,markUsed(id){db.usage[id]=(db.usage[id]||0)+1;save();},getAll(){return [...builtins,...db.custom];},getBuiltins(){return builtins;},getCustom(){return db.custom;}};
})();
(() => {
  const KEY = "su-signal-engine-v1";
  const DEFAULTS = {
    delayMin: 3, delayMax: 8,
    activeMin: 30, activeMax: 90,
    noReplyChance: 15, quoteChance: 20,
    combineEnabled: false, combineChance: 15,
    useBuiltins: true, useCustom: true,
    excludedCategories: [],
    inputStateEnabled: true,
    inputStateText: "SU IS TYPING...",
    animationEnabled: true,
    connectionText: "CONNECTION ESTABLISHED",
    cooldown: 0
  };
  const $ = (s, r=document) => r.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let settings = load(), categories = [], root = null;
  function load() {
    try { return {...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}")}; }
    catch { return {...DEFAULTS}; }
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(settings)); }
  function field(label, key, min=0, max=9999, unit="") {
    return '<label class="engine-field"><span>'+label+'</span><div><input type="number" data-key="'+key+'" min="'+min+'" max="'+max+'" value="'+settings[key]+'"><small>'+unit+'</small></div></label>';
  }
  function toggle(label,key,desc="") {
    return '<label class="engine-toggle"><span><strong>'+label+'</strong>'+(desc?'<small>'+desc+'</small>':'')+'</span><input type="checkbox" data-key="'+key+'" '+(settings[key]?'checked':'')+'><i></i></label>';
  }
  function render() {
    if (!root) return;
    root.innerHTML =
      '<header class="app-view-header"><button class="back-button" data-engine-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — ENGINE</span></header>'+
      '<div class="engine-heading"><p class="eyebrow">PRIVATE COMMUNICATION SYSTEM / RESPONSE RULES</p><h2>ENGINE<br><em>回复引擎</em></h2><p>在这里设定回复节奏与内容来源。设置保存在当前设备，后续由 CHAT 调用。</p></div>'+
      '<section class="engine-section"><div class="engine-section-title"><span>01 / RESPONSE DELAY</span><strong>回复延迟</strong></div><p>玩家点击「说话」后，等待多久再收到回复。</p><div class="engine-pair">'+field("最短延迟","delayMin",0,3600,"秒")+field("最长延迟","delayMax",0,3600,"秒")+'</div></section>'+
      '<section class="engine-section"><div class="engine-section-title"><span>02 / ACTIVE MESSAGE</span><strong>主动消息间隔</strong></div><p>启用后，苏新皓可按设定间隔主动发来消息；具体触发由聊天模块执行。</p><div class="engine-pair">'+field("最短间隔","activeMin",1,10080,"分钟")+field("最长间隔","activeMax",1,10080,"分钟")+'</div></section>'+
      '<section class="engine-section"><div class="engine-section-title"><span>03 / MESSAGE BEHAVIOR</span><strong>消息行为</strong></div><p>以下概率按每次回复判定。</p><div class="engine-pair">'+field("已读但不回复概率","noReplyChance",0,100,"%")+field("引用近期消息概率","quoteChance",0,100,"%")+'</div><div class="engine-subtoggle">'+toggle("句子组合模式","combineEnabled","将多个短句片段组合成一条完整消息，而不是连续发送多条。")+'</div><div class="engine-pair engine-indent">'+field("组合模式触发概率","combineChance",0,100,"%")+'</div></section>'+
      '<section class="engine-section"><div class="engine-section-title"><span>04 / CARD SOURCES</span><strong>字卡来源</strong></div><p>关闭某一来源后，该来源不会参与随机回复。内置字卡不会被修改。</p>'+toggle("使用内置字卡","useBuiltins","维护者提供，玩家不可修改。")+toggle("使用自定义字卡","useCustom","你在 CARDS 中新增或导入的字卡。")+
      '<div class="engine-categories"><strong>排除指定分类</strong><small>勾选后，该分类不会参与随机抽取。</small><div class="engine-category-list">'+(categories.length?categories.map(c=>'<label><input type="checkbox" data-exclude="'+esc(c)+'" '+(settings.excludedCategories.includes(c)?'checked':'')+'><span>'+esc(c)+'</span></label>').join(''):'<small>暂时无法读取分类。</small>')+'</div></div></section>'+
      '<section class="engine-section"><div class="engine-section-title"><span>05 / CONNECTION DISPLAY</span><strong>连接状态显示</strong></div>'+toggle("显示输入状态","inputStateEnabled","例如：苏新皓正在输入。")+ '<label class="engine-text-field">输入状态文案<input type="text" data-key="inputStateText" maxlength="40" value="'+esc(settings.inputStateText)+'"></label>'+toggle("启用连接动画","animationEnabled","仅控制聊天界面的连接动画显示。")+'<label class="engine-text-field">连接完成文案<input type="text" data-key="connectionText" maxlength="60" value="'+esc(settings.connectionText)+'"></label></section>'+
      '<section class="engine-section"><div class="engine-section-title"><span>06 / LIMITS</span><strong>触发限制</strong></div><p>冷却时间只限制再次点击「说话」触发回复，不限制玩家发送消息。</p><div class="engine-pair">'+field("回复触发冷却","cooldown",0,1440,"秒")+'</div><div class="engine-note">每次手动触发最多生成一条回复。预览不会计入字卡使用次数。</div></section>'+
      '<div class="engine-actions"><button class="engine-save" data-engine-act="save">保存设置</button><button data-engine-act="reset">恢复默认</button></div><p class="engine-saved" aria-live="polite" id="engine-saved">设置仅保存在本设备。</p>';
  }
  function valid() {
    const pairs=[["delayMin","delayMax","回复延迟"],["activeMin","activeMax","主动消息间隔"]];
    for (const [a,b,name] of pairs) if (Number(settings[a])>Number(settings[b])) { alert(name+"的最小值不能大于最大值。"); return false; }
    return true;
  }
  function collect() {
    root.querySelectorAll("[data-key]").forEach(el=>{
      const k=el.dataset.key;
      settings[k]=el.type==="checkbox"?el.checked:(el.type==="number"?Number(el.value):el.value.trim());
    });
    settings.excludedCategories=[...root.querySelectorAll("[data-exclude]:checked")].map(el=>el.dataset.exclude);
  }
  async function init(el) {
    root=el;
    try { const r=await fetch("./cards.json"); const j=await r.json(); categories=j.categories||[]; } catch { categories=[]; }
    render();
    if(root.dataset.engineBound)return;
    root.dataset.engineBound="1";
    root.addEventListener("input",e=>{if(e.target.matches("[data-key]")){const k=e.target.dataset.key;settings[k]=e.target.type==="number"?Number(e.target.value):e.target.value;}});
    root.addEventListener("change",e=>{if(e.target.matches("[data-key]")||e.target.matches("[data-exclude]"))collect();});
    root.addEventListener("click",e=>{
      const b=e.target.closest("[data-engine-act]"); if(!b)return;
      if(b.dataset.engineAct==="back"){window.SUSignalCloseApp?.();return;}
      if(b.dataset.engineAct==="save"){collect();if(!valid())return;save();const m=$("#engine-saved",root);m.textContent="已保存。CHAT 模块接入后将按这些规则执行。";return;}
      if(b.dataset.engineAct==="reset"){if(confirm("确定将回复引擎设置恢复为默认值吗？")){settings={...DEFAULTS};save();render();}}
    });
  }
  window.SUSignalEngine={init,getSettings(){return {...settings,excludedCategories:[...settings.excludedCategories]};},save,defaults:{...DEFAULTS}};
})();
(() => {
  let root=null,options=["选项一","选项二"],question="",rotation=0,spinning=false,spinTimer=null,result=null;
  const $=(s,r=root)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function apple(){return '<svg class="choice-apple" viewBox="0 0 100 100" aria-hidden="true"><path d="M51 27C48 14 55 7 67 5C67 17 61 25 51 27Z" fill="#171717"/><path d="M49 27C37 15 24 19 17 29C4 48 18 83 34 91C42 95 47 89 54 89C62 89 67 96 76 90C92 79 101 49 88 31C80 19 65 19 54 28Z" fill="#E32636"/><path d="M50 28C48 21 48 16 51 10" fill="none" stroke="#171717" stroke-width="4" stroke-linecap="round"/></svg>';}
  function render(){
    if(!root)return;
    const n=options.length,step=360/n;
    const palette=[
      {bg:"#A90F2B",fg:"#FFFFFF"},
      {bg:"#FFF8F7",fg:"#8F1024"},
      {bg:"#E32636",fg:"#FFFFFF"},
      {bg:"#F9E1E5",fg:"#A90F2B"},
      {bg:"#7F1025",fg:"#FFFFFF"},
      {bg:"#FFFFFF",fg:"#8F1024"},
      {bg:"#F27B89",fg:"#64101E"}
    ];
    const colors=options.map((_,i)=>palette[i%palette.length]);
    const gap=Math.min(1.2,step*.035);
    const stops=options.map((_,i)=>{
      const start=i*step,end=(i+1)*step,c=colors[i].bg;
      return c+" "+(start+gap)+"deg "+(end-gap)+"deg";
    }).join(",");
    const labelWidth=n>=6?64:n===5?76:88;
    const radius=n>=6?100:n===5?96:91;
    const labels=options.map((v,i)=>{
      const angle=(i+.5)*step;
      return '<span class="choice-wheel-label" title="'+esc(v)+'" style="width:'+labelWidth+'px;margin-left:-'+(labelWidth/2)+'px;color:'+colors[i].fg+';font-size:'+(n>=6?'9px':'11px')+';transform:rotate('+angle+'deg) translateY(-'+radius+'px) rotate(-'+angle+'deg)">'+esc(v.trim()?v:"未命名")+'</span>';
    }).join("");
    root.innerHTML='<header class="app-view-header"><button class="back-button" type="button" data-choice-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — CHOICE</span></header>'+
      '<section class="choice-heading"><p class="eyebrow">LET HIM DECIDE / 08</p><h2>CHOICE<br><em>选择</em></h2><p>把难以决定的小事交给新皓吧。</p></section>'+
      '<section class="choice-question"><label for="choice-question">今天想决定什么？</label><input id="choice-question" maxlength="80" value="'+esc(question)+'" placeholder="例如：今天吃什么？" '+(spinning?'disabled':'')+'></section>'+
      '<section class="choice-options"><div class="choice-section-title"><span>YOUR OPTIONS</span><strong>选项 '+n+' / 7</strong></div>'+
      '<div class="choice-option-list">'+options.map((v,i)=>'<div class="choice-option-row"><span class="choice-option-index">'+String(i+1).padStart(2,"0")+'</span><input data-choice-option="'+i+'" maxlength="24" value="'+esc(v)+'" '+(spinning?'disabled':'')+' aria-label="选项 '+(i+1)+'"><button type="button" data-choice-act="remove" data-index="'+i+'" '+(n<=2||spinning?'disabled':'')+' aria-label="删除选项">×</button></div>').join("")+'</div>'+
      '<button type="button" class="choice-add" data-choice-act="add" '+(n>=7||spinning?'disabled':'')+'>＋ 添加选项</button></section>'+
      '<section class="choice-wheel-section"><div class="choice-pointer" aria-hidden="true"></div><div class="choice-wheel" id="choice-wheel" role="img" aria-label="包含 '+n+' 个选项的随机转盘" style="background:conic-gradient('+stops+');transform:rotate('+rotation+'deg)">'+labels+'<div class="choice-wheel-center">'+apple()+'</div></div>'+
      '<button type="button" class="choice-spin" data-choice-act="spin" '+(spinning?'disabled':'')+'>新皓帮我决定，拜托啦～</button>'+
      (spinning?'<p class="choice-spin-status" aria-live="polite">正在认真帮你挑选……</p>':"")+
      (result!==null?'<div class="choice-result" id="choice-result" aria-live="polite"><span>THAT\'S THE ONE</span>'+(question?'<p class="choice-result-question">'+esc(question)+'</p>':'')+'<strong>'+esc(result)+'</strong><p>那就选这个啦！</p><button type="button" data-choice-act="again">再转一次 ↗</button></div>':"")+
      '</section><p class="choice-footnote">每个选项机会均等。结果由本地随机生成，不需要联网，也不会读取字卡库。</p>';
    $("#choice-question").addEventListener("input",e=>question=e.target.value);
    root.querySelectorAll("[data-choice-option]").forEach(el=>el.addEventListener("input",e=>{
      const i=Number(e.target.dataset.choiceOption);options[i]=e.target.value;result=null;
      const label=root.querySelectorAll(".choice-wheel-label")[i];
      if(label){label.textContent=e.target.value.trim()?e.target.value:"未命名";label.title=e.target.value;}
      $("#choice-result")?.remove();
    }));
  }
  function spin(){
    if(spinning||options.length<2)return;
    if(options.some(x=>!x.trim())){
      const empty=options.findIndex(x=>!x.trim());
      $('[data-choice-option="'+empty+'"]')?.focus();
      return;
    }
    question=$("#choice-question").value.trim();
    const chosen=Math.floor(Math.random()*options.length);
    const step=360/options.length,center=(chosen+.5)*step;
    const current=((rotation%360)+360)%360;
    const target=(360-center)%360;
    const correction=(target-current+360)%360;
    const delta=360*(5+Math.floor(Math.random()*3))+correction;
    const startRotation=rotation;
    rotation+=delta;spinning=true;result=null;
    render();
    const wheel=$("#choice-wheel");
    wheel.style.transition="none";
    wheel.style.transform="rotate("+startRotation+"deg)";
    void wheel.offsetWidth;
    const duration=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?250:5200;
    wheel.style.transition="transform "+duration+"ms cubic-bezier(.12,.72,.12,1)";
    wheel.style.transform="rotate("+rotation+"deg)";
    spinTimer=setTimeout(()=>{
      spinning=false;spinTimer=null;result=options[chosen];render();
    },duration+150);
  }
  function init(el){
    root=el;render();
    if(root.dataset.choiceBound)return;
    root.dataset.choiceBound="1";
    root.addEventListener("click",e=>{
      const b=e.target.closest("[data-choice-act]");if(!b)return;
      const a=b.dataset.choiceAct;
      if(a==="back"){
        if(spinTimer)clearTimeout(spinTimer);
        spinTimer=null;spinning=false;
        window.SUSignalCloseApp?.();return;
      }
      if(a==="add"&&options.length<7&&!spinning){options.push("新选项");result=null;render();const inputs=root.querySelectorAll("[data-choice-option]");inputs[inputs.length-1]?.focus();return;}
      if(a==="remove"&&options.length>2&&!spinning){options.splice(Number(b.dataset.index),1);result=null;render();return;}
      if(a==="spin"||a==="again"){if(a==="again")result=null;spin();}
    });
  }
  window.SUSignalChoice={init};
})();
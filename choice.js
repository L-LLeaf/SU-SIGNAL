(() => {
  let root=null,options=["选项一","选项二"],question="",rotation=0,spinning=false,spinTimer=null,result=null;
  const $=(s,r=root)=>r.querySelector(s);
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function apple(){return '<svg class="choice-apple" viewBox="0 0 100 100" aria-hidden="true"><path d="M51 27C48 14 55 7 67 5C67 17 61 25 51 27Z" fill="#171717"/><path d="M49 27C37 15 24 19 17 29C4 48 18 83 34 91C42 95 47 89 54 89C62 89 67 96 76 90C92 79 101 49 88 31C80 19 65 19 54 28Z" fill="#E32636"/><path d="M50 28C48 21 48 16 51 10" fill="none" stroke="#171717" stroke-width="4" stroke-linecap="round"/></svg>';}
  function render(){
    if(!root)return;
    const n=options.length,step=360/n,colors=options.map((_,i)=>i%3===0?"#E32636":i%3===1?"#fff":"#e9e9e9");
    const stops=options.map((_,i)=>colors[i]+" "+(i*step)+"deg "+((i+1)*step)+"deg").join(",");
    const labels=options.map((v,i)=>{const angle=(i+.5)*step;return '<span class="choice-wheel-label" style="transform:rotate('+angle+'deg) translateY(-'+(n<=4?91: n<=5?88:82)+'px) rotate(-'+angle+'deg)">'+esc(v)+'</span>';}).join("");
    root.innerHTML='<header class="app-view-header"><button class="back-button" data-choice-act="back">← HOME</button><span class="app-kicker">SU / SIGNAL — CHOICE</span></header>'+
      '<section class="choice-heading"><p class="eyebrow">LET HIM DECIDE / 08</p><h2>CHOICE<br><em>选择</em></h2><p>把难以决定的小事交给新皓吧。</p></section>'+
      '<section class="choice-question"><label for="choice-question">今天想决定什么？</label><input id="choice-question" maxlength="80" value="'+esc(question)+'" placeholder="例如：今天吃什么？" '+(spinning?'disabled':'')+'></section>'+
      '<section class="choice-options"><div class="choice-section-title"><span>YOUR OPTIONS</span><strong>选项 '+n+' / 7</strong></div>'+
      '<div class="choice-option-list">'+options.map((v,i)=>'<div class="choice-option-row"><span class="choice-option-index">'+String(i+1).padStart(2,"0")+'</span><input data-choice-option="'+i+'" maxlength="24" value="'+esc(v)+'" '+(spinning?'disabled':'')+' aria-label="选项 '+(i+1)+'"><button data-choice-act="remove" data-index="'+i+'" '+(n<=2||spinning?'disabled':'')+' aria-label="删除选项">×</button></div>').join("")+'</div>'+
      '<button class="choice-add" data-choice-act="add" '+(n>=7||spinning?'disabled':'')+'>＋ 添加选项</button></section>'+
      '<section class="choice-wheel-section"><div class="choice-pointer"></div><div class="choice-wheel" id="choice-wheel" style="background:conic-gradient('+stops+');transform:rotate('+rotation+'deg)">'+labels+'<div class="choice-wheel-center">'+apple()+'</div></div>'+
      '<button class="choice-spin" data-choice-act="spin" '+(spinning?'disabled':'')+'>新皓帮我决定，拜托啦～</button>'+
      (spinning?'<p class="choice-spin-status">正在认真帮你挑选……</p>':"")+
      (result!==null?'<div class="choice-result" id="choice-result"><span>THAT'S THE ONE</span><strong>'+esc(result)+'</strong><p>那就选这个啦！</p><button data-choice-act="again">再转一次 ↗</button></div>':"")+
      '</section><p class="choice-footnote">每个选项机会均等。结果由本地随机生成，不需要联网，也不会读取字卡库。</p>';
    $("#choice-question").addEventListener("input",e=>question=e.target.value);
    root.querySelectorAll("[data-choice-option]").forEach(el=>el.addEventListener("input",e=>{const i=Number(e.target.dataset.choiceOption);options[i]=e.target.value;result=null;const label=root.querySelectorAll(".choice-wheel-label")[i];if(label)label.textContent=e.target.value||"未命名";$("#choice-result")?.remove();}));
  }
  function spin(){
    if(spinning||options.length<2)return;
    if(options.some(x=>!x.trim())){const empty=options.findIndex(x=>!x.trim());const field=$('[data-choice-option="'+empty+'"]');field?.focus();return;}
    question=$("#choice-question").value.trim();
    const chosen=Math.floor(Math.random()*options.length),step=360/options.length,center=(chosen+.5)*step;
    const extra=360*(5+Math.floor(Math.random()*3));
    const delta=extra+360-center;
    spinning=true;result=null;rotation=rotation+delta;
    const wheel=$("#choice-wheel");wheel.style.transition="transform 5.2s cubic-bezier(.12,.72,.12,1)";wheel.style.transform="rotate("+rotation+"deg)";
    render();
    const fresh=$("#choice-wheel");fresh.style.transition="none";fresh.style.transform="rotate("+(rotation-delta)+"deg)";
    void fresh.offsetWidth;fresh.style.transition="transform 5.2s cubic-bezier(.12,.72,.12,1)";fresh.style.transform="rotate("+rotation+"deg)";
    spinTimer=setTimeout(()=>{spinning=false;result=options[chosen];render();},5300);
  }
  function init(el){
    root=el;render();
    if(root.dataset.choiceBound)return;
    root.dataset.choiceBound="1";
    root.addEventListener("click",e=>{
      const b=e.target.closest("[data-choice-act]");if(!b)return;
      const a=b.dataset.choiceAct;
      if(a==="back"){if(spinTimer)clearTimeout(spinTimer);window.SUSignalCloseApp?.();return;}
      if(a==="add"&&options.length<7&&!spinning){options.push("新选项");result=null;render();const inputs=root.querySelectorAll("[data-choice-option]");inputs[inputs.length-1]?.focus();return;}
      if(a==="remove"&&options.length>2&&!spinning){options.splice(Number(b.dataset.index),1);result=null;render();return;}
      if(a==="spin"||a==="again"){if(a==="again")result=null;spin();}
    });
  }
  window.SUSignalChoice={init};
})();
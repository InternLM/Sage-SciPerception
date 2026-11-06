// Reconstruct a recorded held-out example. Animation timing is editorial.
(() => {
  const NS='http://www.w3.org/2000/svg';
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ramp=(t,a,b)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
  const tx=(x,y,text,size,color,weight=400,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${text}</text>`;
  const box=(x,y,w,h,fill,stroke,r)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
  let svg,lines,starts,caret,status,statusDot,answer,rail,molecule,formula,bonds,atoms,cotMark,rule;
  let lastStep=-1, typeRate=12;
  function alpha(el,value){el.setAttribute('opacity',clamp(value).toFixed(4))}
  function stage(step){
    if(step===lastStep)return;lastStep=step;
    let out=box(32,655,1216,46,'#d0ddd4','#d2ddd6',24)+box(32,650,1216,46,'url(#card)','#fff',24)+box(42+step*305,656,229,34,'#edf4ef','#dbe8df',17);
    ['三谱输入','任务约束','联合解析','候选结构'].forEach((label,i)=>{
      const x=62+i*305;
      out+=`<circle cx="${x}" cy="673" r="10" fill="${i===step?'url(#active)':i<step?'#bdcfc3':'#eef3ef'}"/>`+tx(x,677,i+1,11,i<=step?'#fff':'#a9b6ad',500,'middle')+tx(x+22,679,label,15.5,i===step?'#4b786a':'#a1afa6',i===step?600:400);
      if(i<3)out+=`<path d="M${x+110} 673H${x+265}" fill="none" stroke="#e0e9e2"/>`;
    });
    rail.innerHTML=out;
  }
  function renderAt(input){
    const t=Math.max(0,Math.min(16,Number(input)||0));
    const reset=ramp(t,15.4,16),result=ramp(t,10.55,11.1)*(1-reset);
    stage(t<2.4?0:t<3.7?1:t<10.55?2:3);
    for(const [i,key] of ['ir','raman','uv'].entries()){
      const local=t-.2-i*.38,progress=clamp(local/3.15),x=214+progress*542;
      const visible=ramp(local,0,.3)*(1-ramp(local,3.0,3.3))*(1-reset);
      const baseline=294+i*133,color=['#89ad97','#ae9bc3','#c7af80'][i];
      const scan=svg.querySelector(`#scan-${key}`);
      scan.setAttribute('opacity',visible.toFixed(4));
      scan.innerHTML=`<path d="M${x} ${baseline-110}V${baseline+9}" stroke="${color}" stroke-width="1.5" opacity=".8"/><rect x="${x-21}" y="${baseline-110}" width="21" height="119" fill="${color}" opacity=".06"/>`;
    }
    const constraints=ramp(t,2.35,2.7)*(1-ramp(t,3.5,3.9));
    alpha(svg.querySelector('#spectra-constraints'),constraints);
    const local=Math.max(0,t-3.7);
    let active=0;
    lines.forEach((line,i)=>{
      const count=Math.max(0,Math.min(line.chars.length,Math.floor((local-starts[i])*typeRate)));
      line.element.textContent=line.chars.slice(0,count).join('');
      alpha(line.element,(1-result)*(1-reset));
      if(local>=starts[i])active=i;
    });
    caret.setAttribute('x',(898+lines[active].element.getComputedTextLength()).toFixed(2));
    caret.setAttribute('y',406+active*28);
    alpha(caret,(t>=3.7?1:0)*(1-result)*(1-reset)*(Math.floor(local*2.4)%2?.18:1));
    alpha(rule,(1-result)*(1-reset));
    alpha(cotMark[0],1-result);alpha(cotMark[1],1-result);
    status.textContent=t<3.7?'准备联合解析':t<10.55?'正在联合解析':'候选结构已生成';
    alpha(status,1-reset);alpha(statusDot,(t>=10.55?1:.65+.35*Math.sin(t*3.5)**2)*(1-reset));
    alpha(formula,result);
    alpha(molecule,result);
    bonds.forEach((bond,i)=>{
      const progress=ramp(t,10.75+i*.035,11.5+i*.035);
      bond.element.style.strokeDashoffset=String(bond.length*(1-progress));
    });
    atoms.forEach(atom=>alpha(atom,ramp(t,11.15,11.8)));
    answer.textContent=t<10.75?'生成中…':'O=c1cccc[nH]1';
    answer.setAttribute('font-size',t<10.75?'12':'15');
    answer.setAttribute('fill',t<10.75?'#9aac9f':'#4b786a');
    alpha(answer,1-reset);
    svg.setAttribute('data-time',t.toFixed(3));
  }
  async function load(){
    const responses=await Promise.all([fetch('assets/spectra-first-frame.svg'),fetch('assets/spectra-molecule.svg')]);
    if(responses.some(response=>!response.ok))throw new Error('Unable to load spectrum assets');
    const [base,chemical]=await Promise.all(responses.map(response=>response.text()));
    const parse=text=>new DOMParser().parseFromString(text,'image/svg+xml');
    svg=document.importNode(parse(base).documentElement,true);
    document.querySelector('#frame').replaceChildren(svg);
    await document.fonts.ready;
    lines=[...svg.querySelectorAll('[data-full-text]')].map(element=>({element,chars:Array.from(element.getAttribute('data-full-text'))}));
    typeRate=Math.max(12,lines.reduce((total,line)=>total+line.chars.length,0)/5.2);
    starts=[];let time=.35;
    lines.forEach(line=>{starts.push(time);time+=line.chars.length/typeRate+.28});
    caret=svg.querySelector('#cot-caret');status=svg.querySelector('#cot-status');statusDot=svg.querySelector('#cot-status-dot');answer=svg.querySelector('#cot-answer-status');rail=svg.querySelector('#spectra-stage-rail');
    cotMark=[...svg.querySelectorAll('text')].filter(el=>el.textContent==='CoT');cotMark.unshift(cotMark[0].previousElementSibling);
    rule=[...svg.querySelectorAll('path')].find(el=>el.getAttribute('d')==='M879 411V499');
    molecule=document.createElementNS(NS,'g');molecule.id='spectra-final-molecule';
    const drawing=document.importNode(parse(chemical).documentElement,true);
    drawing.setAttribute('x','884');drawing.setAttribute('y','392');drawing.setAttribute('width','308');drawing.setAttribute('height','138');
    molecule.append(drawing);svg.querySelector('#structure-output').append(molecule);
    bonds=[...drawing.querySelectorAll('path[class^="bond-"]')].map(element=>{
      const length=element.getTotalLength();element.style.strokeDasharray=String(length);return{element,length};
    });
    atoms=[...drawing.querySelectorAll('path[class^="atom-"]')];
    formula=document.createElementNS(NS,'g');formula.innerHTML=box(1101,355,97,24,'#edf3ef','#dce7df',12)+tx(1149.5,372,'C₅H₅NO',12.5,'#789582',500,'middle');
    svg.querySelector('#structure-output').append(formula);
    const emphasis=document.createElementNS(NS,'g');emphasis.id='spectra-constraints';
    emphasis.innerHTML=box(851,245,192,32,'none','#9cbaa7',16)+box(1053,245,172,32,'none','#b4a4c5',16);
    svg.append(emphasis);
    window.renderSpectraFinalAt=renderAt;window.spectraFinalDuration=16;
    const fixed=new URLSearchParams(location.search).get('t');
    if(fixed!==null)renderAt(Number(fixed));
    else{const start=performance.now();const tick=now=>{renderAt(((now-start)/1000)%16);requestAnimationFrame(tick)};requestAnimationFrame(tick)}
    window.spectraFinalReady=true;
  }
  load().catch(error=>{window.spectraFinalError=error.message;console.error(error)});
})();

/* Deterministic 32-second mechanism illustration. No fabricated sample scores. */
(() => {
 const NS='http://www.w3.org/2000/svg';
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const ramp=(x,a,b)=>ease((x-a)/(b-a));
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const tx=(x,y,s,size=24,color='#4d6889',weight=400,anchor='start')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(s)}</text>`;
 const box=(x,y,w,h,fill='#eff5fc',stroke='none',r=8,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
 const path=(d,stroke='#78a1cc',width=3,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
 const dot=(x,y,r,color,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
 let svg,el={},parts={},sourceStyles=new Map(),drawLengths=new Map(),routes={},scene,particles,status;
 const routeData={
  instruction:'M510 290H590',word:'M960 290H1045',text:'M1495 290H1638V300H1670',
  protein:'M510 735H568V630H590',spectra:'M510 735H568V838H590',
  encoder:'M890 630H950V710H1008',patch:'M890 838H950V710H1008',
  projected:'M1280 710H1336',science:'M1555 710H1638V347H1670',
  mixed:'M1825 410V520',head:'M1825 699V730',
  sites:'M1940 752H2010V540H2060',molecule:'M1940 752H2010V875H2060',
 };
 const byText=s=>[...svg.querySelectorAll('text')].find(e=>e.textContent===s);
 const alpha=(e,a)=>e.setAttribute('opacity',clamp(a).toFixed(4));
 function group(id){const g=document.createElementNS(NS,'g');g.id=id;svg.append(g);return g}
 function activeGroup(id,value,overview){alpha(parts[id],overview+(1-overview)*value)}
 function trace(p,progress){
  const len=drawLengths.get(p)||p.getTotalLength();drawLengths.set(p,len);
  p.style.strokeDasharray=String(len+.01);p.style.strokeDashoffset=String(len*(1-clamp(progress)));
 }
 function flow(name,u,a,b,color='#6e9dcf',overview=0){
  const p=ramp(u,a,a+.6)*(1-ramp(u,b,b+.5))*(1-overview);
  if(p<=0)return;
  const d=routeData[name],guide=routes[name],len=guide.getTotalLength();
  scene.innerHTML+=path(d,color,7,`opacity="${.12*p}" filter="url(#fw-glow)"`)+path(d,color,3,`opacity="${.76*p}"`);
  for(let i=0;i<2;i++){
   const f=clamp((u-a-.33*i)/(b-a));
   const q=guide.getPointAtLength(len*f),w=name==='text'?13:11;
   particles.innerHTML+=`<g opacity="${p}">`+box(q.x-w/2+2,q.y-9+3,w,18,'#6d8dab','none',2)+box(q.x-w/2,q.y-9,w,18,color,'#f6fbff',2)+path(`M${q.x-w/2+2} ${q.y-7}H${q.x+w/2-2}`,'#fff',1.1)+'</g>';
  }
 }
 function outline(x,y,w,h,p,color='#78a1cc'){
  if(p>0)scene.innerHTML+=box(x-2,y-2,w+4,h+4,'none',color,13,`stroke-width="2.4" opacity="${p}"`);
 }
 function setTokens(prefix,count,p,overview,spread=.075){
  for(let i=0;i<count;i++){
   const item=svg.querySelector(`#fw-${prefix}-token-${i}`);
   const a=overview+(1-overview)*(.08+.92*ease((p-i*spread)/.32));
   alpha(item,a);
   const y=(1-overview)*(1-clamp((p-i*spread)/.32))*11;
   item.setAttribute('transform',`translate(0 ${y.toFixed(3)})`);
  }
 }
 function stageName(u){
  if(u<1.2)return '读取指令与科学输入';
  if(u<3.8)return '提取并组织科学特征';
  if(u<6.2)return '投影为科学特征嵌入';
  if(u<8.2)return '两条路径汇入同一序列';
  if(u<10.2)return '经过语言模型与输出头';
  return '展开对应的任务答案';
 }
 window.renderFrameworkAt=(input=0)=>{
  if(!svg)return;
  const t=Math.max(0,Math.min(32,Number(input))),kind=t<16?'protein':'spectra',u=t-(kind==='protein'?2:16);
  const over=t>=30?ramp(t,30,31.2):1-ramp(t,2,2.65);
  const focus=1-over;
  scene.innerHTML='';particles.innerHTML='';
  const isProtein=kind==='protein';
  for(const id of ['spectra','physiology','protein','crystal','nucleic','molecule-input'])activeGroup(id,id===kind?1:.36,over);
  activeGroup('encoder',isProtein?1:.36,over);activeGroup('patch',isProtein?.36:1,over);
  for(const id of ['encoder-route','encoder-exit'])activeGroup(id,isProtein?.9:.28,over);
  for(const id of ['patch-route','patch-exit'])activeGroup(id,isProtein?.28:.9,over);
  for(const id of ['instruction','word-embedding','text-tokens','mixed-sequence','projector'])activeGroup(id,1,over);
  activeGroup('science-tokens',.92,over);activeGroup('model',u>=7.9?1:.66,over);
  activeGroup('answer-category',.3,over);activeGroup('answer-number',.3,over);
  activeGroup('answer-sites',isProtein?(.36+.64*ramp(u,10.1,10.9)):.3,over);
  activeGroup('answer-molecule',isProtein?.3:(.36+.64*ramp(u,10.1,10.9)),over);

  const instruction=isProtein?['定位这条蛋白质序列中，','参与相互作用的残基。']:['综合同一分子的三种谱图，','识别对应的分子结构。'];
  el.instruction1.textContent=over>.9?'根据输入的科学数据，':instruction[0];
  el.instruction2.textContent=over>.9?'回答问题并给出结论。':instruction[1];
  el.projectorCaption.textContent=over>.9?'按模态独立训练':isProtein?'蛋白质投影模块 · 按模态独立训练':'谱图投影模块 · 按模态独立训练';
  el.projectorCaption.setAttribute('font-size',over>.9?'24':'22');
  const outputD=over>.9?'M 1940 752 H 2010 V 670 H 2040':routeData[isProtein?'sites':'molecule'];
  el.outputPath.setAttribute('d',outputD);

  setTokens('text',8,ramp(u,.7,3.5),over,.085);
  setTokens('science',5,ramp(u,5.0,6.9),over,.12);
  const grayMix=ramp(u,3.5,5.3),blueMix=ramp(u,6.2,8.15);
  for(let i=0;i<11;i++){
   const science=i>=3&&i<=7,p=science?blueMix:grayMix;
   const index=science?i-3:i<3?i:i-5;
   const a=over+(1-over)*(.07+.93*ease((p-index*.08)/.35));
   alpha(svg.querySelector(`#fw-mixed-token-${i}`),a);
  }

  const processing=ramp(u,3.5,4.15)*(1-ramp(u,5.8,6.5))*focus;
  const spread=processing*(.65+.35*Math.sin(clamp((u-3.5)/3)*Math.PI));
  el.back0.setAttribute('transform',`translate(${-9*spread} ${-20*spread})`);
  el.back1.setAttribute('transform',`translate(${-4*spread} ${-10*spread})`);
  el.front.setAttribute('transform',`translate(${4*spread} ${-3*spread})`);
  outline(74,isProtein?657:491,198,150,.85*focus);
  outline(590,isProtein?555:775,300,isProtein?150:126,.65*focus*ramp(u,.9,1.5)*(1-ramp(u,3.9,4.5)));
  outline(1010,590,270,240,processing*.65);
  outline(1670,225,310,185,.65*focus*ramp(u,6.1,6.7)*(1-ramp(u,8.3,8.9)));
  for(const [j,node] of el.nodes.entries()){
   const layer=j<3?0:j<7?1:2;
   const wave=processing*Math.max(0,Math.sin((u-3.5)*4-layer*.9));
   node.setAttribute('r',String(5.4+2.6*wave));
  }
  el.edges.forEach((edge,i)=>alpha(edge,.25+.35*processing*(.5+.5*Math.sin(u*5-i*.11))));

  if(isProtein&&u>0&&u<4){
   const scan=ramp(u,.4,3.2),x=82+100*scan;
   scene.innerHTML+=box(x,727,11,70,'#83a9d3','none',3,`opacity="${.2*focus}"`);
  }
  el.spectraPaths.forEach((p,i)=>trace(p,over+(1-over)*(isProtein?1:ramp(u,.25+i*.15,2.3+i*.15))));
  if(!isProtein&&u>1&&u<4.6){
   const a=ramp(u,1,1.6)*(1-ramp(u,4.0,4.6))*focus;
   for(let i=0;i<8;i++)scene.innerHTML+=box(625+i*29,875,20,12,'#a9c7e9','none',2,`opacity="${a*(.3+.7*ramp(u,1.0+i*.16,1.5+i*.16))}"`);
  }
  flow('instruction',u,0,1.2,'#8c99a8',over);flow('word',u,.75,2.5,'#8c99a8',over);
  flow('text',u,3.4,5.1,'#a2a9b2',over);
  flow(kind,u,.9,2.1,'#7fa6d0',over);
  flow(isProtein?'encoder':'patch',u,2.2,3.8,'#6d9bcb',over);
  flow('projected',u,5.0,6.25,'#7ea8d7',over);flow('science',u,6.1,8.1,'#7ba7d6',over);
  flow('mixed',u,8.05,8.8,'#7fa3cb',over);flow('head',u,9.1,9.8,'#7c9fc4',over);
  flow(isProtein?'sites':'molecule',u,9.5,10.5,'#7b9fc5',over);
  for(let i=0;i<3;i++){
   const wave=focus*ramp(u,8.45+i*.22,8.7+i*.22)*(1-ramp(u,9.15+i*.22,9.45+i*.22));
   if(wave>0)scene.innerHTML+=path(`M1733 ${638+i*19}H1889L1910 ${626+i*19}`,'#78a5d5',3.5,`opacity="${wave*.8}"`);
  }
  const answer=ramp(u,10.2,11.9);
  el.siteItems.forEach(item=>{
   const i=Number(item.dataset.siteIndex),p=isProtein?ramp(u,10.2+i*.12,10.7+i*.12):1;
   alpha(item,over+(1-over)*(isProtein?.08+.92*p:1));
  });
  el.moleculePaths.forEach((p,i)=>trace(p,over+(1-over)*(isProtein?1:ramp(u,10.2+i*.045,11.0+i*.045))));
  el.moleculeAtoms.forEach((p,i)=>alpha(p,over+(1-over)*(isProtein?1:ramp(u,10.9+i*.15,11.4+i*.15))));
  if(answer>0)outline(2060,isProtein?480:780,262,isProtein?130:196,.8*focus*answer,'#7fa6cd');

  const badge=over>.85?'框架总览':isProtein?'演示一 · 蛋白质':'演示二 · 三谱';
  const message=over>.85?'文本与科学特征，进入同一输入嵌入序列':stageName(u);
  status.innerHTML=box(550,962,1060,46,'#f6f9fd','#dce6f2',23)+dot(576,985,4.5,'#83a7d0')+tx(593,993,badge,21,'#6582a4',500)+tx(835,993,message,22,'#8295ac');
  document.body.dataset.time=t.toFixed(3);document.body.dataset.case=over>.85?'overview':kind;
 };
 async function init(){
  const raw=await(await fetch('assets/framework-animation-base.svg')).text();
  document.getElementById('frame').innerHTML=raw;svg=document.querySelector('#frame svg');
  for(const g of svg.querySelectorAll('g[id^="fw-"]'))parts[g.id.slice(3)]=g;
  el.instruction1=byText('根据输入的科学数据，');el.instruction2=byText('回答问题并给出结论。');
  el.projectorCaption=svg.querySelector('#fw-projector-caption');el.back0=svg.querySelector('#fw-projector-back-0');el.back1=svg.querySelector('#fw-projector-back-1');el.front=svg.querySelector('#fw-projector-front');
  el.outputPath=parts['answer-route'].querySelector('path');
  el.nodes=[...el.front.querySelectorAll('circle')];el.edges=[...el.front.querySelectorAll('path')].filter(p=>Number(p.getAttribute('stroke-width'))<1.5&&p.getAttribute('d')?.startsWith('M 10'));
  el.spectraPaths=[...parts.spectra.querySelectorAll('svg path')];
  el.moleculePaths=[...parts['answer-molecule'].querySelectorAll('svg path')];el.moleculeAtoms=[...parts['answer-molecule'].querySelectorAll('svg text')];
  el.siteItems=[...parts['answer-sites'].querySelectorAll('[data-site-index]')];
  svg.insertAdjacentHTML('beforeend','<defs><filter id="fw-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter></defs>');
  const guides=group('fw-route-guides');
  for(const [name,d]of Object.entries(routeData)){const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke','none');guides.append(p);routes[name]=p}
  scene=group('fw-active-overlays');particles=group('fw-moving-tokens');status=group('fw-status');
  await document.fonts.ready;
  window.renderFrameworkAt(0);window.frameworkReady=true;
  const params=new URLSearchParams(location.search);
  if(params.has('t'))window.renderFrameworkAt(Number(params.get('t')));
  else if(params.get('play')==='1'){
   const start=performance.now();let last=0;
   function tick(now){if(now-last>=1000/24){window.renderFrameworkAt(((now-start)/1000)%32);last=now}requestAnimationFrame(tick)}requestAnimationFrame(tick);
  }
 }
 init().catch(error=>{window.frameworkError=error.stack;document.getElementById('frame').textContent=error.message;console.error(error)});
})();

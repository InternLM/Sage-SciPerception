const proteinSample=window.SAGE_TRAINING_DATA.datasets.find(d=>d.id==='protein-seq');
const sequence=proteinSample.visual.sequence;
const interfaceSites=proteinSample.visual.labels;
const siteSet=new Set(interfaceSites);
const P={ink:'#243137',muted:'#83918f',line:'#dbe4df',green:'#4b786a'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const tx=(x,y,s,size=18,color=P.ink,weight=400,anchor='start',cls='',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}" class="${cls}" ${extra}>${esc(s)}</text>`;
const box=(x,y,w,h,fill='#fff',stroke='none',rx=15,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const ln=(x1,y1,x2,y2,color=P.line,width=1,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const dot=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
function category(aa){
 if('AILMFWVY'.includes(aa))return 'sand';
 if('DEKR'.includes(aa))return 'lilac';
 return 'sage';
}
const materials={
 sand:{top:'#faf4e8',base:'#e6d9bd',edge:'#c7b58e',ink:'#8a754a',light:'#fffdf5',sphere:'#c6af7f',deep:'#8c764e'},
 lilac:{top:'#f5f1fa',base:'#dbd1e8',edge:'#bbabcf',ink:'#88709f',light:'#ffffff',sphere:'#baaad3',deep:'#7a659c'},
 sage:{top:'#f0f7f2',base:'#d1e2d7',edge:'#a9c2b4',ink:'#648675',light:'#ffffff',sphere:'#a8c9b7',deep:'#628879'}
};
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc">
<title id="title">蛋白质相互作用位点识别</title>
<desc id="desc">MPBind 训练样本 4OYT B 链：序列输入、特征对齐、参考界面位点与位置列表的18秒动画。初始颜色表示氨基酸类别，深绿色表示参考界面位点。珠链仅示意序列相邻关系，不表示三维构象。</desc>
<style>text{font-family:"PingFang SC","Helvetica Neue",Arial,sans-serif}.mono{font-family:"SFMono-Regular",Consolas,monospace}</style>
<defs>
 <radialGradient id="bgSage" cx="0" cy="0" r="1" gradientTransform="translate(290 370) scale(670 460)" gradientUnits="userSpaceOnUse"><stop stop-color="#e7eee9" stop-opacity=".85"/><stop offset="1" stop-color="#f8f9f8" stop-opacity="0"/></radialGradient>
 <radialGradient id="bgLilac" cx="0" cy="0" r="1" gradientTransform="translate(1125 230) scale(590 430)" gradientUnits="userSpaceOnUse"><stop stop-color="#eeebf3" stop-opacity=".8"/><stop offset="1" stop-color="#f8f9f8" stop-opacity="0"/></radialGradient>
 <linearGradient id="card" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#f7faf8"/></linearGradient>
 <linearGradient id="tray" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eaf0ed"/><stop offset=".13" stop-color="#f1f5f2"/><stop offset="1" stop-color="#f6f8f6"/></linearGradient>
 <linearGradient id="result" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0f4f3"/><stop offset=".55" stop-color="#f9faf9"/><stop offset="1" stop-color="#f1eef6"/></linearGradient>
 <linearGradient id="bond" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eff6f1"/><stop offset=".32" stop-color="#c2d4c9"/><stop offset="1" stop-color="#8ca89b"/></linearGradient>
 <linearGradient id="tile-site" x1="0" y1="0" x2=".6" y2="1"><stop stop-color="#80aa96"/><stop offset=".45" stop-color="#5f8d77"/><stop offset="1" stop-color="#3f6d56"/></linearGradient>
 <radialGradient id="bead-site" cx=".32" cy=".23" r=".8"><stop stop-color="#eff9f1"/><stop offset=".25" stop-color="#bad8c5"/><stop offset=".6" stop-color="#6e9e81"/><stop offset="1" stop-color="#315e45"/></radialGradient>
 <linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a6c9b8" stop-opacity="0"/><stop offset=".5" stop-color="#9bbdaa" stop-opacity=".33"/><stop offset="1" stop-color="#89b39b" stop-opacity="0"/></linearGradient>
 <linearGradient id="active" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6f9886"/><stop offset="1" stop-color="#416d5c"/></linearGradient>
 <linearGradient id="fadeGrid" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".05"/><stop offset=".55" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
 <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#dbe3df" stroke-width=".7"/></pattern>
 <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#c9d6cf"/></pattern>
 <filter id="cardShadow" x="-15%" y="-15%" width="135%" height="145%"><feDropShadow dx="0" dy="18" stdDeviation="17" flood-color="#435e51" flood-opacity=".09"/><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#435e51" flood-opacity=".06"/></filter>
 <filter id="tileShadow" x="-5%" y="-5%" width="115%" height="125%"><feDropShadow dx="0" dy="2" stdDeviation="1.05" flood-color="#5e776a" flood-opacity=".14"/></filter>
 <filter id="softShadow" x="-30%" y="-80%" width="160%" height="270%"><feGaussianBlur stdDeviation="6"/></filter>
 <filter id="beadShadow" x="-35%" y="-30%" width="180%" height="185%"><feDropShadow dx="1" dy="7" stdDeviation="4" flood-color="#4e7260" flood-opacity=".16"/></filter>
 <clipPath id="trayClip"><rect x="54" y="192" width="734" height="388" rx="13"/></clipPath>
 <clipPath id="resultClip"><rect x="852" y="349" width="372" height="229" rx="14"/></clipPath>
</defs>`;
for(const [key,m] of Object.entries(materials)){
 s+=`<defs><linearGradient id="tile-${key}" x1="0" y1="0" x2=".55" y2="1"><stop stop-color="${m.top}"/><stop offset="1" stop-color="${m.base}"/></linearGradient><radialGradient id="bead-${key}" cx=".32" cy=".23" r=".8"><stop stop-color="${m.light}"/><stop offset=".22" stop-color="${m.top}"/><stop offset=".55" stop-color="${m.sphere}"/><stop offset="1" stop-color="${m.deep}"/></radialGradient></defs>`;
}
s+=box(0,0,1280,720,'#f8f9f8',undefined,0);
s+=box(0,0,1280,720,'url(#bgSage)',undefined,0)+box(0,0,1280,720,'url(#bgLilac)',undefined,0);
s+=box(28,106,1224,530,'url(#grid)',undefined,0,'opacity=".55"');
s+=tx(32,55,'蛋白质相互作用位点识别',32,P.ink,600);
s+=tx(33,86,'从一条氨基酸序列出发，定位蛋白质之间可能接触的残基。',16,'#7b8987');
// A thin lower face, soft shadow and bright top edge lift each panel off the stage.
s+=box(32,119,778,513,'#d9e2dc','#d1dcd5',19);
s+=box(32,112,778,514,'url(#card)','#d5e0d9',19,'filter="url(#cardShadow)"');
s+=`<path d="M53 113H789Q809 113 809 133" fill="none" stroke="#fff" stroke-width="2"/>`;
s+=box(830,119,418,513,'#dfe3e1','#d5ddda',19);
s+=box(830,112,418,514,'url(#card)','#d7dfdc',19,'filter="url(#cardShadow)"');
s+=`<path d="M851 113H1227Q1247 113 1247 133" fill="none" stroke="#fff" stroke-width="2"/>`;
s+=tx(56,151,'蛋白质序列',21,P.ink,600);
s+=tx(57,178,'',12.5,'#7b9787',400,'start','', 'id="phase-caption" opacity="0"');
s+=box(640,132,146,30,'#edf3ee','#dce6df',15);
s+=dot(658,147,3.5,'#7a9c88')+tx(675,152,'4OYT · B 链',13,'#6a8274',500);
// The sequence remains complete and ordered; the tiles have shallow physical depth.
s+=box(54,192,734,388,'url(#tray)','#d9e3dc',13);
s+=`<g clip-path="url(#trayClip)">${box(54,192,734,388,'url(#dots)',undefined,0,'opacity=".35"')}
<path d="M68 193H774Q787 193 787 206" fill="none" stroke="#a9bcb0" stroke-opacity=".35"/>
<path d="M55 565Q55 579 69 579H773Q787 579 787 565" fill="none" stroke="#fff" stroke-width="2"/></g>`;
s+=`<g filter="url(#tileShadow)">`;
for(let r=0;r<17;r++){
 const y=207+r*20.8;
 for(let c=0;c<26;c++){
  const i=r*26+c;if(i>=sequence.length)continue;
  const x=96+c*25.6,key=category(sequence[i]),m=materials[key];
  s+=box(x,y+2.2,22.5,17.5,m.edge,undefined,3,`id="tile-edge-${i}"`);
  s+=box(x,y,22.5,17.5,`url(#tile-${key})`,m.base,3,'stroke-width=".5"');
  s+=box(x,y,22.5,17.5,'url(#tile-site)',undefined,3,`id="tile-mark-${i}" opacity="0"`);
  s+=ln(x+3,y+.8,x+19.5,y+.8,'#fff',.7,'opacity=".78"');
 }
}
s+='</g>';
s+=`<g clip-path="url(#trayClip)"><g id="scan-view" opacity="0"><rect id="scan-band" x="54" y="192" width="734" height="62" fill="url(#scan)"/><line id="scan-line" x1="56" x2="786" y1="223" y2="223" stroke="#7ba58c" stroke-width="1.1" opacity=".65"/></g></g>`;
for(let r=0;r<17;r++){
 const y=207+r*20.8;
 s+=tx(65,y+12.9,String(r*26+1).padStart(3,'0'),9.6,'#9aa99f',400,'start','mono');
 s+=tx(778,y+12.9,Math.min((r+1)*26,sequence.length),9.6,'#9aa99f',400,'end','mono');
 for(let c=0;c<26;c++){
  const i=r*26+c;if(i>=sequence.length)continue;
  const x=96+c*25.6,m=materials[category(sequence[i])];
  s+=tx(x+11.25,y+12.7,sequence[i],12.5,m.ink,500,'middle','mono residue',`id="tile-label-${i}" data-position="${i+1}"`);
 }
}
s+='<g id="category-legend">';
const legend=[['sand','疏水残基'],['lilac','D / E / K / R'],['sage','其他残基']];
legend.forEach(([key,name],i)=>{const x=56+i*145;s+=box(x,599,11,11,`url(#tile-${key})`,materials[key].base,3)+tx(x+18,609,name,11.5,'#86968b')});
s+=tx(786,609,'颜色表示氨基酸类别',11.5,'#9aa79e',400,'end');
s+='</g>';
s+='<g id="interface-legend" opacity="0">'+box(56,599,11,11,'url(#tile-site)',undefined,3)+tx(74,609,'参考界面位点',11.5,'#6c8a76')+box(212,599,11,11,'#e4eae5',undefined,3)+tx(230,609,'其余残基',11.5,'#98a79d')+tx(786,609,'绿色高亮对应界面位点',11.5,'#92a398',400,'end')+'</g>';
s+=dot(856,148,3,'#729383')+tx(867,153,'科学问题',13,P.green,600);
s+=tx(852,195,'这条序列中，哪些残基参与',21,P.ink,500);
s+=tx(852,228,'蛋白质之间的相互作用？',21,P.ink,500);
s+=tx(852,261,'请返回对应的位置编号。',21,P.ink,500);
s+=tx(852,292,'输入：单条序列 · 位置编号从 1 开始',13,'#8e9b94');
s+=ln(852,313,1224,313,'#e1e7e3');
s+=tx(852,337,'界面位点',15,P.green,600);
s+=box(852,349,372,229,'url(#result)','#dce3df',14);
s+=`<g clip-path="url(#resultClip)">${box(852,349,372,229,'url(#grid)',undefined,0,'opacity=".42"')}
<path d="M866 350H1210Q1223 350 1223 364" fill="none" stroke="#fff" stroke-width="1.4"/></g>`;
s+='<g id="chain-view">';
s+=tx(1038,373,'序列局部 · 001–008',11,'#a4afa8',400,'middle');
// Beads illustrate sequence adjacency only, never a claimed protein conformation.
const beads=[
 {x:884,y:430,r:14.5},{x:924,y:416,r:16.2},{x:965,y:399,r:17},
 {x:1007,y:409,r:18},{x:1047,y:438,r:17.5},{x:1091,y:444,r:16.6},
 {x:1134,y:424,r:15.3},{x:1175,y:402,r:14.3}
];
s+='<g id="chain-model">';
s+=`<ellipse cx="1035" cy="474" rx="143" ry="9" fill="#8aa697" opacity=".17" filter="url(#softShadow)"/>`;
for(let i=0;i<beads.length-1;i++){
 const a=beads[i],b=beads[i+1];
 s+=ln(a.x,a.y+3,b.x,b.y+3,'#8fa99b',7,'stroke-linecap="round" opacity=".4"');
 s+=ln(a.x,a.y,b.x,b.y,'url(#bond)',7,'stroke-linecap="round"');
 s+=ln(a.x,a.y-1.9,b.x,b.y-1.9,'#f9fcfa',1.5,'stroke-linecap="round" opacity=".85"');
}
s+='<g filter="url(#beadShadow)">';
beads.forEach((b,i)=>{
 const key=category(sequence[i]),m=materials[key];
 s+=dot(b.x,b.y,b.r,`url(#bead-${key})`,'stroke="#fff" stroke-opacity=".75" stroke-width=".6"');
 s+=dot(b.x,b.y,b.r,'url(#bead-site)',`id="bead-mark-${i}" opacity="0"`);
 s+=`<ellipse cx="${b.x-b.r*.24}" cy="${b.y-b.r*.46}" rx="${b.r*.4}" ry="${b.r*.19}" fill="#fff" opacity=".45" transform="rotate(-28 ${b.x} ${b.y})"/>`;
 s+=tx(b.x,b.y+4.2,sequence[i],11.7,m.deep,500,'middle','mono',`id="bead-label-${i}"`);
});
s+='</g>';
s+='</g>';
s+=tx(1038,512,'等待展开',23,'#82978a',500,'middle','', 'id="chain-status"');
s+=tx(1038,541,'在序列中高亮，并列出位置编号',13,'#a1ada5',400,'middle','', 'id="chain-detail"');
s+='</g>';
s+='<g id="result-summary" opacity="0">';
s+=tx(873,376,'参考界面位点',12.5,'#7c9887');
s+=tx(872,423,interfaceSites.length,46,'#507c60',600,'start','mono', 'id="site-count"');
s+=tx(970,421,'个',17,'#8ba193');
s+=box(1138,393,64,23,'#e8f0e9','#d6e3d9',11.5)+tx(1170,409,'已展开',11,'#789b82',500,'middle');
s+=ln(873,440,1203,440,'#dee6df');
s+=tx(873,463,'位置列表（节选）',12.5,'#80978a');
const listLines=['['+interfaceSites.slice(0,8).join(', ')+',',' '+interfaceSites.slice(8,15).join(', ')+',',' '+interfaceSites.slice(15,22).join(', ')+', …,',' '+interfaceSites.slice(-4).join(', ')+']'];
listLines.forEach((line,i)=>{s+=tx(873,487+i*19,line,12.5,'#5b7866',400,'start','mono',`id="list-line-${i}"`)});
s+='</g>';
s+=tx(852,605,'输出格式',12,'#91a097')+tx(931,605,'[位置1, 位置2, …]',13,'#7f9386',400,'start','mono');
// A low-profile raised rail anchors the four animation stages.
s+=box(32,652,1216,46,'#ecf0ed','#e0e7e2',23);
s+=box(33,651,1214,44,'#f9fbf9','#fff',22);
s+=box(42,657,228,32,'#edf3ee','#d9e5dc',16,'id="active-step"');
const steps=['输入序列','特征对齐','界面定位','位置列表'];
steps.forEach((label,i)=>{
 const x=62+i*305;
 if(i<3)s+=ln(x+129,673,x+265,673,'#e2e9e4',1.3);
 s+=dot(x,673,10.5,i===0?'url(#active)':'#edf1ee',`id="step-dot-${i}" stroke="${i===0?'#749786':'none'}" stroke-width=".5"`);
 s+=tx(x,677,i+1,11.5,i===0?'#fff':'#acb9b0',500,'middle','',`id="step-number-${i}"`);
 s+=tx(x+22,679,label,15,i===0?'#426551':'#a0ada4',i===0?600:400,'start','',`id="step-label-${i}"`);
});
s+='</svg>';
document.getElementById('frame').innerHTML=s;


const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const el=id=>document.getElementById(id);
const mix=(a,b,t)=>{
 const rgb=c=>c.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));
 const ac=rgb(a),bc=rgb(b);
 return '#'+ac.map((x,i)=>Math.round(x+(bc[i]-x)*t).toString(16).padStart(2,'0')).join('');
};
const markedTiles=interfaceSites.map(pos=>({pos,mark:el(`tile-mark-${pos-1}`),edge:el(`tile-edge-${pos-1}`),label:el(`tile-label-${pos-1}`),material:materials[category(sequence[pos-1])]}));
window.renderProteinAt=(time=0)=>{
 const t=Math.max(0,Math.min(18,Number(time)));
 const reset=1-ease((t-16.8)/1.2);
 const alignment=ease((t-2)/3.8);
 const location=ease((t-5.8)/5);
 const front=location*(sequence.length+24);
 const result=ease((t-10.8)/.9)*reset;
 const activity=ease((t-1.85)/.35)*reset;
 let count=0;
 for(const item of markedTiles){
  const a=ease((front-item.pos)/20)*reset;
  item.mark.setAttribute('opacity',a);
  item.edge.setAttribute('fill',mix(item.material.edge,'#375f48',a));
  item.label.setAttribute('fill',mix(item.material.ink,'#ffffff',a));
  item.label.dataset.siteRevealed=a>=.5?'true':'false';
  if(a>=.5)count++;
 }
 const scanOpacity=ease((t-2)/.3)*(1-ease((t-5.5)/.3))*reset;
 const scanY=204+alignment*348;
 el('scan-view').setAttribute('opacity',scanOpacity);
 el('scan-band').setAttribute('y',scanY-31);
 el('scan-line').setAttribute('y1',scanY);
 el('scan-line').setAttribute('y2',scanY);
 el('phase-caption').setAttribute('opacity',activity);
 el('phase-caption').textContent=t<5.8?'正在对齐残基特征':t<10.8?'正在定位界面位点':'参考界面位点已展开';
 const legendOpacity=ease((t-5.8)/.5)*reset;
 el('category-legend').setAttribute('opacity',1-legendOpacity);
 el('interface-legend').setAttribute('opacity',legendOpacity);
 el('chain-view').setAttribute('opacity',1-result);
 const floatTime=Math.max(0,Math.min(t-2,8.8));
 const bob=Math.sin(floatTime*1.4)*2.2*activity*(1-result);
 el('chain-model').setAttribute('transform',`translate(0 ${bob})`);
 for(let i=0;i<beads.length;i++){
  const m=materials[category(sequence[i])];
  const a=siteSet.has(i+1)?ease((front-(i+1))/20)*reset:0;
  el(`bead-mark-${i}`).setAttribute('opacity',a);
  el(`bead-label-${i}`).setAttribute('fill',mix(m.deep,'#fffefa',a));
 }
 el('chain-status').textContent=t<2?'等待展开':t<5.8?'特征对齐':`已展开 ${count} 个位点`;
 el('chain-detail').textContent=t<2?'在序列中高亮，并列出位置编号':t<5.8?'逐位读取序列，保留残基位置':'将参考界面位点映射回输入序列';
 // During reset the first-frame copy returns without a hard jump.
 if(t>16.8){
  el('chain-status').textContent='等待展开';
  el('chain-detail').textContent='在序列中高亮，并列出位置编号';
 }
 el('result-summary').setAttribute('opacity',result);
 el('result-summary').setAttribute('transform',`translate(0 ${(1-result)*8})`);
 for(let i=0;i<4;i++){
  const a=ease((t-11.5-i*.27)/.55)*reset;
  el(`list-line-${i}`).setAttribute('opacity',a);
  el(`list-line-${i}`).setAttribute('transform',`translate(0 ${(1-a)*5})`);
 }
 const step=(ease((t-1.85)/.45)+ease((t-5.65)/.45)+ease((t-10.65)/.45))*reset;
 el('active-step').setAttribute('x',42+step*305);
 steps.forEach((_,i)=>{
  const done=clamp(step-i+1);
  const focused=1-clamp(Math.abs(step-i));
  el(`step-dot-${i}`).setAttribute('fill',done>.5?'url(#active)':'#edf1ee');
  el(`step-number-${i}`).setAttribute('fill',done>.5?'#fff':'#acb9b0');
  el(`step-label-${i}`).setAttribute('fill',mix('#a0ada4','#426551',focused));
  el(`step-label-${i}`).setAttribute('font-weight',focused>.5?600:400);
 });
 document.body.dataset.time=t.toFixed(3);
};
window.proteinDuration=18;
const params=new URLSearchParams(location.search);
window.renderProteinAt(Number(params.get('t')||0));
window.firstFrameReady=true;
if(params.has('play')){
 const start=performance.now();let last=-100;
 function tick(now){
  if(now-last>=1000/12){window.renderProteinAt(((now-start)/1000)%18);last=now}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
}

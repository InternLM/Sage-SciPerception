const crystalSample=window.SAGE_TRAINING_DATA.datasets.find(d=>d.id==='cif');
const lattice=crystalSample.visual.lattice;
const fractional=crystalSample.visual.fractional;
const elements=crystalSample.visual.elements;
const C={ink:'#243137',muted:'#83918f',line:'#dbe4df',green:'#4b786a'};
const material={
 Ti:{light:'#ffffff',top:'#e6f1e9',mid:'#9cbdab',base:'#638977',deep:'#426351',r:.48},
 Cu:{light:'#fffef7',top:'#f7edda',mid:'#ccb786',base:'#a38c60',deep:'#796744',r:.43},
 Si:{light:'#ffffff',top:'#eaf0f5',mid:'#b7cbd3',base:'#7f9da7',deep:'#587783',r:.38},
 As:{light:'#ffffff',top:'#f0eaf8',mid:'#c2b1d7',base:'#9c87b5',deep:'#75638e',r:.46}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const tx=(x,y,s,size=18,color=C.ink,weight=400,anchor='start',cls='',extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}" class="${cls}" ${extra}>${esc(s)}</text>`;
const box=(x,y,w,h,fill='#fff',stroke='none',rx=15,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line=(x1,y1,x2,y2,stroke=C.line,width=1,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const circle=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const cart=f=>[0,1,2].map(k=>f.reduce((sum,v,j)=>sum+v*lattice[j][k],0));
const repeat=[3,2,1];
const atoms=[];
// Periodic copies use the supplied cell exactly. At z=1 only the z=0 boundary sites repeat.
for(let i=0;i<repeat[0];i++)for(let j=0;j<repeat[1];j++)fractional.forEach((f,index)=>{
 const frac=[f[0]+i,f[1]+j,f[2]];
 atoms.push({xyz:cart(frac),element:elements[index],cell:[i,j],boundary:false});
 if(Math.abs(f[2])<1e-5)atoms.push({xyz:cart([frac[0],frac[1],1]),element:elements[index],cell:[i,j],boundary:true});
});
const neighbors=[];
for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
 const distance=Math.hypot(...atoms[i].xyz.map((v,k)=>v-atoms[j].xyz[k]));
 // Lines encode a geometric near-neighbor cutoff, not chemical bond orders.
 if(distance>1.7&&distance<=3.05)neighbors.push([i,j]);
}
const referenceEnergy=Number(crystalSample.sample.find(s=>s.family==='main').answer.replace(/<[^>]+>/g,''));
const focusIndex=atoms.findIndex(a=>a.element==='Ti'&&a.cell[0]===1&&a.cell[1]===0&&a.xyz[2]>lattice[2][2]/2&&!a.boundary);
const focusSites=new Set([focusIndex]);
for(const [i,j] of neighbors){if(i===focusIndex)focusSites.add(j);if(j===focusIndex)focusSites.add(i)}
const [na,nb]=repeat;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>{
 const rgb=c=>c.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16));const ac=rgb(a),bc=rgb(b);
 return '#'+ac.map((x,i)=>Math.round(x+(bc[i]-x)*t).toString(16).padStart(2,'0')).join('');
};
const cellCorners=[[0,0,0],[na,0,0],[0,nb,0],[0,0,1],[na,nb,0],[na,0,1],[0,nb,1],[na,nb,1]];
const cellEdges=[[0,1],[0,2],[0,3],[1,4],[1,5],[2,4],[2,6],[3,5],[3,6],[4,7],[5,7],[6,7]];
function renderCrystal(yaw=-.57,state={}){
 const {local=0,result=0,step=0,caption='',activity=0,time=0}=state;
 const center=cart([na/2,nb/2,.5]),pitch=.34;
 let scale=30.2;
 const baseProject=xyz=>{
  const x=xyz[0]-center[0],y=xyz[2]-center[2],z=xyz[1]-center[1];
  const xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw);
  const yy=y*Math.cos(pitch)-zz*Math.sin(pitch),depth=y*Math.sin(pitch)+zz*Math.cos(pitch);
  const perspective=1/(1-depth/44);
  return {x:420+xx*scale*perspective,y:379-yy*scale*perspective,z:depth,k:scale*perspective};
 };
 const extents=atoms.map(a=>{const p=baseProject(a.xyz),r=material[a.element].r*p.k;return {left:p.x-r,right:p.x+r,top:p.y-r,bottom:p.y+r}});
 // Keep the full rotating input inside the viewport before applying the local-view zoom.
 const fit=Math.min(1,(379-183)/(379-Math.min(...extents.map(p=>p.top))),(575-379)/(Math.max(...extents.map(p=>p.bottom))-379),(420-82)/(420-Math.min(...extents.map(p=>p.left))),(768-420)/(Math.max(...extents.map(p=>p.right))-420));
 scale*=fit;
 const target=baseProject(atoms[focusIndex].xyz),zoom=1+.68*local;
 const project=xyz=>{
  const p=baseProject(xyz);
  return {...p,x:(p.x-target.x)*zoom+target.x+(356-target.x)*local,y:(p.y-target.y)*zoom+target.y+(372-target.y)*local,k:p.k*zoom};
 };
 const projectFrac=f=>project(cart(f));
 const poly=(points,fill,stroke='none',width=1,extra='')=>`<polygon points="${points.map(p=>`${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" ${extra}/>`;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc"><title id="title">晶体形成能预测</title><desc id="desc">JARVIS 真实训练结构 JVASP-90856，TiCuSiAs。按照原始晶格和分数坐标做${repeat.join("×")}周期展开；顶部边界原子为周期映像。连线表示3.05埃以内的几何近邻，不表示化学键级。20秒预设动画展示周期晶格、Ti位点的几何近邻和样本的形成能参考标签。</desc><style>text{font-family:"PingFang SC","Helvetica Neue",Arial,sans-serif}.mono{font-family:"SFMono-Regular",Consolas,monospace}</style><defs>
 <radialGradient id="bgSage" cx="0" cy="0" r="1" gradientTransform="translate(290 370) scale(670 460)" gradientUnits="userSpaceOnUse"><stop stop-color="#e7eee9" stop-opacity=".85"/><stop offset="1" stop-color="#f8f9f8" stop-opacity="0"/></radialGradient>
 <radialGradient id="bgLilac" cx="0" cy="0" r="1" gradientTransform="translate(1125 230) scale(590 430)" gradientUnits="userSpaceOnUse"><stop stop-color="#eeebf3" stop-opacity=".8"/><stop offset="1" stop-color="#f8f9f8" stop-opacity="0"/></radialGradient>
 <linearGradient id="card" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#f7faf8"/></linearGradient>
 <linearGradient id="tray" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1f5f2"/><stop offset=".6" stop-color="#f8faf8"/><stop offset="1" stop-color="#edf2ef"/></linearGradient>
 <linearGradient id="result" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0f4f3"/><stop offset=".55" stop-color="#f9faf9"/><stop offset="1" stop-color="#f1eef6"/></linearGradient>
 <linearGradient id="active" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6f9886"/><stop offset="1" stop-color="#416d5c"/></linearGradient>
 <linearGradient id="platform" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#edf3ef"/><stop offset=".55" stop-color="#e6ede8"/><stop offset="1" stop-color="#dce6df"/></linearGradient>
 <linearGradient id="icon" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#dce9df"/></linearGradient>
 <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#dbe3df" stroke-width=".7"/></pattern>
 <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#c9d6cf"/></pattern>
 <filter id="cardShadow" x="-15%" y="-15%" width="135%" height="145%"><feDropShadow dx="0" dy="18" stdDeviation="17" flood-color="#435e51" flood-opacity=".09"/><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#435e51" flood-opacity=".06"/></filter>
 <filter id="floorShadow" x="-35%" y="-100%" width="170%" height="300%"><feGaussianBlur stdDeviation="12"/></filter>
 <filter id="atomShadow" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="1" dy="4" stdDeviation="3" flood-color="#577263" flood-opacity=".13"/></filter>
 <filter id="iconShadow" x="-50%" y="-50%" width="200%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#587561" flood-opacity=".15"/></filter>
 <clipPath id="trayClip"><rect x="54" y="176" width="734" height="404" rx="13"/></clipPath>
 <clipPath id="resultClip"><rect x="852" y="349" width="372" height="229" rx="14"/></clipPath>
 </defs>`;
 for(const [el,m] of Object.entries(material))s+=`<defs><radialGradient id="atom-${el}" cx=".3" cy=".23" r=".84"><stop stop-color="${m.light}"/><stop offset=".19" stop-color="${m.top}"/><stop offset=".56" stop-color="${m.mid}"/><stop offset=".82" stop-color="${m.base}"/><stop offset="1" stop-color="${m.deep}"/></radialGradient></defs>`;
 s+=box(0,0,1280,720,'#f8f9f8',undefined,0)+box(0,0,1280,720,'url(#bgSage)',undefined,0)+box(0,0,1280,720,'url(#bgLilac)',undefined,0);
 s+=box(28,106,1224,530,'url(#grid)',undefined,0,'opacity=".55"');
 s+=tx(32,55,'晶体形成能预测',32,C.ink,600)+tx(33,86,'从原子排列出发，预测晶体的每原子形成能。',16,'#7b8987');
 s+=box(32,119,778,513,'#d9e2dc','#d1dcd5',19)+box(32,112,778,514,'url(#card)','#d5e0d9',19,'filter="url(#cardShadow)"');
 s+='<path d="M53 113H789Q809 113 809 133" fill="none" stroke="#fff" stroke-width="2"/>';
 s+=box(830,119,418,513,'#dfe3e1','#d5ddda',19)+box(830,112,418,514,'url(#card)','#d7dfdc',19,'filter="url(#cardShadow)"');
 s+='<path d="M851 113H1227Q1247 113 1247 133" fill="none" stroke="#fff" stroke-width="2"/>';
 s+=tx(56,151,'晶体结构',21,C.ink,600)+`<g opacity="${activity}">`+tx(175,150,caption,11.5,'#86a08f')+'</g>';
 s+=box(626,132,160,30,'#edf3ee','#dce6df',15)+circle(644,147,3.5,'#7a9c88')+tx(659,152,crystalSample.sourceObject,12.5,'#6a8274',500);
 s+=box(54,176,734,404,'url(#tray)','#d9e3dc',13);
 s+='<g clip-path="url(#trayClip)">'+box(54,176,734,404,'url(#dots)',undefined,0,'opacity=".3"');
 s+=tx(78,210,'TiCuSiAs',22,'#6b8374',500,'start','mono');
 s+=`<g opacity="${1-local}">`+tx(79,232,'周期晶体',11.5,'#9aaba0')+'</g>'+`<g opacity="${local}">`+tx(79,232,'局部近邻视图',11.5,'#9aaba0')+'</g>';
 s+=`<g opacity="${1-local*.92}">`;
 // The floor establishes a shared light direction and casts a soft, broad shadow.
 const floor=[[-.36,-.36,-.072],[na+.36,-.36,-.072],[na+.36,nb+.36,-.072],[-.36,nb+.36,-.072]].map(projectFrac);
 s+=`<ellipse cx="423" cy="540" rx="192" ry="24" fill="#8ea596" opacity=".17" filter="url(#floorShadow)"/>`;
 s+=poly(floor.map(p=>({...p,y:p.y+5})),'#cfdcd2','none',1,'opacity=".55"');
 s+=poly(floor,'url(#platform)','#fff',1.2);
 for(let i=0;i<=6;i++){
  const ka=-.36+i*(na+.72)/6,kb=-.36+i*(nb+.72)/6,a=projectFrac([ka,-.36,-.072]),b=projectFrac([ka,nb+.36,-.072]),c=projectFrac([-.36,kb,-.072]),d=projectFrac([na+.36,kb,-.072]);
  s+=line(a.x,a.y,b.x,b.y,'#c4d3c9',.7,'opacity=".58"')+line(c.x,c.y,d.x,d.y,'#c4d3c9',.7,'opacity=".58"');
 }
 const corners=cellCorners.map(projectFrac);
 // Translucent cell planes sit behind the depth-sorted atoms and near-neighbor rods.
 s+=poly([corners[0],corners[1],corners[5],corners[3]],'#c8ddd1','none',1,'opacity=".12"');
 s+=poly([corners[0],corners[2],corners[6],corners[3]],'#d6cde4','none',1,'opacity=".08"');
 for(const [a,b] of cellEdges)s+=line(corners[a].x,corners[a].y,corners[b].x,corners[b].y,'#a8bfb0',1,'opacity=".6"');
 for(let axis=0;axis<2;axis++)for(let k=1;k<repeat[axis];k++){
  const edgeFractions=axis===0?[[[k,0,0],[k,nb,0]],[[k,0,1],[k,nb,1]],[[k,0,0],[k,0,1]],[[k,nb,0],[k,nb,1]]]:[[[0,k,0],[na,k,0]],[[0,k,1],[na,k,1]],[[0,k,0],[0,k,1]],[[na,k,0],[na,k,1]]];
  for(const pair of edgeFractions){const a=projectFrac(pair[0]),b=projectFrac(pair[1]);s+=line(a.x,a.y,b.x,b.y,'#b4c7bb',.8,'opacity=".5"')}
 }
 s+='</g>';
 const projected=atoms.map(a=>({...a,p:project(a.xyz)}));
 const scene=[];
 for(const [i,j] of neighbors){
  // Small rod segments interleave with spheres by depth to preserve occlusion.
  const isFocusEdge=i===focusIndex||j===focusIndex;
  const from=atoms[i].xyz,to=atoms[j].xyz;
  const distance=Math.hypot(...to.map((v,k)=>v-from[k]));
  const unit=to.map((v,k)=>(v-from[k])/distance);
  const a=from.map((v,k)=>v+unit[k]*material[atoms[i].element].r*.96);
  const b=to.map((v,k)=>v-unit[k]*material[atoms[j].element].r*.96);
  for(let n=0;n<5;n++){
   const pa=project(a.map((v,k)=>v+(b[k]-v)*n/5));
   const pb=project(a.map((v,k)=>v+(b[k]-v)*(n+1)/5));
   const opacity=(.63+Math.max(-.13,Math.min(.13,(pa.z+pb.z)/50)))*(isFocusEdge?1:1-local*.93);
   const bondColor=isFocusEdge?mix('#8fa99b','#668d72',local):'#8fa99b';
   scene.push({depth:(pa.z+pb.z)/2,svg:line(pa.x,pa.y,pb.x,pb.y,bondColor,4.4+local*(isFocusEdge?1.5:0),`stroke-linecap="butt" opacity="${opacity}"`)+line(pa.x-.65,pa.y-1,pb.x-.65,pb.y-1,'#eff7f1',1.15,`stroke-linecap="butt" opacity="${.8*(isFocusEdge?1:1-local*.93)}"`)});
  }
 }
 const labeled=new Set();
 for(const element of Object.keys(material))projected.map((a,i)=>({...a,i})).filter(a=>a.element===element).sort((a,b)=>b.p.z-a.p.z).slice(0,2).forEach(a=>labeled.add(a.i));
 projected.forEach((a,i)=>{
  const p=a.p,m=material[a.element],r=m.r*p.k;
  const opacity=(.86+.14*Math.max(0,Math.min(1,(p.z+6)/12)))*(focusSites.has(i)?1:1-local*.93);
  let body=`<g data-element="${a.element}" data-boundary-image="${a.boundary}" opacity="${opacity}">`;
  body+=circle(p.x,p.y,r,`url(#atom-${a.element})`,'stroke="#fff" stroke-opacity=".7" stroke-width=".6" filter="url(#atomShadow)"');
  body+=`<ellipse cx="${p.x-r*.25}" cy="${p.y-r*.46}" rx="${r*.37}" ry="${r*.17}" fill="#fff" opacity=".38" transform="rotate(-28 ${p.x} ${p.y})"/>`;
  // Only front-facing sites carry labels; every species is also in the fixed legend.
  if((local<.5&&labeled.has(i))||(local>=.5&&focusSites.has(i)))body+=tx(p.x,p.y+3.4,a.element,9.7,m.deep,500,'middle');
  if(i===focusIndex)body+=circle(p.x,p.y,r+5.5,'none',`stroke="#71957b" stroke-width="1.15" opacity="${local*.8}"`);
  body+='</g>';scene.push({depth:p.z,svg:body});
 });
 scene.sort((a,b)=>a.depth-b.depth).forEach(item=>s+=item.svg);
 // A restrained front edge clarifies the volume of the outer cell.
 for(const [a,b] of cellEdges){
  const pa=corners[a],pb=corners[b];
  if((pa.z+pb.z)/2>2)s+=line(pa.x,pa.y,pb.x,pb.y,'#95b29f',1.25,`opacity="${.68*(1-local*.95)}"`);
 }
 // The axes are aligned to the actual supplied lattice, projected with the crystal.
 const origin={x:94,y:530};
 const base=projectFrac([0,0,0]);
 for(const [name,f,color] of [['a',[.8,0,0],'#92ae9b'],['b',[0,.8,0],'#a6a4ba'],['c',[0,0,.6],'#95aeb9']]){
  const q=projectFrac(f),dx=q.x-base.x,dy=q.y-base.y,k=34/Math.hypot(dx,dy);
  const ex=origin.x+dx*k,ey=origin.y+dy*k;
  s+=line(origin.x,origin.y,ex,ey,color,1.4,'stroke-linecap="round"')+circle(ex,ey,1.7,color)+tx(ex+(name==='b'?-6:5),ey+(name==='c'?-4:5),name,10,color,500,'start','mono');
 }
 s+=circle(origin.x,origin.y,2.5,'#9bafa1');
 s+=box(620,542,145,23,'#f6f9f6','#dfe7e1',11.5)+`<g opacity="${1-local}">`+tx(692.5,558,`${repeat.join(' × ')} 周期展开`,10.5,'#95a59b',400,'middle')+'</g>'+`<g opacity="${local}">`+tx(692.5,558,'Ti 位点近邻视图',10.5,'#95a59b',400,'middle')+'</g>';
 s+=`<g id="local-info" opacity="${local}" transform="translate(${(1-local)*12} 0)">`;
 s+=box(587,203,177,115,'#f9fcfa','#dce7df',13,'fill-opacity=".94"');
 s+=circle(605,224,3.5,'#8ba994')+tx(615,229,'Ti 位点',15,'#60806b',600);
 s+=tx(604,253,'局部近邻环境',12,'#8a9f90');
 s+=tx(604,278,`${focusSites.size-1} 个近邻`,14,'#6b8c75',500);
 s+=tx(604,298,'几何距离 ≤ 3.05 Å',10.5,'#a1afa5','400');
 s+='</g>';
 s+='</g>';
 Object.keys(material).forEach((el,i)=>{
  const x=62+i*78;s+=circle(x,604,5.5,`url(#atom-${el})`,'stroke="#fff" stroke-width=".5"')+tx(x+13,609,el,12,'#7e9385',500);
 });
 s+=tx(786,609,'颜色表示元素种类',11.5,'#9aa79e',400,'end');
 s+=circle(856,148,3,'#729383')+tx(867,153,'科学问题',13,C.green,600);
 s+='<g id="science-question">';
 ['对于图示的 TiCuSiAs 晶体，','请综合元素组成、周期性原子排布','及各原子位点的局部配位环境，','预测其每原子形成能'].forEach((text,i)=>{s+=tx(852,186+i*28,text,21,C.ink,500)});
 s+='</g>';
 s+=tx(852,292,'输入：元素 · 原子位置 · 晶格',13,'#8e9b94');
 s+=line(852,313,1224,313,'#e1e7e3')+tx(852,337,'每原子形成能',15,C.green,600);
 s+=box(852,349,372,229,'url(#result)','#dce3df',14);
 s+='<g clip-path="url(#resultClip)">'+box(852,349,372,229,'url(#grid)',undefined,0,'opacity=".42"')+'<path d="M866 350H1210Q1223 350 1223 364" fill="none" stroke="#fff" stroke-width="1.4"/></g>';
 s+=`<g id="pending-result" opacity="${1-result}">`;
 s+=box(1009,389,58,58,'url(#icon)','#dce7de',16,'filter="url(#iconShadow)"');
 s+=tx(1038,427,'E',28,'#89a391',500,'middle','', 'font-style="italic"')+tx(1052,433,'f',13,'#89a391',500,'middle','', 'font-style="italic"');
 s+=tx(1038,493,time<1.9||time>18.2?'等待预测':time<9.7?'结构编码':'性质预测',23,'#82978a',500,'middle');
 s+=tx(1038,524,time<1.9||time>18.2?'从晶体结构到材料性质':time<9.7?(local>.3?'解析局部近邻环境':'读取元素与周期性结构'):'结合结构信息估算形成能',13,'#a1ada5',400,'middle');
 s+=tx(1038,553,'eV / atom',12,'#a0afa4',400,'middle','mono');
 s+='</g>';
 if(result>0){
  s+=`<g id="energy-result" data-reference-value="${referenceEnergy}" opacity="${result}" transform="translate(0 ${(1-result)*10})">`;
  s+=tx(1038,390,'参考形成能',13,'#8ba391',500,'middle');
  s+=tx(1038,458,referenceEnergy.toFixed(5).replace('-','−'),47,'#547e63',600,'middle','mono');
  s+=tx(1038,493,'eV / atom',17,'#8ca394',400,'middle','mono');
  s+=line(900,513,1176,513,'#dee7df');
  s+=tx(1038,540,'TiCuSiAs · JARVIS-DFT',12.5,'#8a9e90',400,'middle');
  s+=tx(1038,560,'原子结构 → 材料性质',11.5,'#a0b0a4',400,'middle');
  s+='</g>';
 }
 s+=tx(852,605,'计算口径',12,'#91a097')+tx(931,605,'JARVIS · optB88-vdW',12.5,'#7f9386');
 s+=box(32,652,1216,46,'#ecf0ed','#e0e7e2',23)+box(33,651,1214,44,'#f9fbf9','#fff',22)+box(42+step*305,657,228,32,'#edf3ee','#d9e5dc',16);
 ['输入晶体','结构编码','性质预测','能量结果'].forEach((label,i)=>{
  const x=62+i*305;
  if(i<3)s+=line(x+129,673,x+265,673,'#e2e9e4',1.3);
  const complete=step>=i-.5,focused=1-clamp(Math.abs(step-i));
  s+=circle(x,673,10.5,complete?'url(#active)':'#edf1ee');
  s+=tx(x,677,i+1,11.5,complete?'#fff':'#acb9b0',500,'middle')+tx(x+22,679,label,15,mix('#a0ada4','#426551',focused),focused>.5?600:400);
 });
 s+='</svg>';
 document.getElementById('frame').innerHTML=s;
 window.crystalSceneInfo={source:crystalSample.sourceObject,cellAtoms:elements.length,displayedAtoms:atoms.length,neighborPairs:neighbors.length,periodicExpansion:repeat,focusIndex,focusNeighbors:focusSites.size-1,localFocus:local,referenceEnergy,resultOpacity:result,time};
}
window.renderCrystalAt=(input=0)=>{
 const t=Math.max(0,Math.min(20,Number(input)));
 const reset=1-ease((t-18.2)/1.8);
 const local=ease((t-5.1)/1.2)*(1-ease((t-8.4)/1.4));
 const yaw=-.57+Math.PI*ease((t-1.8)/6)+Math.PI*ease((t-9.6)/7.4);
 const result=ease((t-11.8)/1)*reset;
 const step=(ease((t-1.85)/.45)+ease((t-9.55)/.45)+ease((t-11.75)/.45))*reset;
 const activity=ease((t-1.8)/.35)*reset;
 const caption=t<5.1?'查看周期性原子排列':t<9.7?'解析 Ti 位点的局部近邻':t<11.8?'连接结构表示与材料性质':'形成能参考值已展开';
 renderCrystal(yaw,{local,result,step,caption,activity,time:t});
};
window.crystalDuration=20;
const params=new URLSearchParams(location.search);
window.renderCrystalAt(Number(params.get('t')||0));
window.firstFrameReady=true;
if(params.has('play')){
 const start=performance.now();let last=-100;
 function tick(now){
  if(now-last>=1000/12){window.renderCrystalAt(((now-start)/1000)%20);last=now}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
}

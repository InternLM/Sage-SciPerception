/* Scripted replay of recorded ncRNA development iterations.
 * Validation uses 612 RNAs; complete-test results use 2,600 RNAs.
 * The scholar emblem represents the development model.
 */
(() => {
  const NS='http://www.w3.org/2000/svg';
  const C={ink:'#243137',green:'#326f58',muted:'#81918b',line:'#d8e2dc',purple:'#796597',amber:'#af8150'};
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  const ramp=(t,a,b)=>ease((t-a)/(b-a));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const tx=(x,y,s,size=18,color=C.ink,weight=400,anchor='start',extra='')=>'<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+color+'" font-weight="'+weight+'" text-anchor="'+anchor+'" '+extra+'>'+esc(s)+'</text>';
  const box=(x,y,w,h,fill='#fff',stroke='none',r=12,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'" stroke="'+stroke+'" '+extra+'/>';
  const dot=(x,y,r,fill,extra='')=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+extra+'/>';
  const path=(d,color=C.line,width=1,extra='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
  const poly=(points,fill,stroke='none',extra='')=>'<polygon points="'+points.map(p=>p.join(',')).join(' ')+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1" stroke-linejoin="round" '+extra+'/>';
  const wrap=(content,transform='',opacity=1)=>'<g transform="'+transform+'" opacity="'+clamp(opacity)+'">'+content+'</g>';
  const colors={
    neutral:{face:'url(#rsi-neutral)',side:'#b6c3be',top:'#f9fbfa',stroke:'#b5c3bd',ink:'#64756d'},
    green:{face:'url(#rsi-green)',side:'#67917b',top:'#eef8f0',stroke:'#8cae96',ink:'#315e48'},
    purple:{face:'url(#rsi-purple)',side:'#8a78a3',top:'#f5f0fb',stroke:'#b1a2c5',ink:'#66517d'},
    result:{face:'url(#rsi-result)',side:'#294f3e',top:'#709e83',stroke:'#47715b',ink:'#fff'}
  };
  function solid(x,y,w,h,tone='neutral',depth=14,rise=12,shadow=.16){
    const c=colors[tone];
    return '<g data-solid="cuboid">'+
      '<ellipse cx="'+(x+w/2+depth*.6)+'" cy="'+(y+h+14)+'" rx="'+(w*.55)+'" ry="12" fill="#3c5e4d" opacity="'+shadow+'" filter="url(#floor-blur)"/>'+
      poly([[x+w,y],[x+w+depth,y-rise],[x+w+depth,y+h-rise],[x+w,y+h]],c.side,c.stroke)+
      poly([[x,y],[x+depth,y-rise],[x+w+depth,y-rise],[x+w,y]],c.top,c.stroke)+
      box(x,y,w,h,c.face,c.stroke,9)+
      path('M'+(x+9)+' '+(y+1)+'H'+(x+w-9)+'Q'+(x+w-1)+' '+(y+1)+' '+(x+w-1)+' '+(y+9),'#fff',1.6,'opacity=".9"')+
      path('M'+(x+w+1)+' '+(y+6)+'V'+(y+h-9),'#f9fcfa',1.2,'opacity=".55"')+'</g>';
  }
  function flow(points,t,color=C.green,opacity=1,speed=2.6){
    const d=points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');
    const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    const total=lengths.reduce((a,b)=>a+b,0);
    let out=path(d,color,7,'opacity=".10" transform="translate(0 2)"')+path(d,color,2.8,'opacity=".74"');
    const [end,before]=[points.at(-1),points.at(-2)];
    const a=Math.atan2(end[1]-before[1],end[0]-before[0]);
    out+=poly([[end[0],end[1]],[end[0]-8*Math.cos(a-.5),end[1]-8*Math.sin(a-.5)],[end[0]-8*Math.cos(a+.5),end[1]-8*Math.sin(a+.5)]],color);
    if(t>=0){
      for(let k=0;k<2;k++){
        let distance=(((t/speed+k*.5)%1+1)%1)*total,index=0;
        while(index<lengths.length-1&&distance>lengths[index])distance-=lengths[index++];
        const p=points[index],q=points[index+1],f=lengths[index]?distance/lengths[index]:0;
        const x=p[0]+(q[0]-p[0])*f,y=p[1]+(q[1]-p[1])*f;
        out+=dot(x,y,8,color,'opacity=".10"')+dot(x,y,3.5,color)+dot(x-.7,y-.8,1.1,'#fff');
      }
    }
    return wrap(out,'',opacity);
  }
  function deck(upper=false,opacity=1){
    const p=upper?[[208,367],[623,345],[691,406],[276,428]]:[[98,444],[684,408],[746,480],[160,516]];
    const down=p.map(([x,y])=>[x,y+10]);
    let out='<ellipse cx="'+(upper?453:432)+'" cy="'+(upper?420:520)+'" rx="'+(upper?220:291)+'" ry="18" fill="#587860" opacity=".14" filter="url(#floor-blur)"/>';
    out+=poly([p[3],p[2],down[2],down[3]],upper?'#95b49e':'#bccbc3','#abc0b1');
    out+=poly(p,upper?'url(#rsi-deck)':'#edf1ee',upper?'#bdd5c4':'#d7e1da');
    for(let i=1;i<8;i++){
      const f=i/8;
      out+=path('M'+(p[0][0]+(p[1][0]-p[0][0])*f)+' '+(p[0][1]+(p[1][1]-p[0][1])*f)+'L'+(p[3][0]+(p[2][0]-p[3][0])*f)+' '+(p[3][1]+(p[2][1]-p[3][1])*f),'#acc6b4',.7,'opacity=".3"');
    }
    out+=path('M'+p[0].join(' ')+'L'+p[1].join(' ')+'L'+p[2].join(' '),'#fff',1.5);
    return wrap(out,'',opacity);
  }
  function icon(x,y,type,tone='neutral'){
    const c=colors[tone];
    let out='';
    if(type==='features'){
      for(let i=0;i<3;i++)out+=solid(x-24+i*2,y+i*8,48,5,'neutral',7,5,.03);
      out+=path('M'+(x+35)+' '+(y+16)+'v-6a4 4 0 0 0-8 0v6',c.ink,1.2)+box(x+26,y+16,10,9,'#eff4f0','#94aa9c',2);
    }else if(type==='bars'){
      for(let i=0;i<5;i++)out+=box(x-25+i*11,y+23-[11,20,30,22,13][i],6,[11,20,30,22,13][i],tone==='purple'?'#927aad':tone==='green'?'#608b70':'#9baa9f','none',2);
    }else{
      for(let i=0;i<13;i++)out+=dot(x-24+(i%5)*12,y+3+Math.floor(i/5)*9,3.1,['#8ba88e','#a391b6','#c4b17f'][i%3]);
    }
    return out;
  }
  function module(x,y,w,h,label,detail,type='bars',tone='neutral',depth=14,rise=12){
    return solid(x,y,w,h,tone,depth,rise)+icon(x+w/2,y+20,type,tone)+
      tx(x+w/2,y+h-24,label,17,colors[tone].ink,600,'middle')+
      tx(x+w/2,y+h-7,detail,10.5,tone==='purple'?'#8e7ca2':'#809487',400,'middle');
  }
  const phases=[
    {start:0,step:0,heading:'迭代起点：单路径接入',top:'RNA 特征，经投影生成家族答案',q:['怎样改进现有接入方案，','提高 RNA 家族分类表现？'],note:'读取实验反馈，修订下一轮设计',metric:'迭代起点 · 完整测试',kind:'baseline'},
    {start:2.5,step:1,heading:'提出假设：增强特征交互',top:'让投影模块中的特征充分交互',q:['增加全局注意力，','能否让分类表现更好？'],note:'提出结构假设，训练后检查验证结果',metric:'验证反馈 · 同一批 612 条 RNA',kind:'attention'},
    {start:7.4,step:2,heading:'复盘：信息损失发生在哪里？',top:'比较科学分类读出与语言模型生成',q:['科学特征已能区分类别，','瓶颈是否在语言对齐？'],note:'复盘前一轮结果，重新定位问题',metric:'验证诊断 · 同一批 612 条 RNA',kind:'diagnostic'},
    {start:11,step:2,heading:'修正方案：拆出独立映射',top:'先完成科学分类，再学习语言对齐',q:['先学习科学分类，','再单独训练语言映射。'],note:'保留原接入路径，训练新增映射',metric:'新方案 · 分阶段读出',kind:'rebuild'},
    {start:16,step:3,heading:'验证新方案：先选点，再全测',top:'按独立验证固定候选',q:['先用验证集选定方案，','再检查完整测试结果。'],note:'50 / 100 / 126 步验证持平，选择最早点',metric:'方案选择 · 612 条验证 RNA',kind:'validation'},
    {start:18.2,step:3,heading:'第一轮改进：分阶段读出',top:'完整测试确认新方案的收益',q:['分阶段方案完成全测，','分类表现得到提升。'],note:'完整测试 2,600 条，原始回答独立复算',metric:'完整测试结果 · 分阶段读出',kind:'first'},
    {start:22.5,step:3,heading:'继续迭代：任务适配与侧路',top:'科学模型选点后冻结，经独立侧路接入',q:['引入任务适配的科学模型，','通过独立侧路传递信息。'],note:'科学模型选点后冻结，再训练映射',metric:'后续迭代 · 完整测试',kind:'second'},
    {start:26.5,step:3,heading:'继续迭代：融合与读出蒸馏',top:'融合科学预测，用教师答案训练映射',q:['融合不同种子的预测，','继续改进映射训练。'],note:'同一验证集筛选，固定候选后全测',metric:'后续迭代 · 完整测试',kind:'third'},
    {start:30.5,step:3,heading:'从自己的实验中，改进自己的设计',top:'',q:['发现问题，修正方案，','再交给实验验证。'],note:'模型参与设计、检验与修订自己的方案',metric:'完整测试准确率 · 迭代轨迹',kind:'summary'}
  ];
  let svg,els={};
  function scorePanel(phase,t){
    const kind=phase.kind,success=['first','second','third','summary'].includes(kind);
    let out=solid(860,398,355,171,success?'result':'neutral',12,10,.14);
    const text=success?'#fff':'#687c70',small=success?'#d3e4d8':'#8c9d91';
    const row=(y,name,value,color=C.green)=>tx(881,y,name,13,'#7b8c82')+tx(1194,y,value,26,color,600,'end');
    if(kind==='baseline'||success){
      const values={baseline:'90.04%',first:'94.65%',second:'96.73%',third:'97.35%',summary:'97.35%'};
      const labels={baseline:'迭代前方案',first:'分阶段读出',second:'任务适配',third:'融合与蒸馏',summary:'最终方案'};
      out+=box(880,410,116,23,success?'#6d967c':'#e8eeea','none',11.5)+tx(938,426,labels[kind],11,success?'#fff':'#879a8d',500,'middle');
      if(kind==='third'||kind==='summary')out+=tx(1193,427,'+7.31 个百分点',12,'#ecf7eb',600,'end');
      out+=tx(1038,495,values[kind],62,text,600,'middle')+tx(1038,522,'完整测试准确率',14,small,400,'middle');
      const detail=kind==='baseline'?'BEACON ncRNA · 2,600 条 RNA':kind==='first'?'较起点 +4.62 个百分点':kind==='second'?'较前组 +2.08 个百分点':'迭代起点 90.04% → 最终 97.35%';
      out+=tx(1038,551,detail,12,small,400,'middle');
    }else if(kind==='attention'){
      out+=tx(882,424,'检验全局注意力假设',12.5,'#7e9284',500)+row(459,'原方案','92.81%')+row(494,'全局注意力','92.81%',C.purple)+path('M880 510H1196','#d3ded6')+tx(1038,541,'验证未见提升 · 停止该分支',12,C.amber,500,'middle');
    }else if(kind==='diagnostic'){
      out+=tx(882,424,'同范围比较，检查信息损失',12.5,'#7e9284',500)+row(459,'科学分类读出','96.24%')+row(494,'语言模型生成','92.81%',C.purple)+path('M880 510H1196','#d3ded6')+tx(1038,539,'科学读出用于诊断',12,'#83978a',400,'middle')+tx(1038,555,'不替代最终模型成绩',11,'#98a69d',400,'middle');
    }else if(kind==='rebuild'){
      out+=tx(1038,430,'把科学分类与语言映射分开',13,'#819788',500,'middle')+tx(1038,480,'先分类 → 再对齐',24,C.green,600,'middle')+tx(1038,516,'只训练新增的语言映射',13,'#84988a',400,'middle')+tx(1038,547,'约 53 万可训练参数 · 保留原路径',11.5,'#94a399',400,'middle');
    }else{
      out+=tx(882,424,'固定第 50 步候选',12.5,'#7e9284',500)+row(459,'同范围原方案','92.81%',C.purple)+row(494,'分阶段读出','95.42%')+path('M880 510H1196','#d3ded6')+tx(1038,541,'50 / 100 / 126 步验证持平',12,'#8b9f90',400,'middle');
    }
    return out;
  }
  function sidebar(phase,t){
    const bob=t>2.5&&t<30.5?Math.sin(t*1.7)*2:0;
    let out=dot(856,148,3,'#709682')+tx(867,153,'研发模型',13,C.green,600);
    out+=wrap('<ellipse cx="902" cy="247" rx="43" ry="9" fill="#8c829e" opacity=".2" filter="url(#floor-blur)"/><circle cx="901" cy="209" r="38" fill="#b1a6c0"/><circle cx="901" cy="202" r="38" fill="url(#badge-face)" stroke="#d5cfe0"/><use href="#intern-scholar" x="874" y="174" width="54" height="54"/>','translate(0 '+bob+')');
    out+=tx(957,200,'书生模型',25,'#3f5e4d',600)+tx(958,226,'分析 · 设计 · 复盘',12.5,'#9385a4');
    out+=tx(852,274,phase.q[0],20,C.ink,500)+tx(852,307,phase.q[1],20,C.ink,500)+tx(852,334,phase.note,11.8,'#87968b');
    out+=path('M852 351H1224','#dce4df')+tx(852,375,phase.metric,14,C.green,600)+scorePanel(phase,t);
    out+=tx(852,607,'改进对象',11.5,'#94a197')+tx(931,607,'科学模态接入方案',12.5,'#819487');
    return out;
  }
  function oldArchitecture(t,rebuild,diagnostic){
    const focus=ramp(t,2.5,3.4)*(1-ramp(t,7.4,8.1));
    const recede=Math.max(rebuild,ramp(t,7.4,8.4));
    const scale=1-.22*recede,dy=73*recede;
    let out=deck(false,.75);
    out+=flow([[253,411],[352,411]],focus>0?-1:t,'#a6b8ad',.75*(1-focus*.6));
    out+=flow([[494,411],[598,411]],focus>0?-1:t,'#a6b8ad',.75*(1-focus*.6));
    out+=wrap(module(120,370,132,79,'RNA–FM','科学特征 · 冻结','features','neutral',10,8),'',1-.72*focus);
    out+=wrap(module(598,370,123,79,'家族分类','13 类 ncRNA','family','neutral',10,8),'',1-.72*focus);
    const projector=module(353,352,140,98,rebuild>.5?'原投影模块':'投影模块',rebuild>.5?'原接入路径保留':'当前可训练模块','bars',focus>.2?'purple':'neutral',10+focus*13,8+focus*10);
    out+=wrap(projector,'translate(423 '+(401-40*focus)+') scale('+(1+.12*focus)+') translate(-423 -401)',1-.25*diagnostic);
    if(recede>.1)out+=tx(423,546,'原 RNA-FM 接入路径保留',14,'#7e9284',500,'middle');
    return wrap(out,'translate(420 '+(420+dy)+') scale('+scale+') translate(-420 -420)',1-.23*rebuild);
  }
  function sequence(t){
    const a=1-ramp(t,2.4,3.2);if(!a)return '';
    const letters='AUGC UAGC UUAU GGAC GUAC'.replaceAll(' ','');
    let out='';
    [...letters].forEach((letter,i)=>{
      const x=131+i*25.4,y=260+Math.sin(i*.55)*5;
      const tone={A:['#e7f0e8','#87a48e'],U:['#f4eddb','#b49a65'],G:['#ede5f4','#9b85b2'],C:['#e4edf0','#7fa2ac']}[letter];
      out+=box(x+2,y+4,21,28,'#c9d5cd','none',4)+box(x,y,21,28,tone[0],'#d5dfd8',4)+tx(x+10.5,y+19,letter,13,tone[1],600,'middle');
    });
    out+=flow([[195,304],[195,359]],t,'#a7b8ad',.6);
    return wrap(out,'',a);
  }
  function attention(t){
    const p=ramp(t,3,4.4)*(1-ramp(t,7.4,8.1));if(!p)return '';
    let out='';
    [0,1].forEach(i=>{
      const y=252+i*32;
      out+=solid(342+i*5,y,156,16,'purple',21,17,.13);
      for(let j=0;j<7;j++)out+=dot(357+j*20,y+8,2.7,'#9b84b6')+path('M'+(357+j*20)+' '+(y+8)+'Q421 '+(y-15)+' '+(477-j*20)+' '+(y+8),'#c3b2d4',.7);
    });
    out+=tx(425,222,'全局注意力',17,C.purple,600,'middle')+path('M423 306V316','#a492b9',1.3,'stroke-dasharray="4 4"');
    if(t>=5.8)out+=box(557,275,151,36,'#f3eadd','#e5d4b8',18)+tx(632,298,'验证未见提升',15,C.amber,600,'middle');
    return wrap(out,'translate(423 330) scale('+(1+.08*p)+') translate(-423 -330)',p);
  }
  function diagnosis(t){
    const a=ramp(t,7.5,8.3)*(1-ramp(t,10.9,11.7));if(!a)return '';
    let out=solid(164,254,497,115,'neutral',18,15,.2);
    out+=tx(290,286,'科学分类读出',15,'#5d7967',500,'middle')+tx(290,335,'96.24%',35,C.green,600,'middle');
    out+=tx(548,286,'语言模型生成',15,'#8c7b9e',500,'middle')+tx(548,335,'92.81%',35,C.purple,600,'middle');
    out+=path('M381 313H447',C.amber,2.3,'marker-end="url(#arrow-revision)"')+box(380,340,70,22,'#f3ebdf','none',11)+tx(415,355,'信息损失',10.5,C.amber,500,'middle');
    return wrap(out,'translate(0 '+(16*(1-a))+')',a);
  }
  function architecture(t,rebuild){
    if(!rebuild)return '';
    const p=ramp(t,11.2,14.7),lift=47*Math.sin(Math.PI*p);
    const second=ramp(t,22.5,23.5),third=ramp(t,26.5,27.5);
    let out=deck(true,.85);
    if(second<1)out+=flow([[237,454],[215,454],[215,337],[234,337]],t-11,C.green,1-second);
    if(second>0)out+=wrap(box(83,280,120,31,'#f8fbf8','#b9cdbf',10)+tx(143,300,'同一 RNA 输入',12,'#5f816b',500,'middle')+flow([[204,295],[215,295],[215,337],[234,337]],t-22.5,C.green)+flow([[143,312],[143,433],[237,433],[237,453]],t-22.5,'#a6b8ad',.6),'',second);
    out+=flow([[386,337],[462,337]],t-11,C.green);
    out+=flow([[625,330],[692,330],[692,490],[655,490]],t-11,C.purple);
    out+=solid(235,292,150,90,'green',25,21,.24);
    out+=solid(463,278,160,104,'purple',26,22,.24);
    // Lift separate slabs during reconstruction; two scientific slabs later
    // represent the two task-adapted seeds combined by the recorded method.
    out+=solid(241,268-lift,138,12,'green',25,21,.12);
    out+=path('M248 '+(280-lift)+'V292M369 '+(280-lift)+'V292','#9bb8a4',1,'stroke-dasharray="4 4"');
    if(third>0)out+=wrap(solid(246,248-lift,128,10,'green',25,21,.1),'',third);
    out+=solid(471,256-lift,144,10,'purple',26,22,.12);
    out+=path('M481 '+(266-lift)+'V278M605 '+(266-lift)+'V278','#b5a2c8',1,'stroke-dasharray="4 4"');
    out+=icon(310,307,'family','green')+icon(543,303,'bars','purple');
    out+=tx(310,355,second>.5?'RiNALMo':'科学读出',18,'#315f47',600,'middle')+
      tx(310,374,second>.5?(third>.5?'双种子预测融合':'任务适配后冻结'):'13 类科学概率',11,'#64896f',400,'middle');
    out+=tx(543,355,'语言映射',19,'#66507e',600,'middle')+tx(543,375,'13 → 128 → 4096',11,'#8c77a0',400,'middle');
    out+=wrap(box(80,228,118,27,'#e3efe7','#bdd4c4',13.5)+tx(139,247,'新增独立路径',12,'#4d795c',600,'middle'),'',1-ramp(t,30.5,31.5));
    return wrap(out,'translate(426 370) scale('+(0.6+0.4*rebuild)+') translate(-426 -370)',rebuild);
  }
  function timeline(t){
    const a=ramp(t,30.5,31.5);if(!a)return '';
    const values=['90.04%','94.65%','96.73%','97.35%'],labels=['迭代起点','分阶段读出','任务适配','融合与蒸馏'];
    let out='';
    values.forEach((v,i)=>{
      const x=89+i*174;
      out+=solid(x,231,132,32,i===3?'green':'neutral',7,6,.08)+tx(x+66,253,v,21,i===3?C.green:'#829189',i===3?600:400,'middle')+tx(x+66,216,labels[i],10.5,'#85968b',400,'middle');
      if(i<3)out+=path('M'+(x+145)+' 246H'+(x+166),'#a6bdae',1.6,'marker-end="url(#arrow-revision)"');
    });
    return wrap(out,'',a);
  }
  function stage(phase,t){
    const rebuild=ramp(t,11.1,15.4),summary=ramp(t,30.5,31.5),diagnostic=ramp(t,7.4,8.4)*(1-rebuild);
    let out=tx(56,151,phase.heading,20,C.ink,600)+box(613,131,173,29,'#f0f5f1','#d3e1d7',14.5)+dot(631,146,3.5,'#719b7d')+tx(647,151,'BEACON · ncRNA',12.5,'#678774',500);
    out+=box(54,176,734,408,rebuild>.5?'#f1f6f2':'#f5f7f5','#d7e2d9',13)+box(55,177,732,406,'url(#dots)','none',12,'opacity=".24"');
    out+=tx(80,210,phase.top,13,'#718d7a',500);
    let art=oldArchitecture(t,rebuild,diagnostic)+sequence(t)+attention(t)+diagnosis(t)+architecture(t,rebuild);
    out+=wrap(art,'translate(420 '+(380+14*summary)+') scale('+(1-.12*summary)+') translate(-420 -380)');
    out+=timeline(t);
    out+=box(66,599,9,9,rebuild>.5?'#6e9b7c':'#c3cec7','none',2)+tx(83,608,rebuild>.5?'新方案：科学读出 + 独立语言映射':'起点：科学特征经单一投影接入',11.5,'#7e9385');
    if(rebuild<.1)out+=tx(786,608,'依据验证反馈修订',11.5,'#94a197',400,'end');
    return out;
  }
  function loops(t){
    const feedback=ramp(t,5.6,6.4),revision=ramp(t,10.8,11.7);
    let out=flow([[1218,395],[1234,395],[1234,217],[1194,217]],feedback?t-5.6:-1,C.amber,.15+.8*feedback,2.7);
    out+=flow([[848,204],[819,204],[819,591],[750,591],[750,337],[651,337]],revision?t-10.8:-1,C.green,revision,4.3);
    if(revision)out+=wrap(box(503,580,227,27,'#f1f6f2','none',12)+tx(616.5,598,'实验反馈 → 下一轮设计',12,'#64866f',500,'middle'),'',revision);
    return out;
  }
  function rail(step){
    let out=box(32,656,1216,44,'#d8e3db','#d0ddd4',22)+box(32,651,1216,44,'#f9fbf9','#fff',22);
    ['建立起点','检验假设','复盘修正','再次验证'].forEach((label,i)=>{
      const x=62+i*305;
      if(i===step)out+=box(x-20,657,228,32,'#e2eee5','#c2d6c7',16);
      if(i<3)out+=path('M'+(x+129)+' 673H'+(x+265),'#dce6de',1.3);
      out+=dot(x,674,10.5,i<=step?'#c0d2c5':'#e7eee8')+dot(x,671,10.5,i===step?C.green:i<step?'#8eaf98':'#edf1ee')+tx(x,675,i+1,11.5,i<=step?'#fff':'#a9b7ad',500,'middle')+tx(x+22,678,label,15,i===step?'#315d44':'#9caba1',i===step?600:400);
    });
    return out;
  }
  window.renderRsiAt=(input=0)=>{
    if(!svg)return;
    const time=Math.max(0,Math.min(36,Number(input))),t=Math.min(time,33.5);
    const phase=[...phases].reverse().find(p=>t>=p.start)||phases[0];
    const paint=(phase,at)=>stage(phase,at)+sidebar(phase,at)+loops(at)+rail(phase.step);
    if(time>=35.85)els.scene.innerHTML=paint(phases[0],0);
    else if(time<=34)els.scene.innerHTML=paint(phase,t);
    else{
      const reset=ramp(time,34,35.85);
      els.scene.innerHTML=wrap(paint(phase,t),'',1-reset)+wrap(paint(phases[0],0),'',reset);
    }
    document.body.dataset.time=time.toFixed(3);document.body.dataset.phase=phase.kind;
  };
  async function init(){
    const base=await(await fetch('assets/rna-rsi-first-frame-v2.svg')).text();
    document.getElementById('frame').innerHTML=base;svg=document.querySelector('#frame svg');
    svg.querySelector('desc').textContent='基于 ncRNA 实验记录的36秒研发回放：从紧凑单路径，经抬升拆解和验证复盘，形成分层双路径。书生标志代表研发模型。验证反馈使用612条RNA；完整测试使用2600条。完整测试准确率依次为90.04%、94.65%、96.73%、97.35%。';
    // Reuse the established illustration's palette, backgrounds and scholar
    // symbol. Recompose the foreground to show a much larger spatial change.
    const keep=new Set([...svg.children].slice(0,22).filter(el=>{
      const tag=el.tagName;
      return ['title','desc','style','defs'].includes(tag)||['rect','path'].includes(tag)||tag==='text'&&Number(el.getAttribute('y'))<100;
    }));
    [...svg.children].filter(el=>!keep.has(el)).forEach(el=>el.remove());
    svg.insertAdjacentHTML('beforeend','<defs>'+
      '<linearGradient id="rsi-neutral" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#fafcfb"/><stop offset="1" stop-color="#e1e8e3"/></linearGradient>'+
      '<linearGradient id="rsi-green" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#e8f5e9"/><stop offset="1" stop-color="#a4c7ad"/></linearGradient>'+
      '<linearGradient id="rsi-purple" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#f1eafb"/><stop offset="1" stop-color="#c9b8db"/></linearGradient>'+
      '<linearGradient id="rsi-result" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#689378"/><stop offset="1" stop-color="#3b664e"/></linearGradient>'+
      '<linearGradient id="rsi-deck" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#edf6ef"/><stop offset="1" stop-color="#d5e8da"/></linearGradient></defs>');
    els.scene=document.createElementNS(NS,'g');els.scene.id='rsi-animated-scene';svg.append(els.scene);
    await document.fonts.ready;
    window.renderRsiAt(0);window.rnaRsiReady=true;
    const params=new URLSearchParams(location.search);
    if(params.has('t'))window.renderRsiAt(Number(params.get('t')));
    else if(params.get('play')==='1'){
      const start=performance.now();
      function tick(now){window.renderRsiAt(((now-start)/1000)%36);requestAnimationFrame(tick)}
      requestAnimationFrame(tick);
    }
  }
  init().catch(error=>{document.getElementById('frame').textContent=error.message;window.rnaRsiError=error.stack;console.error(error)});
})();

(() => {
  'use strict';
  const D = window.FIELD_LAB;
  if (!D) return;
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt = n => !Number.isFinite(n) ? '—' : ((Math.abs(n)>0 && Math.abs(n)<1e-3)||Math.abs(n)>=1e5 ? n.toExponential(3) : Number(n.toFixed(3)).toString());

  const key='aqa-fields-progress';
  let done=new Set(JSON.parse(localStorage.getItem(key)||'[]'));
  let lesson=D.lessons[0].id, filter='all', sim='fieldCompare', vals={}, t=0, playing=true;

  function show(view){
    $$('.view').forEach(v=>v.classList.remove('active-view'));
    $('#view-'+view)?.classList.add('active-view');
    $$('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    if(view==='lab') requestAnimationFrame(resize);
  }
  $$('.nav-button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.view)));
  $$('[data-jump]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.jump)));

  function progress(){
    $('#progressText').textContent=done.size+' / '+D.lessons.length+' complete';
    $('#progressFill').style.width=(100*done.size/D.lessons.length)+'%';
    localStorage.setItem(key,JSON.stringify([...done]));
  }
  $('#resetProgress').addEventListener('click',()=>{done.clear();progress();renderCourse();renderLesson(lesson);});

  function renderCourse(){
    const h=$('#courseList'); h.innerHTML='';
    D.lessons.filter(x=>filter==='all'||x.topic===filter).forEach(x=>{
      const b=document.createElement('button');
      b.className='lesson-card panel'+(x.id===lesson?' active':'')+(done.has(x.id)?' complete':'');
      b.innerHTML='<div class="lesson-card-row"><div><div class="lesson-code">'+esc(x.code)+'</div><div class="lesson-title">'+esc(x.title)+'</div></div><span class="lesson-status">'+(done.has(x.id)?'✓ complete':'lesson '+(D.lessons.indexOf(x)+1))+'</span></div><p class="muted small">'+esc(x.lead)+'</p>';
      b.addEventListener('click',()=>{lesson=x.id;renderCourse();renderLesson(x.id);});
      h.appendChild(b);
    });
  }
  function renderLesson(id){
    const x=D.lessons.find(l=>l.id===id)||D.lessons[0]; lesson=x.id;
    $('#lessonPanel').innerHTML='<span class="eyebrow">'+esc(x.code)+' · '+esc(x.topic)+'</span><h2>'+esc(x.title)+'</h2><p class="muted">'+esc(x.lead)+'</p><div class="keyword-row">'+x.keywords.map(k=>'<span class="keyword-chip">'+esc(k)+'</span>').join('')+'</div><section class="lesson-section"><h3>Objectives</h3><ul>'+x.objectives.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ul></section><section class="lesson-section"><h3>Retrieval starter</h3>'+x.retrieval.map(a=>'<details><summary>'+esc(a[0])+'</summary><p>'+esc(a[1])+'</p></details>').join('')+'</section><section class="lesson-section"><h3>Core teaching</h3>'+x.teach.map(a=>'<div class="teach-section"><h3>'+esc(a[0])+'</h3><p>'+esc(a[1])+'</p></div>').join('')+'</section><section class="lesson-section"><h3>Equations</h3>'+x.formulas.map(a=>'<span class="equation-chip">'+esc(a)+'</span>').join('')+'</section><section class="lesson-section"><h3>Worked example</h3><p><strong>'+esc(x.worked.q)+'</strong></p><ol>'+x.worked.steps.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ol></section><section class="lesson-section"><h3>Apply it</h3><p>'+esc(x.activity)+'</p></section><section class="lesson-section mission-inline"><h3>Simulation mission</h3><p><strong>'+esc(x.mission.goal)+'</strong></p><ol>'+x.mission.steps.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ol><button class="button primary" id="lessonSim">Open linked simulation</button></section><section class="lesson-section"><h3>AQA exam language</h3><p>'+esc(x.examTip)+'</p><p><strong>Common mistake:</strong> '+esc(x.misconception)+'</p></section><section class="check-card"><h3>Quick check</h3><p>'+esc(x.check[0])+'</p><div class="check-options">'+x.check[1].map((a,i)=>'<button class="button" data-answer="'+i+'">'+esc(a)+'</button>').join('')+'</div><div id="checkResult" class="check-result"></div></section><section class="lesson-section"><h3>Exit ticket</h3><p>'+esc(x.exit)+'</p></section><div class="lesson-footer-actions"><button class="button primary" id="complete">'+(done.has(x.id)?'Mark incomplete':'Mark complete')+'</button><button class="button" id="next">Next lesson</button></div>';
    $('#lessonSim').addEventListener('click',()=>{setSim(x.sim);show('lab');});
    $$('[data-answer]',$('#lessonPanel')).forEach(b=>b.addEventListener('click',()=>{$('#checkResult').innerHTML='<strong>'+(Number(b.dataset.answer)===x.check[2]?'Correct':'Not quite')+'.</strong> '+esc(x.check[3]);}));
    $('#complete').addEventListener('click',()=>{done.has(x.id)?done.delete(x.id):done.add(x.id);progress();renderCourse();renderLesson(x.id);});
    $('#next').addEventListener('click',()=>{const i=D.lessons.findIndex(l=>l.id===x.id);const n=D.lessons[Math.min(D.lessons.length-1,i+1)];lesson=n.id;renderCourse();renderLesson(n.id);});
  }
  $$('[data-course-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.courseFilter;$$('[data-course-filter]').forEach(q=>q.classList.toggle('primary',q===b));const f=D.lessons.find(x=>filter==='all'||x.topic===filter);if(f)lesson=f.id;renderCourse();renderLesson(lesson);}));

  const canvas=$('#simCanvas'), ctx=canvas.getContext('2d'); let W=900,H=520,DPR=1;
  function resize(){const r=canvas.getBoundingClientRect();DPR=Math.max(1,Math.min(2,devicePixelRatio||1));W=Math.max(320,r.width);H=Math.max(300,r.height);canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);draw();}
  addEventListener('resize',resize);
  function line(x1,y1,x2,y2,c='#67c7ff',w=2){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
  function circle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function label(s,x,y,c='#dceaff'){ctx.fillStyle=c;ctx.font='13px system-ui';ctx.fillText(s,x,y);}
  function arrow(x1,y1,x2,y2,c='#72e0a3'){line(x1,y1,x2,y2,c,2);const a=Math.atan2(y2-y1,x2-x1);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-9*Math.cos(a-.5),y2-9*Math.sin(a-.5));ctx.lineTo(x2-9*Math.cos(a+.5),y2-9*Math.sin(a+.5));ctx.closePath();ctx.fill();}
  function background(){const g=ctx.createRadialGradient(W*.5,H*.3,10,W*.5,H*.5,Math.max(W,H));g.addColorStop(0,'#102a45');g.addColorStop(1,'#04101b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  function radial(cx,cy,out=true){for(let i=0;i<14;i++){const a=i*Math.PI*2/14,x1=cx+Math.cos(a)*30,y1=cy+Math.sin(a)*30,x2=cx+Math.cos(a)*Math.min(W,H)*.34,y2=cy+Math.sin(a)*Math.min(W,H)*.34;out?arrow(x1,y1,x2,y2,'rgba(103,199,255,.6)'):arrow(x2,y2,x1,y1,'rgba(103,199,255,.6)');}}
  function readout(){const v=vals;switch(sim){case'fieldCompare':return'Relative field = '+fmt(v.source/v.distance**2);case'gravity':{const M=v.mass*1e24,r=v.radius*1e6;return'g = '+fmt(D.G*M/r**2)+' N kg⁻¹ · V = '+fmt(-D.G*M/r)+' J kg⁻¹';}case'orbit':{const M=v.mass*1e24,r=v.radius*1e6;return'v = '+fmt(Math.sqrt(D.G*M/r))+' m s⁻¹ · T = '+fmt(2*Math.PI*Math.sqrt(r**3/(D.G*M)))+' s';}case'electric':{const Q=v.charge*1e-9;return'E = '+fmt(D.k*Q/v.distance**2)+' N C⁻¹ · V = '+fmt(D.k*Q/v.distance)+' V';}case'capacitor':{const C=D.e0*v.er*v.area/v.gap;return'C = '+fmt(C)+' F · Q = '+fmt(C*v.voltage)+' C';}case'discharge':{const tau=v.R*v.C*1e-6;return'τ = '+fmt(tau)+' s · V(t) = '+fmt(v.V0*Math.exp(-t/tau))+' V';}case'magWire':return'F = '+fmt(v.B*v.I*v.L)+' N';case'particle':return'r ≈ '+fmt(1.67e-27*v.speed*1e6/(v.B*1.6e-19))+' m';case'flux':return'NΦ = '+fmt(v.B*.01*v.N*Math.cos(v.angle*Math.PI/180))+' Wb turn';case'induction':{const w=2*Math.PI*v.f;return'εpeak = '+fmt(v.B*.01*v.N*w)+' V';}case'ac':return'Vrms = '+fmt(v.peak/Math.sqrt(2))+' V · T = '+fmt(1/v.f)+' s';case'transformer':return'Vs = '+fmt(v.Vp*v.Ns/v.Np)+' V';default:return'';}}
  function draw(){background();const x=W/2,y=H/2,v=vals;switch(sim){
    case'fieldCompare':circle(x,y,26,'#f2c14e');radial(x,y,true);circle(x+120*v.distance/2,y,8,'#72e0a3');break;
    case'gravity':circle(x,y,55,'#2d6a9f');radial(x,y,false);circle(x+150,y,8,'#fff');arrow(x+150,y,x+90,y);break;
    case'orbit':{circle(x,y,45,'#2d6a9f');const r=Math.min(W,H)*.32;ctx.strokeStyle='rgba(103,199,255,.5)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();const a=t*.7;circle(x+r*Math.cos(a),y+r*Math.sin(a),8,'#fff');break;}
    case'electric':{const pos=v.charge>=0;circle(x*.65,y,28,pos?'#ff9b9b':'#86b7ff');radial(x*.65,y,pos);ctx.fillStyle='#ff9b9b';ctx.fillRect(W*.65-100,y-105,200,9);ctx.fillStyle='#86b7ff';ctx.fillRect(W*.65-100,y+105,200,9);for(let q=W*.65-80;q<W*.65+90;q+=35)arrow(q,y-90,q,y+90,'rgba(103,199,255,.65)');break;}
    case'capacitor':{const g=50+v.gap/.005*80;ctx.fillStyle='#d8e4ee';ctx.fillRect(x-g/2-7,y-120,14,240);ctx.fillRect(x+g/2-7,y-120,14,240);ctx.fillStyle='rgba(242,193,78,.25)';ctx.fillRect(x-g/2+7,y-120,g-14,240);for(let q=y-90;q<=y+90;q+=30)arrow(x-g/2+18,q,x+g/2-18,q,'rgba(103,199,255,.65)');break;}
    case'discharge':{const x0=60,y0=45,w=W-110,h=H-95;line(x0,y0+h,x0+w,y0+h,'#8ea7bd');line(x0,y0,x0,y0+h,'#8ea7bd');ctx.strokeStyle='#67c7ff';ctx.beginPath();for(let i=0;i<=150;i++){const u=i/150,px=x0+u*w,py=y0+h-Math.exp(-u*5)*h;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();label('exponential discharge',x0+15,y0+20);break;}
    case'magWire':for(let q=70;q<W-60;q+=45)for(let z=60;z<H-50;z+=45)label('×',q,z,'rgba(103,199,255,.5)');line(x-150,y,x+150,y,'#f2c14e',8);arrow(x,y,x,y-Math.sign(v.I||1)*110);break;
    case'particle':{for(let q=60;q<W-40;q+=50)for(let z=55;z<H-45;z+=50)label('×',q,z,'rgba(103,199,255,.3)');const r=Math.min(W,H)*.3,a=t*v.chargeSign;ctx.strokeStyle='rgba(242,193,78,.6)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();circle(x+r*Math.cos(a),y+r*Math.sin(a),8,v.chargeSign>0?'#ff9b9b':'#86b7ff');break;}
    case'flux':{for(let q=70;q<W-60;q+=55)arrow(q,70,q,H-70,'rgba(103,199,255,.4)');ctx.save();ctx.translate(x,y);ctx.rotate(v.angle*Math.PI/900);ctx.strokeStyle='#f2c14e';ctx.lineWidth=6;ctx.strokeRect(-110,-75,220,150);ctx.restore();label('θ = '+v.angle+'°',x-30,y+130);break;}
    case'induction':{for(let q=70;q<W*.52;q+=55)arrow(q,70,q,H-70,'rgba(103,199,255,.4)');ctx.save();ctx.translate(W*.32,y);ctx.rotate(2*Math.PI*v.f*t);ctx.strokeStyle='#f2c14e';ctx.lineWidth=6;ctx.strokeRect(-85,-55,170,110);ctx.restore();label('rotating coil',W*.25,y+95);break;}
    case'ac':{const x0=55,y0=45,w=W-100,h=H-90;for(let i=0;i<=8;i++)line(x0,y0+i*h/8,x0+w,y0+i*h/8,'rgba(255,255,255,.1)',1);ctx.strokeStyle='#67c7ff';ctx.beginPath();for(let i=0;i<=220;i++){const u=i/220,px=x0+u*w,py=y0+h/2-Math.sin(u*Math.PI*6)*h*.38;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();break;}
    case'transformer':{ctx.strokeStyle='#6f7f8e';ctx.lineWidth=25;ctx.strokeRect(x-150,y-125,300,250);label('Primary',x-230,y-145,'#f2c14e');label('Secondary',x+170,y-145,'#67c7ff');arrow(x-70,y,x+70,y);break;}
  }$('#simReadout').textContent=readout();}
  function setSim(id){sim=D.simulations[id]?id:'fieldCompare';const s=D.simulations[sim];vals={};s.controls.forEach(c=>vals[c.id]=c.value);t=0;$('#simCode').textContent=s.code;$('#simTitle').textContent=s.title;$('#simSubtitle').textContent=s.subtitle;$('#simSpec').textContent='AQA '+s.code;$('#simpleExplain').textContent=s.explain;$('#examExplain').textContent=s.exam;$('#mistakeExplain').textContent=s.mistake;const l=D.lessons.find(x=>x.sim===sim)||D.lessons[0];$('#missionGoal').textContent=l.mission.goal;$('#missionSteps').innerHTML=l.mission.steps.map(a=>'<li>'+esc(a)+'</li>').join('');$('#missionRecord').textContent=l.mission.record;$('#missionConclusion').textContent=l.mission.conclusion;$('#simTabs').innerHTML='';Object.entries(D.simulations).forEach(([k,q])=>{const b=document.createElement('button');b.className='sim-tab'+(k===sim?' active':'');b.textContent=q.title;b.addEventListener('click',()=>setSim(k));$('#simTabs').appendChild(b);});$('#simControls').innerHTML='';s.controls.forEach(c=>{const w=document.createElement('div');w.className='sim-control';w.innerHTML='<label><span>'+esc(c.label)+'</span><input type="range" min="'+c.min+'" max="'+c.max+'" step="'+c.step+'" value="'+c.value+'"><output>'+fmt(c.value)+' '+esc(c.unit)+'</output></label>';const i=$('input',w),o=$('output',w);i.addEventListener('input',()=>{vals[c.id]=Number(i.value);o.textContent=fmt(vals[c.id])+' '+c.unit;draw();});$('#simControls').appendChild(w);});draw();}
  $('#playPause').addEventListener('click',()=>{playing=!playing;$('#playPause').textContent=playing?'Pause':'Play';});
  $('#resetSim').addEventListener('click',()=>setSim(sim));
  $('#showFieldLines').addEventListener('click',()=>draw());
  $('#showVectors').addEventListener('click',()=>draw());
  $('#snapshotSim').addEventListener('click',()=>{$('#snapshotTray').innerHTML='<div class="snapshot"><strong>'+esc(D.simulations[sim].title)+'</strong> · '+esc(readout())+'</div>'+$('#snapshotTray').innerHTML;});
  let last=performance.now();function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(playing){t+=dt;if(['orbit','discharge','particle','induction','ac'].includes(sim))draw();}requestAnimationFrame(loop);}requestAnimationFrame(loop);

  function formulas(){const topic=$('#formulaTopic').value;return D.formulas.filter(f=>topic==='all'||f.topic===topic);}
  function renderFormulaMenu(){const list=formulas();$('#formulaSelect').innerHTML=list.map(f=>'<option value="'+D.formulas.indexOf(f)+'">'+esc(f.name)+'</option>').join('');$('#formulaCards').innerHTML=list.map(f=>'<div class="formula-card"><strong>'+esc(f.name)+'</strong><div class="eq">'+esc(f.eq)+'</div></div>').join('');renderFormula();}
  function renderFormula(){const f=D.formulas[Number($('#formulaSelect').value)]||formulas()[0];if(!f)return;$('#formulaInputs').innerHTML=f.vars.map(v=>'<label class="field"><span>'+esc(v[1])+' <small class="muted">'+esc(v[2])+'</small></span><input type="number" step="any" value="'+v[3]+'" data-v="'+esc(v[0])+'"></label>').join('');$$('[data-v]',$('#formulaInputs')).forEach(i=>i.addEventListener('input',calc));calc();function calc(){const z={};$$('[data-v]',$('#formulaInputs')).forEach(i=>z[i.dataset.v]=Number(i.value));let ans=NaN;try{ans=f.calc(z);}catch(e){}$('#formulaWorking').innerHTML='<div class="working-line"><strong>'+esc(f.eq)+'</strong></div><div class="working-line">'+f.vars.map(v=>esc(v[0])+' = '+fmt(z[v[0]])+' '+esc(v[2])).join(' · ')+'</div><div class="working-line"><strong>Result: '+fmt(ans)+' '+esc(f.unit)+'</strong></div>';}}
  $('#formulaTopic').addEventListener('change',renderFormulaMenu);$('#formulaSelect').addEventListener('change',renderFormula);

  $$('[data-practical]').forEach(b=>b.addEventListener('click',()=>{$$('[data-practical]').forEach(x=>x.classList.toggle('primary',x===b));$$('.practical-panel').forEach(p=>p.classList.add('hidden'));$('#practical-'+b.dataset.practical).classList.remove('hidden');}));
  function range(id,out,fn){const e=$('#'+id),o=$('#'+out);const u=()=>o.textContent=fn(Number(e.value));e.addEventListener('input',u);u();}
  range('rp9C','rp9COut',v=>v+' µF');range('rp9R','rp9ROut',v=>fmt(v/1000)+' kΩ');range('rp9T','rp9TOut',v=>fmt(v)+' s');range('rp10I','rp10IOut',v=>fmt(v)+' A');range('rp10L','rp10LOut',v=>fmt(v)+' m');range('rp10B','rp10BOut',v=>fmt(v)+' T');range('rp11Angle','rp11AngleOut',v=>v+'°');range('rp11N','rp11NOut',v=>v);range('rp11B','rp11BOut',v=>fmt(v)+' T');
  const p9=[],p10=[],p11=[];
  function plot(id,points,xLabel,yLabel){
    const c=$('#'+id); if(!c) return;
    const r=c.getBoundingClientRect(), d=Math.max(1,Math.min(2,window.devicePixelRatio||1));
    const w=Math.max(260,r.width||420), h=Math.max(180,r.height||230);
    c.width=Math.round(w*d); c.height=Math.round(h*d);
    const g=c.getContext('2d'); g.setTransform(d,0,0,d,0,0);
    g.fillStyle='#071522'; g.fillRect(0,0,w,h);
    const p=34;
    for(let i=0;i<=5;i++){
      lineGraph(g,p,p+i*(h-2*p)/5,w-p,p+i*(h-2*p)/5,'rgba(255,255,255,.10)');
      lineGraph(g,p+i*(w-2*p)/5,p,p+i*(w-2*p)/5,h-p,'rgba(255,255,255,.10)');
    }
    lineGraph(g,p,h-p,w-p,h-p,'#7f96aa'); lineGraph(g,p,p,p,h-p,'#7f96aa');
    if(points.length){
      const xs=points.map(q=>q[0]), ys=points.map(q=>q[1]);
      const xmin=Math.min(...xs), xmax=Math.max(...xs), ymin=Math.min(...ys), ymax=Math.max(...ys);
      const sx=x=>p+(x-xmin)/(xmax-xmin||1)*(w-2*p);
      const sy=y=>h-p-(y-ymin)/(ymax-ymin||1)*(h-2*p);
      const sorted=points.slice().sort((a,b)=>a[0]-b[0]);
      g.strokeStyle='#67c7ff'; g.lineWidth=2; g.beginPath();
      sorted.forEach((q,i)=>{const X=sx(q[0]),Y=sy(q[1]);i?g.lineTo(X,Y):g.moveTo(X,Y);}); g.stroke();
      g.fillStyle='#f2c14e'; points.forEach(q=>{g.beginPath();g.arc(sx(q[0]),sy(q[1]),4,0,Math.PI*2);g.fill();});
    }
    g.fillStyle='#b8cadb'; g.font='11px system-ui'; g.fillText(xLabel,w/2-18,h-8);
    g.save(); g.translate(11,h/2+20); g.rotate(-Math.PI/2); g.fillText(yLabel,0,0); g.restore();
  }
  function lineGraph(g,x1,y1,x2,y2,c){g.strokeStyle=c;g.lineWidth=1;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
  $('#takeRP9').addEventListener('click',()=>{const C=+$('#rp9C').value*1e-6,R=+$('#rp9R').value,tt=+$('#rp9T').value,V=6*Math.exp(-tt/(R*C)),ln=Math.log(V/6);p9.push([tt,V,ln]);$('#rp9Rows').innerHTML=p9.map(q=>'<tr><td>'+fmt(q[0])+'</td><td>'+fmt(q[1])+'</td><td>'+fmt(q[2])+'</td></tr>').join('');$('#rp9Summary').textContent='τ = '+fmt(R*C)+' s · expected log-plot gradient = '+fmt(-1/(R*C))+' s⁻¹';plot('rp9Graph',p9.map(q=>[q[0],q[2]]),'t / s','ln(V/V₀)');});
  $('#clearRP9').addEventListener('click',()=>{p9.length=0;$('#rp9Rows').innerHTML='';$('#rp9Summary').textContent='Collect at least five readings.';plot('rp9Graph',[],'t / s','ln(V/V₀)');});
  $('#takeRP10').addEventListener('click',()=>{const I=+$('#rp10I').value,L=+$('#rp10L').value,B=+$('#rp10B').value,F=B*I*L;p10.push([I,L,B,F]);$('#rp10Rows').innerHTML=p10.map(q=>'<tr><td>'+fmt(q[0])+'</td><td>'+fmt(q[1])+'</td><td>'+fmt(q[2])+'</td><td>'+fmt(q[3])+'</td></tr>').join('');$('#rp10Summary').textContent='For fixed B and L, F against I should be a straight line through the origin.';plot('rp10Graph',p10.map(q=>[q[0],q[3]]),'I / A','F / N');});
  $('#clearRP10').addEventListener('click',()=>{p10.length=0;$('#rp10Rows').innerHTML='';plot('rp10Graph',[],'I / A','F / N');});
  $('#takeRP11').addEventListener('click',()=>{const a=+$('#rp11Angle').value,N=+$('#rp11N').value,B=+$('#rp11B').value,c=Math.cos(a*Math.PI/180),fl=B*.01*N*c;p11.push([a,c,fl]);$('#rp11Rows').innerHTML=p11.map(q=>'<tr><td>'+fmt(q[0])+'</td><td>'+fmt(q[1])+'</td><td>'+fmt(q[2])+'</td></tr>').join('');$('#rp11Summary').textContent='NΦ should be directly proportional to cosθ.';plot('rp11Graph',p11.map(q=>[q[1],q[2]]),'cosθ','NΦ');});
  $('#clearRP11').addEventListener('click',()=>{p11.length=0;$('#rp11Rows').innerHTML='';plot('rp11Graph',[],'cosθ','NΦ');});

  function diagnostic(){const d=D.diagnostics[Math.floor(Math.random()*D.diagnostics.length)];$('#diagnosticBox').innerHTML='<p><strong>'+esc(d.q)+'</strong></p><textarea placeholder="Write your answer first..."></textarea><button class="button" id="reveal">Reveal answer</button><div class="diagnostic-answer" id="diagAnswer">'+esc(d.a)+'</div>';$('#reveal').addEventListener('click',()=>$('#diagAnswer').classList.add('show'));}
  $('#newDiagnostic').addEventListener('click',diagnostic);
  $('#languageChecklist').innerHTML=['Define field direction clearly.','Use r from the correct reference point.','Separate scalar potential from vector field strength.','Use Faraday for magnitude and Lenz for direction.','State graph gradient/area meanings with units.','Distinguish ideal transformer ratios from losses.'].map(x=>'<label class="checklist-item"><input type="checkbox"> '+esc(x)+'</label>').join('');
  $('#trapList').innerHTML='<ul>'+['Using altitude instead of distance from a planet centre.','Confusing 1/r potential with 1/r² field strength.','Using E = V/d for radial fields.','Calling one RC time constant a half-life.','Using angle to the coil plane instead of its normal.','Saying Lenz opposes the field instead of the change.','Using rms mains voltage as the peak value.'].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  $('#equationLinks').innerHTML='<div class="comparison-grid"><div class="mini"><strong>Gravity</strong><p>F → g → V → orbit</p></div><div class="mini"><strong>Electric</strong><p>F → E → V → capacitance</p></div><div class="mini"><strong>Magnetic</strong><p>F → flux → induction → AC</p></div></div>';
  $('#specMap').innerHTML=D.specMap.map(r=>'<div class="spec-card"><strong>'+esc(r[0])+'</strong><span>'+esc(r[1])+'</span><span>'+esc(r[2])+'</span><span>'+esc(r[3])+'</span></div>').join('');

  progress();renderCourse();renderLesson(lesson);setSim(sim);renderFormulaMenu();diagnostic();requestAnimationFrame(()=>{resize();plot('rp9Graph',[],'t / s','ln(V/V₀)');plot('rp10Graph',[],'I / A','F / N');plot('rp11Graph',[],'cosθ','NΦ');});
})();
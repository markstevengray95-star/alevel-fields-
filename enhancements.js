(() => {
  'use strict';

  const D = window.FIELD_LAB || {};
  const G = D.G || 6.67430e-11;
  const k = D.k || 8.9875517923e9;
  const e0 = D.e0 || 8.8541878128e-12;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const fmt = (n, dp=3) => {
    if (!Number.isFinite(n)) return '—';
    const a = Math.abs(n);
    if ((a > 0 && a < 1e-3) || a >= 1e5) return n.toExponential(3);
    return Number(n.toFixed(dp)).toString();
  };
  const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));
  const deg = r => r * 180 / Math.PI;
  const rad = d => d * Math.PI / 180;

  const root = $('#advancedApp');
  if (!root) return;

  root.innerHTML = `
    <div class="adv-tabs" id="advTabs"></div>

    <div class="advanced-grid">
      <section class="panel adv-visual-panel">
        <div class="adv-stage-wrap">
          <canvas id="advCanvas" aria-label="Advanced interactive Fields simulation"></canvas>
          <div class="adv-stage-badges">
            <span class="pill" id="advSpec">AQA 3.7</span>
            <span class="pill" id="advModeBadge">Live model</span>
          </div>
          <div class="drag-hint" id="advDragHint">Drag the highlighted object with mouse or finger.</div>
        </div>

        <div class="viewer-controls adv-toolbar">
          <button class="button primary" id="advPlay">Pause</button>
          <button class="button" id="advStep">Step frame</button>
          <button class="button" id="advReset">Reset</button>
          <button class="button active-toggle" id="advLines">Field lines</button>
          <button class="button active-toggle" id="advVectors">Vectors</button>
          <button class="button" id="advEquip">Equipotentials</button>
          <button class="button" id="advTrace">Trace</button>
          <button class="button" id="adv3d">Potential surface</button>
        </div>

        <div class="adv-live-readout" id="advReadout"></div>

        <div class="adv-graph-shell">
          <div class="adv-graph-head">
            <div><span class="eyebrow">Live graph</span><strong id="advGraphTitle">Model graph</strong></div>
            <span class="muted small" id="advGraphHint">Click or drag on graphs where a cursor is available.</span>
          </div>
          <canvas id="advGraph" aria-label="Live simulation graph"></canvas>
          <div class="adv-graph-legend" id="advGraphLegend"></div>
        </div>
      </section>

      <aside class="adv-side">
        <article class="panel pad">
          <span class="eyebrow" id="advCode"></span>
          <h2 id="advTitle"></h2>
          <p class="muted" id="advSubtitle"></p>
          <div id="advControls" class="control-stack"></div>
        </article>

        <article class="panel pad">
          <span class="eyebrow">Investigation</span>
          <h3 id="advMissionTitle">Predict → manipulate → explain</h3>
          <ol id="advMission"></ol>
          <div class="three-note-grid">
            <label><strong>Prediction</strong><textarea id="advPrediction" placeholder="Predict before changing the model..."></textarea></label>
            <label><strong>Observation</strong><textarea id="advObservation" placeholder="Record what the model actually shows..."></textarea></label>
            <label><strong>Explanation</strong><textarea id="advExplanation" placeholder="Explain with equations and precise physics terms..."></textarea></label>
          </div>
          <button class="button" id="checkExplanation">Check physics language</button>
          <div id="explainFeedback" class="keyword-feedback"></div>
        </article>

        <article class="panel pad">
          <span class="eyebrow">Simulation → calculation</span>
          <h3 id="simCalcQuestion"></h3>
          <div class="calc-entry-row">
            <input id="simCalcAnswer" type="number" step="any" placeholder="Numerical answer">
            <button class="button primary" id="checkSimCalc">Check</button>
          </div>
          <div id="simCalcFeedback" class="feedback hidden"></div>
          <button class="text-button" id="newSimCalc">New values/question</button>
        </article>

        <article class="panel pad">
          <span class="eyebrow">Original AQA-style application</span>
          <h3 id="simExamQuestion"></h3>
          <textarea id="simExamAnswer" class="student-answer" placeholder="Write a full exam-style answer..."></textarea>
          <div class="button-row">
            <button class="button" id="simExamHint">Hint</button>
            <button class="button primary" id="simExamReveal">Check against points</button>
          </div>
          <div id="simExamFeedback" class="feedback hidden"></div>
        </article>
      </aside>
    </div>

    <section class="panel pad advanced-section" id="practicalStudio">
      <div class="section-head compact">
        <div><span class="eyebrow">Required practical studio</span><h2>Virtual RP9–11 apparatus + analysis</h2></div>
        <p class="muted">Use the same variables as the core practical tab, but with live apparatus, automatic uncertainty prompts and analysis graphs.</p>
      </div>
      <div class="practical-upgrade-grid">
        <article class="practical-upgrade-card">
          <div class="data-badge">RP9</div>
          <h3>Capacitor oscilloscope</h3>
          <p>Charge/discharge switch, live V/I/Q traces, graph cursor, log-linear mode and automatic time-constant estimate.</p>
          <button class="button" data-adv-model="capacitor">Open RP9 lab</button>
        </article>
        <article class="practical-upgrade-card">
          <div class="data-badge">RP10</div>
          <h3>Force-on-wire balance</h3>
          <p>Top-pan balance model with adjustable B, I and L, live force reading and F–I graph.</p>
          <button class="button" data-adv-model="wire">Open RP10 lab</button>
        </article>
        <article class="practical-upgrade-card">
          <div class="data-badge">RP11</div>
          <h3>Search coil + oscilloscope</h3>
          <p>Rotate the coil, read flux linkage, view the induced trace and test NΦ ∝ cosθ.</p>
          <button class="button" data-adv-model="coil">Open RP11 lab</button>
        </article>
      </div>
      <div id="practicalDataArea"></div>
    </section>

    <section class="panel pad advanced-section">
      <div class="section-head compact">
        <div><span class="eyebrow">Graph skills lab</span><h2>Predict the graph before revealing it</h2></div>
        <p class="muted">Draw a predicted shape with mouse or finger, then overlay the physical relationship.</p>
      </div>
      <div class="graph-skills-grid">
        <div>
          <label class="field"><span>Graph</span>
            <select id="graphSkillSelect">
              <option value="g-r">g against r (radial field)</option>
              <option value="V-r">gravitational V against r</option>
              <option value="E-r">electric E against r</option>
              <option value="cap-v">capacitor discharge V against t</option>
              <option value="cap-ln">ln(V/V₀) against t</option>
              <option value="flux-cos">NΦ against cosθ</option>
              <option value="ac">AC voltage against time</option>
            </select>
          </label>
          <div class="button-row">
            <button class="button" id="clearGraphSketch">Clear sketch</button>
            <button class="button primary" id="revealGraphModel">Reveal model</button>
          </div>
          <div id="graphSkillPrompt" class="practical-guidance"></div>
        </div>
        <canvas id="graphSkillCanvas" aria-label="Draw your predicted graph"></canvas>
      </div>
    </section>

    <section class="panel pad advanced-section" id="examCentre">
      <div class="section-head compact">
        <div><span class="eyebrow">Fields Exam Centre</span><h2>Extended, practical and data questions</h2></div>
        <p class="muted">Original questions in AQA style: calculations, explanations, graphs, practicals and “spot the mistake” tasks.</p>
      </div>
      <div class="exam-centre-grid">
        <aside>
          <label class="field"><span>Topic</span>
            <select id="examTopic">
              <option value="all">All Fields</option>
              <option value="gravity">Gravitation</option>
              <option value="electric">Electric fields</option>
              <option value="capacitance">Capacitance</option>
              <option value="magnetic">Magnetic fields / induction</option>
              <option value="practical">Required practicals</option>
            </select>
          </label>
          <label class="field"><span>Question type</span>
            <select id="examType">
              <option value="all">Mixed</option>
              <option value="calc">Calculation</option>
              <option value="explain">Explanation</option>
              <option value="graph">Graph/data</option>
              <option value="practical">Practical</option>
              <option value="mistake">Spot the mistake</option>
            </select>
          </label>
          <label class="field"><span>Confidence before answering</span>
            <input id="examConfidence" type="range" min="1" max="5" value="3" step="1">
            <output id="examConfidenceOut">3 / 5</output>
          </label>
          <div class="timer-card">
            <strong id="examTimer">20:00</strong>
            <button class="button" id="startTimer">Start 20-min test</button>
          </div>
          <button class="button primary" id="newExamQuestion">New question</button>
        </aside>
        <article>
          <div class="question-meta"><span class="data-badge" id="examQTopic">AQA 3.7</span><span class="data-badge" id="examQMarks">4 marks</span><span class="data-badge" id="examQType">Calculation</span></div>
          <h3 id="examCentreQuestion"></h3>
          <textarea id="examCentreAnswer" class="student-answer exam-answer-large" placeholder="Show working and write your answer..."></textarea>
          <div class="button-row">
            <button class="button" id="examCentreHint">Hint</button>
            <button class="button primary" id="examCentreCheck">Check / reveal points</button>
          </div>
          <div id="examCentreFeedback" class="feedback hidden"></div>
        </article>
      </div>
      <div class="heatmap-wrap">
        <h3>Adaptive topic heatmap</h3>
        <div id="topicHeatmap" class="topic-heatmap"></div>
        <div id="adaptiveRecommendation" class="practical-guidance"></div>
      </div>
    </section>
  `;

  const modelDefs = {
    field: {
      code:'3.7.1–3.7.3', title:'Interactive Field Sandbox',
      subtitle:'Drag two sources and a test probe. Compare gravitational and electrostatic fields, resultant vectors, potential and equipotentials.',
      mission:['Choose gravity or electric mode.','Drag the sources to change separation.','Drag the probe to map the field.','Toggle vectors, field lines, equipotentials and the potential surface.','Explain why field is a vector but potential is a scalar.'],
      keywords:['resultant','vector','potential','field','inverse square'],
      controls:[
        {id:'kind',label:'Field type',type:'select',options:[['electric','Electric'],['gravity','Gravitational']],value:'electric'},
        {id:'s1',label:'Source 1 magnitude',min:1,max:8,step:.5,value:4,unit:'relative'},
        {id:'s2',label:'Source 2 magnitude',min:-8,max:8,step:.5,value:-4,unit:'relative'},
        {id:'scale',label:'Display scale',min:.6,max:1.6,step:.1,value:1,unit:'×'}
      ]
    },
    orbit: {
      code:'3.7.2.4', title:'Orbit & Escape Laboratory',
      subtitle:'Drag the satellite to set radius, change launch speed, inspect force/velocity vectors and follow energy through the orbit.',
      mission:['Drag the satellite radially to change r.','Set the speed multiplier to 1.00 for a circular orbit.','Increase/decrease launch speed and observe the trajectory.','Compare kinetic, potential and total energy.','Find the escape-speed threshold.'],
      keywords:['centripetal','gravitational','velocity','potential energy','total energy'],
      controls:[
        {id:'mass',label:'Planet mass',min:1,max:8,step:.1,value:5.97,unit:'×10²⁴ kg'},
        {id:'radius',label:'Initial radius',min:7,max:35,step:.5,value:12,unit:'×10⁶ m'},
        {id:'speedFactor',label:'Speed / circular speed',min:.35,max:1.55,step:.01,value:1,unit:'×'},
        {id:'zoom',label:'View zoom',min:.7,max:1.4,step:.05,value:1,unit:'×'}
      ]
    },
    capacitor: {
      code:'3.7.4 · RP9', title:'Capacitor + Virtual Oscilloscope',
      subtitle:'Switch between charge and discharge, view V/I/Q simultaneously, move the graph cursor and test τ = RC.',
      mission:['Select charge or discharge.','Vary R or C and compare the time constant.','Use the live graph cursor to estimate τ.','Switch to ln(V/V₀) analysis in RP9 mode.','Explain why current changes exponentially.'],
      keywords:['time constant','exponential','charge','current','potential difference'],
      controls:[
        {id:'mode',label:'Circuit state',type:'select',options:[['discharge','Discharge'],['charge','Charge']],value:'discharge'},
        {id:'R',label:'Resistance',min:1,max:20,step:.5,value:4.7,unit:'kΩ'},
        {id:'C',label:'Capacitance',min:100,max:1000,step:10,value:470,unit:'µF'},
        {id:'V0',label:'Supply / initial pd',min:2,max:12,step:.5,value:6,unit:'V'},
        {id:'cursor',label:'Graph cursor time',min:0,max:15,step:.1,value:1,unit:'s'}
      ]
    },
    particle: {
      code:'3.7.5.2', title:'Magnetic Particle Chamber',
      subtitle:'Launch a charged particle into a uniform magnetic field and test r = mv/BQ with direction prediction.',
      mission:['Choose particle sign and mass.','Predict curvature direction before running.','Vary speed and B independently.','Measure the displayed radius.','Use the cyclotron toggle to compare repeated acceleration.'],
      keywords:['magnetic force','perpendicular','circular','radius','charge'],
      controls:[
        {id:'particle',label:'Particle',type:'select',options:[['proton','Proton'],['electron','Electron']],value:'proton'},
        {id:'B',label:'Flux density',min:.02,max:.5,step:.01,value:.12,unit:'T'},
        {id:'speed',label:'Speed',min:.2,max:8,step:.1,value:2,unit:'×10⁶ m s⁻¹'},
        {id:'fieldDir',label:'Field direction',type:'select',options:[['into','Into page'],['out','Out of page']],value:'into'},
        {id:'cyclotron',label:'Mode',type:'select',options:[['single','Single-field chamber'],['cyclotron','Cyclotron view']],value:'single'}
      ]
    },
    induction: {
      code:'3.7.5.3–3.7.5.5', title:'Induction & Generator Laboratory',
      subtitle:'Drag a magnet through a coil or switch to a rotating generator. Watch flux linkage and induced emf change together.',
      mission:['Use magnet mode and drag the magnet through the coil.','Move faster and compare peak emf.','Reverse the motion and apply Lenz’s law.','Switch to generator mode.','Change turns, area, B and frequency and explain the emf graph.'],
      keywords:['flux linkage','rate of change','induced emf','Lenz','Faraday'],
      controls:[
        {id:'mode',label:'Induction mode',type:'select',options:[['magnet','Moving magnet'],['generator','Rotating generator']],value:'magnet'},
        {id:'B',label:'Peak field',min:.02,max:.5,step:.01,value:.15,unit:'T'},
        {id:'N',label:'Turns',min:50,max:500,step:10,value:200,unit:'turns'},
        {id:'area',label:'Coil area',min:.002,max:.03,step:.001,value:.01,unit:'m²'},
        {id:'f',label:'Generator frequency',min:.2,max:5,step:.1,value:1,unit:'Hz'}
      ]
    },
    transformer: {
      code:'3.7.5.6–3.7.5.7', title:'Transformer & Transmission Laboratory',
      subtitle:'Design a transformer and compare transmission losses when power is sent at different voltages.',
      mission:['Choose primary and secondary turns.','Predict whether the transformer steps voltage up or down.','Compare ideal and efficiency-adjusted power.','Raise transmission voltage while keeping transmitted power fixed.','Explain why I²R losses decrease.'],
      keywords:['turns ratio','alternating','power','current','I squared R'],
      controls:[
        {id:'Np',label:'Primary turns',min:100,max:1500,step:50,value:500,unit:''},
        {id:'Ns',label:'Secondary turns',min:100,max:3000,step:50,value:1000,unit:''},
        {id:'Vp',label:'Primary rms voltage',min:12,max:400,step:1,value:230,unit:'V'},
        {id:'eff',label:'Efficiency',min:70,max:100,step:1,value:94,unit:'%'},
        {id:'power',label:'Transmitted power',min:1,max:100,step:1,value:20,unit:'kW'},
        {id:'lineR',label:'Line resistance',min:.1,max:10,step:.1,value:2,unit:'Ω'}
      ]
    },
    wire: {
      code:'3.7.5.1 · RP10', title:'RP10 Force-on-Wire Balance',
      subtitle:'Virtual top-pan balance: change flux density, current and wire length and collect F = BIL data.',
      mission:['Zero the virtual balance.','Vary current while holding B and L constant.','Collect at least five readings.','Check whether F against I is linear.','Repeat conceptually for B or L and discuss uncertainty.'],
      keywords:['flux density','current','length','force','proportional'],
      controls:[
        {id:'B',label:'Flux density',min:.05,max:.5,step:.01,value:.2,unit:'T'},
        {id:'I',label:'Current',min:.2,max:5,step:.1,value:2,unit:'A'},
        {id:'L',label:'Wire length in field',min:.02,max:.15,step:.005,value:.06,unit:'m'},
        {id:'noise',label:'Measurement scatter',min:0,max:3,step:.25,value:.5,unit:'%'}
      ]
    },
    coil: {
      code:'3.7.5.3 · RP11', title:'RP11 Search Coil & Oscilloscope',
      subtitle:'Rotate a search coil through a uniform field and test NΦ = BAN cosθ with an oscilloscope-style trace.',
      mission:['Set B, N and coil area.','Rotate the coil through a range of angles.','Record NΦ and cosθ.','Check that NΦ plotted against cosθ is linear.','Switch on rotation and interpret the induced emf trace.'],
      keywords:['flux linkage','cosine','normal','search coil','oscilloscope'],
      controls:[
        {id:'B',label:'Flux density',min:.02,max:.25,step:.01,value:.08,unit:'T'},
        {id:'N',label:'Turns',min:50,max:500,step:10,value:200,unit:''},
        {id:'area',label:'Coil area',min:.002,max:.02,step:.001,value:.01,unit:'m²'},
        {id:'angle',label:'Angle θ',min:0,max:180,step:1,value:30,unit:'°'},
        {id:'rotate',label:'Motion',type:'select',options:[['static','Static angle'],['rotate','Rotate continuously']],value:'static'}
      ]
    }
  };

  const defaults = {};
  Object.entries(modelDefs).forEach(([key,def])=>{
    defaults[key] = {};
    def.controls.forEach(c=>defaults[key][c.id]=c.value);
  });

  let model = 'field';
  let values = typeof structuredClone==='function' ? structuredClone(defaults[model]) : JSON.parse(JSON.stringify(defaults[model]));
  let playing = true;
  let t = 0;
  let last = performance.now();
  let showLines = true, showVectors = true, showEquip = false, showTrace = false, surface3d = false;
  let drag = null;
  let fieldObjects = {
    s1:{x:.33,y:.48}, s2:{x:.67,y:.48}, probe:{x:.5,y:.72}
  };
  let orbitAngle = 0;
  let magnetX = .25;
  let practicalData = {capacitor:[], wire:[], coil:[]};
  let tracePts = [];
  let currentCalc = null;
  let currentExam = null;

  const canvas = $('#advCanvas');
  const graph = $('#advGraph');
  const ctx = canvas.getContext('2d');
  const gctx = graph.getContext('2d');
  let W=900,H=520,GW=900,GH=280,DPR=1;

  function clone(obj){return JSON.parse(JSON.stringify(obj));}
  function resize(){
    DPR = Math.max(1,Math.min(2,window.devicePixelRatio||1));
    const r=canvas.getBoundingClientRect();
    W=Math.max(320,r.width);H=Math.max(330,r.height);
    canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
    const gr=graph.getBoundingClientRect();
    GW=Math.max(320,gr.width);GH=Math.max(220,gr.height);
    graph.width=GW*DPR;graph.height=GH*DPR;gctx.setTransform(DPR,0,0,DPR,0,0);
    resizeGraphSkill();
    drawAll();
  }
  addEventListener('resize',resize);

  function line(c,x1,y1,x2,y2,color='#62c8ff',w=2){
    c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  }
  function arrow(c,x1,y1,x2,y2,color='#72e0a3',w=2){
    line(c,x1,y1,x2,y2,color,w);
    const a=Math.atan2(y2-y1,x2-x1);
    c.fillStyle=color;c.beginPath();c.moveTo(x2,y2);
    c.lineTo(x2-9*Math.cos(a-.5),y2-9*Math.sin(a-.5));
    c.lineTo(x2-9*Math.cos(a+.5),y2-9*Math.sin(a+.5));c.closePath();c.fill();
  }
  function circle(c,x,y,r,color,stroke){
    c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
    if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
  }
  function text(c,s,x,y,color='#dceaff',size=13,align='left'){
    c.fillStyle=color;c.font=`${size}px system-ui`;c.textAlign=align;c.fillText(s,x,y);
  }
  function bg(c,w,h){
    const g=c.createRadialGradient(w*.45,h*.25,20,w*.5,h*.5,Math.max(w,h));
    g.addColorStop(0,'#153552');g.addColorStop(1,'#06111c');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(255,255,255,.045)';c.lineWidth=1;
    for(let x=0;x<w;x+=40) line(c,x,0,x,h,'rgba(255,255,255,.035)',1);
    for(let y=0;y<h;y+=40) line(c,0,y,w,y,'rgba(255,255,255,.035)',1);
  }
  function axes(c,w,h,xlabel,ylabel){
    const l=52,r=20,top=22,b=42;
    line(c,l,top,l,h-b,'#8298aa',1.5);line(c,l,h-b,w-r,h-b,'#8298aa',1.5);
    text(c,xlabel,(l+w-r)/2,h-12,'#a9c2d5',12,'center');
    c.save();c.translate(15,(top+h-b)/2);c.rotate(-Math.PI/2);text(c,ylabel,0,0,'#a9c2d5',12,'center');c.restore();
    return {l,r,top,b,pw:w-l-r,ph:h-top-b};
  }
  function poly(c,pts,color='#62c8ff',w=2){
    if(!pts.length)return;c.strokeStyle=color;c.lineWidth=w;c.beginPath();
    pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
  }

  function renderTabs(){
    $('#advTabs').innerHTML = Object.entries(modelDefs).map(([id,d]) =>
      `<button class="sim-tab ${id===model?'active':''}" data-adv-model="${id}">${d.title.replace(' Laboratory','').replace(' Laboratory','')}</button>`
    ).join('');
    $$('[data-adv-model]').forEach(b=>b.addEventListener('click',()=>setModel(b.dataset.advModel)));
  }

  function renderControls(){
    const def=modelDefs[model];
    $('#advCode').textContent='AQA '+def.code;
    $('#advSpec').textContent='AQA '+def.code;
    $('#advTitle').textContent=def.title;
    $('#advSubtitle').textContent=def.subtitle;
    $('#advMission').innerHTML=def.mission.map(x=>`<li>${x}</li>`).join('');
    $('#advControls').innerHTML=def.controls.map(c=>{
      if(c.type==='select'){
        return `<label class="field adv-control"><span>${c.label}</span><select data-adv-control="${c.id}">${c.options.map(o=>`<option value="${o[0]}" ${String(values[c.id])===String(o[0])?'selected':''}>${o[1]}</option>`).join('')}</select></label>`;
      }
      return `<label class="field adv-control"><span>${c.label}</span><input data-adv-control="${c.id}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${values[c.id]}"><output>${fmt(Number(values[c.id]))} ${c.unit||''}</output></label>`;
    }).join('');
    $$('[data-adv-control]').forEach(el=>el.addEventListener('input',()=>{
      const id=el.dataset.advControl;
      values[id]=el.tagName==='SELECT'?el.value:Number(el.value);
      const out=el.parentElement.querySelector('output');
      if(out){const c=def.controls.find(x=>x.id===id);out.textContent=`${fmt(Number(values[id]))} ${c.unit||''}`;}
      if(model==='orbit' && id==='radius') orbitAngle=0;
      if(model==='capacitor' && ['R','C','V0','mode'].includes(id)) t=0;
      if(model==='coil' && id==='angle' && values.rotate==='static') t=0;
      makeSimCalc();
      drawAll();
    }));
    $('#advDragHint').textContent = {
      field:'Drag either source or the green probe.',
      orbit:'Drag the satellite radially to change orbital radius.',
      capacitor:'Use the graph cursor slider or click the graph.',
      particle:'Adjust particle properties, then play/pause or step.',
      induction:'In moving-magnet mode, drag the magnet through the coil.',
      transformer:'Adjust turns and transmission settings.',
      wire:'Adjust B, I and L; collect readings below.',
      coil:'Use the angle slider or drag across the coil.'
    }[model];
    $('#advModeBadge').textContent = (model==='wire'||model==='coil'||model==='capacitor')?'Practical + model':'Live model';
    renderPracticalData();
  }

  function setModel(id){
    if(!modelDefs[id]) return;
    model=id;values=clone(defaults[id]);t=0;tracePts=[];orbitAngle=0;magnetX=.25;drag=null;
    renderTabs();renderControls();makeSimCalc();makeSimExam();
    drawAll();
    root.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function fieldPhysics(px,py){
    const w=W,h=H;
    const p={x:px/w,y:py/h};
    const s1=fieldObjects.s1,s2=fieldObjects.s2;
    const kind=values.kind;
    const strengthScale = kind==='electric'?2e-9:2e22;
    let Ex=0,Ey=0,V=0;
    [ [s1,values.s1], [s2,values.s2] ].forEach(([s,raw])=>{
      const dx=(p.x-s.x)*4,dy=(p.y-s.y)*4;
      const r=Math.max(.12,Math.hypot(dx,dy));
      let source=raw*strengthScale;
      if(kind==='gravity') source=Math.abs(raw)*strengthScale;
      const mag=(kind==='electric'?k*Math.abs(source)/(r*r):G*Math.abs(source)/(r*r));
      const ux=dx/r,uy=dy/r;
      if(kind==='gravity'){Ex+=-mag*ux;Ey+=-mag*uy;V+=-G*Math.abs(source)/r;}
      else {Ex+=Math.sign(source)*mag*ux;Ey+=Math.sign(source)*mag*uy;V+=k*source/r;}
    });
    return {Ex,Ey,E:Math.hypot(Ex,Ey),V};
  }

  function drawField(){
    bg(ctx,W,H);
    const s1={x:fieldObjects.s1.x*W,y:fieldObjects.s1.y*H};
    const s2={x:fieldObjects.s2.x*W,y:fieldObjects.s2.y*H};
    const probe={x:fieldObjects.probe.x*W,y:fieldObjects.probe.y*H};
    if(showEquip){
      const valsGrid=[];
      for(let iy=0;iy<16;iy++) for(let ix=0;ix<28;ix++){
        const p=fieldPhysics((ix+.5)/28*W,(iy+.5)/16*H);valsGrid.push(p.V);
      }
      const max=Math.max(...valsGrid.map(Math.abs),1e-12);
      let n=0;
      for(let iy=0;iy<16;iy++)for(let ix=0;ix<28;ix++){
        const v=valsGrid[n++]/max;
        ctx.fillStyle=v>=0?`rgba(255,120,100,${Math.min(.18,Math.abs(v)*.22)})`:`rgba(80,150,255,${Math.min(.18,Math.abs(v)*.22)})`;
        ctx.fillRect(ix/28*W,iy/16*H,W/28+1,H/16+1);
      }
    }
    if(showLines){
      for(let yy=42;yy<H-30;yy+=55) for(let xx=42;xx<W-30;xx+=55){
        const p=fieldPhysics(xx,yy);const m=Math.max(1e-20,p.E);
        const L=clamp(12+Math.log10(m+1)*2,10,27);
        arrow(ctx,xx,yy,xx+p.Ex/m*L,yy+p.Ey/m*L,'rgba(98,200,255,.42)',1.4);
      }
    }
    const s1c=values.kind==='gravity'?'#f2c14e':(values.s1>=0?'#ff8f8f':'#79aefc');
    const s2c=values.kind==='gravity'?'#f2c14e':(values.s2>=0?'#ff8f8f':'#79aefc');
    circle(ctx,s1.x,s1.y,26,s1c,'#fff');circle(ctx,s2.x,s2.y,26,s2c,'#fff');
    text(ctx,values.kind==='gravity'?'M₁':(values.s1>=0?'+Q₁':'−Q₁'),s1.x,s1.y+5,'#08111c',14,'center');
    text(ctx,values.kind==='gravity'?'M₂':(values.s2>=0?'+Q₂':'−Q₂'),s2.x,s2.y+5,'#08111c',14,'center');
    circle(ctx,probe.x,probe.y,11,'#72e0a3','#fff');text(ctx,'probe',probe.x,probe.y+28,'#dceaff',12,'center');
    const p=fieldPhysics(probe.x,probe.y);
    if(showVectors && p.E>0){
      const len=clamp(45+Math.log10(p.E+1)*6,35,105);
      arrow(ctx,probe.x,probe.y,probe.x+p.Ex/p.E*len,probe.y+p.Ey/p.E*len,'#72e0a3',3);
    }
    text(ctx,values.kind==='gravity'?'Gravitational field':'Electric field',20,28,'#dceaff',16);
    if(surface3d) drawPotentialSurface();
  }

  function orbitNumbers(){
    const M=values.mass*1e24,r=values.radius*1e6;
    const vc=Math.sqrt(G*M/r),v=vc*values.speedFactor;
    const escape=Math.sqrt(2*G*M/r);
    const KE=.5*v*v,PE=-G*M/r,TE=KE+PE;
    const T=2*Math.PI*Math.sqrt(r**3/(G*M));
    return {M,r,vc,v,escape,KE,PE,TE,T,g:G*M/r**2};
  }
  function drawOrbit(){
    bg(ctx,W,H);
    const n=orbitNumbers(),cx=W*.5,cy=H*.52;
    const rr=clamp((values.radius-5)/30*Math.min(W,H)*.36+90,90,Math.min(W,H)*.42)*values.zoom;
    circle(ctx,cx,cy,48,'#2d79a7','#8dd9ff');
    text(ctx,'central mass',cx,cy+5,'#fff',12,'center');
    if(showTrace){
      ctx.strokeStyle='rgba(98,200,255,.4)';ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.stroke();
    }
    const sx=cx+rr*Math.cos(orbitAngle),sy=cy+rr*Math.sin(orbitAngle);
    circle(ctx,sx,sy,10,'#fff','#72e0a3');
    const tx=-Math.sin(orbitAngle),ty=Math.cos(orbitAngle);
    const rx=-Math.cos(orbitAngle),ry=-Math.sin(orbitAngle);
    if(showVectors){
      arrow(ctx,sx,sy,sx+tx*80*values.speedFactor,sy+ty*80*values.speedFactor,'#72e0a3',3);
      arrow(ctx,sx,sy,sx+rx*65,sy+ry*65,'#ff9b9b',3);
      text(ctx,'v',sx+tx*90,sy+ty*90,'#72e0a3',14);
      text(ctx,'F',sx+rx*75,sy+ry*75,'#ff9b9b',14);
    }
    text(ctx,`v/vc = ${fmt(values.speedFactor,2)}`,20,30,'#dceaff',15);
    if(values.speedFactor>=Math.sqrt(2)) text(ctx,'escape condition reached',20,54,'#f2c14e',14);
  }

  function capNumbers(){
    const R=values.R*1e3,C=values.C*1e-6,V0=values.V0,tau=R*C;
    const discharge=values.mode==='discharge';
    const V=discharge?V0*Math.exp(-t/tau):V0*(1-Math.exp(-t/tau));
    const I=(V0/R)*Math.exp(-t/tau)*(discharge?-1:1);
    const Q=C*V;
    return {R,C,V0,tau,V,I,Q};
  }
  function drawCapacitor(){
    bg(ctx,W,H);const n=capNumbers(),cx=W*.42,cy=H*.5;
    line(ctx,80,cy,cx-45,cy,'#dceaff',3);
    line(ctx,cx+45,cy,W-90,cy,'#dceaff',3);
    line(ctx,cx-20,cy-85,cx-20,cy+85,'#e6edf2',8);
    line(ctx,cx+20,cy-85,cx+20,cy+85,'#e6edf2',8);
    text(ctx,'C',cx,cy-105,'#f2c14e',16,'center');
    const level=clamp(n.V/n.V0,0,1);
    ctx.fillStyle='rgba(242,193,78,.18)';ctx.fillRect(cx-15,cy+80-level*160,30,level*160);
    const bx=100,by=cy-70;
    ctx.strokeStyle='#72e0a3';ctx.lineWidth=3;ctx.strokeRect(bx,by,70,45);
    text(ctx,values.mode==='discharge'?'R load':'DC supply',bx+35,by+28,'#72e0a3',12,'center');
    text(ctx,`V = ${fmt(n.V)} V`,W-220,80,'#62c8ff',16);
    text(ctx,`I = ${fmt(n.I*1e3)} mA`,W-220,108,'#72e0a3',16);
    text(ctx,`Q = ${fmt(n.Q*1e6)} µC`,W-220,136,'#f2c14e',16);
    text(ctx,`τ = ${fmt(n.tau)} s`,W-220,164,'#dceaff',16);
    if(playing) text(ctx,'oscilloscope running',20,28,'#dceaff',13);
  }

  function particleNumbers(){
    const electron=values.particle==='electron';
    const m=electron?9.1093837e-31:1.6726219e-27;
    const q=(electron?-1:1)*1.602176634e-19;
    const v=values.speed*1e6;
    const r=m*v/(Math.abs(q)*values.B);
    const omega=Math.abs(q)*values.B/m;
    return {m,q,v,r,omega};
  }
  function drawParticle(){
    bg(ctx,W,H);
    for(let y=45;y<H-30;y+=45) for(let x=45;x<W-30;x+=45){
      text(ctx,values.fieldDir==='into'?'×':'•',x,y,'rgba(98,200,255,.28)',18,'center');
    }
    const n=particleNumbers();
    const pr=clamp(80+Math.log10(n.r+1e-12)*18,65,Math.min(W,H)*.32);
    const sign=(n.q>0?1:-1)*(values.fieldDir==='into'?1:-1);
    const cx=W*.48,cy=H*.52,a=t*1.7*sign;
    ctx.strokeStyle='rgba(242,193,78,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,pr,0,Math.PI*2);ctx.stroke();
    const px=cx+pr*Math.cos(a),py=cy+pr*Math.sin(a);
    circle(ctx,px,py,9,n.q>0?'#ff9696':'#7bb8ff','#fff');
    if(showVectors){
      const tx=-Math.sin(a)*sign,ty=Math.cos(a)*sign;
      const rx=-Math.cos(a),ry=-Math.sin(a);
      arrow(ctx,px,py,px+tx*70,py+ty*70,'#72e0a3',3);
      arrow(ctx,px,py,px+rx*55,py+ry*55,'#ff9b9b',3);
    }
    if(values.cyclotron==='cyclotron'){
      line(ctx,cx,40,cx,H-40,'rgba(255,255,255,.35)',3);
      text(ctx,'D-shaped electrode boundary',cx+10,60,'#dceaff',12);
    }
    text(ctx,`r = ${fmt(n.r)} m`,20,28,'#f2c14e',15);
  }

  function inductionNumbers(){
    const B=values.B,N=values.N,A=values.area;
    if(values.mode==='generator'){
      const w=2*Math.PI*values.f,theta=w*t;
      return {flux:N*B*A*Math.cos(theta),emf:N*B*A*w*Math.sin(theta),theta,w};
    }
    const dx=(magnetX-.5)*5;
    const shape=Math.exp(-dx*dx);
    const flux=N*B*A*shape;
    const velocity=playing?0.75*Math.cos(t*.9):0;
    const dshape=-2*dx*shape;
    const emf=-N*B*A*dshape*velocity;
    return {flux,emf,theta:0,w:0};
  }
  function drawInduction(){
    bg(ctx,W,H);const n=inductionNumbers(),cy=H*.5,cx=W*.63;
    if(values.mode==='magnet'){
      const mx=magnetX*W;
      ctx.fillStyle='#ff8585';ctx.fillRect(mx-70,cy-28,70,56);ctx.fillStyle='#7eb6ff';ctx.fillRect(mx,cy-28,70,56);
      text(ctx,'N',mx-35,cy+5,'#07111f',17,'center');text(ctx,'S',mx+35,cy+5,'#07111f',17,'center');
      ctx.strokeStyle='#f2c14e';ctx.lineWidth=5;
      for(let q=0;q<7;q++)ctx.strokeRect(cx-52+q*9,cy-85,4,170);
      if(showVectors) arrow(ctx,mx+80,cy,cx-65,cy,'rgba(98,200,255,.65)',2);
      text(ctx,'drag magnet',mx,cy+68,'#dceaff',12,'center');
    } else {
      for(let x=80;x<W-80;x+=60) arrow(ctx,x,80,x,H-80,'rgba(98,200,255,.3)',1.5);
      ctx.save();ctx.translate(W*.5,H*.5);ctx.rotate(n.theta);ctx.strokeStyle='#f2c14e';ctx.lineWidth=6;ctx.strokeRect(-110,-70,220,140);ctx.restore();
      text(ctx,'rotating coil',W*.5,H*.5+120,'#dceaff',13,'center');
    }
    text(ctx,`NΦ = ${fmt(n.flux)} Wb turn`,20,28,'#62c8ff',15);
    text(ctx,`ε = ${fmt(n.emf)} V`,20,52,'#72e0a3',15);
    text(ctx,n.emf>=0?'induced polarity: +':'induced polarity: −',20,76,'#f2c14e',13);
  }

  function transformerNumbers(){
    const Vs=values.Vp*values.Ns/values.Np;
    const Pin=values.power*1000;
    const Pout=Pin*values.eff/100;
    const Is=Pout/Math.max(1,Vs);
    const lineLoss=Is*Is*values.lineR;
    const lowV=values.Vp;
    const lowI=Pin/Math.max(1,lowV);
    const lowLoss=lowI*lowI*values.lineR;
    return {Vs,Pin,Pout,Is,lineLoss,lowI,lowLoss};
  }
  function drawTransformer(){
    bg(ctx,W,H);const n=transformerNumbers(),cx=W*.5,cy=H*.5;
    ctx.strokeStyle='#718494';ctx.lineWidth=28;ctx.strokeRect(cx-160,cy-130,320,260);
    ctx.lineWidth=5;ctx.strokeStyle='#f2c14e';
    for(let i=0;i<8;i++)ctx.strokeRect(cx-205+i*7,cy-90,4,180);
    ctx.strokeStyle='#62c8ff';
    for(let i=0;i<12;i++)ctx.strokeRect(cx+120+i*7,cy-90,4,180);
    arrow(ctx,cx-60,cy,cx+60,cy,'#72e0a3',3);
    text(ctx,`Primary ${values.Np} turns`,cx-210,cy-155,'#f2c14e',14);
    text(ctx,`Secondary ${values.Ns} turns`,cx+40,cy-155,'#62c8ff',14);
    text(ctx,`Vs ≈ ${fmt(n.Vs)} V`,20,32,'#62c8ff',16);
    text(ctx,`line loss ≈ ${fmt(n.lineLoss)} W`,20,58,'#ff9b9b',15);
  }

  function wireNumbers(){
    const ideal=values.B*values.I*values.L;
    const noise=(Math.sin(values.I*8.31+values.B*3.7)*values.noise/100);
    const measured=ideal*(1+noise);
    const dm=measured/9.81*1000;
    return {ideal,measured,dm};
  }
  function drawWire(){
    bg(ctx,W,H);const n=wireNumbers(),cx=W*.5,cy=H*.43;
    ctx.fillStyle='#405364';ctx.fillRect(cx-180,cy-120,360,180);
    ctx.fillStyle='#07111f';ctx.fillRect(cx-145,cy-85,290,110);
    for(let y=cy-70;y<cy+20;y+=34)for(let x=cx-125;x<cx+130;x+=40)text(ctx,'×',x,y,'rgba(98,200,255,.45)',19,'center');
    line(ctx,cx-150,cy-25,cx+150,cy-25,'#f2c14e',7);
    arrow(ctx,cx,cy-25,cx,cy-105,'#72e0a3',3);
    ctx.fillStyle='#c8d5de';ctx.fillRect(cx-110,cy+115,220,35);
    text(ctx,`balance change = ${fmt(n.dm)} g`,cx,cy+139,'#07111f',15,'center');
    text(ctx,`F = ${fmt(n.measured)} N`,20,30,'#72e0a3',16);
  }

  function coilNumbers(){
    const theta=values.rotate==='rotate'?(2*Math.PI*.35*t):rad(values.angle);
    const flux=values.N*values.B*values.area*Math.cos(theta);
    const emf=values.rotate==='rotate'?values.N*values.B*values.area*(2*Math.PI*.35)*Math.sin(theta):0;
    return {theta,flux,emf};
  }
  function drawCoil(){
    bg(ctx,W,H);const n=coilNumbers(),cx=W*.5,cy=H*.48;
    for(let x=70;x<W-70;x+=60) arrow(ctx,x,70,x,H-80,'rgba(98,200,255,.3)',1.5);
    ctx.save();ctx.translate(cx,cy);ctx.scale(Math.max(.15,Math.abs(Math.cos(n.theta))),1);ctx.strokeStyle='#f2c14e';ctx.lineWidth=7;ctx.strokeRect(-130,-85,260,170);ctx.restore();
    arrow(ctx,cx,cy,cx+Math.cos(n.theta)*100,cy-Math.sin(n.theta)*100,'#72e0a3',3);
    text(ctx,'coil normal',cx+Math.cos(n.theta)*112,cy-Math.sin(n.theta)*112,'#72e0a3',12,'center');
    text(ctx,`θ = ${fmt((deg(n.theta)%360+360)%360,1)}°`,20,28,'#dceaff',15);
    text(ctx,`NΦ = ${fmt(n.flux)} Wb turn`,20,54,'#62c8ff',15);
    if(values.rotate==='rotate') text(ctx,`ε = ${fmt(n.emf)} V`,20,80,'#72e0a3',15);
  }

  function drawAll(){
    if(!canvas.isConnected)return;
    ({
      field:drawField,orbit:drawOrbit,capacitor:drawCapacitor,particle:drawParticle,
      induction:drawInduction,transformer:drawTransformer,wire:drawWire,coil:drawCoil
    }[model]||drawField)();
    updateReadout();
    drawGraph();
  }

  function updateReadout(){
    let html='';
    if(model==='field'){
      const p=fieldPhysics(fieldObjects.probe.x*W,fieldObjects.probe.y*H);
      html=`<strong>${values.kind==='gravity'?'g':'E'} = ${fmt(p.E)}</strong><span>${values.kind==='gravity'?'N kg⁻¹':'N C⁻¹'}</span><strong>V = ${fmt(p.V)}</strong><span>${values.kind==='gravity'?'J kg⁻¹':'V'}</span><strong>probe x = ${fmt(fieldObjects.probe.x,2)}</strong>`;
    }else if(model==='orbit'){
      const n=orbitNumbers();html=`<strong>v = ${fmt(n.v)} m s⁻¹</strong><span>circular ${fmt(n.vc)} m s⁻¹</span><strong>T = ${fmt(n.T)} s</strong><span>g = ${fmt(n.g)} N kg⁻¹</span><strong>Etotal/m = ${fmt(n.TE)} J kg⁻¹</strong>`;
    }else if(model==='capacitor'){
      const n=capNumbers();html=`<strong>τ = ${fmt(n.tau)} s</strong><span>V = ${fmt(n.V)} V</span><strong>I = ${fmt(n.I*1e3)} mA</strong><span>Q = ${fmt(n.Q*1e6)} µC</span><strong>cursor = ${fmt(values.cursor)} s</strong>`;
    }else if(model==='particle'){
      const n=particleNumbers();html=`<strong>r = ${fmt(n.r)} m</strong><span>F = ${fmt(Math.abs(n.q)*n.v*values.B)} N</span><strong>q = ${n.q>0?'+e':'−e'}</strong><span>force ⟂ velocity</span>`;
    }else if(model==='induction'){
      const n=inductionNumbers();html=`<strong>NΦ = ${fmt(n.flux)} Wb turn</strong><span>ε = ${fmt(n.emf)} V</span><strong>${values.mode==='generator'?'sinusoidal generator':'Faraday + Lenz'}</strong>`;
    }else if(model==='transformer'){
      const n=transformerNumbers();html=`<strong>Vs = ${fmt(n.Vs)} V</strong><span>Is ≈ ${fmt(n.Is)} A</span><strong>line loss = ${fmt(n.lineLoss)} W</strong><span>efficiency ${values.eff}%</span>`;
    }else if(model==='wire'){
      const n=wireNumbers();html=`<strong>F = ${fmt(n.measured)} N</strong><span>ideal ${fmt(n.ideal)} N</span><strong>balance Δm = ${fmt(n.dm)} g</strong>`;
    }else if(model==='coil'){
      const n=coilNumbers();html=`<strong>NΦ = ${fmt(n.flux)} Wb turn</strong><span>cosθ = ${fmt(Math.cos(n.theta))}</span><strong>ε = ${fmt(n.emf)} V</strong>`;
    }
    $('#advReadout').innerHTML=html;
  }

  function clearGraph(){
    gctx.clearRect(0,0,GW,GH);gctx.fillStyle='#07121f';gctx.fillRect(0,0,GW,GH);
  }
  function plotSeries(series,xmin,xmax,ymin,ymax,xlabel,ylabel,title,colors){
    clearGraph();const a=axes(gctx,GW,GH,xlabel,ylabel);
    $('#advGraphTitle').textContent=title;
    series.forEach((pts,si)=>{
      const mapped=pts.map(([x,y])=>[
        a.l+(x-xmin)/(xmax-xmin||1)*a.pw,
        a.top+a.ph-(y-ymin)/(ymax-ymin||1)*a.ph
      ]);
      poly(gctx,mapped,(colors||['#62c8ff','#72e0a3','#f2c14e'])[si%3],2.2);
    });
  }

  function drawGraph(){
    if(surface3d && model==='field'){drawPotentialSurface();return;}
    if(model==='field'){
      const pts=[],vpts=[];for(let i=0;i<=100;i++){const x=.08+i/100*.84;const p=fieldPhysics(x*W,H*.72);pts.push([x,p.E]);vpts.push([x,p.V]);}
      const maxE=Math.max(...pts.map(p=>p[1]),1),maxV=Math.max(...vpts.map(p=>Math.abs(p[1])),1);
      plotSeries([pts.map(p=>[p[0],p[1]/maxE]),vpts.map(p=>[p[0],p[1]/maxV])],0,1,-1,1,'position across field','normalised value','Field strength and potential',['#72e0a3','#62c8ff']);
      $('#advGraphLegend').innerHTML='<span><i class="legend-swatch green"></i>field magnitude</span><span><i class="legend-swatch blue"></i>potential</span>';
    }else if(model==='orbit'){
      const n=orbitNumbers(),r0=7e6,r1=35e6,ke=[],pe=[],te=[];for(let i=0;i<=100;i++){const r=r0+(r1-r0)*i/100;const vc=Math.sqrt(G*n.M/r)*values.speedFactor;const K=.5*vc*vc,P=-G*n.M/r;ke.push([r/1e6,K]);pe.push([r/1e6,P]);te.push([r/1e6,K+P]);}
      const abs=Math.max(...ke.concat(pe,te).map(p=>Math.abs(p[1])));
      plotSeries([ke.map(p=>[p[0],p[1]/abs]),pe.map(p=>[p[0],p[1]/abs]),te.map(p=>[p[0],p[1]/abs])],7,35,-1,1,'r / 10⁶ m','normalised energy','Orbital energy against radius',['#72e0a3','#62c8ff','#f2c14e']);
      $('#advGraphLegend').innerHTML='<span>KE</span><span>PE</span><span>Total</span>';
    }else if(model==='capacitor'){
      const n=capNumbers(),maxT=Math.max(15,5*n.tau),V=[],I=[],Q=[];for(let i=0;i<=120;i++){const tt=maxT*i/120;const d=values.mode==='discharge';const vv=d?n.V0*Math.exp(-tt/n.tau):n.V0*(1-Math.exp(-tt/n.tau));const ii=(n.V0/n.R)*Math.exp(-tt/n.tau)*(d?-1:1);V.push([tt,vv/n.V0]);I.push([tt,ii/(n.V0/n.R)]);Q.push([tt,(n.C*vv)/(n.C*n.V0)]);}
      plotSeries([V,I,Q],0,maxT,-1.05,1.05,'t / s','normalised','V, I and Q against time',['#62c8ff','#72e0a3','#f2c14e']);
      const a=axesOverlay(GW,GH);const cx=a.l+clamp(values.cursor/maxT,0,1)*a.pw;line(gctx,cx,a.top,cx,a.top+a.ph,'rgba(255,255,255,.45)',1.5);
      $('#advGraphLegend').innerHTML='<span>V</span><span>I</span><span>Q</span>';
    }else if(model==='particle'){
      const pts=[];for(let b=.02;b<=.5;b+=.005){const old=values.B;values.B=b;pts.push([b,particleNumbers().r]);values.B=old;}
      const max=Math.max(...pts.map(p=>p[1]));
      plotSeries([pts],.02,.5,0,max*1.05,'B / T','r / m','Path radius against flux density',['#f2c14e']);
      $('#advGraphLegend').textContent='r ∝ 1/B';
    }else if(model==='induction'){
      const flux=[],emf=[];if(values.mode==='generator'){
        const w=2*Math.PI*values.f,T=1/values.f;for(let i=0;i<=120;i++){const tt=2*T*i/120;flux.push([tt,Math.cos(w*tt)]);emf.push([tt,Math.sin(w*tt)]);}
        plotSeries([flux,emf],0,2*T,-1.1,1.1,'t / s','normalised','Flux linkage and induced emf',['#62c8ff','#72e0a3']);
      }else{
        for(let i=0;i<=120;i++){const x=-2.5+5*i/120,shape=Math.exp(-x*x),d=-2*x*shape;flux.push([x,shape]);emf.push([x,-d]);}
        plotSeries([flux,emf],-2.5,2.5,-1.2,1.2,'magnet position','normalised','Flux linkage and induced emf',['#62c8ff','#72e0a3']);
      }
      $('#advGraphLegend').innerHTML='<span>NΦ</span><span>ε</span>';
    }else if(model==='transformer'){
      const pts=[];for(let v=50;v<=2000;v+=20){const I=values.power*1000/v;pts.push([v,I*I*values.lineR]);}
      const max=Math.max(...pts.map(p=>p[1]));
      plotSeries([pts],50,2000,0,max,'transmission voltage / V','I²R loss / W','Transmission loss falls strongly as voltage rises',['#ff9b9b']);
      $('#advGraphLegend').textContent='constant transmitted power';
    }else if(model==='wire'){
      const pts=[];for(let I=.2;I<=5;I+=.1)pts.push([I,values.B*I*values.L]);
      plotSeries([pts],0,5,0,values.B*5*values.L*1.1,'I / A','F / N','RP10: F against I',['#72e0a3']);
      $('#advGraphLegend').textContent='gradient = BL';
    }else if(model==='coil'){
      const pts=[];for(let c=-1;c<=1;c+=.02)pts.push([c,values.N*values.B*values.area*c]);
      const max=Math.abs(values.N*values.B*values.area);
      plotSeries([pts],-1,1,-max,max,'cosθ','NΦ / Wb turn','RP11: flux linkage against cosθ',['#62c8ff']);
      $('#advGraphLegend').textContent='gradient = BAN';
    }
  }
  function axesOverlay(w,h){return {l:52,r:20,top:22,b:42,pw:w-72,ph:h-64};}

  function drawPotentialSurface(){
    clearGraph();$('#advGraphTitle').textContent='Potential surface (pseudo-3D)';
    const cols=34,rows=19,ox=GW*.5,oy=GH*.70,sx=GW*.018,sy=GH*.035,sz=GH*.16;
    const vals=[];
    for(let j=0;j<rows;j++){vals[j]=[];for(let i=0;i<cols;i++){const x=(i/(cols-1))*.9+.05,y=(j/(rows-1))*.8+.08;vals[j][i]=fieldPhysics(x*W,y*H).V;}}
    const max=Math.max(...vals.flat().map(Math.abs),1e-12);
    function proj(i,j,v){const xx=(i-cols/2)*sx-(j-rows/2)*sx*.75;const yy=(j-rows/2)*sy-(v/max)*sz;return [ox+xx,oy+yy];}
    for(let j=0;j<rows;j++){const pts=[];for(let i=0;i<cols;i++)pts.push(proj(i,j,vals[j][i]));poly(gctx,pts,'rgba(98,200,255,.48)',1);}
    for(let i=0;i<cols;i+=2){const pts=[];for(let j=0;j<rows;j++)pts.push(proj(i,j,vals[j][i]));poly(gctx,pts,'rgba(114,224,163,.28)',1);}
    text(gctx,'height represents scalar potential',20,25,'#dceaff',13);
    $('#advGraphLegend').textContent='Potential surface: steep gradient means stronger field.';
  }

  function pointerPos(ev,el){
    const r=el.getBoundingClientRect();const p=ev.touches?ev.touches[0]:ev;
    return {x:(p.clientX-r.left)/r.width*W,y:(p.clientY-r.top)/r.height*H};
  }
  canvas.addEventListener('pointerdown',ev=>{
    canvas.setPointerCapture?.(ev.pointerId);
    const p=pointerPos(ev,canvas);
    if(model==='field'){
      const objs=['s1','s2','probe'];let best=null,dist=1e9;
      objs.forEach(id=>{const q=fieldObjects[id],d=Math.hypot(p.x-q.x*W,p.y-q.y*H);if(d<dist){dist=d;best=id;}});
      if(dist<50)drag={kind:best};
    } else if(model==='orbit') drag={kind:'satellite'};
    else if(model==='induction' && values.mode==='magnet') drag={kind:'magnet'};
    else if(model==='coil' && values.rotate==='static') drag={kind:'coil'};
  });
  canvas.addEventListener('pointermove',ev=>{
    if(!drag)return;const p=pointerPos(ev,canvas);
    if(model==='field'){
      fieldObjects[drag.kind]={x:clamp(p.x/W,.05,.95),y:clamp(p.y/H,.08,.92)};
    }else if(model==='orbit'){
      const rr=Math.hypot(p.x-W*.5,p.y-H*.52);
      values.radius=clamp(7+(rr-90)/(Math.min(W,H)*.42-90)*28,7,35);
      const slider=$('[data-adv-control="radius"]');if(slider){slider.value=values.radius;slider.dispatchEvent(new Event('input'));}
    }else if(model==='induction'){
      magnetX=clamp(p.x/W,.06,.94);
    }else if(model==='coil'){
      const a=Math.atan2(H*.48-p.y,p.x-W*.5);
      values.angle=clamp((deg(a)+360)%180,0,180);
      const slider=$('[data-adv-control="angle"]');if(slider){slider.value=values.angle;slider.dispatchEvent(new Event('input'));}
    }
    drawAll();
  });
  const stopDrag=()=>drag=null;
  canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);

  graph.addEventListener('pointerdown',ev=>{
    if(model!=='capacitor')return;
    const r=graph.getBoundingClientRect(),x=ev.clientX-r.left,a=axesOverlay(GW,GH);
    const n=capNumbers(),maxT=Math.max(15,5*n.tau);
    values.cursor=clamp((x/r.width*GW-a.l)/a.pw,0,1)*maxT;
    const slider=$('[data-adv-control="cursor"]');if(slider){slider.value=clamp(values.cursor,0,15);slider.dispatchEvent(new Event('input'));}
    drawAll();
  });

  $('#advPlay').addEventListener('click',()=>{playing=!playing;$('#advPlay').textContent=playing?'Pause':'Play';});
  $('#advStep').addEventListener('click',()=>{playing=false;$('#advPlay').textContent='Play';stepTime(.08);drawAll();});
  $('#advReset').addEventListener('click',()=>setModel(model));
  $('#advLines').addEventListener('click',()=>{showLines=!showLines;$('#advLines').classList.toggle('active-toggle',showLines);drawAll();});
  $('#advVectors').addEventListener('click',()=>{showVectors=!showVectors;$('#advVectors').classList.toggle('active-toggle',showVectors);drawAll();});
  $('#advEquip').addEventListener('click',()=>{showEquip=!showEquip;$('#advEquip').classList.toggle('active-toggle',showEquip);drawAll();});
  $('#advTrace').addEventListener('click',()=>{showTrace=!showTrace;$('#advTrace').classList.toggle('active-toggle',showTrace);drawAll();});
  $('#adv3d').addEventListener('click',()=>{surface3d=!surface3d;$('#adv3d').classList.toggle('active-toggle',surface3d);drawAll();});

  function stepTime(dt){
    t+=dt;
    if(model==='orbit'){
      const n=orbitNumbers();orbitAngle += dt*(n.v/n.r)*1.2e3;
    }
    if(model==='induction' && values.mode==='magnet'){
      magnetX=.5+.33*Math.sin(t*.9);
    }
    if(model==='capacitor'){
      const n=capNumbers();if(t>Math.max(15,6*n.tau))t=0;
    }
  }
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(playing){stepTime(dt);drawAll();}
    requestAnimationFrame(loop);
  }

  function makeSimCalc(){
    const q={};
    if(model==='field'){
      const p=fieldPhysics(fieldObjects.probe.x*W,fieldObjects.probe.y*H);
      q.text=`The probe is at its current position. Use the live readout to state the ${values.kind==='gravity'?'field strength g':'electric field strength E'} to 3 significant figures.`;
      q.answer=p.E;q.tol=Math.max(Math.abs(p.E)*.015,1e-12);q.unit=values.kind==='gravity'?'N kg⁻¹':'N C⁻¹';
    }else if(model==='orbit'){
      const n=orbitNumbers();q.text=`For the current mass and radius, calculate the circular orbital speed (not the speed-multiplier launch speed).`;q.answer=n.vc;q.tol=n.vc*.015;q.unit='m s⁻¹';
    }else if(model==='capacitor'){
      const n=capNumbers();q.text=`Calculate the time constant τ from the displayed R and C.`;q.answer=n.tau;q.tol=n.tau*.015;q.unit='s';
    }else if(model==='particle'){
      const n=particleNumbers();q.text=`Calculate the path radius using r = mv/BQ for the current particle.`;q.answer=n.r;q.tol=n.r*.02;q.unit='m';
    }else if(model==='induction'){
      const n=inductionNumbers();q.text=values.mode==='generator'?`Calculate the current instantaneous induced emf shown by the generator.`:`State the magnitude of the induced emf predicted by the current flux-change model.`;q.answer=Math.abs(n.emf);q.tol=Math.max(Math.abs(n.emf)*.03,1e-6);q.unit='V';
    }else if(model==='transformer'){
      const n=transformerNumbers();q.text=`Calculate the ideal secondary rms voltage from the current turns ratio.`;q.answer=n.Vs;q.tol=n.Vs*.01;q.unit='V';
    }else if(model==='wire'){
      const n=wireNumbers();q.text=`Calculate the ideal magnetic force F = BIL for the current settings (ignore simulated scatter).`;q.answer=n.ideal;q.tol=Math.max(n.ideal*.015,1e-6);q.unit='N';
    }else if(model==='coil'){
      const n=coilNumbers();q.text=`Calculate the current flux linkage NΦ.`;q.answer=n.flux;q.tol=Math.max(Math.abs(n.flux)*.02,1e-6);q.unit='Wb turn';
    }
    currentCalc=q;$('#simCalcQuestion').textContent=q.text;$('#simCalcAnswer').value='';$('#simCalcFeedback').classList.add('hidden');
  }
  $('#newSimCalc').addEventListener('click',makeSimCalc);
  $('#checkSimCalc').addEventListener('click',()=>{
    const v=Number($('#simCalcAnswer').value),ok=Number.isFinite(v)&&Math.abs(v-currentCalc.answer)<=currentCalc.tol;
    const f=$('#simCalcFeedback');f.innerHTML=`<strong>${ok?'Correct.':'Check again.'}</strong> Expected about ${fmt(currentCalc.answer)} ${currentCalc.unit}.`;
    f.classList.remove('hidden');
    recordPerformance(topicForModel(model),ok);
  });

  const simExamBank = {
    field:[
      {q:'Explain why two source fields are combined vectorially but electric/gravitational potential is added algebraically.',hint:'Think direction versus scalar energy per unit mass/charge.',points:['field strength has direction','use vector addition/components','potential is scalar','potentials add algebraically']},
      {q:'A point lies on an equipotential. Explain what happens to the work done by the field when a test object moves along the equipotential.',hint:'Use ΔE = mΔV or QΔV.',points:['potential difference is zero','energy change is zero','no work is done by the field']}
    ],
    orbit:[
      {q:'A satellite is moved to a larger circular orbit. Explain the changes in orbital speed, period and total energy.',hint:'Use v² = GM/r and total energy = −GMm/2r.',points:['speed decreases','period increases','total energy becomes less negative/increases','energy must be supplied']},
      {q:'Explain why escape speed is larger than circular orbital speed at the same radius.',hint:'Compare the conditions on total energy.',points:['circular orbit remains bound','escape needs total energy at least zero','escape speed is √2 times circular speed']}
    ],
    capacitor:[
      {q:'Explain how increasing resistance changes a capacitor discharge graph and the time constant.',hint:'Use τ = RC and the exponential form.',points:['time constant increases','discharge is slower','initial current magnitude decreases','same initial capacitor voltage if V0 unchanged']},
      {q:'Describe how RP9 can use a log-linear plot to determine RC.',hint:'Take natural logs of the discharge equation.',points:['plot ln V against t','straight line','gradient = −1/RC','RC obtained from negative reciprocal gradient']}
    ],
    particle:[
      {q:'Explain why a magnetic field changes the direction of a charged particle without changing its speed.',hint:'Consider the angle between force and velocity.',points:['force is perpendicular to velocity','no work is done','kinetic energy unchanged','force supplies centripetal acceleration']}
    ],
    induction:[
      {q:'Use Faraday’s law and Lenz’s law to explain why moving the magnet faster increases emf and why reversing motion reverses polarity.',hint:'Rate of change and opposition to change.',points:['faster motion increases rate of change of flux linkage','larger induced emf','Lenz law opposes the change','reversing flux change reverses emf polarity']}
    ],
    transformer:[
      {q:'Explain why electrical power is transmitted at high voltage and low current.',hint:'For fixed power use P = VI and line loss = I²R.',points:['higher voltage gives lower current for same power','line loss is I²R','lower current greatly reduces heating loss']}
    ],
    wire:[
      {q:'For RP10, describe how to obtain a reliable graph showing force is proportional to current.',hint:'Control B and L and use a top-pan balance.',points:['keep B constant','keep length in field constant','vary current across a range','zero/read balance carefully','plot F against I','repeat or assess uncertainty']}
    ],
    coil:[
      {q:'For RP11, explain why plotting NΦ against cosθ should give a straight line.',hint:'Start from NΦ = BAN cosθ.',points:['NΦ = BAN cosθ','B A and N are controlled','gradient is BAN','line should pass through origin ideally']}
    ]
  };
  function makeSimExam(){
    const list=simExamBank[model]||simExamBank.field;currentExam=list[Math.floor(Math.random()*list.length)];
    $('#simExamQuestion').textContent=currentExam.q;$('#simExamAnswer').value='';$('#simExamFeedback').classList.add('hidden');
  }
  $('#simExamHint').addEventListener('click',()=>{const f=$('#simExamFeedback');f.textContent=currentExam.hint;f.classList.remove('hidden');});
  $('#simExamReveal').addEventListener('click',()=>{
    const ans=$('#simExamAnswer').value.toLowerCase();const hits=currentExam.points.filter(p=>p.toLowerCase().split(/\W+/).filter(w=>w.length>4).some(w=>ans.includes(w)));
    const f=$('#simExamFeedback');f.innerHTML=`<strong>Key marking points:</strong><ul>${currentExam.points.map(p=>`<li>${p}</li>`).join('')}</ul><p>You included evidence for about ${hits.length}/${currentExam.points.length} points. Improve any missing ideas in your own wording.</p>`;f.classList.remove('hidden');
    recordPerformance(topicForModel(model),hits.length>=Math.ceil(currentExam.points.length*.6));
  });

  $('#checkExplanation').addEventListener('click',()=>{
    const ans=$('#advExplanation').value.toLowerCase(),keys=modelDefs[model].keywords;
    const found=keys.filter(k=>ans.includes(k.toLowerCase())),missing=keys.filter(k=>!ans.includes(k.toLowerCase()));
    $('#explainFeedback').innerHTML=`<span class="good-chip">Found: ${found.length?found.join(', '):'none yet'}</span>${missing.length?`<span class="warn-chip">Consider: ${missing.join(', ')}</span>`:'<span class="good-chip">Strong physics vocabulary coverage</span>'}`;
  });

  function renderPracticalData(){
    const area=$('#practicalDataArea');
    if(!['capacitor','wire','coil'].includes(model)){area.innerHTML='';return;}
    const rows=practicalData[model];
    let head='',body='',analysis='';
    if(model==='capacitor'){
      head='<tr><th>t / s</th><th>V / V</th><th>ln(V/V₀)</th></tr>';
      body=rows.map(r=>`<tr><td>${fmt(r.t)}</td><td>${fmt(r.V)}</td><td>${fmt(r.ln)}</td></tr>`).join('');
      if(rows.length>=3){
        const fit=linearFit(rows.map(r=>[r.t,r.ln]));analysis=`Gradient ≈ ${fmt(fit.m)} s⁻¹ → experimental RC ≈ ${fmt(-1/fit.m)} s.`;
      }
    }else if(model==='wire'){
      head='<tr><th>I / A</th><th>B / T</th><th>L / m</th><th>F / N</th></tr>';
      body=rows.map(r=>`<tr><td>${fmt(r.I)}</td><td>${fmt(r.B)}</td><td>${fmt(r.L)}</td><td>${fmt(r.F)}</td></tr>`).join('');
      if(rows.length>=3){
        const fit=linearFit(rows.map(r=>[r.I,r.F]));analysis=`F–I gradient ≈ ${fmt(fit.m)} N A⁻¹; expected BL = ${fmt(values.B*values.L)} N A⁻¹.`;
      }
    }else{
      head='<tr><th>θ / °</th><th>cosθ</th><th>NΦ / Wb turn</th></tr>';
      body=rows.map(r=>`<tr><td>${fmt(r.angle)}</td><td>${fmt(r.cos)}</td><td>${fmt(r.flux)}</td></tr>`).join('');
      if(rows.length>=3){
        const fit=linearFit(rows.map(r=>[r.cos,r.flux]));analysis=`NΦ–cosθ gradient ≈ ${fmt(fit.m)} Wb turn; expected BAN = ${fmt(values.B*values.area*values.N)}.`;
      }
    }
    area.innerHTML=`<div class="practical-data-bar"><button class="button primary" id="collectPractical">Collect current reading</button><button class="button" id="clearPractical">Clear data</button><span class="muted small">Add realistic scatter only in RP10 using the scatter control.</span></div>
      <div class="table-scroll"><table class="data-table"><thead>${head}</thead><tbody>${body||'<tr><td colspan="4">No readings yet</td></tr>'}</tbody></table></div>
      <div class="equation">${analysis||'Collect at least three readings to begin analysis.'}</div>
      <div class="uncertainty-box"><strong>Uncertainty prompt:</strong> identify the largest measurement uncertainty, describe one control variable, and state how repeats or a best-fit line improve reliability.</div>`;
    $('#collectPractical').addEventListener('click',collectPractical);
    $('#clearPractical').addEventListener('click',()=>{practicalData[model]=[];renderPracticalData();});
  }
  function collectPractical(){
    if(model==='capacitor'){
      const n=capNumbers(),tt=values.cursor;
      const V=values.mode==='discharge'?n.V0*Math.exp(-tt/n.tau):n.V0*(1-Math.exp(-tt/n.tau));
      if(V>0)practicalData.capacitor.push({t:tt,V,ln:Math.log(V/n.V0)});
    }else if(model==='wire'){
      const n=wireNumbers();practicalData.wire.push({I:values.I,B:values.B,L:values.L,F:n.measured});
    }else if(model==='coil'){
      const n=coilNumbers(),angle=values.rotate==='static'?values.angle:(deg(n.theta)%360+360)%360;
      practicalData.coil.push({angle,cos:Math.cos(n.theta),flux:n.flux});
    }
    renderPracticalData();
  }
  function linearFit(pts){
    const n=pts.length,sx=pts.reduce((s,p)=>s+p[0],0),sy=pts.reduce((s,p)=>s+p[1],0),sxx=pts.reduce((s,p)=>s+p[0]*p[0],0),sxy=pts.reduce((s,p)=>s+p[0]*p[1],0);
    const d=n*sxx-sx*sx;return {m:d?(n*sxy-sx*sy)/d:0,c:d?(sy*sxx-sx*sxy)/d:0};
  }

  const gs=$('#graphSkillCanvas'),gsctx=gs.getContext('2d');let GSW=700,GSH=330,gsDrawing=false,gsPts=[],gsReveal=false;
  const graphPrompts={
    'g-r':'Predict the shape for g = GM/r². Label the effect of increasing r.',
    'V-r':'Predict V = −GM/r, including the zero at infinity and negative sign.',
    'E-r':'Predict E = kQ/r² for a positive source charge.',
    'cap-v':'Predict V = V₀e⁻ᵗ/ᴿᶜ for a discharging capacitor.',
    'cap-ln':'Predict ln(V/V₀) against t after taking natural logs of the discharge equation.',
    'flux-cos':'Predict NΦ against cosθ when B, A and N are constant.',
    'ac':'Predict an alternating sinusoidal voltage against time.'
  };
  function resizeGraphSkill(){
    const r=gs.getBoundingClientRect();if(!r.width)return;
    GSW=Math.max(320,r.width);GSH=Math.max(260,r.height);gs.width=GSW*DPR;gs.height=GSH*DPR;gsctx.setTransform(DPR,0,0,DPR,0,0);drawGraphSkill();
  }
  function drawGraphSkill(){
    gsctx.fillStyle='#07121f';gsctx.fillRect(0,0,GSW,GSH);
    const a=axes(gsctx,GSW,GSH,'x / independent variable','y / dependent variable');
    if(gsPts.length)poly(gsctx,gsPts,'#f2c14e',2.5);
    if(gsReveal){
      const type=$('#graphSkillSelect').value,pts=[];
      for(let i=0;i<=120;i++){
        const u=i/120,x=a.l+u*a.pw;let y=0;
        if(type==='g-r'||type==='E-r') y=1/Math.pow(.25+.75*u,2);
        if(type==='V-r') y=-1/(.25+.75*u);
        if(type==='cap-v') y=Math.exp(-4*u);
        if(type==='cap-ln') y=-3*u;
        if(type==='flux-cos') y=-1+2*u;
        if(type==='ac') y=Math.sin(u*Math.PI*4);
        let yn;
        if(type==='g-r'||type==='E-r')yn=(y-1)/(16-1);
        else if(type==='V-r')yn=(y+4)/4;
        else if(type==='cap-v')yn=y;
        else if(type==='cap-ln')yn=(y+3)/3;
        else yn=(y+1)/2;
        pts.push([x,a.top+a.ph-yn*a.ph]);
      }
      poly(gsctx,pts,'#62c8ff',3);
      text(gsctx,'model relationship',a.l+10,a.top+18,'#62c8ff',12);
    }
  }
  function graphSkillPoint(ev){
    const r=gs.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*GSW,y:(ev.clientY-r.top)/r.height*GSH};
  }
  gs.addEventListener('pointerdown',ev=>{gsDrawing=true;gs.setPointerCapture?.(ev.pointerId);gsPts=[];const p=graphSkillPoint(ev);gsPts.push([p.x,p.y]);drawGraphSkill();});
  gs.addEventListener('pointermove',ev=>{if(!gsDrawing)return;const p=graphSkillPoint(ev);gsPts.push([p.x,p.y]);drawGraphSkill();});
  gs.addEventListener('pointerup',()=>gsDrawing=false);gs.addEventListener('pointercancel',()=>gsDrawing=false);
  $('#clearGraphSketch').addEventListener('click',()=>{gsPts=[];gsReveal=false;drawGraphSkill();});
  $('#revealGraphModel').addEventListener('click',()=>{gsReveal=true;drawGraphSkill();});
  $('#graphSkillSelect').addEventListener('change',()=>{gsPts=[];gsReveal=false;updateGraphPrompt();drawGraphSkill();});
  function updateGraphPrompt(){$('#graphSkillPrompt').textContent=graphPrompts[$('#graphSkillSelect').value];}

  const examBank = [
    {topic:'gravity',type:'calc',marks:4,q:'A satellite orbits a planet of mass 6.0 × 10²⁴ kg at a radius of 8.0 × 10⁶ m. Calculate its circular orbital speed.',hint:'Set gravitational force equal to centripetal force.',answer:'Use v = √(GM/r). Substitution gives about 7.07 × 10³ m s⁻¹.',keys:['square root','GM','radius','7070']},
    {topic:'gravity',type:'explain',marks:4,q:'Explain why gravitational potential is negative close to an isolated planet when the zero of potential is taken at infinity.',hint:'Think about work needed to remove a mass to infinity.',answer:'A mass is in a bound state. Positive work must be done against attraction to move it to infinity, so its potential near the planet is below the zero at infinity.',keys:['infinity','work','attraction','negative']},
    {topic:'gravity',type:'graph',marks:4,q:'A graph of gravitational field strength g against radius r is provided. Explain how the change in gravitational potential between two radii can be obtained from the graph.',hint:'Use the relationship between field and potential gradient.',answer:'The magnitude of the potential difference is the area under the g–r graph between the radii, with sign determined by the direction/change in potential.',keys:['area','under','potential','radius']},
    {topic:'electric',type:'calc',marks:4,q:'A +3.0 nC point charge produces an electric field at a point 0.20 m away. Calculate the field strength.',hint:'Use E = kQ/r².',answer:'E = (8.99 × 10⁹)(3.0 × 10⁻⁹)/(0.20)² ≈ 6.74 × 10² N C⁻¹.',keys:['8.99','3.0','0.20','674']},
    {topic:'electric',type:'explain',marks:4,q:'Two equal positive charges are fixed a short distance apart. Explain why the electric field can be zero at the midpoint while the electric potential is not zero.',hint:'Compare vector and scalar addition.',answer:'The fields are equal and opposite vectors so cancel at the midpoint. Electric potential is scalar; both positive contributions add, so the potential is positive.',keys:['opposite','vector','cancel','scalar','add']},
    {topic:'electric',type:'mistake',marks:3,q:'A student says: “If the electric potential is zero at a point, the electric field must also be zero.” Identify the error and give a counterexample.',hint:'Potential and potential gradient are different quantities.',answer:'Zero potential does not imply zero potential gradient. For example, potential can be zero at a chosen/reference point while the field is non-zero; or between opposite charges there can be a zero-potential point with non-zero field.',keys:['gradient','non-zero','potential','field']},
    {topic:'capacitance',type:'calc',marks:5,q:'A 470 µF capacitor discharges through 4.7 kΩ from 6.0 V. Calculate the time constant and the potential difference after 3.0 s.',hint:'τ = RC and V = V₀e⁻ᵗ/τ.',answer:'τ = 4700 × 470 × 10⁻⁶ ≈ 2.21 s. V ≈ 6.0e⁻³/²·²¹ ≈ 1.54 V.',keys:['2.21','1.54','exponential']},
    {topic:'capacitance',type:'graph',marks:4,q:'Explain why a plot of ln(V/V₀) against time for capacitor discharge is useful.',hint:'Linearise the exponential relationship.',answer:'ln(V/V₀) = −t/RC, so the plot is a straight line with gradient −1/RC. This allows the time constant to be determined from the gradient.',keys:['straight','gradient','-1/RC','time constant']},
    {topic:'practical',type:'practical',marks:6,q:'Plan a method for Required Practical 9 that determines the time constant of a capacitor by log-linear analysis.',hint:'Include apparatus, measurements, repeatability and the graph.',answer:'Charge the capacitor to a measured V₀, discharge it through known R, record V at many times using a high-resistance voltmeter/data logger, repeat as needed, plot ln(V/V₀) against t, find best-fit gradient and use RC = −1/gradient. Control R and C and ensure full recharge/discharge between runs.',keys:['voltmeter','time','ln','gradient','repeat','R','C']},
    {topic:'magnetic',type:'calc',marks:4,q:'A proton of speed 2.5 × 10⁶ m s⁻¹ enters a 0.20 T magnetic field at right angles. Calculate the radius of its circular path.',hint:'Set BQv = mv²/r.',answer:'r = mv/BQ ≈ (1.67 × 10⁻²⁷ × 2.5 × 10⁶)/(0.20 × 1.60 × 10⁻¹⁹) ≈ 0.130 m.',keys:['mv','BQ','0.130']},
    {topic:'magnetic',type:'explain',marks:4,q:'Explain why the magnetic force on a charged particle does no work when the particle moves perpendicular to the field.',hint:'Use the direction of force relative to velocity/displacement.',answer:'The magnetic force is perpendicular to the instantaneous velocity/displacement. Therefore there is no force component along the motion, so no work is done and kinetic energy/speed remain constant.',keys:['perpendicular','work','kinetic','speed']},
    {topic:'magnetic',type:'calc',marks:4,q:'A 0.060 m wire carries 3.0 A perpendicular to a 0.25 T magnetic field. Calculate the force on the wire.',hint:'Use F = BIL.',answer:'F = 0.25 × 3.0 × 0.060 = 0.045 N.',keys:['0.045','BIL']},
    {topic:'practical',type:'practical',marks:6,q:'Describe how Required Practical 10 can test F = BIL using a top-pan balance.',hint:'State what is changed, controlled and measured.',answer:'Place a current-carrying wire perpendicular to a uniform magnetic field and use the balance change to obtain force. Vary one of I, L or B while keeping the others fixed, take a range of readings, repeat/zero the balance and plot F against the chosen independent variable.',keys:['balance','current','length','flux density','plot','control']},
    {topic:'magnetic',type:'graph',marks:4,q:'For a coil rotating in a uniform field, compare the phase of flux linkage and induced emf.',hint:'Differentiate the cosine flux-linkage function.',answer:'Flux linkage varies as cosωt. Induced emf is −d(NΦ)/dt and therefore varies as sinωt (with sign according to the chosen convention), so emf is a quarter-cycle out of phase with flux linkage.',keys:['cos','differentiate','sin','quarter']},
    {topic:'practical',type:'practical',marks:5,q:'Explain how Required Practical 11 tests the relationship NΦ = BAN cosθ.',hint:'Use a search coil and oscilloscope/measurement of flux linkage.',answer:'Keep B, A and N constant, vary the angle between the coil normal and field direction, determine flux linkage for each angle, and plot NΦ against cosθ. A straight line with gradient BAN supports the relationship.',keys:['angle','normal','cos','gradient','BAN']},
    {topic:'magnetic',type:'mistake',marks:3,q:'A student says a transformer can step up a steady DC voltage because Vs/Vp = Ns/Np. Explain the mistake.',hint:'What creates changing flux in the core?',answer:'The transformer equation assumes alternating/changing magnetic flux. Steady DC gives no continuing change of flux after switching, so there is no sustained induced emf in the secondary.',keys:['alternating','changing flux','DC','induced emf']},
    {topic:'magnetic',type:'explain',marks:5,q:'Explain why high-voltage transmission reduces energy loss in power cables when the transmitted power is fixed.',hint:'Combine P = VI with Ploss = I²R.',answer:'For a fixed transmitted power, increasing voltage reduces current. Cable heating loss is I²R, so reducing current produces a much larger reduction in power loss.',keys:['fixed power','voltage','current','I²R','loss']}
  ];

  const perfKey='aqa-fields-adaptive-v2';
  let perf=JSON.parse(localStorage.getItem(perfKey)||'{}');
  ['gravity','electric','capacitance','magnetic','practical'].forEach(k=>perf[k] ||= {ok:0,bad:0});
  function topicForModel(m){return ({field:'electric',orbit:'gravity',capacitor:'capacitance',particle:'magnetic',induction:'magnetic',transformer:'magnetic',wire:'practical',coil:'practical'})[m]||'electric';}
  function recordPerformance(topic,ok){
    topic=topic==='fields'?'electric':topic;
    if(!perf[topic])perf[topic]={ok:0,bad:0};
    perf[topic][ok?'ok':'bad']++;
    localStorage.setItem(perfKey,JSON.stringify(perf));renderHeatmap();
  }
  function renderHeatmap(){
    $('#topicHeatmap').innerHTML=Object.entries(perf).map(([topic,p])=>{
      const total=p.ok+p.bad,rate=total?p.ok/total:.5;
      const cls=rate>=.75?'strong':rate>=.5?'developing':'priority';
      return `<div class="heat-cell ${cls}"><strong>${topic}</strong><span>${total?Math.round(rate*100)+'%':'new'}</span><small>${p.ok} secure · ${p.bad} revisit</small></div>`;
    }).join('');
    const weakest=Object.entries(perf).sort((a,b)=>{
      const ra=(a[1].ok+1)/(a[1].ok+a[1].bad+2),rb=(b[1].ok+1)/(b[1].ok+b[1].bad+2);return ra-rb;
    })[0];
    $('#adaptiveRecommendation').innerHTML=`<strong>Adaptive next step:</strong> ${weakest[0]} currently has the lowest secure-response rate. The next mixed practice should include extra ${weakest[0]} retrieval before moving on.`;
  }

  let examQ=null,timer=null,timeLeft=1200;
  function matchesExam(q){
    const t=$('#examTopic').value,ty=$('#examType').value;
    return (t==='all'||q.topic===t||(t==='magnetic'&&q.topic==='magnetic'))&&(ty==='all'||q.type===ty);
  }
  function newExamQuestion(){
    const pool=examBank.filter(matchesExam);examQ=pool[Math.floor(Math.random()*pool.length)]||examBank[0];
    $('#examQTopic').textContent=examQ.topic.toUpperCase();
    $('#examQMarks').textContent=examQ.marks+' marks';
    $('#examQType').textContent=examQ.type;
    $('#examCentreQuestion').textContent=examQ.q;
    $('#examCentreAnswer').value='';
    $('#examCentreFeedback').classList.add('hidden');
  }
  $('#examTopic').addEventListener('change',newExamQuestion);$('#examType').addEventListener('change',newExamQuestion);
  $('#newExamQuestion').addEventListener('click',newExamQuestion);
  $('#examCentreHint').addEventListener('click',()=>{const f=$('#examCentreFeedback');f.textContent=examQ.hint;f.classList.remove('hidden');});
  $('#examCentreCheck').addEventListener('click',()=>{
    const ans=$('#examCentreAnswer').value.toLowerCase();
    const hits=examQ.keys.filter(k=>ans.includes(k.toLowerCase()));
    const likely=hits.length>=Math.max(1,Math.ceil(examQ.keys.length*.5));
    const f=$('#examCentreFeedback');f.innerHTML=`<strong>Indicative answer points:</strong><p>${examQ.answer}</p><p>Your response matched ${hits.length}/${examQ.keys.length} key checks. Use the revealed points to self-correct rather than copying them.</p>`;
    f.classList.remove('hidden');recordPerformance(examQ.topic,likely);
  });
  $('#examConfidence').addEventListener('input',e=>$('#examConfidenceOut').textContent=e.target.value+' / 5');
  function showTimer(){
    const m=Math.floor(timeLeft/60),s=timeLeft%60;$('#examTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  $('#startTimer').addEventListener('click',()=>{
    if(timer){clearInterval(timer);timer=null;$('#startTimer').textContent='Start 20-min test';return;}
    timeLeft=1200;showTimer();$('#startTimer').textContent='Pause timer';
    timer=setInterval(()=>{timeLeft=Math.max(0,timeLeft-1);showTimer();if(timeLeft===0){clearInterval(timer);timer=null;$('#startTimer').textContent='Start 20-min test';}},1000);
  });

  const mastery=$('#view-mastery .mastery-grid');
  if(mastery){
    const extra=document.createElement('article');extra.className='panel pad';
    extra.innerHTML='<h3>Adaptive next steps</h3><p class="muted small">This updates from your Advanced Lab and Exam Centre attempts.</p><div id="masteryAdaptive"></div><button class="button" id="openAdvancedFromMastery">Open Advanced Lab</button>';
    mastery.appendChild(extra);
    $('#openAdvancedFromMastery').addEventListener('click',()=>document.querySelector('[data-view="advanced"]')?.click());
  }
  function mirrorAdaptive(){
    const box=$('#masteryAdaptive');if(!box)return;
    const ordered=Object.entries(perf).sort((a,b)=>((a[1].ok+1)/(a[1].ok+a[1].bad+2))-((b[1].ok+1)/(b[1].ok+b[1].bad+2)));
    box.innerHTML=ordered.slice(0,3).map(([k,p],i)=>`<div class="adaptive-line"><strong>${i===0?'Priority':'Next'}: ${k}</strong><span>${p.ok} secure / ${p.bad} revisit</span></div>`).join('');
  }
  const oldRenderHeatmap=renderHeatmap;
  renderHeatmap=function(){oldRenderHeatmap();mirrorAdaptive();};

  $$('[data-adv-model]').forEach(b=>b.addEventListener('click',()=>setModel(b.dataset.advModel)));

  updateGraphPrompt();
  renderHeatmap();
  newExamQuestion();
  renderTabs();
  renderControls();
  makeSimCalc();
  makeSimExam();
  requestAnimationFrame(()=>{resize();resizeGraphSkill();});
  requestAnimationFrame(loop);
})();
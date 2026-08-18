
const DB_KEY = "techmtc-db-v1";

const seed = {
  role: "trainer",
  user: {name:"Trainer", reg:"TR-001", year:"First Year"},
  trainees: [
    {id:1,name:"Kofi Mensah",reg:"TM001",year:"First Year"},
    {id:2,name:"Samuel Boateng",reg:"TM002",year:"First Year"},
    {id:3,name:"Emmanuel Asare",reg:"TM003",year:"First Year"},
    {id:4,name:"Daniel Owusu",reg:"TM004",year:"First Year"},
    {id:5,name:"Isaac Addo",reg:"TM005",year:"First Year"},
    {id:6,name:"Mercy A.",reg:"TM006",year:"First Year"},
    {id:7,name:"John B.",reg:"TM007",year:"Second Year"},
    {id:8,name:"Amina K.",reg:"TM008",year:"Second Year"}
  ],
  topics: [
    {id:1,year:"First Year",title:"Sets and Number Systems",details:"Number sets, operations and representations.",plannedDate:"2026-08-20",plannedTime:"10:00",duration:90,remarks:"Bring scientific calculator."},
    {id:2,year:"First Year",title:"Indices and Surds",details:"Laws of indices and simplification of surds.",plannedDate:"2026-08-25",plannedTime:"10:00",duration:90,remarks:""},
    {id:3,year:"First Year",title:"Linear Equations",details:"Solving linear equations and applications.",plannedDate:"2026-09-01",plannedTime:"10:00",duration:90,remarks:"Practice word problems."},
    {id:4,year:"Second Year",title:"Trigonometry Applications",details:"Using trigonometric ratios in technical problems.",plannedDate:"2026-08-22",plannedTime:"14:00",duration:120,remarks:"Bring drawing set."}
  ],
  attendance: {},
  coursework: {},
  timetable: [
    {id:1,year:"First Year",topicId:1,date:"2026-08-20",start:"10:00",end:"11:30",venue:"Mathematics Classroom",remarks:"Introduction and examples"},
    {id:2,year:"First Year",topicId:2,date:"2026-08-25",start:"10:00",end:"11:30",venue:"Mathematics Classroom",remarks:"Worked examples"},
    {id:3,year:"Second Year",topicId:4,date:"2026-08-22",start:"14:00",end:"16:00",venue:"Workshop Classroom",remarks:"Technical applications"}
  ],
  resources: [],
  forum: [
    {id:1,year:"First Year",topicId:3,author:"Daniel Owusu",body:"Why do we add or subtract the same number on both sides?",time:"2026-08-18 09:15",replies:[
      {author:"Trainer",body:"Because an equation is a balance. Doing the same operation to both sides keeps the two sides equal.",time:"2026-08-18 10:40"}
    ]}
  ]
};

let db = loadDB();
let state = {page:"dashboard", year:"First Year", modal:null};

function loadDB(){
  try{
    const x = JSON.parse(localStorage.getItem(DB_KEY));
    return x ? {...seed,...x} : structuredClone(seed);
  }catch(e){ return structuredClone(seed); }
}
function saveDB(){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }
function uid(arr){ return arr.length ? Math.max(...arr.map(x=>x.id||0))+1 : 1; }
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function topicName(id){ return db.topics.find(t=>t.id==id)?.title || "General"; }
function toast(msg){
  const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}
function isTrainer(){ return db.role==="trainer"; }
function yearTopics(){ return db.topics.filter(t=>t.year===state.year); }
function currentTrainees(){ return db.trainees.filter(t=>t.year===state.year); }

function render(){
  const app=document.getElementById("app");
  app.innerHTML = shell(content());
  bindNav();
}
function shell(body){
  const nav = [
    ["dashboard","🏠","Home"],["topics","📘","Topics"],["timetable","🗓️","Timetable"],
    ["attendance","👤","Attendance"],["coursework","📝","Course Work"],["resources","📄","Resources"],["forum","💬","Forum"]
  ];
  return `
  <div class="shell">
    <header class="topbar">
      <div class="brand"><div class="logo">TM</div><div>TechMtc<small>Technician Mathematics Class</small></div></div>
      <div class="role-switch">
        <select id="yearTop" class="year-switch">
          <option ${state.year==="First Year"?"selected":""}>First Year</option>
          <option ${state.year==="Second Year"?"selected":""}>Second Year</option>
        </select>
        <select id="roleTop">
          <option value="trainer" ${db.role==="trainer"?"selected":""}>Trainer</option>
          <option value="trainee" ${db.role==="trainee"?"selected":""}>Trainee</option>
        </select>
      </div>
    </header>
    <div class="layout">
      <aside class="sidebar">
        ${nav.map(([p,i,l])=>`<button class="nav-btn ${state.page===p?"active":""}" data-page="${p}">${i} ${l}</button>`).join("")}
      </aside>
      <main class="main">${body}</main>
    </div>
    <nav class="mobile-nav">
      ${nav.slice(0,6).map(([p,i,l])=>`<button class="${state.page===p?"active":""}" data-page="${p}">${i}<br>${l}</button>`).join("")}
    </nav>
    ${state.modal?modalHtml(state.modal):""}
  </div>`;
}
function bindNav(){
  document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;state.modal=null;render()});
  document.getElementById("yearTop").onchange=e=>{state.year=e.target.value;render()};
  document.getElementById("roleTop").onchange=e=>{db.role=e.target.value;saveDB();render()};
}
function content(){
  return ({
    dashboard:dashboard,
    topics:topics,
    timetable:timetable,
    attendance:attendance,
    coursework:coursework,
    resources:resources,
    forum:forum
  }[state.page]||dashboard)();
}

function dashboard(){
  const topics=yearTopics(), trainees=currentTrainees();
  const scheduled=db.timetable.filter(x=>x.year===state.year).sort((a,b)=>a.date.localeCompare(b.date));
  const next=scheduled.find(x=>x.date>=new Date().toISOString().slice(0,10)) || scheduled[0];
  const attKeys=Object.keys(db.attendance).filter(k=>k.startsWith(state.year+"|"));
  let att=0,total=0;
  attKeys.forEach(k=>{Object.values(db.attendance[k]).forEach(v=>{total++; if(v==="Present") att++;})});
  const avgAtt=total?Math.round(att/total*100):0;
  return `
    <section class="card hero">
      <div><h1>Hello, ${isTrainer()?"Trainer":"Trainee"} 👋</h1>
      <p>${state.year} • Technician Mathematics</p></div>
      <div class="hero-box">
        <b>Next topic</b><div style="font-size:20px;margin-top:6px">${next?esc(topicName(next.topicId)):"No topic scheduled"}</div>
        <div style="opacity:.85;margin-top:4px">${next?`${next.date} • ${next.start} • ${esc(next.venue)}`:"Add a timetable entry to get started."}</div>
      </div>
    </section>
    <div class="grid cols-4" style="margin-top:16px">
      <div class="card kpi"><div class="muted">Topics</div><div class="value">${topics.length}</div></div>
      <div class="card kpi"><div class="muted">Trainees</div><div class="value">${trainees.length}</div></div>
      <div class="card kpi"><div class="muted">Scheduled Lessons</div><div class="value">${scheduled.length}</div></div>
      <div class="card kpi"><div class="muted">Attendance</div><div class="value">${avgAtt}%</div></div>
    </div>
    <div class="grid cols-2" style="margin-top:16px">
      <div class="card">
        <div class="section-title"><h3>Upcoming timetable</h3><button class="btn small secondary" onclick="state.page='timetable';render()">View all</button></div>
        <div class="list">${scheduled.slice(0,4).map(x=>`
          <div class="list-item"><div><b>${esc(topicName(x.topicId))}</b><div class="muted">${x.date} • ${x.start}-${x.end}</div></div><span class="badge">${esc(x.venue)}</span></div>
        `).join("")||'<div class="empty">No timetable entries yet.</div>'}</div>
      </div>
      <div class="card">
        <div class="section-title"><h3>Recent discussions</h3><button class="btn small secondary" onclick="state.page='forum';render()">Open forum</button></div>
        <div class="list">${db.forum.filter(x=>x.year===state.year).slice(-4).reverse().map(p=>`
          <div class="list-item"><div><b>${esc(topicName(p.topicId))}</b><div>${esc(p.body).slice(0,90)}</div><div class="muted">${esc(p.author)}</div></div><span class="badge">${p.replies.length} replies</span></div>
        `).join("")||'<div class="empty">No discussions yet.</div>'}</div>
      </div>
    </div>`;
}

function topics(){
  const rows=yearTopics();
  return `
  <div class="section-title"><h2>${state.year} Topics</h2>${isTrainer()?`<button class="btn" onclick="openModal('topic')">+ Add Topic</button>`:""}</div>
  <div class="card">
    <div class="list">${rows.map((t,i)=>`
      <div class="list-item">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div class="topic-num">${i+1}</div>
          <div><b>${esc(t.title)}</b><div class="muted">${esc(t.details||"No details added")}</div>
          <div style="margin-top:7px"><span class="badge">${t.plannedDate||"No date"}</span> ${t.plannedTime?`<span class="badge green">${t.plannedTime}</span>`:""}</div></div>
        </div>
        ${isTrainer()?`<div><button class="btn small secondary" onclick="editTopic(${t.id})">Edit</button> <button class="btn small danger" onclick="deleteTopic(${t.id})">Delete</button></div>`:""}
      </div>`).join("")||'<div class="empty">No topics yet.</div>'}</div>
  </div>`;
}
function timetable(){
  const rows=db.timetable.filter(x=>x.year===state.year).sort((a,b)=>a.date.localeCompare(b.date));
  return `
  <div class="section-title"><h2>${state.year} Timetable</h2>${isTrainer()?`<button class="btn" onclick="openModal('schedule')">+ Add Schedule</button>`:""}</div>
  <div class="card"><div class="list">${rows.map(x=>`
    <div class="list-item">
      <div><b>${esc(topicName(x.topicId))}</b><div class="muted">${x.date} • ${x.start}-${x.end} • ${esc(x.venue)}</div>
      <div>${esc(x.remarks||"")}</div></div>
      ${isTrainer()?`<button class="btn small danger" onclick="deleteSchedule(${x.id})">Delete</button>`:""}
    </div>`).join("")||'<div class="empty">No timetable entries yet.</div>'}</div></div>`;
}
function attendance(){
  const topics=yearTopics();
  if(!isTrainer()){
    const mine=db.trainees[0];
    const rec=[];
    Object.entries(db.attendance).forEach(([k,v])=>{
      if(k.startsWith(state.year+"|") && v[mine?.id]) rec.push([k,v[mine.id]]);
    });
    return `<div class="section-title"><h2>My Attendance</h2></div><div class="card">
      ${rec.length?rec.map(([k,v])=>{const [y,d,tid]=k.split("|");return `<div class="list-item"><div><b>${esc(topicName(tid))}</b><div class="muted">${d}</div></div><span class="badge ${v==="Present"?"green":v==="Absent"?"red":"orange"}">${v}</span></div>`}).join(""):'<div class="empty">No attendance records yet.</div>'}
    </div>`;
  }
  const today=new Date().toISOString().slice(0,10);
  return `
  <div class="section-title"><h2>Attendance</h2></div>
  <div class="card">
    <div class="toolbar">
      <div class="field"><label>Date</label><input class="input" id="attDate" type="date" value="${today}"></div>
      <div class="field"><label>Topic</label><select id="attTopic">${topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join("")}</select></div>
      <button class="btn" onclick="loadAttendance()">Load List</button>
    </div>
    <div id="attTable"><div class="empty">Choose a date and topic, then load the attendance list.</div></div>
  </div>`;
}
function loadAttendance(){
  const date=document.getElementById("attDate").value, tid=document.getElementById("attTopic").value;
  if(!tid)return toast("Add a topic first.");
  const key=`${state.year}|${date}|${tid}`, rec=db.attendance[key]||{};
  document.getElementById("attTable").innerHTML=`
  <table><thead><tr><th>Trainee</th><th>Registration</th><th>Status</th></tr></thead><tbody>
  ${currentTrainees().map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.reg)}</td><td>
    <select data-att="${t.id}">
      ${["Present","Absent","Late","Excused"].map(s=>`<option ${rec[t.id]===s?"selected":""}>${s}</option>`).join("")}
    </select>
  </td></tr>`).join("")}</tbody></table>
  <div style="margin-top:14px"><button class="btn success" onclick="saveAttendance('${key}')">Save Attendance</button></div>`;
}
function saveAttendance(key){
  const rec={};
  document.querySelectorAll("[data-att]").forEach(s=>rec[s.dataset.att]=s.value);
  db.attendance[key]=rec; saveDB(); toast("Attendance saved.");
}
function coursework(){
  const topics=yearTopics();
  if(!isTrainer()){
    const mine=db.trainees[0];
    const rows=Object.entries(db.coursework).filter(([k])=>k.startsWith(state.year+"|")).map(([k,v])=>{
      const tid=k.split("|")[1]; return [topicName(tid),v[mine?.id]];
    }).filter(x=>x[1]!==undefined);
    return `<div class="section-title"><h2>My Course Work</h2></div><div class="card">
      ${rows.length?rows.map(([t,m])=>`<div class="list-item"><b>${esc(t)}</b><span class="badge green">${esc(m)}%</span></div>`).join(""):'<div class="empty">No course work marks yet.</div>'}
    </div>`;
  }
  return `
  <div class="section-title"><h2>Course Work - Manual Entry</h2></div>
  <div class="card">
    <div class="toolbar"><div class="field"><label>Topic</label><select id="cwTopic">${topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join("")}</select></div>
    <button class="btn" onclick="loadCoursework()">Load Marks</button></div>
    <div id="cwTable"><div class="empty">Select a topic to enter each trainee's course work mark.</div></div>
  </div>`;
}
function loadCoursework(){
  const tid=document.getElementById("cwTopic").value;if(!tid)return toast("Add a topic first.");
  const key=`${state.year}|${tid}`, rec=db.coursework[key]||{};
  document.getElementById("cwTable").innerHTML=`
  <table><thead><tr><th>Trainee</th><th>Registration</th><th>Course Work (%)</th></tr></thead><tbody>
  ${currentTrainees().map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.reg)}</td><td><input class="input" style="max-width:110px" type="number" min="0" max="100" data-cw="${t.id}" value="${rec[t.id]??""}"></td></tr>`).join("")}
  </tbody></table><div style="margin-top:14px"><button class="btn success" onclick="saveCoursework('${key}')">Save Marks</button></div>`;
}
function saveCoursework(key){
  const rec={};document.querySelectorAll("[data-cw]").forEach(i=>{if(i.value!=="")rec[i.dataset.cw]=Number(i.value)});
  db.coursework[key]=rec;saveDB();toast("Course work saved.");
}
function resources(){
  const rows=db.resources.filter(x=>x.year===state.year);
  return `
  <div class="section-title"><h2>Resources</h2>${isTrainer()?`<button class="btn" onclick="openModal('resource')">+ Add PDF</button>`:""}</div>
  <div class="card"><div class="list">${rows.map(r=>`
    <div class="list-item"><div><b>📄 ${esc(r.name)}</b><div class="muted">${esc(topicName(r.topicId))} • ${Math.round((r.dataUrl?.length||0)/1024)} KB stored locally</div></div>
    <div><button class="btn small secondary" onclick="openResource(${r.id})">Open</button>${isTrainer()?` <button class="btn small danger" onclick="deleteResource(${r.id})">Delete</button>`:""}</div></div>
  `).join("")||'<div class="empty">No PDF resources yet.</div>'}</div></div>`;
}
function forum(){
  const posts=db.forum.filter(x=>x.year===state.year);
  return `
  <div class="section-title"><h2>Forum & Follow-up Discussions</h2><button class="btn" onclick="openModal('post')">+ New Discussion</button></div>
  <div class="grid cols-2">
    <div class="card"><div class="list">${posts.map(p=>`
      <div class="forum-post">
        <div class="meta">${esc(p.author)} • ${esc(topicName(p.topicId))} • ${esc(p.time)}</div>
        <b>${esc(p.body)}</b>
        <div style="margin-top:10px">${p.replies.map(r=>`<div class="reply"><div class="meta">${esc(r.author)} • ${esc(r.time)}</div>${esc(r.body)}</div>`).join("")}</div>
        <button class="btn small secondary" style="margin-top:10px" onclick="replyTo(${p.id})">Reply</button>
      </div>`).join("")||'<div class="empty">No discussions yet.</div>'}</div></div>
    <div class="card"><h3>How to use the forum</h3><p class="muted">Ask follow-up questions after lessons, discuss difficult examples, and let the trainer respond under each topic.</p></div>
  </div>`;
}

function modalHtml(type){
  let body="";
  if(type==="topic"){
    body=`<h2>Add Topic</h2><div class="form-grid">
      <div class="field"><label>Year</label><select id="mYear"><option ${state.year==="First Year"?"selected":""}>First Year</option><option ${state.year==="Second Year"?"selected":""}>Second Year</option></select></div>
      <div class="field"><label>Topic Title</label><input id="mTitle" class="input"></div>
      <div class="field full"><label>Topic Details</label><textarea id="mDetails" rows="4" placeholder="Short description only — notes can be uploaded later as PDFs."></textarea></div>
      <div class="field"><label>Planned Date</label><input id="mDate" type="date" class="input"></div>
      <div class="field"><label>Planned Time</label><input id="mTime" type="time" class="input"></div>
      <div class="field"><label>Duration (minutes)</label><input id="mDuration" type="number" class="input" value="90"></div>
      <div class="field"><label>Remarks</label><input id="mRemarks" class="input"></div>
      <div class="full"><button class="btn" onclick="saveTopic()">Save Topic</button></div></div>`;
  }else if(type==="schedule"){
    body=`<h2>Add Timetable Entry</h2><div class="form-grid">
      <div class="field"><label>Topic</label><select id="sTopic">${yearTopics().map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join("")}</select></div>
      <div class="field"><label>Date</label><input id="sDate" type="date" class="input"></div>
      <div class="field"><label>Start</label><input id="sStart" type="time" class="input"></div>
      <div class="field"><label>End</label><input id="sEnd" type="time" class="input"></div>
      <div class="field"><label>Venue</label><input id="sVenue" class="input" value="Mathematics Classroom"></div>
      <div class="field"><label>Remarks</label><input id="sRemarks" class="input" placeholder="What will be covered / remarks"></div>
      <div class="full"><button class="btn" onclick="saveSchedule()">Save Schedule</button></div></div>`;
  }else if(type==="resource"){
    body=`<h2>Add PDF Resource</h2><div class="form-grid">
      <div class="field"><label>Topic</label><select id="rTopic">${yearTopics().map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join("")}</select></div>
      <div class="field"><label>PDF File</label><input id="rFile" type="file" accept="application/pdf" class="input"></div>
      <div class="full note">PDFs are saved in this browser's local storage for this demo. Very large PDFs may exceed browser storage limits.</div>
      <div class="full"><button class="btn" onclick="saveResource()">Save PDF</button></div></div>`;
  }else if(type==="post"){
    body=`<h2>New Discussion</h2><div class="form-grid">
      <div class="field"><label>Topic</label><select id="pTopic">${yearTopics().map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join("")}<option value="">General Discussion</option></select></div>
      <div class="field"><label>Your name</label><input id="pAuthor" class="input" value="${isTrainer()?"Trainer":"Trainee"}"></div>
      <div class="field full"><label>Question / Discussion</label><textarea id="pBody" rows="5"></textarea></div>
      <div class="full"><button class="btn" onclick="savePost()">Post Discussion</button></div></div>`;
  }else if(type.startsWith("reply:")){
    const id=type.split(":")[1];
    body=`<h2>Reply</h2><div class="field"><label>Your name</label><input id="replyAuthor" class="input" value="${isTrainer()?"Trainer":"Trainee"}"></div>
    <div class="field" style="margin-top:12px"><label>Reply</label><textarea id="replyBody" rows="5"></textarea></div>
    <button class="btn" style="margin-top:12px" onclick="saveReply(${id})">Post Reply</button>`;
  }else if(type.startsWith("editTopic:")){
    const id=Number(type.split(":")[1]),t=db.topics.find(x=>x.id===id);
    body=`<h2>Edit Topic</h2><div class="form-grid">
      <input type="hidden" id="eId" value="${id}">
      <div class="field"><label>Year</label><select id="eYear"><option ${t.year==="First Year"?"selected":""}>First Year</option><option ${t.year==="Second Year"?"selected":""}>Second Year</option></select></div>
      <div class="field"><label>Topic Title</label><input id="eTitle" class="input" value="${esc(t.title)}"></div>
      <div class="field full"><label>Topic Details</label><textarea id="eDetails" rows="4">${esc(t.details||"")}</textarea></div>
      <div class="field"><label>Planned Date</label><input id="eDate" type="date" class="input" value="${t.plannedDate||""}"></div>
      <div class="field"><label>Planned Time</label><input id="eTime" type="time" class="input" value="${t.plannedTime||""}"></div>
      <div class="field"><label>Duration</label><input id="eDuration" type="number" class="input" value="${t.duration||90}"></div>
      <div class="field"><label>Remarks</label><input id="eRemarks" class="input" value="${esc(t.remarks||"")}"></div>
      <div class="full"><button class="btn" onclick="updateTopic()">Save Changes</button></div></div>`;
  }
  return `<div class="modal-backdrop" onclick="if(event.target===this){state.modal=null;render()}"><div class="modal"><button class="close" onclick="state.modal=null;render()">✕</button>${body}</div></div>`;
}
function openModal(t){state.modal=t;render()}
function saveTopic(){
  const t={id:uid(db.topics),year:mYear.value,title:mTitle.value.trim(),details:mDetails.value.trim(),plannedDate:mDate.value,plannedTime:mTime.value,duration:Number(mDuration.value||90),remarks:mRemarks.value.trim()};
  if(!t.title)return toast("Enter a topic title.");
  db.topics.push(t);saveDB();state.year=t.year;state.modal=null;render();toast("Topic added.");
}
function editTopic(id){state.modal=`editTopic:${id}`;render()}
function updateTopic(){
  const id=Number(eId.value),t=db.topics.find(x=>x.id===id);if(!t)return;
  Object.assign(t,{year:eYear.value,title:eTitle.value.trim(),details:eDetails.value.trim(),plannedDate:eDate.value,plannedTime:eTime.value,duration:Number(eDuration.value||90),remarks:eRemarks.value.trim()});
  saveDB();state.year=t.year;state.modal=null;render();toast("Topic updated.");
}
function deleteTopic(id){
  if(!confirm("Delete this topic?"))return;
  db.topics=db.topics.filter(x=>x.id!==id);
  db.timetable=db.timetable.filter(x=>x.topicId!==id);
  saveDB();render();toast("Topic deleted.");
}
function saveSchedule(){
  const topicId=Number(sTopic.value);if(!topicId||!sDate.value)return toast("Choose a topic and date.");
  db.timetable.push({id:uid(db.timetable),year:state.year,topicId,date:sDate.value,start:sStart.value,end:sEnd.value,venue:sVenue.value.trim(),remarks:sRemarks.value.trim()});
  saveDB();state.modal=null;render();toast("Timetable entry added.");
}
function deleteSchedule(id){
  if(!confirm("Delete this timetable entry?"))return;
  db.timetable=db.timetable.filter(x=>x.id!==id);saveDB();render();
}
function saveResource(){
  const file=rFile.files[0];if(!file)return toast("Choose a PDF.");
  const reader=new FileReader();
  reader.onload=()=>{
    db.resources.push({id:uid(db.resources),year:state.year,topicId:Number(rTopic.value),name:file.name,dataUrl:reader.result});
    try{saveDB();state.modal=null;render();toast("PDF saved.");}catch(e){toast("PDF is too large for local browser storage.");}
  };
  reader.readAsDataURL(file);
}
function openResource(id){
  const r=db.resources.find(x=>x.id===id);if(!r)return;
  const w=window.open(); if(w) w.location=r.dataUrl;
}
function deleteResource(id){
  if(!confirm("Delete this PDF resource?"))return;
  db.resources=db.resources.filter(x=>x.id!==id);saveDB();render();
}
function savePost(){
  const body=pBody.value.trim();if(!body)return toast("Type your discussion.");
  db.forum.push({id:uid(db.forum),year:state.year,topicId:pTopic.value?Number(pTopic.value):"",author:pAuthor.value.trim()||"User",body,time:new Date().toLocaleString(),replies:[]});
  saveDB();state.modal=null;render();toast("Discussion posted.");
}
function replyTo(id){state.modal=`reply:${id}`;render()}
function saveReply(id){
  const p=db.forum.find(x=>x.id===id);if(!p)return;
  const body=replyBody.value.trim();if(!body)return toast("Type your reply.");
  p.replies.push({author:replyAuthor.value.trim()||"User",body,time:new Date().toLocaleString()});
  saveDB();state.modal=null;render();toast("Reply posted.");
}
render();

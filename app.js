let year=localStorage.year||"First Year",page="topics";
let db=JSON.parse(localStorage.techmtc||"null")||{
topics:[
{id:1,year:"First Year",title:"Sets and Number Systems",details:"Number sets and operations",remarks:"Bring calculator"},
{id:2,year:"Second Year",title:"Trigonometry Applications",details:"Technical applications",remarks:"Bring drawing set"}],
timetable:[],attendance:[],coursework:[],forum:[]
};
function save(){localStorage.techmtc=JSON.stringify(db)}
function setYear(y){year=y;localStorage.year=y;render()}
function addTopic(){
let title=prompt("Topic title"); if(!title)return;
let details=prompt("Topic details")||"";
let remarks=prompt("Remarks")||"";
db.topics.push({id:Date.now(),year,title,details,remarks});save();render()
}
function render(){
const a=document.getElementById("app");
if(page==="topics"){
let x=db.topics.filter(t=>t.year===year);
a.innerHTML=`<div class="row"><h2>${year} Topics</h2><button class="btn" onclick="addTopic()">+ Add</button></div>`+
(x.map(t=>`<div class="card"><b>${t.title}</b><p>${t.details}</p><span class="tag">${t.remarks||"No remarks"}</span></div>`).join("")||"<div class=card>No topics yet.</div>");
}else if(page==="timetable"){
a.innerHTML=`<h2>Timetable</h2><div class="card">Use Topics to add class topics. Timetable scheduling will be connected to your shared website in the online version.</div>`;
}else if(page==="attendance"){
a.innerHTML=`<h2>Attendance</h2><div class="card">Attendance list for ${year}. The trainer can record attendance in the full TechMtc version.</div>`;
}else if(page==="coursework"){
a.innerHTML=`<h2>Course Work</h2><div class="card">Manual course work marks for ${year} trainees.</div>`;
}else{
a.innerHTML=`<h2>Forum</h2><div class="card">Follow-up questions and class discussions.</div>`;
}}
render();

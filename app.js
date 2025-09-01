/* Fan Bubble App JS
 * Handles member list, profile view, chat view, nickname storage, data loading.
 * 추가: 9:16 화면 비율 자동 조정 (짧은 쪽 기준)
 */

const MEMBER_LIST = [
  {id:"Gunil", display:"건일"},
  {id:"Jeongsu", display:"정수"},
  {id:"Gaon", display:"가온"},
  {id:"Ode", display:"오드"},
  {id:"Junhan", display:"준한"},
  {id:"Jooyeon", display:"주연"},
];

/* 유틸리티 함수 */
function qs(sel,root=document){return root.querySelector(sel);}
function qsa(sel,root=document){return [...root.querySelectorAll(sel)];}
function getParam(name){
  const p=new URLSearchParams(location.search);
  return p.get(name);
}
function getNickname(){
  return localStorage.getItem("fanNickname") || "";
}
function setNickname(nick){
  localStorage.setItem("fanNickname", nick);
}
function getMemberDisplay(id){
  const m = MEMBER_LIST.find(x=>x.id===id);
  return m ? m.display : id;
}
function profileSrc(id){
  return `images/${id}_profile.jpg`;
}
function backgroundSrc(id){
  return `images/${id}_background.jpg`;
}
function dataSrc(id){
  return `data/${id}.csv`;
}
function formatDateK(dateStr){
  const d = new Date(dateStr);
  if(!isNaN(d.getTime())){
    const y=d.getFullYear();
    const m=d.getMonth()+1;
    const day=d.getDate();
    const weekday=["일","월","화","수","목","금","토"][d.getDay()];
    return `${y}년 ${m}월 ${day}일 ${weekday}요일`;
  }
  return dateStr;
}

/* ========== 화면 비율 조정 ========== */
function adjustAspectRatio() {
  const appFrame = document.querySelector(".app-frame");
  if(!appFrame) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let width, height;

  if(vw < vh) {
    // 세로가 긴 경우 (폰 기본)
    height = vh;
    width = height * 9 / 16;
  } else {
    // 가로가 긴 경우 (태블릿/가로모드)
    width = vw;
    height = width * 16 / 9;
  }

  appFrame.style.width = `${width}px`;
  appFrame.style.height = `${height}px`;
  appFrame.style.margin = '0 auto';
}
window.addEventListener('resize', adjustAspectRatio);
window.addEventListener('load', adjustAspectRatio);

/* ========== 닉네임 모달 ========== */
function openNickModal(){
  qs("#nickModal").classList.remove("hidden");
}
function closeNickModal(){
  qs("#nickModal").classList.add("hidden");
}
function saveNickname(){
  const val = qs("#nickInput").value.trim();
  if(val){
    setNickname(val);
    closeNickModal();
  }
}

/* ========== 아카이브 목록 (Members) ========== */
function renderArchiveList(){
  const listEl = qs("#archiveList");
  if(!listEl) return;
  listEl.innerHTML = "";
  MEMBER_LIST.forEach(m=>{
    const row = document.createElement("a");
    row.className = "archive-row";
    row.href = `member.html?id=${m.id}`;
    row.innerHTML = `
      <div class="archive-row-avatar-wrap">
        <img class="archive-row-avatar" src="${profileSrc(m.id)}" alt="${m.display}">
      </div>
      <div class="archive-row-name">${m.display}</div>
    `;
    listEl.appendChild(row);
  });
}

/* ========== 프로필 페이지 ========== */
function loadMemberProfile(){
  const memberId = getParam("id");
  if(!memberId) return;
  qs("#memberProfile").src = profileSrc(memberId);
  qs("#memberDisplayName").textContent = getMemberDisplay(memberId);
  qs("#memberBg").src = backgroundSrc(memberId);

  qs("#viewChatBtn").addEventListener("click",()=>{
    location.href = `chat.html?id=${memberId}`;
  });
}

/* ========== 채팅 페이지 ========== */
async function loadChat(){
  const memberId = getParam("id");
  if(!memberId) return;

  qs("#chatMemberName").textContent = getMemberDisplay(memberId);

  const nick = getNickname();
  if(!nick){
    openNickModal();
    return;
  }

  const res = await fetch(dataSrc(memberId));
  const text = await res.text();
  const rows = text.trim().split("\n").slice(1).map(r=>r.split(","));
  const chatWrap = qs("#chatScroll");

  rows.forEach(r=>{
    const [date,time,textVal,from,type,media] = r;
    const msgElWrap = document.createElement("div");
    msgElWrap.className = "chat-msg-wrap";

    const msgEl = document.createElement("div");
    msgEl.className = "chat-msg";

    if(type === "text"){
      msgEl.textContent = textVal;
    } else if(type === "image"){
      const img = document.createElement("img");
      img.src = media;
      img.className = "chat-media-image";
      msgEl.appendChild(img);
    } else if(type === "video" || type === "vedio"){
      const vid = document.createElement("video");
      vid.src = media;
      vid.className = "chat-media-video";
      vid.controls = true;
      msgEl.appendChild(vid);
    }

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    meta.textContent = time;
    msgElWrap.appendChild(msgEl);
    msgElWrap.appendChild(meta);
    chatWrap.appendChild(msgElWrap);
  });

  // 맨 아래로 스크롤
  chatWrap.scrollTop = chatWrap.scrollHeight;
}

/* ========== 초기화 ========== */
window.addEventListener("DOMContentLoaded",()=>{
  if(qs("#archiveList")) renderArchiveList();
  if(qs("#memberProfile")) loadMemberProfile();
  if(qs("#chatScroll")) loadChat();

  if(!getNickname()) openNickModal();
});

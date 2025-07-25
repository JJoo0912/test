/* app.js */

/* 전역 상수 및 설정 */
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
  const username = 'JJoo0912';
  const repoName = 'test';
  const branch = 'main';
  return `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/data/${id}.csv`;
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

/* 아카이브 페이지 초기화 */
function initArchive(){
  const listEl = qs("#archiveList");
  if(!listEl) return;
  MEMBER_LIST.forEach(m=>{
    const row=document.createElement("a");
    row.className="archive-row";
    row.href=`member.html?m=${m.id}`;
    row.innerHTML=`
      <span class="archive-row-avatar-wrap">
        <img class="archive-row-avatar" src="${profileSrc(m.id)}" alt="${m.display}"
             onerror="this.src='images/default_profile.jpg'">
      </span>
      <span class="archive-row-name">${m.display}</span>
      <span class="archive-row-status"> </span>
    `;
    listEl.appendChild(row);
  });
}

/* 멤버 프로필 페이지 초기화 */
function initMember(){
  const id=getParam("m");
  if(!id) {
    console.warn("Member ID not found in URL for member.html");
    return;
  }
  const disp=getMemberDisplay(id);
  const bg=qs("#memberBg");
  const prof=qs("#memberProfile");
  const nameEl=qs("#memberDisplayName");
  const btn=qs("#viewChatBtn");
  if(bg) bg.src=backgroundSrc(id);
  if(prof){
    prof.src=profileSrc(id);
    prof.onerror=()=>{prof.src="images/default_profile.jpg";}
  }
  if(nameEl) nameEl.textContent=disp;
  if(btn){
    btn.addEventListener("click",()=>{ location.href=`chat.html?m=${id}`; });
  }
}

/* 채팅 페이지 초기화 */
let currentMemberId=null;
function initChat(){
  const id=getParam("m");
  if(!id) {
    console.warn("Member ID not found in URL for chat.html");
    return;
  }
  currentMemberId=id;
  const disp=getMemberDisplay(id);
  const titleEl=qs("#chatMemberName");
  if(titleEl) titleEl.textContent=disp;

  openNickModal(); // 닉네임 유무와 상관없이 항상 모달을 띄움
}

// CSV 텍스트를 파싱하여 JSON 객체 배열로 변환
function parseCsv(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = [];
    let inQuote = false;
    let currentVal = '';
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' && (j === 0 || line[j-1] === ',' || inQuote)) {
        if (inQuote && j + 1 < line.length && line[j+1] === '"') {
          currentVal += '"';
          j++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        values.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index].trim() : '';
    });
    result.push(row);
  }
  return result;
}

// 채팅 데이터 비동기 로드
async function loadChatData(id){
  const box=qs("#chatScroll");
  if(!box) return;
  box.innerHTML="<div class='chat-date-sep'>채팅 데이터 불러오는 중...</div>";
  try{
    const res=await fetch(dataSrc(id));
    if(!res.ok) {
      let errorMessage = `데이터를 불러올 수 없어요. (오류 코드: ${res.status})`;
      if (res.status === 404) {
        errorMessage = `데이터 파일이 없거나 경로가 잘못되었습니다. (${id}.csv 확인)`;
      } else if (res.status >= 500) {
        errorMessage = `서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`;
      }
      throw new Error(errorMessage);
    }
    const csvText = await res.text();
    const data = parseCsv(csvText);
    if (data.length === 0) {
      box.innerHTML = "<div class='chat-date-sep'>아직 채팅 데이터가 없어요.</div>";
      return;
    }
    renderChat(box, data, id);
  }catch(err){
    box.innerHTML=`<div class='chat-date-sep'>${err.message || "알 수 없는 오류가 발생했어요."}</div>`;
    console.error("Failed to load chat data:", err);
  }
}

// 채팅 UI 렌더링
function renderChat(box, data, memberId){
  box.innerHTML="";
  const fanNick=getNickname() || "빌런즈";
  let lastDate=null;
  data.forEach(msg=>{
    if(msg.date && msg.date!==lastDate){
      const sep=document.createElement("div");
      sep.className="chat-date-sep";
      sep.textContent=formatDateK(msg.date);
      box.appendChild(sep);
      lastDate=msg.date;
    }
    
    // chat-msg-wrap을 flexbox 컨테이너로 사용하여 말풍선과 시간을 같은 줄에 배치
    const msgWrap = document.createElement("div");
    msgWrap.className = "chat-msg-wrap"; // flexbox 컨테이너 역할

    const msgContent = document.createElement("div"); // 메시지 내용이 들어갈 컨테이너
    msgContent.className = `chat-msg artist`; // 기존 말풍선 스타일 유지

    // msg.type에 따라 내용 렌더링 분기
    if (msg.type === 'image' && msg.media) {
      const img = document.createElement("img");
      img.src = msg.media;
      img.alt = "채팅 이미지";
      img.className = "chat-media-image"; // CSS 스타일링을 위한 클래스
      msgContent.appendChild(img);
    } else if (msg.type === 'video' && msg.media) {
      const video = document.createElement("video");
      video.src = msg.media;
      video.controls = true; // 동영상 컨트롤 표시 (재생/정지 등)
      video.className = "chat-media-video"; // CSS 스타일링을 위한 클래스
      msgContent.appendChild(video);
    } else if (msg.text && msg.text.trim() !== '') {
      // 기본 텍스트 메시지
      const msgText = document.createTextNode(msg.text.replace(/\(name\)/g, fanNick));
      msgContent.appendChild(msgText);
    } else {
      // 내용이 없는 메시지는 건너뛰기
      console.warn("Skipping message with no content:", msg);
      return;
    }

    // 완성된 메시지 내용 컨테이너(msgContent)를 msgWrap에 추가
    msgWrap.appendChild(msgContent);
    
    // 시간 정보(meta)를 msgDiv가 아닌 msgWrap의 자식으로 추가
    if (msg.time) { // msg.text 유무 검사 제거 (이미지/동영상도 시간 표시해야 하므로)
      const meta = document.createElement("div");
      meta.className = "chat-meta";
      meta.textContent = msg.time;
      msgWrap.appendChild(meta); // msgWrap의 직접 자식으로 추가
    }
    
    box.appendChild(msgWrap);
  });
  box.scrollTop = box.scrollHeight;
}

/* 닉네임 설정 모달 관련 함수 */
function openNickModal(){
  const m=qs("#nickModal");
  if(m) m.classList.remove("hidden");
  const inp=qs("#nickInput");
  if(inp) inp.focus();
}
function closeNickModal(){
  const m=qs("#nickModal");
  if(m) m.classList.add("hidden");
}
// 닉네임 저장 시 현재 채팅 데이터 로드
function saveNickname(){
  const inp=qs("#nickInput");
  const nick=(inp?.value||"").trim();
  if(nick){
    setNickname(nick);
    closeNickModal();
    if(currentMemberId){
      loadChatData(currentMemberId);
    }
  } else {
    alert("닉네임을 입력해주세요!");
  }
}

/* 페이지 로드 시 초기화 함수 실행 */
document.addEventListener("DOMContentLoaded",()=>{
  const path=location.pathname;
  if(path.endsWith("index.html") || path.endsWith("/")){
    initArchive();
  }else if(path.endsWith("member.html")){
    initMember();
  }else if(path.endsWith("chat.html")){
    initChat();
  }
});

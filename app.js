const MEMBER_LIST = [
  { id: "Gunil", display: "건일" },
  { id: "Jeongsu", display: "정수" },
  { id: "Gaon", display: "가온" },
  { id: "Ode", display: "오드" },
  { id: "Junhan", display: "준한" },
  { id: "Jooyeon", display: "주연" }
];

/* 화면 비율 9:16 유지 */
function setAppAspectRatio() {
  const app = document.getElementById("app");
  const w = window.innerWidth;
  const h = window.innerHeight;
  const short = Math.min(w, h);
  const long = Math.max(w, h);

  let appW, appH;

  if (short === h) {
    appH = short;
    appW = (appH / 16) * 9;
  } else {
    appW = short;
    appH = (appW / 9) * 16;
    if (appH > long) appH = long;
  }

  app.style.width = `${appW}px`;
  app.style.height = `${appH}px`;
}
window.addEventListener("resize", setAppAspectRatio);
window.addEventListener("load", setAppAspectRatio);

/* 닉네임 관리 */
function getNickname() { return localStorage.getItem("nickname"); }
function saveNickname() {
  const input = document.getElementById("nickInput");
  const nick = input.value.trim();
  if (nick) { localStorage.setItem("nickname", nick); closeNickModal(); openChatIfPending(); }
}
function openNickModal() { document.getElementById("nickModal").classList.remove("hidden"); }
function closeNickModal() { document.getElementById("nickModal").classList.add("hidden"); }

/* 아카이브 렌더링 */
function renderArchive() {
  const archiveList = document.getElementById("archiveList");
  if (!archiveList) return;
  archiveList.innerHTML = "";
  MEMBER_LIST.forEach(member => {
    const row = document.createElement("a");
    row.className = "archive-row";
    row.href = `member.html?member=${member.id}`;
    row.innerHTML = `
      <div class="archive-row-avatar-wrap">
        <img class="archive-row-avatar" src="images/${member.id}_profile.jpg" alt="${member.display}">
      </div>
      <div class="archive-row-name">${member.display}</div>
    `;
    archiveList.appendChild(row);
  });
}

/* 채팅 불러오기 */
async function loadChat(memberId) {
  const chatScroll = document.getElementById("chatScroll");
  if (!chatScroll) return;
  const res = await fetch(`data/${memberId}.csv`);
  const csvText = await res.text();
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  chatScroll.innerHTML = "";

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const msgObj = {};
    headers.forEach((h, idx) => msgObj[h.trim()] = cols[idx]?.trim());
    const msgWrap = document.createElement("div");
    msgWrap.className = "chat-msg-wrap";
    const msgContent = document.createElement("div");
    msgContent.className = "chat-msg";

    if (msgObj.type === "text") msgContent.textContent = msgObj.text;
    else if (msgObj.type === "image") {
      const img = document.createElement("img");
      img.src = msgObj.media; 
      img.className="chat-media-image"; 
      msgContent.appendChild(img);
      img.addEventListener("click", () => openMediaPopup(img.src, "image"));
      img.addEventListener("touchstart", () => openMediaPopup(img.src, "image"));
    }
    else if (msgObj.type === "video" || msgObj.type === "vedio") {
      const vid = document.createElement("video");
      vid.src = msgObj.media; 
      vid.className="chat-media-video"; 
      vid.controls=true;
      msgContent.appendChild(vid);
      vid.addEventListener("click", () => openMediaPopup(vid.src, "video"));
      vid.addEventListener("touchstart", () => openMediaPopup(vid.src, "video"));
    }

    const meta = document.createElement("div");
    meta.className = "chat-meta"; 
    meta.textContent = msgObj.time || "";
    msgWrap.appendChild(msgContent); 
    msgWrap.appendChild(meta);
    chatScroll.appendChild(msgWrap);
  }
  chatScroll.scrollTop = chatScroll.scrollHeight;
}

/* 이미지/동영상 팝업 기능 */
function openMediaPopup(src, type) {
  const popup = document.getElementById("mediaPopup");
  const content = document.getElementById("mediaPopupContent");
  const downloadBtn = document.getElementById("mediaPopupDownload");
  content.innerHTML = "";

  if (type === "image") {
    const img = document.createElement("img");
    img.src = src;
    content.appendChild(img);
  } else if (type === "video") {
    const vid = document.createElement("video");
    vid.src = src;
    vid.controls = true;
    content.appendChild(vid);
  }

  downloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 24 24">
      <path d="M5 18h14v-2H5v2zm7-2l-7-7h4V4h6v5h4l-7 7z"/>
    </svg>
  `;
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = src;
    a.download = src.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  popup.classList.remove("hidden");
}

function closeMediaPopup() {
  const popup = document.getElementById("mediaPopup");
  const content = document.getElementById("mediaPopupContent");
  const downloadBtn = document.getElementById("mediaPopupDownload");
  popup.classList.add("hidden");
  content.innerHTML = "";
  downloadBtn.innerHTML = "";
  downloadBtn.onclick = null;
}

/* 채팅 페이지 초기화 */
function initChatPage() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (!memberId) return;
  const displayName = MEMBER_LIST.find(m => m.id === memberId)?.display || memberId;
  document.getElementById("chatMemberName").textContent = displayName;
  if (!getNickname()) openNickModal();
  else loadChat(memberId);
}

function openChatIfPending() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (memberId) loadChat(memberId);
}

/* 멤버 프로필 페이지 초기화 */
function initMemberPage() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (!memberId) return;
  const member = MEMBER_LIST.find(m => m.id === memberId);
  if (!member) return;

  const profileImg = document.getElementById("memberProfile");
  const bgImg = document.getElementById("memberBg");

  profileImg.src = `images/${member.id}_profile.jpg`;
  bgImg.src = `images/${member.id}_background.jpg`;

  // 클릭 + 터치 이벤트 모두 등록
  function openProfilePopup() { openMediaPopup(profileImg.src, "image"); }
  function openBgPopup() { openMediaPopup(bgImg.src, "image"); }

  profileImg.addEventListener("click", openProfilePopup);
  profileImg.addEventListener("touchstart", openProfilePopup);

  bgImg.addEventListener("click", openBgPopup);
  bgImg.addEventListener("touchstart", openBgPopup);

  // 전체 채팅 보기 버튼
  document.getElementById("viewChatBtn").addEventListener("click", () => {
    window.location.href = `chat.html?member=${member.id}`;
  });

  // 닫기 버튼
  const exitBtn = document.createElement("button");
  exitBtn.className = "exit-button";
  exitBtn.textContent = "✕";
  exitBtn.addEventListener("click", () => window.history.back());
  document.getElementById("app").appendChild(exitBtn);
}

/* 초기화 */
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("archiveList")) renderArchive();
  if (document.getElementById("chatScroll")) initChatPage();
  if (document.getElementById("memberDisplayName")) initMemberPage();
});

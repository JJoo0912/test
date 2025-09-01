/* app.js - 원본 기능 유지 + 화면 비율 9:16 적용 */

const MEMBER_LIST = [
  { id: "Gunil", display: "건일" },
  { id: "Jeongsu", display: "정수" },
  { id: "Gaon", display: "가온" },
  { id: "Ode", display: "오드" },
  { id: "Junhan", display: "준한" },
  { id: "Jooyeon", display: "주연" }
];

/* ======================================
   화면 비율 9:16 유지
   - 세로 기준으로 전체 화면 길이 적용
   - 16을 세로 기준, 가로는 자동 계산
====================================== */
function setAppAspectRatio() {
  const app = document.getElementById("app");
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  const longSide = (shortSide / 9) * 16;
  
  if (window.innerHeight < window.innerWidth) {
    // 가로가 길 경우 (태블릿 가로 모드 등)
    app.style.width = `${longSide}px`;
    app.style.height = `${shortSide}px`;
  } else {
    app.style.width = `${shortSide}px`;
    app.style.height = `${longSide}px`;
  }
}
window.addEventListener("resize", setAppAspectRatio);
window.addEventListener("load", setAppAspectRatio);

/* ======================================
   닉네임 관리
====================================== */
function getNickname() {
  return localStorage.getItem("nickname");
}

function saveNickname() {
  const input = document.getElementById("nickInput");
  const nick = input.value.trim();
  if (nick) {
    localStorage.setItem("nickname", nick);
    closeNickModal();
    openChatIfPending();
  }
}

function openNickModal() {
  document.getElementById("nickModal").classList.remove("hidden");
}

function closeNickModal() {
  document.getElementById("nickModal").classList.add("hidden");
}

/* ======================================
   아카이브(멤버 리스트) 렌더링
====================================== */
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

/* ======================================
   채팅 불러오기
   - CSV 형식: data/(멤버명).csv
   - text, image, video 지원
====================================== */
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

    if (msgObj.type === "text") {
      msgContent.textContent = msgObj.text;
    } else if (msgObj.type === "image") {
      const img = document.createElement("img");
      img.src = msgObj.media;
      img.className = "chat-media-image";
      msgContent.appendChild(img);
    } else if (msgObj.type === "video" || msgObj.type === "vedio") {
      const vid = document.createElement("video");
      vid.src = msgObj.media;
      vid.className = "chat-media-video";
      vid.controls = true;
      msgContent.appendChild(vid);
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

/* ======================================
   채팅 페이지 초기화
====================================== */
function initChatPage() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (!memberId) return;

  const displayName = MEMBER_LIST.find(m => m.id === memberId)?.display || memberId;
  document.getElementById("chatMemberName").textContent = displayName;

  // 닉네임 확인
  if (!getNickname()) {
    openNickModal();
  } else {
    loadChat(memberId);
  }
}

function openChatIfPending() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (memberId) loadChat(memberId);
}

/* ======================================
   멤버 프로필 페이지
====================================== */
function initMemberPage() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (!memberId) return;

  const member = MEMBER_LIST.find(m => m.id === memberId);
  if (!member) return;

  const displayNameEl = document.getElementById("memberDisplayName");
  const profileImg = document.getElementById("memberProfile");
  const bgImg = document.getElementById("memberBg");

  displayNameEl.textContent = member.display;
  profileImg.src = `images/${member.id}_profile.jpg`;
  bgImg.src = `images/${member.id}_background.jpg`;

  const chatBtn = document.getElementById("viewChatBtn");
  chatBtn.addEventListener("click", () => {
    window.location.href = `chat.html?member=${member.id}`;
  });
}

/* ======================================
   초기화
====================================== */
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("archiveList")) renderArchive();
  if (document.getElementById("chatScroll")) initChatPage();
  if (document.getElementById("memberDisplayName")) initMemberPage();
});

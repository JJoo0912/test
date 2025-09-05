// ==========================
// Xdinary Heroes Fan Bubble App JS
// ==========================

// 멤버 리스트
const MEMBER_LIST = [
  { id: "Gunil", display: "건일 선배", status: " " },
  { id: "Jeongsu", display: "정수", status: " " },
  { id: "Gaon", display: "지석", status: "🇰🇷" },
  { id: "Ode", display: "뜽이", status: "밥밥디라라" },
  { id: "Junhan", display: "형준", status: "Iari basilio - Your love" },
  { id: "Jooyeon", display: "쭈쿠나쭈타타", status: "전설? Get 했다." }
];

const defaultNick = "빌런즈";

// ==========================
// 화면 비율 9:16 유지
// ==========================
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

// ==========================
// 닉네임 관리
// ==========================
function getNickname(memberId) { return localStorage.getItem(memberId + "Name"); }

function openNickModal(member) {
  currentMember = member;
  document.getElementById("modalMemberName").textContent = member.display;
  document.getElementById("nickInput").value = getNickname(member.id) || "";
  document.getElementById("nicknameModal").classList.remove("hidden");
}

function closeNickModal() {
  document.getElementById("nicknameModal").classList.add("hidden");
  currentMember = null;
}

function saveNickname() {
  const input = document.getElementById("nickInput");
  const nick = input.value.trim() || defaultNick;
  if (!currentMember) return;

  // 저장
  localStorage.setItem(currentMember.id + "Name", nick);

  // 표시 업데이트
  const nickText = document.getElementById(currentMember.id + "Nick");
  if (nickText) nickText.textContent = `${currentMember.display} -> ${nick}`;

  closeNickModal();
}

// ==========================
// 아카이브 렌더링
// ==========================
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

// ==========================
// 채팅 불러오기
// ==========================
async function loadChat(memberId) {
  const chatScroll = document.getElementById("chatScroll");
  if (!chatScroll) return;
  const res = await fetch(`data/${memberId}.csv`);
  const csvText = await res.text();
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  chatScroll.innerHTML = "";

  let lastDateStr = null; //날짜 구분선용
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    const msgObj = {};
    headers.forEach((h, idx) => msgObj[h.trim()] = cols[idx]?.trim());

    //날짜 구분선 추가
    if (msgObj.date) {
      const msgDate = new Date(msgObj.date);
      const dateStr = `${msgDate.getFullYear()}년 ${msgDate.getMonth()+1}월 ${msgDate.getDate()}일 ${["일","월","화","수","목","금","토"][msgDate.getDay()]}요일`;
      if (dateStr !== lastDateStr) {
        const dateDivider = document.createElement("div");
        dateDivider.className = "chat-date-divider";
        const span = document.createElement("span");
              span.textContent = dateStr;
        dateDivider.appendChild(span);
        chatScroll.appendChild(dateDivider);
        lastDateStr = dateStr;
      }
    }
    
    const msgWrap = document.createElement("div");
    msgWrap.className = "chat-msg-wrap";
    const msgContent = document.createElement("div");
    msgContent.className = "chat-msg";

    if (msgObj.type === "text") {
      msgContent.textContent = replaceNickname(msgObj.text, memberId);
    }
    else if (msgObj.type === "image") {
      const img = document.createElement("img");
      img.src = msgObj.media;
      img.className = "chat-media-image";
      msgContent.appendChild(img);
      img.addEventListener("click", () => openMediaPopup(img.src, "image"));
      img.addEventListener("touchstart", () => openMediaPopup(img.src, "image"));
    }
    else if (msgObj.type === "video" || msgObj.type === "vedio") {
      const vid = document.createElement("video");
      vid.src = msgObj.media;
      vid.className = "chat-media-video";
      vid.controls = true;
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

// (name) 치환
function replaceNickname(text, memberId) {
  const nick = getNickname(memberId) || defaultNick;
  return text.replace(/\(name\)/g, nick);
}

// ==========================
// 채팅 페이지 초기화
// ==========================
function initChatPage() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (!memberId) return;
  const displayName = MEMBER_LIST.find(m => m.id === memberId)?.display || memberId;
  document.getElementById("chatMemberName").textContent = displayName;
  if (!getNickname(memberId)) openNickModal(MEMBER_LIST.find(m => m.id === memberId));
  else loadChat(memberId);
}

function openChatIfPending() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (memberId) loadChat(memberId);
}

// ==========================
// 이미지/동영상 팝업
// ==========================
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

// ==========================
// 멤버 페이지 초기화
// ==========================
function initMemberPage() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (!memberId) return;
  const member = MEMBER_LIST.find(m => m.id === memberId);
  if (!member) return;

  document.getElementById("memberDisplayName").textContent = member.display;
  document.getElementById("memberStatus").textContent = member.status;

  const profileImg = document.getElementById("memberProfile");
  const bgImg = document.getElementById("memberBg");

  profileImg.src = `images/${member.id}_profile.jpg`;
  bgImg.src = `images/${member.id}_background.jpg`;

  profileImg.onerror = () => profileImg.src = "images/default_profile.jpg";
  bgImg.onerror = () => bgImg.src = "images/default_background.jpg";

  // ==========================
// 이미지 히스토리 팝업 (구현방안 2)
// ==========================

// 히스토리 팝업 상태
let mediaGallery = null; 
// 형태: { items: string[], index: number, type: 'image' | 'video' }

function createOrUpdateNavButtons() {
  // 컨테이너
  const card = document.querySelector(".media-popup-card");
  if (!card) return;

  // 기존 버튼 제거(중복 방지)
  const oldPrev = card.querySelector(".media-nav-prev");
  const oldNext = card.querySelector(".media-nav-next");
  const oldInfo = card.querySelector(".media-nav-info");
  if (oldPrev) oldPrev.remove();
  if (oldNext) oldNext.remove();
  if (oldInfo) oldInfo.remove();

  // 갤러리 모드가 아니면 버튼 X
  if (!mediaGallery || !mediaGallery.items || mediaGallery.items.length <= 1) return;

  // 이전/다음 버튼 + 현재위치 표시 생성
  const prevBtn = document.createElement("button");
  prevBtn.className = "media-nav-prev";
  prevBtn.textContent = "<";

  const nextBtn = document.createElement("button");
  nextBtn.className = "media-nav-next";
  nextBtn.textContent = ">";

  const info = document.createElement("div");
  info.className = "media-nav-info";

  // 이벤트
  prevBtn.addEventListener("click", () => {
    // 왼쪽: "현재 설정된 이미지" 쪽으로 이동 (index 감소)
    if (!mediaGallery) return;
    if (mediaGallery.index > 0) {
      mediaGallery.index--;
      setMediaPopupContent(mediaGallery.items[mediaGallery.index], mediaGallery.type);
      updateNavState();
    }
  });

  nextBtn.addEventListener("click", () => {
    // 오른쪽: 과거로 이동 (index 증가)
    if (!mediaGallery) return;
    if (mediaGallery.index < mediaGallery.items.length - 1) {
      mediaGallery.index++;
      setMediaPopupContent(mediaGallery.items[mediaGallery.index], mediaGallery.type);
      updateNavState();
    }
  });

  // 카드에 부착
  card.appendChild(prevBtn);
  card.appendChild(nextBtn);
  card.appendChild(info);

  // 초기 상태 반영
  updateNavState();
}

function updateNavState() {
  if (!mediaGallery) return;
  const card = document.querySelector(".media-popup-card");
  const prevBtn = card.querySelector(".media-nav-prev");
  const nextBtn = card.querySelector(".media-nav-next");
  const info    = card.querySelector(".media-nav-info");

  // 위치 표기: "현재(1)/총 N" 보다는 "현재/총" 표기
  info.textContent = `${mediaGallery.index + 1} / ${mediaGallery.items.length}`;

  // 비활성화 로직
  if (prevBtn) prevBtn.disabled = (mediaGallery.index === 0);
  if (nextBtn) nextBtn.disabled = (mediaGallery.index === mediaGallery.items.length - 1);
}

// 팝업 content 교체 (이미지/비디오 공용)
function setMediaPopupContent(src, type) {
  const content = document.getElementById("mediaPopupContent");
  if (!content) return;
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
}

// 이미지 존재 여부 체크 (비동기)
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// 멤버별 히스토리 목록 구성
// kind: 'profile' | 'background'
async function buildHistoryList(memberId, kind) {
  // 현재 이미지
  const current =
    kind === "profile"
      ? `images/${memberId}_profile.jpg`
      : `images/${memberId}_background.jpg`;

  // 히스토리 이미지: images/history/{kind}/{memberId}_{num}.jpg
  const folder = kind === "profile" ? "profile" : "background";
  const MAX_CHECK = 50; // 필요 시 늘릴 수 있음
  const found = [];

  // 1부터 MAX_CHECK까지 존재하는 번호를 모읍니다.
  for (let n = 1; n <= MAX_CHECK; n++) {
    const url = `images/history/${folder}/${memberId}_${n}.jpg`;
    // 존재하면 목록에 추가
    /* eslint-disable no-await-in-loop */
    const exists = await checkImageExists(url);
    if (exists) found.push({ num: n, url });
  }

  // 요구사항: 숫자가 클수록 최근. 오른쪽(>)을 누르면 가장 큰 숫자부터 내려가며 보이게.
  // 팝업 진입 순서: [현재, ... (큰숫자 → 작은숫자)]
  found.sort((a, b) => b.num - a.num); // 큰 → 작은
  const historyUrls = found.map(x => x.url);

  return [current, ...historyUrls];
}

// 히스토리 팝업 열기
async function openImageHistoryPopup(memberId, kind) {
  // 목록 구성
  const items = await buildHistoryList(memberId, kind);

  // 상태 세팅 (이미지는 전부 image)
  mediaGallery = { items, index: 0, type: "image" };

  // 공용 모달 열기 + 콘텐츠 세팅
  const popup = document.getElementById("mediaPopup");
  const downloadBtn = document.getElementById("mediaPopupDownload");

  setMediaPopupContent(items[0], "image");

  // 다운로드 버튼 유지
  downloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="white" viewBox="0 0 24 24">
      <path d="M5 18h14v-2H5v2zm7-2l-7-7h4V4h6v5h4l-7 7z"/>
    </svg>
  `;
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = mediaGallery.items[mediaGallery.index];
    a.download = a.href.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 네비게이션 버튼 구성
  createOrUpdateNavButtons();

  // 모달 표시
  popup.classList.remove("hidden");
}

// closeMediaPopup 확장: 갤러리 상태 초기화
const _origCloseMediaPopup = closeMediaPopup;
closeMediaPopup = function () {
  mediaGallery = null; // 상태 리셋

  // 네비 버튼/인포 제거
  const card = document.querySelector(".media-popup-card");
  if (card) {
    const oldPrev = card.querySelector(".media-nav-prev");
    const oldNext = card.querySelector(".media-nav-next");
    const oldInfo = card.querySelector(".media-nav-info");
    if (oldPrev) oldPrev.remove();
    if (oldNext) oldNext.remove();
    if (oldInfo) oldInfo.remove();
  }
  // 원래 닫기 로직 수행
  _origCloseMediaPopup();
};
  document.getElementById("viewChatBtn").addEventListener("click", () => {
    window.location.href = `chat.html?member=${member.id}`;
  });

  const exitBtn = document.createElement("button");
  exitBtn.className = "exit-button";
  exitBtn.textContent = "✕";
  exitBtn.addEventListener("click", () => window.history.back());
  document.getElementById("app").appendChild(exitBtn);
}

// ==========================
// 탭바 이동 및 초기화
// ==========================
let currentMember = null;

window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("archiveList")) renderArchive();
  if (document.getElementById("chatScroll")) initChatPage();
  if (document.getElementById("memberDisplayName")) initMemberPage();

  // 탭바
  const membersBtn = document.getElementById("tabMembersBtn");
  const settingBtn = document.getElementById("tabSettingBtn");
  const nicknameBtn = document.getElementById("openNicknameSetting");

  if (membersBtn) {
    membersBtn.addEventListener("click", (e) => {
      if (!window.location.pathname.endsWith("index.html")) {
        window.location.href = "index.html";
      }
    });
  }

  if (settingBtn) {
    settingBtn.addEventListener("click", (e) => {
      if (!window.location.pathname.endsWith("setting.html")) {
        window.location.href = "setting.html";
      }
    });
  }

  if (nicknameBtn) {
    nicknameBtn.addEventListener("click", () => {
      window.location.href = "nickname.html";
    });
  }
});

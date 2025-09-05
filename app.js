// ==========================
// Xdinary Heroes Fan Bubble App JS
// ==========================

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
  if (!memberId) return;
  const chatScroll = document.getElementById("chatScroll");
  if (!chatScroll) return;

  try {
    const res = await fetch(`data/${memberId}.csv`);
    if (!res.ok) throw new Error("CSV 파일을 불러올 수 없습니다.");
    const csvText = await res.text();
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",");
    chatScroll.innerHTML = "";

    let lastDateStr = null;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const msgObj = {};
      headers.forEach((h, idx) => msgObj[h.trim()] = cols[idx]?.trim() || "");

      // 날짜 구분선
      if (msgObj.date) {
        const msgDate = new Date(msgObj.date);
        const dateStr = `${msgDate.getFullYear()}년 ${msgDate.getMonth() + 1}월 ${msgDate.getDate()}일 ${["일","월","화","수","목","금","토"][msgDate.getDay()]}요일`;
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

      // 메시지
      const msgWrap = document.createElement("div");
      msgWrap.className = "chat-msg-wrap";
      const msgContent = document.createElement("div");
      msgContent.className = "chat-msg";

      if (msgObj.type === "text") {
        msgContent.textContent = replaceNickname(msgObj.text, memberId);
      } else if (msgObj.type === "image") {
        const img = document.createElement("img");
        img.src = msgObj.media;
        img.className = "chat-media-image";
        msgContent.appendChild(img);
        img.addEventListener("click", () => openMediaPopup(img.src, "image"));
        img.addEventListener("touchstart", () => openMediaPopup(img.src, "image"));
      } else if (msgObj.type === "video" || msgObj.type === "vedio") {
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
  } catch (error) {
    console.error("채팅 로딩 오류:", error);
    chatScroll.innerHTML = "<div class='chat-error'>채팅을 불러올 수 없습니다.</div>";
  }
}

// (name) 치환
function replaceNickname(text, memberId) {
  if (!text) return "";
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
  const chatNameEl = document.getElementById("chatMemberName");
  if (chatNameEl) chatNameEl.textContent = displayName;

  // 닉네임 모달이 없으면 바로 로딩
  if (typeof getNickname === "function" && !getNickname(memberId)) {
    openNickModal(MEMBER_LIST.find(m => m.id === memberId));
  } else {
    loadChat(memberId);
  }
}

function openChatIfPending() {
  const params = new URLSearchParams(window.location.search);
  const memberId = params.get("member");
  if (memberId) loadChat(memberId);
}

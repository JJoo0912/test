// ==========================
// 멤버 리스트 및 기본 닉네임
// ==========================
const MEMBER_LIST = [
  { id: "Gunil", display: "건일" },
  { id: "Jeongsu", display: "정수" },
  { id: "Gaon", display: "가온" },
  { id: "Ode", display: "오드" },
  { id: "Junhan", display: "준한" },
  { id: "Jooyeon", display: "주연" }
];

const defaultNick = "빌런즈";
let currentMember = null;

// ==========================
// 닉네임 조회
// ==========================
function getNickname(memberId) {
  return localStorage.getItem(memberId + "Name") || defaultNick;
}

// ==========================
// 닉네임 모달 열기
// ==========================
function openNickModal(member) {
  currentMember = member;
  const modal = document.getElementById("nicknameModal") || document.getElementById("nickModal");
  if (!modal) return;

  const input = document.getElementById("nickInput");
  input.value = getNickname(member.id);

  modal.classList.remove("hidden");

  // 모달 제목 (nickname.html용)
  const modalTitle = document.getElementById("modalMemberName");
  if (modalTitle) modalTitle.textContent = member.display;
}

// ==========================
// 닫기
// ==========================
function closeNickModal() {
  const modal = document.getElementById("nicknameModal") || document.getElementById("nickModal");
  if (!modal) return;

  modal.classList.add("hidden");
  currentMember = null;
}

// ==========================
// 저장
// ==========================
function saveNickname() {
  if (!currentMember) return;

  const input = document.getElementById("nickInput");
  const nick = input.value.trim() || defaultNick;

  localStorage.setItem(currentMember.id + "Name", nick);

  // 화면 업데이트
  const nickText = document.getElementById(currentMember.id + "Nick");
  if (nickText) nickText.textContent = `${currentMember.display} -> ${nick}`;

  closeNickModal();
}

// ==========================
// 초기화
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const memberListEl = document.getElementById("nicknameMemberList");
  if (memberListEl) {
    // nickname.html 전용 렌더링
    MEMBER_LIST.forEach(member => {
      const wrap = document.createElement("div");
      wrap.className = "nickname-member-wrap";

      const img = document.createElement("img");
      img.src = `images/${member.id}_profile.jpg`;
      img.alt = member.display;
      img.className = "nickname-member-img";

      const nickText = document.createElement("div");
      nickText.id = `${member.id}Nick`;
      nickText.className = "nickname-text";
      nickText.textContent = `${member.display} -> ${getNickname(member.id)}`;

      wrap.appendChild(img);
      wrap.appendChild(nickText);
      memberListEl.appendChild(wrap);

      img.addEventListener("click", () => openNickModal(member));
    });
  }

  // 모달 버튼 이벤트
  const saveBtn = document.getElementById("saveNickBtn") || document.getElementById("nickSaveBtn");
  if (saveBtn) saveBtn.addEventListener("click", saveNickname);

  const cancelBtn = document.getElementById("cancelNickBtn") || document.getElementById("nickCancelBtn");
  if (cancelBtn) cancelBtn.addEventListener("click", closeNickModal);

  // 뒤로가기 버튼 (nickname.html용)
  const backBtn = document.getElementById("backToSetting");
  if (backBtn) backBtn.addEventListener("click", () => window.location.href = "setting.html");
});

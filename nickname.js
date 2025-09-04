// 멤버 리스트
const MEMBER_LIST = [
  { id: "Gunil", display: "건일" },
  { id: "Jeongsu", display: "정수" },
  { id: "Gaon", display: "가온" },
  { id: "Ode", display: "오드" },
  { id: "Junhan", display: "준한" },
  { id: "Jooyeon", display: "주연" }
];

const defaultNick = "빌런즈";

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  const memberListEl = document.getElementById("nicknameMemberList");
  const displayArea = document.getElementById("nicknameDisplayArea");

  MEMBER_LIST.forEach(member => {
    // 프로필 아이콘
    const wrap = document.createElement("div");
    wrap.className = "nickname-member-wrap";

    const img = document.createElement("img");
    img.src = `images/${member.id}_profile.jpg`;
    img.className = "nickname-member-img";
    img.alt = member.display;

    // 닉네임 표시
    const nickText = document.createElement("div");
    nickText.className = "nickname-text";
    nickText.id = `${member.id}Nick`;
    nickText.textContent = `${member.display} -> ${localStorage.getItem(member.id + "Name") || defaultNick}`;

    wrap.appendChild(img);
    wrap.appendChild(nickText);
    memberListEl.appendChild(wrap);

    // 클릭 시 모달 열기
    img.addEventListener("click", () => openNickModal(member));
  });

  // 모달 버튼 이벤트
  document.getElementById("saveNickBtn").addEventListener("click", saveNickname);
  document.getElementById("cancelNickBtn").addEventListener("click", closeNickModal);
});

// 선택 멤버 저장
let currentMember = null;
function openNickModal(member) {
  currentMember = member;
  document.getElementById("modalMemberName").textContent = member.display;
  document.getElementById("nickInput").value = localStorage.getItem(member.id + "Name") || "";
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
  nickText.textContent = `${currentMember.display} -> ${nick}`;

  closeNickModal();
}

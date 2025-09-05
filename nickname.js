// 멤버 리스트
const MEMBER_LIST = [
  { id: "Gunil", display: "건일 선배" },
  { id: "Jeongsu", display: "정수" },
  { id: "Gaon", display: "가온" },
  { id: "Ode", display: "뜽이" },
  { id: "Junhan", display: "준한" },
  { id: "Jooyeon", display: "쭈쿠나쭈타타" }
];

// 멤버별 기본 닉네임
const defaultNicks = {
  Gunil: "건빵이",
  Jeongsu: "말랑이",
  Gaon: "가온패밀리",
  Ode: "응큼이",
  Junhan: "보무리",
  Jooyeon: "소중이"
};

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  const memberListEl = document.getElementById("nicknameMemberList");
  const displayArea = document.getElementById("nicknameDisplayArea");

  // 멤버 리스트 렌더링
  MEMBER_LIST.forEach(member => {
    const wrap = document.createElement("div");
    wrap.className = "nickname-member-wrap";

    const img = document.createElement("img");
    img.src = `images/${member.id}_profile.jpg`;
    img.className = "nickname-member-img";
    img.alt = member.display;

    const nickText = document.createElement("div");
    nickText.className = "nickname-text";
    nickText.id = `${member.id}Nick`;
    nickText.textContent = `${member.display} -> ${localStorage.getItem(member.id + "Name") || defaultNicks[member.id]}`;

    wrap.appendChild(img);
    wrap.appendChild(nickText);
    memberListEl.appendChild(wrap);

    img.addEventListener("click", () => openNickModal(member));
  });

  // 모달 버튼 이벤트
  document.getElementById("saveNickBtn").addEventListener("click", saveNickname);
  document.getElementById("cancelNickBtn").addEventListener("click", closeNickModal);

  // 뒤로가기 버튼 이벤트
  const backBtn = document.getElementById("backToSetting");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "setting.html";
    });
  }
});

// 선택 멤버 저장
let currentMember = null;

function openNickModal(member) {
  currentMember = member;
  document.getElementById("modalMemberName").textContent = member.display;
  document.getElementById("nickInput").value = localStorage.getItem(member.id + "Name") || defaultNicks[member.id];
  document.getElementById("nicknameModal").classList.remove("hidden");
}

function closeNickModal() {
  document.getElementById("nicknameModal").classList.add("hidden");
  currentMember = null;
}

function saveNickname() {
  const input = document.getElementById("nickInput");
  const nick = input.value.trim() || defaultNicks[currentMember.id];
  if (!currentMember) return;

  localStorage.setItem(currentMember.id + "Name", nick);

  const nickText = document.getElementById(currentMember.id + "Nick");
  nickText.textContent = `${currentMember.display} -> ${nick}`;

  closeNickModal();
}

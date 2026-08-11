document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const navLinks = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];
const dialog = document.querySelector("#project-dialog");
const dialogClose = dialog.querySelector(".dialog-close");
const toast = document.querySelector(".toast");
let toastTimer;

const projectData = {
  skyroute: {
    index: "01 / CASE STUDY",
    title: "SKYROUTE",
    subtitle: "항공사 예매 및 운항 관리 웹 서비스 · 5인 팀 · 2026.06—07",
    blocks: [
      ["Problem", "문제와 목표", "항공사 내부 기준 정보와 운항 스케줄, 사용자의 항공권 검색·예약·결제·취소·환불이 각각 분리되지 않고 하나의 업무 흐름으로 연결되어야 했습니다."],
      ["My role", "나의 기여", ["프로젝트 기획, 요구사항 정의와 기준 문서 작성", "편도·왕복 검색부터 예약·결제 완료까지 사용자 흐름 구현", "PortOne 테스트 결제와 금액·주문번호·결제 상태 검증", "전체·부분 취소, 환불 내역 저장과 좌석 반환 로직", "사용자·지상직 공지사항과 공통 UI, 통합 테스트"]],
      ["Decision", "상태 정합성 중심 설계", "부분 취소 시 결제 상태만 바뀌면 예약·티켓·좌석·환불 금액이 어긋날 수 있었습니다. 취소 대상과 금액을 먼저 검증한 뒤 관련 상태 변경, 좌석 반환과 환불 내역 저장을 하나의 업무 흐름으로 구성했습니다."],
      ["Verification", "통합 흐름 검증", ["기준 정보 → 운항 스케줄 → 검색 → 예약·결제 → 취소·환불 전 과정 테스트", "Oracle 제약조건과 MyBatis 매핑 점검", "결제 실패·취소 시 예약 상태와 좌석 반환 확인", "사용 중 기준 정보 변경 제한으로 참조 정합성 유지"]],
      ["Reflection", "배운 점과 다음 단계", "기능 단위 성공만으로는 서비스가 안정적이지 않다는 점을 배웠습니다. 다음 단계에서는 상태 변경 단위 테스트와 결제·좌석 처리의 동시성 테스트를 추가하고자 합니다."],
      ["Stack", "Technology", ["Java", "Spring Boot", "Spring MVC", "Spring Security", "MyBatis", "Thymeleaf", "Oracle", "JavaScript", "Bootstrap", "PortOne"]]
    ]
  },
  kicktreff: {
    index: "02 / CASE STUDY",
    title: "KICK-TREFF",
    subtitle: "축구·풋살 매칭 및 팀 통합 관리 플랫폼 · 4인 팀 · 2026.04—06",
    blocks: [
      ["Problem", "문제와 목표", "단체 채팅방과 엑셀 등 여러 수단에 흩어진 동호회 운영을 클럽 관리, 경기 매칭, 선수 검색, 1:1 채팅, 기록과 고객센터가 연결된 하나의 서비스로 통합했습니다."],
      ["My role", "나의 기여", ["PM·개발팀장으로 요구사항, 우선순위, 일정과 Git 협업 총괄", "Controller–DAO–VO–JSP 계층 분리와 공통 구조 정립", "클럽 CRUD, 가입 승인·거절, 팀원·권한 관리", "관리자·공지·FAQ·문의·신고 처리", "플레이어 검색과 AJAX 폴링 1:1 채팅 구현"]],
      ["Decision", "최근 메시지 기준 조회", "모든 메시지를 반복 조회하면 데이터 누적에 따라 불필요한 처리가 커지고 읽음 상태 관리가 어려워집니다. 마지막 확인 메시지 이후 데이터만 조회하고, 읽음 상태와 미읽음 수를 함께 갱신하도록 변경했습니다."],
      ["Collaboration", "공통 기준으로 재작업 감소", ["초기 요구사항과 기능 우선순위 문서화", "공통 MVC 구조와 URL·세션·권한 기준 정리", "화면별 스타일 차이를 줄이는 CSS 컴포넌트 구축", "진행 상황 공유와 통합 오류 디버깅"]],
      ["Reflection", "배운 점과 다음 단계", "개발 초기에 공통 구조와 규칙을 명확히 정의하는 것이 개발 효율과 유지보수성에 직접 연결된다는 점을 배웠습니다. WebSocket 기반 구조도 학습하며 확장 방향을 검토했습니다."],
      ["Stack", "Technology", ["Java", "JSP/Servlet", "JDBC", "Oracle", "JavaScript", "jQuery", "AJAX", "Apache Tomcat", "Git/GitHub"]]
    ]
  },
  krd: {
    index: "03 / CASE STUDY",
    title: "K-RD Project",
    subtitle: "국가 연구과제 관리 시스템 · 5인 팀 · 2026.02—03",
    blocks: [
      ["Problem", "문제와 목표", "연구과제 공고부터 신청, 평가·선정, 진행과 예산 정산까지의 업무 절차를 사용자 권한과 과제 상태에 따라 안정적으로 처리하는 Java 콘솔 시스템을 만들었습니다."],
      ["My role", "나의 기여", ["시스템 관리자 메뉴 전반 설계·구현", "회원 조건 검색, 정보 수정과 계정 상태 관리", "권한 신청 승인·거부와 공고 상태 변경", "예산·통계 조회와 관리자 게시물 CRUD", "입력값·권한 검증과 JDBC 기반 Oracle 연동"]],
      ["Decision", "이력을 보존하는 논리 삭제", "회원을 물리 삭제하면 기존 과제와 권한 신청 데이터의 관계가 훼손될 수 있어 계정 상태를 변경하는 논리 삭제를 선택했습니다. 이력을 유지하면서 비활성 회원의 접근만 제한했습니다."],
      ["Business logic", "업무 절차를 코드로 변환", ["사용자 역할별 허용 기능 구분", "권한 신청의 승인·거부 조건 검증", "허용되지 않은 공고 상태 전이 차단", "업무 단계별 관계와 이력을 유지하는 SQL 작성"]],
      ["Reflection", "배운 점과 다음 단계", "CRUD보다 먼저 실제 업무 절차와 데이터 관계를 이해해야 한다는 점을 배웠습니다. 반복되는 입력·출력 코드를 경험하며 기능별 책임 분리와 공통 모듈화의 필요성도 확인했습니다."],
      ["Stack", "Technology", ["Java", "JDBC", "Oracle 21c", "SQL", "Eclipse", "Git/GitHub"]]
    ]
  }
};

window.addEventListener("scroll", () => header.classList.toggle("is-scrolled", window.scrollY > 24), { passive: true });

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  mobileNav.hidden = !open;
});

mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  menuButton.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .08, rootMargin: "0px 0px -8%" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!active) return;
  navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${active.target.id}`));
}, { threshold: [0, .2, .45], rootMargin: "-30% 0px -55%" });

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll("[data-project-open]").forEach((button) => {
  button.addEventListener("click", () => openProject(projectData[button.dataset.projectOpen]));
});

function openProject(project) {
  document.querySelector("#dialog-index").textContent = project.index;
  document.querySelector("#dialog-title").textContent = project.title;
  document.querySelector("#dialog-subtitle").textContent = project.subtitle;
  document.querySelector("#dialog-content").innerHTML = project.blocks.map((block, index) => {
    const body = Array.isArray(block[2])
      ? (block[0] === "Stack"
          ? `<div class="dialog-stack">${block[2].map((item) => `<span>${item}</span>`).join("")}</div>`
          : `<ul>${block[2].map((item) => `<li>${item}</li>`).join("")}</ul>`)
      : `<p>${block[2]}</p>`;
    return `<section class="dialog-block${index === 4 ? " dialog-block--wide" : ""}"><small>${block[0]}</small><h3>${block[1]}</h3>${body}</section>`;
  }).join("");
  dialog.showModal();
  document.body.style.overflow = "hidden";
}

function closeDialog() {
  dialog.close();
  document.body.style.overflow = "";
}

dialogClose.addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
dialog.addEventListener("close", () => { document.body.style.overflow = ""; });

document.querySelector("[data-copy-email]").addEventListener("click", async (event) => {
  const email = event.currentTarget.dataset.copyEmail;
  try { await navigator.clipboard.writeText(email); showToast("이메일 주소를 복사했습니다."); }
  catch { showToast(email); }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}

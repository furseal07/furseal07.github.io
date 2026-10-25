document.documentElement.classList.add("js");

// 로딩 화면: '개발자 모드로 전환 중...' 아래 블록 게이지가 한 칸씩 차고, 전환 기록이 한 줄씩 찍힙니다.
const loader = document.querySelector("#site-loader");
const loaderCount = document.querySelector("#loader-count");
const loaderMessage = document.querySelector("#loader-message");
const loaderProgress = document.querySelector("#loader-progress");
const loaderLog = document.querySelector("#loader-log");
const LOADER_BLOCKS = 20;
// [이 진행률(%)부터, 기록 한 줄]
const loaderSteps = [
  [0, "기획 경험 불러오는 중"],
  [34, "운영 경험 동기화 완료"],
  [67, "개발 환경 설정 완료"],
  [100, "개발자 모드 전환 완료!"]
];

// 로딩 중에는 휠 · 터치 · 키보드 스크롤을 막아 뒤의 페이지가 비쳐 보이지 않게 합니다.
const blockScroll = (event) => event.preventDefault();
const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);
const blockScrollKeys = (event) => { if (SCROLL_KEYS.has(event.key)) event.preventDefault(); };
const lockScroll = (on) => {
  const method = on ? "addEventListener" : "removeEventListener";
  window[method]("wheel", blockScroll, { passive: false });
  window[method]("touchmove", blockScroll, { passive: false });
  window[method]("keydown", blockScrollKeys);
  document.documentElement.classList.toggle("is-loading", on);
};

let loaderDone = false;
const finishLoader = () => {
  if (!loader || loaderDone) return;
  loaderDone = true;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo(0, 0);
  lockScroll(false);
  loader.classList.add("is-complete");
  document.body.classList.remove("is-loading");
  window.setTimeout(() => document.body.classList.add("is-ready"), reduceMotion ? 0 : 450);
  // 위쪽 첫 화면이 다 뜬 뒤에 아래 내용이 차례로 나타나게 합니다
  window.setTimeout(() => enableReveal(), reduceMotion ? 0 : 1000);
  window.setTimeout(() => loader.remove(), reduceMotion ? 50 : 700);
};

// 이 탭에서 이미 한 번 봤다면(새로고침 등) 로딩 화면을 건너뜁니다.
const LOADER_KEY = "pf-loader-seen";
let loaderSeen = false;
try {
  loaderSeen = sessionStorage.getItem(LOADER_KEY) === "1";
  sessionStorage.setItem(LOADER_KEY, "1");
} catch {}

const startLoader = () => {
  if (loaderSeen || !loader || !loaderCount || !loaderProgress || !loaderLog) {
    loader?.remove();
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    window.setTimeout(() => enableReveal(), 550);
    return;
  }

  // 새로고침 때 브라우저가 이전 스크롤 위치로 되돌리지 않게 맨 위에서 시작합니다
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  lockScroll(true);

  // 건너뛰기: SKIP 버튼, 또는 Esc · Enter 키
  const skipButton = loader.querySelector("[data-loader-skip]");
  skipButton?.addEventListener("click", finishLoader);
  const skipByKey = (event) => {
    if (loaderDone) { window.removeEventListener("keydown", skipByKey); return; }
    if (event.key === "Escape" || event.key === "Enter") { event.preventDefault(); finishLoader(); }
  };
  window.addEventListener("keydown", skipByKey);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduceMotion ? 400 : 4000;   // 게이지가 차는 시간 (ms)
  const blocks = Array.from({ length: LOADER_BLOCKS }, () => {
    const block = document.createElement("i");
    loaderProgress.appendChild(block);
    return block;
  });
  let activeStep = -1;
  let startedAt;

  const enterStep = (index) => {
    if (index === activeStep) return;
    // 지난 줄은 OK 표시로 마무리하고 새 줄을 찍습니다
    const previous = loaderLog.lastElementChild;
    if (previous) previous.classList.add("is-done");
    activeStep = index;
    const line = document.createElement("li");
    line.textContent = loaderSteps[index][1];
    if (index === loaderSteps.length - 1) line.classList.add("is-final");
    loaderLog.appendChild(line);
    if (loaderMessage) loaderMessage.textContent = loaderSteps[index][1];
  };

  const tick = (timestamp) => {
    if (loaderDone) return;   // 건너뛰기를 누르면 멈춥니다
    startedAt ??= timestamp;
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const percent = Math.round(progress * 100);
    let step = 0;
    loaderSteps.forEach((entry, index) => { if (percent >= entry[0]) step = index; });

    loaderCount.textContent = String(percent);
    loaderProgress.setAttribute("aria-valuenow", String(percent));
    const filled = Math.floor(progress * LOADER_BLOCKS);
    blocks.forEach((block, index) => block.classList.toggle("is-on", index < filled));
    enterStep(step);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      window.setTimeout(finishLoader, reduceMotion ? 50 : 350);   // 완료 줄을 잠깐 보여 준 뒤 닫습니다
    }
  };

  window.requestAnimationFrame(tick);
};

startLoader();

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const navLinks = [...document.querySelectorAll(".desktop-nav a, .mobile-nav a")];
const pages = [...document.querySelectorAll(".page[data-page]")];
const contactTrigger = document.querySelector("[data-contact-open]");
const contactDialog = document.querySelector("#contact-dialog");
const contactDialogClose = contactDialog.querySelector(".contact-dialog-close");
const contactDialogToast = contactDialog.querySelector(".contact-dialog__toast");
const toast = document.querySelector(".toast");
let toastTimer;
let activeToast;

const projectData = {
  skyroute: {
    index: "01 / CASE STUDY",
    title: "SKYROUTE",
    subtitle: "항공사 예매 및 운항 관리 웹 서비스 · 5인 팀 · 2026.06.10 ~ 2026.07.28 (약 7주)",
    blocks: [
      ["Problem", "문제와 목표", "Spring Boot 기반 웹 환경과 Oracle DB로 항공사 예매·운항 관리의 핵심 업무 흐름을 구현하는 것이 목표였습니다. 내부 기준 정보와 운항 스케줄, 사용자의 검색·예약·결제·취소·환불이 따로 떨어지지 않고 아래 흐름처럼 하나의 데이터로 이어져야 했습니다.", ["기준 정보 등록", "운항 스케줄 등록", "항공권 검색·예약·결제", "체크인·탑승", "지연/결항 안내"]],
      ["My role", "나의 기여", ["프로젝트 기획, 요구사항 정의와 기준 문서 작성", "편도·왕복 검색부터 예약·결제 완료까지 사용자 흐름 구현", "PortOne 테스트 결제와 금액·주문번호·결제 상태 검증", "전체·부분 취소, 환불 내역 저장과 좌석 반환 로직", "사용자·지상직 공지사항과 공통 UI, 통합 테스트"]],
      ["Decision", "상태 정합성 중심 설계", "부분 취소 시 결제 상태만 바뀌면 예약·티켓·좌석·환불 금액이 어긋날 수 있었습니다. 취소 대상과 금액을 먼저 검증한 뒤 관련 상태 변경, 좌석 반환과 환불 내역 저장을 하나의 업무 흐름으로 구성했습니다."],
      ["Verification", "통합 흐름 검증", ["기준 정보 → 운항 스케줄 → 검색 → 예약·결제 → 취소·환불 전 과정 테스트", "예약·결제·환불·체크인 테스트용 Oracle 더미 데이터와 초기화 SQL 작성", "Oracle 제약조건, MyBatis 매핑, URL 경로·탭 이동 오류 디버깅", "결제 실패·취소 시 예약 상태와 좌석 반환 확인", "사용 중인 공항·노선·게이트의 삭제·비활성화 차단으로 참조 정합성 유지"]],
      ["Reflection", "배운 점과 다음 단계", "요구사항 정의서대로 만든 테이블도 실제 예약·취소 흐름을 붙여 보니 구조 문제가 드러났습니다. 좌석·탑승객·환불 규정을 다시 설계하며 화면에서 계산할 수 있는 값은 저장하지 않고, 예매 당시 기록처럼 시점이 중요한 데이터는 원본과 분리해 스냅샷으로 남기고, 자주 바뀌는 규칙은 코드가 아닌 정책 데이터로 관리해야 한다는 기준을 얻었습니다. 다음 프로젝트에서는 ERD를 확정하기 전에 예약 → 변경 → 취소 같은 핵심 시나리오를 먼저 대입해 검증하고, 요금·수수료 같은 정책 값은 처음부터 테이블로 분리해 설계하겠습니다."],
      ["Stack", "Technology", ["Java", "Spring Boot", "Spring MVC", "Spring Security", "MyBatis", "Thymeleaf", "Oracle", "JavaScript", "Bootstrap", "PortOne"]]
    ]
  },
  kicktreff: {
    index: "02 / CASE STUDY",
    title: "KICK-TREFF",
    subtitle: "아마추어 축구·풋살 매칭 및 팀 통합 관리 플랫폼 · 4인 팀 · 2026.04.17—06.02",
    blocks: [
      ["Problem", "문제와 목표", "아마추어 축구·풋살 동호회 운영진은 단톡방, 엑셀, 단순 매칭 앱을 함께 쓰며 일정 관리와 인원 모집에 피로를 겪고 있었습니다. 이를 해소하기 위해 팀 내부의 스탯 관리·출석 체크부터 외부 팀과의 매칭, 전용 심판의 객관적인 경기 기록, 포인트 기반 결제까지 하나의 플랫폼에서 원스톱으로 제공하는 것을 목표로 했습니다. 사용자 · 클럽장 · 심판 · 관리자 네 역할이 아래 흐름을 함께 이어 갑니다.", ["클럽 생성·가입·출석", "매치 개설·신청", "포인트 결제·구장 예약", "심판 경기 기록", "스탯·랭킹 반영"]],
      ["My role", "나의 기여", ["PM·개발팀장으로 요구사항, 우선순위, 일정과 Git 협업 총괄", "Controller–DAO–VO–JSP 계층 분리와 공통 구조 정립", "클럽 CRUD, 가입 승인·거절, 팀원·권한 관리", "팀원 강퇴·탈퇴, 팀장 권한 양도, 클럽 게시판", "관리자 대시보드와 회원·클럽·구장·심판 관리", "공지·FAQ·1:1 문의 답변·신고 처리", "플레이어 검색·프로필과 AJAX 폴링 1:1 채팅(읽음·미읽음 처리)", "공통 CSS·디자인 컴포넌트 정리와 통합 테스트·디버깅"]],
      ["Decision", "최근 메시지 기준 조회", "모든 메시지를 반복 조회하면 데이터 누적에 따라 불필요한 처리가 커지고 읽음 상태 관리가 어려워집니다. 마지막 확인 메시지 이후 데이터만 조회하고, 읽음 상태와 미읽음 수를 함께 갱신하도록 변경했습니다."],
      ["Collaboration", "공통 기준으로 재작업 감소", ["초기 요구사항과 기능 우선순위 문서화", "공통 MVC 구조와 URL·세션·권한 기준 정리", "화면별 스타일 차이를 줄이는 CSS 컴포넌트 구축", "진행 상황 공유와 통합 오류 디버깅"]],
      ["Reflection", "배운 점과 다음 단계", "개발 초기에 공통 구조와 규칙을 명확히 정의하는 것이 개발 효율과 유지보수성에 직접 연결된다는 점을 배웠습니다. WebSocket 기반 구조도 학습하며 확장 방향을 검토했습니다."],
      ["Stack", "Technology", ["Java", "JSP/Servlet", "JSTL", "JDBC", "Oracle", "JavaScript", "jQuery", "AJAX", "Apache Tomcat", "Git/GitHub"]]
    ]
  },
  krd: {
    index: "03 / CASE STUDY",
    title: "K-RD Project",
    subtitle: "국가 연구과제 관리 시스템 · 5인 팀 · 2026.02—03",
    blocks: [
      ["Problem", "문제와 목표", "국가 연구과제의 공고 등록부터 과제 신청, 평가·선정, 연구 진행과 예산 정산까지의 업무를 하나로 관리하는 Java 콘솔 프로그램입니다. 연구자 · 평가위원 · 연구기관 담당자 · 시스템 관리자의 권한을 나누고, 과제 진행 단계에 따른 상태 변경과 데이터를 Oracle DB에서 일관되게 처리하는 것이 목표였습니다.", ["공고 등록", "과제 신청", "평가·선정", "연구 진행", "예산 집행·정산"]],
      ["My role", "나의 기여", ["시스템 관리자(ADM) 메뉴 전반 설계·구현", "회원 목록 조회와 ID·이름·이메일·권한·상태·가입/접속일 조건 검색", "계정 정지·연장·해제, 논리 삭제, 권한 강제 변경과 변경 이력 저장", "권한 신청 승인·거부, 공고(게시물) 상태 관리", "예산 변경 이력·집행 현황, 연도·기관별 선정 통계와 평균 경쟁률", "입력값·권한 검증 공통 유틸과 JDBC 기반 Oracle 연동"]],
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

// 스크롤해서 보이는 순간 나타나는 효과. 로딩 화면과 첫 화면 등장이 끝나기 전에는 시작하지 않습니다.
let revealReady = false;
const revealObserver = new IntersectionObserver((entries) => {
  if (!revealReady) return;
  let order = 0;
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    element.style.transitionDelay = `${Math.min(order, 4) * 0.12}s`;   // 한꺼번에 보이면 위에서부터 차례로
    order += 1;
    element.classList.add("is-visible");
    revealObserver.unobserve(element);
    window.setTimeout(() => { element.style.transitionDelay = ""; }, 1400);
  });
}, { threshold: .08, rootMargin: "0px 0px -8%" });

function enableReveal() {
  if (revealReady) return;
  revealReady = true;
  // 이미 화면 안에 있던 요소도 다시 확인하도록 관찰을 새로 겁니다
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
    revealObserver.unobserve(element);
    revealObserver.observe(element);
  });
}

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// 페이지 나누기: 요약(home) · 프로젝트(projects) · 기술(skills)를 한 번에 하나만 보여 줍니다.
// 주소 끝(#home, #projects, #skills)으로 페이지를 고르고, #project-skyroute 처럼 프로젝트 이름이 오면 프로젝트 페이지를 열고 그 카드로 내려갑니다.
// 뒤로 가기 / 앞으로 가기도 그대로 동작합니다.
const pageNames = pages.map((page) => page.dataset.page);
function pageFromHash(hash) {
  const id = (hash || "").replace("#", "");
  if (pageNames.includes(id)) return { page: id, target: null };
  const target = id ? document.getElementById(id) : null;
  const owner = target?.closest(".page[data-page]");
  return owner ? { page: owner.dataset.page, target } : { page: "home", target: null };
}

const questLog = document.querySelector("#quest-log");
const questDetails = [...document.querySelectorAll(".quest-detail")];

function showPage(name, target) {
  // 프로젝트 페이지: 프로젝트 상세(#project-이름)를 고르면 목록 대신 그 상세 화면만, 아니면 목록만 보여 줍니다
  // (#skyroute-docs 처럼 상세 화면 안쪽을 고르면 그 상세 화면을 열고 그 위치로 내려갑니다)
  const detail = target ? target.closest(".quest-detail") : null;
  if (name === "projects" && questLog) {
    questLog.hidden = Boolean(detail);
    document.querySelector("#projects .section-heading").hidden = Boolean(detail);
    questDetails.forEach((item) => { item.hidden = item !== detail; });
    if (detail && target === detail) target = null;   // 상세 화면 자체는 맨 위부터 보여 줍니다
  }
  pages.forEach((page) => {
    const active = page.dataset.page === name;
    page.hidden = !active;
    if (active) page.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => revealObserver.observe(element));
  });
  navLinks.forEach((link) => link.classList.toggle("is-active", link.dataset.pageLink === name));
  // 고른 위치가 탭 안에 있으면 그 탭을 먼저 엽니다 (#skyroute-docs → 협업 문서 탭)
  const panel = target?.closest("[role=tabpanel]");
  if (panel) {
    const tab = document.querySelector(`[role=tab][aria-controls="${panel.id}"]`);
    if (tab) { activateTab(tab); target = tab.closest("[role=tablist]"); }
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (target) {
    window.requestAnimationFrame(() => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }));
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

document.querySelectorAll("a[data-page-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const hash = link.getAttribute("href");
    if (location.hash !== hash) history.pushState(null, "", hash);
    const route = pageFromHash(hash);
    showPage(route.page, route.target);
  });
});

window.addEventListener("popstate", () => {
  const route = pageFromHash(location.hash);
  showPage(route.page, route.target);
});

document.querySelectorAll("[data-scroll-top]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

const initialRoute = pageFromHash(location.hash);
showPage(initialRoute.page, initialRoute.target);

// 프로젝트 상세 기록: projectData 의 문제 · 나의 기여 · 설계 결정 · 검증 · 회고를 각 상세 화면 아래에 채웁니다.
// (기술 목록은 상세 화면 위쪽 기술 칸에 이미 있으므로 넣지 않습니다)
document.querySelectorAll("[data-case]").forEach((container) => {
  const project = projectData[container.dataset.case];
  if (!project) return;
  container.innerHTML = project.blocks.filter((block) => block[0] !== "Stack").map((block, index) => {
    const body = Array.isArray(block[2])
      ? `<ul>${block[2].map((item) => `<li>${item}</li>`).join("")}</ul>`
      : `<p>${block[2]}</p>`;
    // 네 번째 값이 있으면 업무 흐름 단계로 보여 줍니다 (1 → 2 → 3 ...)
    const flow = block[3] ? `<ol class="case-flow">${block[3].map((step) => `<li><span>${step}</span></li>`).join("")}</ol>` : "";
    const key = block[0] === "Decision" ? " is-key" : "";
    return `<section class="case-block${key}"><small>${block[0].toUpperCase()}</small><h4>${block[1]}</h4>${body}${flow}</section>`;
  }).join("");
});

// 실제 화면 슬라이드: 4초마다 다음 화면. 마우스를 올리거나 버튼에 초점이 있으면 멈춥니다.
document.querySelectorAll("[data-slider]").forEach((slider) => {
  const slides = [...slider.querySelectorAll(".shot-slider__slide")];
  const dots = [...slider.querySelectorAll("[data-slider-dot]")];
  const label = slider.querySelector("[data-slider-label]");
  const count = slider.querySelector("[data-slider-count]");
  const autoplay = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0;
  let timer;
  let paused = false;

  const go = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.querySelector("a")?.setAttribute("tabindex", active ? "0" : "-1");
    });
    dots.forEach((dot, i) => (i === current ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current")));
    if (label) label.textContent = slides[current].dataset.label;
    if (count) count.textContent = `${current + 1} / ${slides.length}`;
  };
  const restart = () => {
    clearInterval(timer);
    if (autoplay && !paused) timer = setInterval(() => { if (!document.hidden) go(current + 1); }, 4000);
  };

  slider.querySelector("[data-slider-prev]")?.addEventListener("click", () => { go(current - 1); restart(); });
  slider.querySelector("[data-slider-next]")?.addEventListener("click", () => { go(current + 1); restart(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => { go(i); restart(); }));
  slider.addEventListener("mouseenter", () => { paused = true; restart(); });
  slider.addEventListener("mouseleave", () => { paused = false; restart(); });
  slider.addEventListener("focusin", () => { paused = true; restart(); });
  slider.addEventListener("focusout", () => { paused = false; restart(); });
  restart();
});

// 상세 탭: 버튼을 누르면 해당 칸만 보여 줍니다. (← → 키로도 이동)
function activateTab(tab) {
  const list = tab.closest("[role=tablist]");
  list.querySelectorAll("[role=tab]").forEach((other) => {
    const on = other === tab;
    other.setAttribute("aria-selected", String(on));
    other.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(other.getAttribute("aria-controls"));
    if (panel) panel.hidden = !on;
  });
}
document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const tabs = [...tab.closest("[role=tablist]").querySelectorAll("[role=tab]")];
    const next = tabs[(tabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    activateTab(next);
    next.focus();
  });
});

// 이미지 크게 보기: data-lightbox 링크를 누르면 새 창 대신 이 페이지 위에 크게 띄웁니다. (Esc · 바깥 클릭 · X로 닫기)
const lightbox = document.querySelector("#lightbox");
if (lightbox) {
  const lightboxImg = lightbox.querySelector(".lightbox__img");
  const lightboxCaption = lightbox.querySelector(".lightbox__caption");
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-lightbox]");
    if (!link) return;
    event.preventDefault();
    const img = link.querySelector("img");
    lightboxImg.src = link.getAttribute("href");
    lightboxImg.alt = img ? img.alt : "";
    lightboxCaption.textContent = link.closest("[data-label]")?.dataset.label || link.querySelector(".collab-doc__name")?.textContent || (img ? img.alt : "");
    lightbox.showModal();
    document.body.style.overflow = "hidden";
  });
  lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("close", () => { document.body.style.overflow = ""; });
}

contactTrigger.addEventListener("click", () => {
  contactDialog.showModal();
  document.body.style.overflow = "hidden";
});

contactDialogClose.addEventListener("click", () => contactDialog.close());
contactDialog.addEventListener("click", (event) => { if (event.target === contactDialog) contactDialog.close(); });
contactDialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  contactDialogToast.classList.remove("is-visible");
});

document.querySelectorAll("[data-copy-email]").forEach((button) => {
  button.addEventListener("click", async (event) => {
    const email = event.currentTarget.dataset.copyEmail;
    const copyLabel = event.currentTarget.querySelector("[data-copy-label]");
    const targetToast = event.currentTarget.closest("#contact-dialog") ? contactDialogToast : toast;

    try {
      await copyText(email);
      showToast("이메일 주소를 복사했습니다.", targetToast);
      if (copyLabel) {
        copyLabel.textContent = "COPIED";
        window.setTimeout(() => { copyLabel.textContent = "COPY"; }, 1600);
      }
    } catch {
      showToast(email, targetToast);
    }
  });
});

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporaryInput = document.createElement("textarea");
  temporaryInput.value = text;
  temporaryInput.setAttribute("readonly", "");
  temporaryInput.style.position = "fixed";
  temporaryInput.style.opacity = "0";
  document.body.appendChild(temporaryInput);
  temporaryInput.select();
  const copied = document.execCommand("copy");
  temporaryInput.remove();
  if (!copied) throw new Error("Copy failed");
}

function showToast(message, targetToast = toast) {
  if (activeToast && activeToast !== targetToast) activeToast.classList.remove("is-visible");
  activeToast = targetToast;
  targetToast.textContent = message;
  targetToast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    targetToast.classList.remove("is-visible");
    if (activeToast === targetToast) activeToast = null;
  }, 1800);
}
// 캐릭터 대사: 첫 화면이 나타난 뒤 글자가 한 자씩 찍히고, 다 찍히면 아래 칸들(상태창 · 프로젝트)이 차례로 나타납니다.
// 대사 창을 누르면 바로 전체 문장을 보여 줍니다. (움직임 줄이기 설정이면 처음부터 전체 표시)
(() => {
  const target = document.querySelector("#devDialogue");
  const showRest = () => document.body.classList.add("intro-done");
  if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { showRest(); return; }
  const original = target.innerHTML;
  // 다 쓴 문장을 보이지 않게 미리 깔아 두어, 타이핑 중에도 창 높이가 바뀌지 않게 합니다
  const ghost = document.createElement("span");
  ghost.className = "char-dialogue__ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.innerHTML = original;
  target.before(ghost);
  target.classList.add("is-overlay");
  // 글자 조각: [글자, 강조 여부]
  const parts = [...target.childNodes].map((node) => [node.textContent, node.nodeName === "EM"]);
  target.textContent = "";
  target.classList.add("is-typing");
  let timer;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    target.innerHTML = original;
    window.setTimeout(showRest, 250);
    window.setTimeout(() => target.classList.remove("is-typing"), 1600);
  };
  const start = () => {
    let partIndex = 0;
    let charIndex = 0;
    let holder = null;
    const step = () => {
      if (finished) return;
      if (partIndex >= parts.length) { finish(); return; }
      const [text, emphasized] = parts[partIndex];
      if (charIndex === 0) holder = emphasized ? target.appendChild(document.createElement("em")) : target;
      holder.append(text[charIndex]);
      charIndex += 1;
      if (charIndex >= text.length) { partIndex += 1; charIndex = 0; }
      timer = window.setTimeout(step, 48);
    };
    step();
  };
  document.querySelector(".char-dialogue")?.addEventListener("click", (event) => {
    if (!event.target.closest("a")) finish();
  });
  const waitForReady = () => {
    if (document.body.classList.contains("is-ready")) window.setTimeout(start, 300);   // 캐릭터창은 처음부터 떠 있고, 대사만 찍힙니다
    else window.requestAnimationFrame(waitForReady);
  };
  waitForReady();
})();

// 캐릭터를 누르면 잠깐 웃어요
(() => {
  const portrait = document.querySelector("#devPortrait");
  if (!portrait) return;
  let timer;
  portrait.addEventListener("click", () => {
    portrait.classList.add("is-laughing");
    clearTimeout(timer);
    timer = setTimeout(() => portrait.classList.remove("is-laughing"), 1400);
  });
})();

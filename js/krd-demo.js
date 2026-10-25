// K-RD Project 콘솔 데모
// 실제 Java 콘솔 프로그램(KRD Hubs)의 시스템 관리자(ADM) 메뉴 흐름과 검증 규칙을 브라우저에서 그대로 따라 해 볼 수 있게 옮긴 것입니다.
// DB 대신 아래의 가상 데이터를 쓰고, 바꾼 내용은 이 창을 닫았다 열어도 유지됩니다. (처음부터 버튼 또는 새로고침으로 초기화)
(() => {
  const dialog = document.querySelector("#krd-demo");
  if (!dialog) return;

  const screen = dialog.querySelector(".krd-term__screen");
  const form = dialog.querySelector(".krd-term__form");
  const input = form.querySelector("input");
  const hintsBox = dialog.querySelector(".krd-term__hints");
  const restartButton = dialog.querySelector("[data-krd-restart]");
  const closeButton = dialog.querySelector("[data-krd-close]");

  // ------------------------------------------------
  // 날짜 · 문자열 도우미
  // ------------------------------------------------
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const two = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
  const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return ymd(d); };
  const TODAY = ymd(today);
  const isRealDate = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  };
  // 한글은 화면에서 두 칸을 차지하므로 표 칸을 맞출 때 너비를 두 칸으로 셉니다.
  const isWide = (code) => (code >= 0xac00 && code <= 0xd7a3) || (code >= 0x1100 && code <= 0x11ff) || (code >= 0x3130 && code <= 0x318f) || (code >= 0x4e00 && code <= 0x9fff) || (code >= 0xff01 && code <= 0xff60);
  const width = (s) => [...String(s)].reduce((sum, ch) => sum + (isWide(ch.codePointAt(0)) ? 2 : 1), 0);
  const padR = (s, n) => { s = String(s); return s + " ".repeat(Math.max(0, n - width(s))); };
  const padL = (s, n) => { s = String(s); return " ".repeat(Math.max(0, n - width(s))) + s; };
  const won = (n) => Number(n).toLocaleString("ko-KR");
  const nvl = (s) => (s == null || String(s).trim() === "" ? "-" : String(s));
  const cut = (s, max) => (s == null ? "-" : s.length <= max ? s : s.slice(0, max - 2) + "..");

  // ------------------------------------------------
  // 가상 데이터 (실제 DB 테이블 구조를 따라 만든 예시 값)
  // ------------------------------------------------
  let db;
  const freshData = () => ({
    users: [
      { id: "adm01", name: "관리자", birth: "1990-04-08", email: "adm01@krdhubs.kr", phone: "010-0000-0001", country: "KR", addr: "서울특별시 중구", gender: "-", aff: "KRD Hubs 운영팀", field: "시스템 운영", role: "ADM", status: "ACTIVE", end: null, created: "2026-02-11 09:00:00", last: `${TODAY} 09:12:40`, updated: "2026-02-11 09:00:00" },
      { id: "agy_choi", name: "최민준", birth: "1985-11-02", email: "mj.choi@nuri-tech.kr", phone: "010-2481-7730", country: "KR", addr: "대전광역시 유성구", gender: "M", aff: "누리기술진흥원", field: "기관 과제 관리", role: "AGY", status: "ACTIVE", end: null, created: "2026-02-12 10:31:05", last: "2026-03-09 17:20:11", updated: "2026-02-20 14:02:33" },
      { id: "gst_han", name: "한지우", birth: "1998-07-21", email: "jiwoo.han@mail.kr", phone: "010-5502-1184", country: "KR", addr: "경기도 수원시", gender: "F", aff: "한빛대학교 대학원", field: "에너지 소재", role: "GST", status: "ACTIVE", end: null, created: "2026-03-02 13:45:52", last: "2026-03-10 08:55:03", updated: "2026-03-02 13:45:52" },
      { id: "gst_seo", name: "서도현", birth: "1994-01-30", email: "dh.seo@mail.kr", phone: "010-9017-3345", country: "KR", addr: "부산광역시 남구", gender: "M", aff: "해솔연구소", field: "해양 환경", role: "GST", status: "ACTIVE", end: null, created: "2026-03-04 16:12:09", last: "2026-03-08 21:40:18", updated: "2026-03-04 16:12:09" },
      { id: "gst_yoon", name: "윤가람", birth: "1999-05-14", email: "garam.y@mail.kr", phone: "010-3321-0098", country: "KR", addr: "광주광역시 북구", gender: "F", aff: "-", field: "-", role: "GST", status: "DELETED", end: null, created: "2026-02-15 11:02:44", last: "2026-02-18 19:30:27", updated: "2026-03-01 10:15:00" },
      { id: "resi_kim", name: "김연구", birth: "1982-09-03", email: "yg.kim@hanbit.ac.kr", phone: "010-7745-2210", country: "KR", addr: "대전광역시 유성구", gender: "M", aff: "한빛대학교 소재공학과", field: "이차전지 소재", role: "RESI", status: "ACTIVE", end: null, created: "2026-02-13 09:41:16", last: "2026-03-11 10:02:57", updated: "2026-02-28 15:22:41" },
      { id: "resi_oh", name: "오태양", birth: "1987-12-19", email: "ty.oh@mirae.re.kr", phone: "010-6630-4471", country: "KR", addr: "세종특별자치시", gender: "M", aff: "미래과학재단 연구소", field: "재난 예측 AI", role: "RESI", status: "SUSPENDED", end: addDays(-3), created: "2026-02-14 15:08:33", last: "2026-02-27 11:47:05", updated: "2026-03-01 09:00:00" },
      { id: "resi_park", name: "박서연", birth: "1991-03-27", email: "sy.park@hanbit.ac.kr", phone: "010-8812-5567", country: "KR", addr: "서울특별시 관악구", gender: "F", aff: "한빛대학교 바이오학과", field: "스마트팜 데이터", role: "RESI", status: "SUSPENDED", end: addDays(20), created: "2026-02-16 10:20:48", last: "2026-03-05 13:33:19", updated: "2026-03-06 09:30:00" },
      { id: "reso_lee", name: "이도윤", birth: "1979-06-11", email: "dy.lee@nuri-tech.kr", phone: "010-1209-8823", country: "KR", addr: "대전광역시 서구", gender: "M", aff: "누리기술진흥원", field: "연구 행정", role: "RESO", status: "ACTIVE", end: null, created: "2026-02-12 11:55:02", last: "2026-03-10 16:08:44", updated: "2026-02-12 11:55:02" },
      { id: "rev_jung", name: "정하은", birth: "1976-10-05", email: "he.jung@review.kr", phone: "010-4478-6602", country: "KR", addr: "서울특별시 서초구", gender: "F", aff: "평가위원단", field: "에너지·환경", role: "REV", status: "ACTIVE", end: null, created: "2026-02-12 14:27:39", last: "2026-03-09 09:51:22", updated: "2026-02-12 14:27:39" }
    ],
    roleHist: [],
    anns: [
      { id: 101, title: "차세대 이차전지 소재 원천기술 개발", status: "공고중", start: "2026-09-01", end: addDays(30), agency: "누리기술진흥원" },
      { id: 102, title: "해양 미세플라스틱 저감 기술 실증", status: "공고예정", start: addDays(14), end: addDays(60), agency: "해솔연구재단" },
      { id: 103, title: "AI 기반 재난 예측 플랫폼 고도화", status: "마감", start: "2026-06-01", end: addDays(-10), agency: "미래과학재단" },
      { id: 104, title: "스마트팜 생육 데이터 표준화 연구", status: "마감", start: "2026-08-15", end: addDays(5), agency: "누리기술진흥원" },
      { id: 105, title: "탄소중립 건축 자재 성능 검증", status: "공고중", start: "2026-09-20", end: addDays(45), agency: "미래과학재단" }
    ],
    projects: [
      { id: 2001, title: "고체 전해질 계면 안정화 기술", total: 300000000, lines: [[1, 120000000, "PAID", "2026-03-02", 1, "adm01", "2026-03-03"], [2, 120000000, "PAID", "2026-06-02", 1, "adm01", "2026-06-04"], [3, 60000000, "REQUESTED", "2026-09-01", 0, null, null]] },
      { id: 2002, title: "재난 예측 모델 학습 데이터셋 구축", total: 180000000, lines: [[1, 72000000, "PAID", "2026-03-05", 1, "adm01", "2026-03-06"], [2, 72000000, "REQUESTED", "2026-07-01", 0, null, null]] },
      { id: 2003, title: "스마트팜 센서 데이터 수집 표준", total: 120000000, lines: [[1, 48000000, "PAID", "2026-04-01", 1, "adm01", "2026-04-02"]] },
      { id: 2004, title: "해양 미세플라스틱 분해 미생물 탐색", total: 250000000, lines: [] }
    ],
    budgetHist: [
      [5007, 2001, 280000000, 300000000, "2026-05-20 10:12:00", "adm01", "2차년도 장비비 증액"],
      [5006, 2002, 200000000, 180000000, "2026-04-28 15:40:00", "adm01", "중복 항목 조정"],
      [5005, 2003, 100000000, 120000000, "2026-04-02 09:05:00", "agy_choi", "현장 실증 범위 확대"],
      [5004, 2004, 0, 250000000, "2026-03-30 14:22:00", "agy_choi", "최초 배정"],
      [5003, 2003, 0, 100000000, "2026-03-25 11:30:00", "agy_choi", "최초 배정"],
      [5002, 2002, 0, 200000000, "2026-03-04 16:10:00", "agy_choi", "최초 배정"],
      [5001, 2001, 0, 280000000, "2026-03-01 10:00:00", "agy_choi", "최초 배정"]
    ],
    byYear: [[2024, 3], [2025, 5], [2026, 4]],
    byAgency: [["누리기술진흥원", 5], ["미래과학재단", 4], ["해솔연구재단", 3]],
    avgRate: 2.35,
    roleApps: [
      { id: 33, user: "gst_seo", role: "RESI", at: "2026-03-08", reason: "해양 환경 과제 연구책임자로 참여 예정입니다." },
      { id: 32, user: "gst_han", role: "RESI", at: "2026-03-06", reason: "지도교수 과제 공동연구원 등록" },
      { id: 31, user: "rev_jung", role: "AGY", at: "2026-03-02", reason: null }
    ]
  });

  // ------------------------------------------------
  // 화면 출력 (System.out.print / println 역할)
  // ------------------------------------------------
  const IND = "      ";
  const seg = (c) => (t) => ({ c, t });
  const PRI = seg("t-pri"), PRIB = seg("t-pri t-b"), WHT = seg("t-wht"), WHTB = seg("t-wht t-b"), GRY = seg("t-gry"), ERR = seg("t-err"), ERRB = seg("t-err t-b"), SUC = seg("t-suc"), SUCB = seg("t-suc t-b"), B = seg("t-b");
  let line = null;
  let liveOptions = [];

  const newLine = () => {
    line = document.createElement("div");
    line.className = "krd-term__line";
    screen.appendChild(line);
  };
  const print = (...parts) => {
    if (!line) newLine();
    parts.forEach((part) => {
      if (part == null) return;
      if (typeof part === "string") { line.append(part); return; }
      if (part.opt != null) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "krd-term__opt";
        button.textContent = `[${part.opt}]`;
        button.dataset.value = part.opt;
        line.appendChild(button);
        liveOptions.push(button);
        return;
      }
      const span = document.createElement("span");
      span.className = part.c;
      span.textContent = part.t;
      line.appendChild(span);
    });
  };
  const println = (...parts) => {
    print(...parts);
    if (!line.childNodes.length) line.append(" ");
    line = null;
  };
  const blank = (n = 1) => { for (let i = 0; i < n; i += 1) println(); };
  const scrollDown = () => { screen.scrollTop = screen.scrollHeight; };

  // 공통 UI (각 Java 클래스의 printSubTitle · printMenuOption · printError · printSuccess)
  const subTitle = (title, rule = 48) => { blank(); println(IND, PRIB("◈ " + title)); println(IND, GRY("─".repeat(rule))); };
  const option = (key, desc) => println(IND + "  ", { opt: key }, " ", WHT(desc));
  const bar = () => println(IND, GRY("┃"));
  const error = (msg) => { blank(); println(IND, ERRB("✘ Error: "), msg); };
  const success = (msg) => { blank(); println(IND, SUCB("✔ Success: "), msg); };
  const inputTag = (tag) => { blank(); print(IND, PRIB("▶ " + tag), " : "); };
  // USH_ConsoleUtil 의 오류 표시 (Error 머리말 없이 들여쓰기만)
  const utilError = (msg) => println(IND, ERRB("✘ "), ERR(msg));

  // ------------------------------------------------
  // 입력 (br.readLine 역할) — 프로그램이 입력을 기다리는 동안만 입력창이 열립니다
  // ------------------------------------------------
  let generation = 0;
  let pending = null;
  class Restart extends Error {}
  class Exit extends Error {}

  const setHints = (hints) => {
    hintsBox.replaceChildren();
    (hints || []).forEach(([label, value]) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "krd-term__chip";
      chip.textContent = label;
      chip.dataset.value = value;
      hintsBox.appendChild(chip);
    });
    hintsBox.hidden = !hintsBox.childElementCount;
  };

  const readLine = ({ secret = false, hints = null } = {}) => {
    const myGen = generation;
    input.type = secret ? "password" : "text";
    input.value = "";
    input.disabled = false;
    setHints(hints);
    scrollDown();
    if (dialog.open && window.matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
    return new Promise((resolve, reject) => {
      pending = { resolve, reject, secret, gen: myGen };
    });
  };

  const submit = (raw) => {
    if (!pending) return;
    const { resolve, secret } = pending;
    pending = null;
    print(WHTB(secret ? "*".repeat(raw.length) : raw));
    println();
    liveOptions.forEach((button) => { button.disabled = true; });
    liveOptions = [];
    input.value = "";
    setHints(null);
    resolve(raw);
  };

  form.addEventListener("submit", (event) => { event.preventDefault(); submit(input.value); });
  screen.addEventListener("click", (event) => {
    const button = event.target.closest(".krd-term__opt");
    if (button && !button.disabled) submit(button.dataset.value);
  });
  hintsBox.addEventListener("click", (event) => {
    const chip = event.target.closest(".krd-term__chip");
    if (!chip) return;
    if (chip.dataset.value === "__restart__") { start(); return; }
    submit(chip.dataset.value);
  });

  // USH_ConsoleUtil — 입력 검증 공통 유틸
  const io = {
    async required(tag, opts) {
      for (;;) {
        inputTag(tag);
        const s = (await readLine(opts)).trim();
        if (!s) { utilError("해당 항목은 필수 입력 사항입니다."); continue; }
        return s;
      }
    },
    async optional(tag, opts) {
      inputTag(tag);
      const s = (await readLine(opts)).trim();
      return s ? s : null;
    },
    async confirmYN(tag) {
      for (;;) {
        inputTag(tag);
        const s = (await readLine({ hints: [["Y", "Y"], ["N", "N"]] })).trim().toUpperCase();
        if (s === "Y") return true;
        if (s === "N") return false;
        utilError("잘못된 입력입니다. Y 또는 N만 입력하세요.");
      }
    },
    async fromSet(tag, allowed, hints) {
      for (;;) {
        inputTag(tag);
        const s = (await readLine({ hints: hints || allowed.map((v) => [v, v]) })).trim().toUpperCase();
        if (!s) { utilError("해당 항목은 필수 입력 사항입니다."); continue; }
        if (!allowed.includes(s)) { println(IND, ERRB("✘ "), ERR("허용되지 않은 값입니다. 다음 중 하나를 입력하세요: "), GRY(`[${allowed.join(", ")}]`)); continue; }
        return s;
      }
    },
    async date(tag, requiredDate, hints) {
      for (;;) {
        inputTag(tag);
        const s = (await readLine({ hints })).trim();
        if (!s) {
          if (!requiredDate) return "";
          utilError("날짜 입력은 필수입니다.");
          continue;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) { utilError("날짜 형식이 올바르지 않습니다. (예: 2026-03-08)"); continue; }
        if (!isRealDate(s)) { utilError("달력에 존재하지 않는 유효하지 않은 날짜입니다."); continue; }
        return s;
      }
    },
    async int(tag, opts) {
      for (;;) {
        inputTag(tag);
        const s = (await readLine(opts)).trim();
        if (/^[+-]?\d{1,10}$/.test(s) && Math.abs(Number(s)) <= 2147483647) return Number(s);
        utilError("숫자만 입력 가능합니다.");
      }
    },
    async intInRange(tag, min, max, opts) {
      for (;;) {
        const n = await io.int(tag, opts);
        if (n >= min && n <= max) return n;
        utilError(`${min}에서 ${max} 사이의 숫자를 입력해주세요.`);
      }
    }
  };
  const menuPick = (min, max) => io.intInRange("메뉴 선택", min, max);

  // ------------------------------------------------
  // UserMain — 첫 화면 · 로그인
  // ------------------------------------------------
  const LOGO = [
    " ██╗  ██╗██████╗ ██████╗     ██╗  ██╗██╗   ██╗██████╗ ███████╗",
    " ██║ ██╔╝██╔══██╗██╔══██╗    ██║  ██║██║   ██║██╔══██╗██╔════╝",
    " █████╔╝ ██████╔╝██║  ██║    ███████║██║   ██║██████╔╝███████╗",
    " ██╔═██╗ ██╔══██╗██║  ██║    ██╔══██║██║   ██║██╔══██╗╚════██║",
    " ██║  ██╗██║  ██║██████╔╝    ██║  ██║╚██████╔╝██████╔╝███████║",
    " ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝"
  ];
  const drawLine = (startCh, endCh, ch, n) => println(IND, GRY(startCh + ch.repeat(n) + endCh));

  async function mainMenu() {
    for (;;) {
      blank(2);
      LOGO.forEach((row) => { println(IND, PRIB(row)); screen.lastElementChild.classList.add("is-logo"); });
      blank();
      println(IND, WHTB("  국가 연구과제 관리 플랫폼"), GRY(" | Version 1.0"));
      drawLine("┏", "┓", "─", 50);
      bar();
      option("1", "시스템 로그인 (Login)");
      option("2", "신규 회원가입 (Sign Up)");
      bar();
      option("3", "프로그램 종료 (Exit)");
      bar();
      drawLine("┗", "┛", "─", 50);
      inputTag("메뉴 선택");
      const raw = await readLine();
      const no = /^[+-]?\d+$/.test(raw.trim()) ? Number(raw.trim()) : NaN;
      if (Number.isNaN(no)) { error("숫자만 입력 가능합니다."); continue; }
      if (no === 1) {
        if (await loginScreen()) await adminMain();
      } else if (no === 2) {
        blank();
        println(IND, "[ 회원가입 모듈로 이동합니다 ]");
        println(IND, GRY("  (데모 안내) 회원가입은 팀원이 구현한 기능이라 이 데모에는 포함하지 않았습니다."));
      } else if (no === 3) {
        blank();
        println(IND, WHT("KRD Hubs를 종료합니다. 이용해 주셔서 감사합니다."));
        throw new Exit();
      } else {
        error("잘못된 입력입니다. 메뉴 번호를 확인하세요.");
      }
    }
  }

  async function loginScreen() {
    for (;;) {
      blank();
      drawLine("╔", "╗", "═", 40);
      println(IND, GRY("║"), "  ", WHTB("접속 인증"));
      drawLine("╠", "╣", "─", 40);
      println(IND, GRY("║"));
      option("1", "로그인 진행");
      option("2", "아이디 / 비밀번호 찾기");
      bar();
      option("0", "이전 화면으로");
      println(IND, GRY("║"));
      drawLine("╚", "╝", "═", 40);
      inputTag("진행 선택");
      const raw = (await readLine()).trim();
      if (!/^[+-]?\d+$/.test(raw)) { error("숫자를 입력하세요."); continue; }
      const no = Number(raw);
      if (no === 1) {
        blank();
        println(IND, GRY("─".repeat(42)));
        inputTag("아이디(ID)");
        const id = await readLine({ hints: [["데모 계정 adm01", "adm01"]] });
        inputTag("비밀번호(PW)");
        const pw = await readLine({ secret: true, hints: [["데모 비밀번호 입력", "1234"]] });
        println(IND, GRY("─".repeat(42)));
        if (id.trim() === "adm01" && pw === "1234") {
          success("adm01님, 환영합니다. 시스템에 접속합니다.");
          return true;
        }
        const other = db.users.find((u) => u.id === id.trim() && u.role !== "ADM");
        if (other && pw === "1234") {
          blank();
          println(IND, GRY(`  (데모 안내) ${other.role} 메뉴는 팀원이 구현한 부분이라 이 데모에서는 시스템 관리자(adm01) 화면만 체험할 수 있습니다.`));
          continue;
        }
        error("인증에 실패했습니다. ID와 PW를 확인하세요.");
      } else if (no === 2) {
        blank();
        println(IND, GRY("  (데모 안내) 아이디 / 비밀번호 찾기는 이 데모에 포함하지 않았습니다."));
      } else if (no === 0) {
        return false;
      } else {
        error("잘못된 선택입니다.");
      }
    }
  }

  // ------------------------------------------------
  // USH_KRDAdminMain — 시스템 관리자 대시보드
  // ------------------------------------------------
  async function adminMain() {
    blank(2);
    println(IND, PRIB("========================================"));
    println(IND, PRIB("   USER SESSION 활성화 [ADM]"));
    println(IND, PRIB("========================================"));
    for (;;) {
      blank(2);
      println(IND, PRI("━".repeat(48)));
      println(IND, B("   KRD Hubs | "), WHT("시스템 관리자 대시보드 (Admin)"));
      println(IND, PRI("━".repeat(48)));
      blank();
      option("1", "전체 회원 관리 (User Management)");
      option("2", "예산 관리 메뉴 (Budget Control)");
      option("3", "선정 통계 조회 (Statistics & Reports)");
      bar();
      option("4", "게시물 관리 (Announcement Control)");
      option("5", "권한 신청 관리 (Role Application)");
      bar();
      option("6", "시스템 로그아웃 (Logout)");
      option("7", "프로그램 종료 (Exit)");
      blank();
      const no = await menuPick(1, 7);
      if (no === 1) await userMenu();
      else if (no === 2) await budgetMenu();
      else if (no === 3) await statsMenu();
      else if (no === 4) await annFlow();
      else if (no === 5) await roleMenu();
      else if (no === 6) {
        inputTag("로그아웃 하시겠습니까? (Y/N)");
        const s = (await readLine({ hints: [["Y", "Y"], ["N", "N"]] })).trim();
        if (s.toUpperCase() === "Y") { success("시스템 관리자 계정에서 안전하게 로그아웃 되었습니다."); return; }
        if (s.toUpperCase() !== "N") error("Y 또는 N만 입력해주세요.");
      } else if (no === 7) {
        blank();
        println(IND, "프로그램을 종료합니다.");
        throw new Exit();
      }
    }
  }

  // ------------------------------------------------
  // 전체 회원 관리 (USH_AdminMemberService + USH_MemberDAO)
  // ------------------------------------------------
  const ROLES = ["GST", "RESI", "RESO", "AGY", "REV"];
  const findUser = (id) => db.users.find((u) => u.id === id);
  const sortUsers = (list) => [...list].sort((a, b) => (a.role === b.role ? (a.id < b.id ? -1 : 1) : a.role < b.role ? 1 : -1));

  // 정지 기간이 끝난 계정을 ACTIVE로 되돌립니다 (회원 관리 메뉴에 들어올 때마다 실행)
  const restoreExpired = () => {
    let count = 0;
    db.users.forEach((u) => {
      if (u.status === "SUSPENDED" && u.end && /^\d{4}-\d{2}-\d{2}$/.test(u.end) && u.end <= TODAY) {
        u.status = "ACTIVE"; u.end = null; count += 1;
      }
    });
    return count;
  };

  async function userMenu() {
    const restored = restoreExpired();
    if (restored > 0) success(`만료된 정지 계정 ${restored}건을 ACTIVE로 복구했습니다.`);
    for (;;) {
      subTitle("전체 회원 관리 (User Management)");
      option("1", "회원 목록 전체 조회");
      option("2", "회원 조건부 검색");
      option("3", "회원 계정 상태 변경 (정지/활성)");
      option("4", "회원 계정 영구 삭제");
      option("5", "회원 권한(역할) 강제 변경");
      bar();
      option("0", "이전 메뉴로 돌아가기 (Back)");
      blank();
      const no = await menuPick(0, 5);
      if (no === 0) return;
      if (no === 1) { blank(); printUserList("회원 목록 전체 조회 (DELETED 제외)", sortUsers(db.users.filter((u) => u.status !== "DELETED"))); await afterUserList(); }
      else if (no === 2) await userSearch();
      else if (no === 3) await changeStatus();
      else if (no === 4) await deleteUser();
      else if (no === 5) await changeRole();
    }
  }

  const RULE_USERS = "-".repeat(128);
  function printUserList(title, list) {
    subTitle(title, 56);
    if (!list.length) { println(IND, GRY("  조건에 맞는 회원 정보가 없습니다.")); return; }
    println(IND, WHTB([padR("ID", 12), padR("이름", 8), padR("생년월일", 12), padR("이메일", 22), padR("권한", 6), padR("상태", 10), padR("가입일자", 19), padR("마지막접속", 19)].join(" | ")));
    println(IND, GRY(RULE_USERS));
    list.forEach((u) => {
      const color = u.status === "ACTIVE" ? SUC : u.status === "SUSPENDED" ? ERR : GRY;
      println(IND, [padR(u.id, 12), padR(u.name, 8), padR(u.birth, 12), padR(u.email, 22), padR(u.role, 6)].join(" | ") + " | ", color(padR(u.status, 10)), " | " + padR(u.created, 19) + " | " + padR(u.last, 19));
    });
    println(IND, GRY(RULE_USERS));
  }

  async function afterUserList() {
    for (;;) {
      blank();
      option("1", "특정 회원 상세 정보 조회");
      bar();
      option("0", "목록 닫기 및 이전 메뉴로 돌아가기");
      blank();
      const no = await menuPick(0, 1);
      if (no === 0) return;
      const id = await io.required("상세 조회할 회원 ID 입력", { hints: [["resi_park", "resi_park"], ["agy_choi", "agy_choi"]] });
      const u = findUser(id);
      if (!u) { error("해당 ID의 회원을 찾을 수 없습니다: " + id); continue; }
      printUserDetail(u);
    }
  }

  function printUserDetail(u) {
    const row = (label, value, danger) => println(IND, PRI("│  "), danger ? ERR(padR(label, 12) + " : " + value) : GRY(padR(label, 12) + " : "), danger ? null : WHT(value));
    const sep = (a, b) => println(IND, PRI(a + "─".repeat(58) + b));
    blank();
    println(IND, PRIB("◈ 회원 상세 정보 (User Details)"));
    sep("┌", "┐");
    row("ID", nvl(u.id)); row("이름", nvl(u.name)); row("생년월일", nvl(u.birth)); row("이메일", nvl(u.email)); row("전화번호", nvl(u.phone));
    sep("├", "┤");
    row("소속", nvl(u.aff)); row("담당 분야", nvl(u.field)); row("권한(역할)", nvl(u.role)); row("계정 상태", nvl(u.status));
    if (u.status === "SUSPENDED") row("패널티 종료일", nvl(u.end), true);
    sep("├", "┤");
    row("국적", nvl(u.country)); row("주소", nvl(u.addr)); row("성별", nvl(u.gender));
    sep("├", "┤");
    row("가입 일자", nvl(u.created)); row("마지막 접속", nvl(u.last)); row("업데이트 일시", nvl(u.updated));
    sep("└", "┘");
  }

  async function userSearch() {
    subTitle("회원 조건 검색 (Search Users)", 56);
    println(IND, GRY("  [안내] 입력하지 않고 엔터(Enter)를 치면 해당 조건은 생략됩니다."));
    const skip = [["건너뛰기 (Enter)", ""]];
    const id = await io.optional("ID(부분일치)", { hints: [...skip, ["resi", "resi"]] });
    const name = await io.optional("이름(부분일치)", { hints: skip });
    const email = await io.optional("이메일(부분일치)", { hints: [...skip, ["hanbit", "hanbit"]] });
    let role = await io.optional("권한 코드 (ADM/AGY/RESI/RESO/REV)", { hints: [...skip, ["RESI", "RESI"], ["GST", "GST"]] });
    let status = await io.optional("상태 코드 (ACTIVE/SUSPENDED/DELETED)", { hints: [...skip, ["SUSPENDED", "SUSPENDED"], ["DELETED", "DELETED"]] });
    if (role) role = role.toUpperCase();
    if (status) status = status.toUpperCase();
    blank();
    println(IND, WHT("[ 가입일 및 접속일 조건 ]"));
    const regStart = await io.date("가입일 시작(YYYY-MM-DD)", false, [...skip, ["2026-02-13", "2026-02-13"]]);
    const regEnd = await io.date("가입일 끝(YYYY-MM-DD)", false, skip);
    const lastStart = await io.date("마지막접속 시작(YYYY-MM-DD)", false, skip);
    const lastEnd = await io.date("마지막접속 끝(YYYY-MM-DD)", false, skip);

    // 입력한 조건만 WHERE 절에 붙이는 동적 검색과 같은 방식으로 거릅니다
    const day = (ts) => ts.slice(0, 10);
    const list = sortUsers(db.users.filter((u) =>
      (!id || u.id.includes(id)) && (!name || u.name.includes(name)) && (!email || u.email.includes(email)) &&
      (!role || u.role === role) && (!status || u.status === status) &&
      (!regStart || day(u.created) >= regStart) && (!regEnd || day(u.created) <= regEnd) &&
      (!lastStart || day(u.last) >= lastStart) && (!lastEnd || day(u.last) <= lastEnd)));
    printUserList("회원 조건 검색 결과", list);
    if (list.length) await afterUserList();
  }

  async function changeStatus() {
    subTitle("회원 상태 변경 (패널티 부여/해제)", 56);
    const userId = await io.required("상태 변경할 사용자 ID 입력", { hints: [["resi_kim", "resi_kim"], ["resi_park", "resi_park"], ["gst_yoon", "gst_yoon"]] });
    const u = findUser(userId);
    if (!u) { error("존재하지 않는 ID입니다."); return; }
    const status = await io.fromSet("변경할 상태 입력 (ACTIVE/SUSPENDED)", ["ACTIVE", "SUSPENDED"]);
    const current = u.status;
    if (current === "DELETED") { error("이미 삭제된 계정입니다. (DELETED 상태는 변경 불가)"); return; }
    const isExtend = current === "SUSPENDED" && status === "SUSPENDED";
    if (isExtend) { blank(); println(IND, PRI("[ 패널티 기간 연장 모드 ]")); }
    if (current === "ACTIVE" && status === "ACTIVE") { error("이미 ACTIVE한 상태입니다."); return; }

    if (status === "SUSPENDED") {
      if (isExtend) {
        const oldEnd = u.end;
        const end = await io.date("연장할 패널티 종료일(YYYY-MM-DD)", true, [[addDays(40), addDays(40)]]);
        if (end < TODAY) { error("종료일이 오늘보다 이전입니다. 다시 시도하세요."); return; }
        if (!oldEnd) println(IND, GRY("  (기존 종료일이 없어 연장 비교를 생략합니다.)"));
        else if (!(end > oldEnd)) { error(`연장은 기존 종료일(${oldEnd}) 이후 날짜로만 가능합니다.`); return; }
        if (!(await io.confirmYN("정말 변경하시겠습니까? (Y/N)"))) { error("변경을 취소했습니다."); return; }
        u.end = end; u.updated = `${TODAY} 12:00:00`;
        success("상태 변경(기간 연장)이 완료되었습니다.");
      } else {
        const start = await io.date("패널티 시작일(YYYY-MM-DD)", true, [[TODAY, TODAY]]);
        const end = await io.date("패널티 종료일(YYYY-MM-DD)", true, [[addDays(14), addDays(14)]]);
        if (start > end) { error("종료일이 시작일보다 빠를 수 없습니다."); return; }
        if (start > TODAY) { error("시작일이 오늘보다 미래일 수 없습니다. (패널티는 즉시 적용)"); return; }
        if (end < TODAY) { error("종료일이 오늘보다 과거일 수 없습니다."); return; }
        if (!(await io.confirmYN("정말 변경하시겠습니까? (Y/N)"))) { error("변경을 취소했습니다."); return; }
        u.status = "SUSPENDED"; u.end = end; u.updated = `${TODAY} 12:00:00`;
        success("상태 변경(패널티 부여)이 완료되었습니다.");
      }
    } else {
      if (!(await io.confirmYN("정말로 ACTIVE 상태로 변경하시겠습니까? (Y/N)"))) { error("변경을 취소했습니다."); return; }
      u.status = "ACTIVE"; u.end = null; u.updated = `${TODAY} 12:00:00`;
      success("계정이 ACTIVE 상태로 복구되었습니다.");
    }
  }

  async function deleteUser() {
    subTitle("회원 계정 삭제 (Delete User)", 56);
    const userId = await io.required("삭제할 회원 ID 입력", { hints: [["gst_seo", "gst_seo"], ["adm01", "adm01"], ["gst_yoon", "gst_yoon"]] });
    const u = findUser(userId);
    if (!u) { error("존재하지 않는 회원 ID입니다."); return; }
    if (u.status === "DELETED") { error("이미 삭제된 계정입니다."); return; }
    if (u.role === "ADM") { error("관리자(ADM) 계정은 삭제할 수 없습니다."); return; }
    println(IND, ERR("  ※ 경고: 삭제 시 계정 상태가 DELETED로 변경되며 복구가 불가능할 수 있습니다."));
    if (!(await io.confirmYN("정말 삭제하시겠습니까? (Y/N)"))) { error("삭제 처리를 취소했습니다."); return; }
    u.status = "DELETED"; u.updated = `${TODAY} 12:00:00`;   // 행을 지우지 않고 상태만 바꾸는 논리 삭제
    success("해당 계정이 성공적으로 삭제(DELETED) 되었습니다.");
  }

  async function changeRole() {
    subTitle("회원 권한(역할) 변경 (Change Role)", 56);
    const userId = await io.required("권한을 변경할 대상 ID 입력", { hints: [["gst_han", "gst_han"], ["resi_park", "resi_park"]] });
    const u = findUser(userId);
    if (!u) { error("존재하지 않는 ID입니다."); return; }
    if (!(u.status == null || u.status === "ACTIVE")) { error("계정 상태가 ACTIVE가 아니면 권한을 변경할 수 없습니다."); return; }
    println(IND, GRY("  현재 권한: "), u.role);
    let newRole;
    for (;;) {
      newRole = await io.fromSet("변경할 권한(역할) 입력 (예: AGY, REV)", ROLES);
      if (newRole === u.role) { error("현재 보유 중인 권한과 동일합니다. 다른 권한을 입력하세요."); continue; }
      break;
    }
    const reason = await io.optional("변경 사유 (엔터=생략)", { hints: [["생략 (Enter)", ""]] });
    if (!(await io.confirmYN(`정말로 권한을 [${u.role} -> ${newRole}]로 변경하시겠습니까? (Y/N)`))) { error("권한 변경을 취소하였습니다."); return; }
    // 권한 변경과 변경 이력 저장은 한 트랜잭션으로 처리됩니다 (둘 중 하나라도 실패하면 둘 다 취소)
    db.roleHist.push({ user: u.id, before: u.role, after: newRole, by: "adm01", at: TODAY, reason });
    u.role = newRole; u.updated = `${TODAY} 12:00:00`;
    success("권한(역할) 변경 처리가 완료되었습니다.");
    println(IND, GRY(`  role_change_hist 기록: ${db.roleHist.at(-1).before} → ${newRole} · 변경자 adm01 · 사유 ${reason || "-"}`));
  }

  // ------------------------------------------------
  // 예산 관리 (USH_AdminBudgetService + USH_BudgetDAO)
  // ------------------------------------------------
  async function budgetMenu() {
    for (;;) {
      subTitle("예산 관리 메뉴 (Budget Control)");
      option("1", "예산 변경 이력(History) 조회");
      option("2", "예산 사용 현황(Usage) 실시간 조회");
      bar();
      option("0", "이전 메뉴로 돌아가기 (Back)");
      blank();
      const no = await menuPick(0, 2);
      if (no === 0) return;
      if (no === 1) await budgetHist();
      else await budgetUsage();
    }
  }

  async function budgetHist() {
    subTitle("예산 변경 이력 조회 (Budget History)");
    println(IND, GRY("  [안내] 값을 입력하지 않고 엔터(Enter)를 치면 해당 조건은 생략됩니다."));
    const skip = [["건너뛰기 (Enter)", ""]];
    let projectId = null;
    for (;;) {
      const s = await io.optional("프로젝트 ID", { hints: [...skip, ["2001", "2001"], ["2003", "2003"]] });
      if (s == null) break;
      if (/^[+-]?\d+$/.test(s)) { projectId = Number(s); break; }
      error("숫자만 입력 가능합니다. (예: 1001)");
    }
    const start = await io.date("변경일 시작(YYYY-MM-DD)", false, skip) || null;
    const end = await io.date("변경일 끝(YYYY-MM-DD)", false, skip) || null;
    let limit = 100;
    for (;;) {
      const s = await io.optional("조회 건수(기본값: 100)", { hints: [["기본값 (Enter)", ""], ["3", "3"]] });
      if (s == null) break;
      if (/^[+-]?\d+$/.test(s)) { limit = Number(s); break; }
      error("숫자만 입력 가능합니다. (예: 100)");
    }
    const rows = db.budgetHist
      .filter(([, pid, , , at]) => (projectId == null || pid === projectId) && (!start || at.slice(0, 10) >= start) && (!end || at.slice(0, 10) <= end))
      .sort((a, b) => (a[4] === b[4] ? b[0] - a[0] : a[4] < b[4] ? 1 : -1))
      .slice(0, Math.max(0, limit));

    blank();
    println(IND, PRIB(`◈ 예산 변경 이력 결과 (최대 ${limit}건)`));
    if (!rows.length) {
      println(IND, GRY("  조회 결과가 없습니다."));
    } else {
      const rule = "-".repeat(120);
      println(IND, WHTB([padR("HIST_ID", 8), padR("PROJECT", 8), padL("BEFORE(원)", 15), padL("AFTER(원)", 15), padL("DIFF(원)", 15), padR("CHANGED_BY", 12), padR("CHANGED_AT", 12), "REASON"].join(" | ")));
      println(IND, GRY(rule));
      rows.forEach(([hid, pid, before, after, at, by, reason]) => {
        const diff = after - before;
        const color = diff > 0 ? SUC : diff < 0 ? ERR : WHT;
        println(IND, [padR(hid, 8), padR(pid, 8), padL(won(before), 15), padL(won(after), 15)].join(" | ") + " | ", color(padL((diff > 0 ? "+" : "") + won(diff), 15)), " | " + [padR(nvl(by), 12), padR(at.slice(0, 10), 12), cut(nvl(reason), 20)].join(" | "));
      });
      println(IND, GRY(rule));
    }
    await io.optional("엔터를 누르면 이전 메뉴로 돌아갑니다.", { hints: [["돌아가기 (Enter)", ""]] });
  }

  const usageOf = (p) => {
    const used = p.lines.filter((l) => l[4] === 1).reduce((sum, l) => sum + l[1], 0);
    const pct = p.total === 0 ? 0 : Math.round((used * 10000) / p.total) / 100;
    return { used, remain: p.total - used, pct };
  };

  async function budgetUsage() {
    for (;;) {
      subTitle("예산 사용 현황 전체 조회 (Budget Usage Overview)");
      const rule = "-".repeat(104);
      println(IND, WHTB([padR("PROJECT", 8), padR("공고명", 28), padL("총액(원)", 15), padL("집행액(원)", 15), padL("잔액(원)", 15), padR("집행률(%)", 8)].join(" | ")));
      println(IND, GRY(rule));
      db.projects.forEach((p) => {
        const u = usageOf(p);
        println(IND, [padR(p.id, 8), padR(cut(p.title, 26), 28), padL(won(p.total), 15), padL(won(u.used), 15), padL(won(u.remain), 15), padL(u.pct.toFixed(2), 6) + "%"].join(" | "));
      });
      println(IND, GRY(rule));
      blank();
      option("1", "프로젝트 예산 상세 조회 (집행 내역 포함)");
      bar();
      option("0", "이전 메뉴로 돌아가기 (Back)");
      blank();
      const no = await menuPick(0, 1);
      if (no === 0) return;
      const pid = await io.intInRange("상세 조회할 PROJECT_ID 입력", 1, 2147483647, { hints: db.projects.map((p) => [String(p.id), String(p.id)]) });
      const p = db.projects.find((x) => x.id === pid);
      if (!p) { error(`해당 PROJECT_ID(${pid})가 존재하지 않거나 연결된 공고가 없습니다.`); continue; }
      const u = usageOf(p);
      const row = (label, value, color = WHT) => println(IND, PRI("│  "), GRY(padR(label, 12) + " : "), color(value));
      blank();
      println(IND, PRIB("◈ 프로젝트 예산 상세 정보 (Project Detail)"));
      println(IND, PRI("┌" + "─".repeat(60) + "┐"));
      row("PROJECT_ID", String(p.id)); row("공고명", p.title);
      println(IND, PRI("├" + "─".repeat(60) + "┤"));
      row("총 배정 예산", won(p.total) + " 원", PRI); row("집행 승인액", won(u.used) + " 원", ERR); row("현재 잔액", won(u.remain) + " 원", SUC);
      println(IND, PRI("├" + "─".repeat(60) + "┤"));
      row("집행률", u.pct.toFixed(2) + " %");
      println(IND, PRI("└" + "─".repeat(60) + "┘"));
      blank();
      println(IND, PRIB("◈ 집행(지급) 내역 리스트"));
      if (!p.lines.length) { println(IND, GRY("  지급 내역이 존재하지 않습니다.")); continue; }
      const rule2 = "-".repeat(88);
      println(IND, WHTB([padR("회차", 6), padL("금액(원)", 15), padR("상태", 10), padR("요청일", 12), padR("승인(Y/N)", 8), padR("승인자", 10), padR("승인일", 12)].join(" | ")));
      println(IND, GRY(rule2));
      p.lines.forEach(([round, amt, st, req, ok, by, at]) => {
        println(IND, [padR(round, 6), padL(won(amt), 15), padR(st, 10), padR(req, 12)].join(" | ") + " | ", (ok ? SUC : GRY)(padR(ok ? "Y" : "N", 8)), " | " + [padR(nvl(by), 10), padR(nvl(at), 12)].join(" | "));
      });
      println(IND, GRY(rule2));
    }
  }

  // ------------------------------------------------
  // 선정 통계 (USH_AdminStatsService + USH_StatsDAO)
  // ------------------------------------------------
  async function statsMenu() {
    const back = () => io.optional("엔터를 누르면 이전 메뉴로 돌아갑니다.", { hints: [["돌아가기 (Enter)", ""]] });
    const rule = "-".repeat(48);
    for (;;) {
      subTitle("선정 통계 조회 (Statistics & Reports)");
      option("1", "연도별 선정 건수 현황");
      option("2", "기관별 선정 건수 현황");
      option("3", "연구과제 평균 경쟁률 분석");
      bar();
      option("0", "이전 메뉴로 돌아가기 (Back)");
      blank();
      const no = await menuPick(0, 3);
      if (no === 0) return;
      if (no === 1) {
        subTitle("연도별 선정 건수 현황 (Selected Projects by Year)");
        println(IND, WHTB(padR("연도(Year)", 10) + " | " + "총 선정 건수"));
        println(IND, GRY(rule));
        db.byYear.forEach(([y, c]) => println(IND, padR(y, 12) + " | ", PRI(padR(c, 12)), " 건"));
        println(IND, GRY(rule));
      } else if (no === 2) {
        subTitle("기관별 선정 건수 현황 (Selected Projects by Agency)");
        println(IND, WHTB(padR("기관명 (Agency)", 25) + " | " + "총 선정 건수"));
        println(IND, GRY(rule));
        db.byAgency.forEach(([a, c]) => println(IND, padR(a, 25) + " | ", PRI(padR(c, 12)), " 건"));
        println(IND, GRY(rule));
      } else {
        subTitle("연구과제 평균 경쟁률 분석 (Average Competition Rate)");
        println(IND, PRI("┌" + "─".repeat(46) + "┐"));
        println(IND, PRI("│  "), GRY(padR("현재 평균 경쟁률", 15) + " : "), WHTB(db.avgRate.toFixed(2) + " : 1"));
        println(IND, PRI("└" + "─".repeat(46) + "┘"));
      }
      await back();
    }
  }

  // ------------------------------------------------
  // 공고 상태 강제 변경 (USH_AdminAnnouncementService + USH_AnnouncementDAO)
  // ------------------------------------------------
  const ANN_STATUS = ["공고중", "공고예정", "마감"];
  async function annFlow() {
    for (;;) {
      subTitle("시스템 설정 : 게시물 관리 (Announcement Control)");
      option("1", "공고 상태(Status) 강제 변경");
      bar();
      option("0", "이전 메뉴로 돌아가기 (Back)");
      blank();
      const no = await menuPick(0, 1);
      if (no === 0) return;
      await forceAnnStatus();
    }
  }

  async function forceAnnStatus() {
    for (;;) {
      subTitle("공고 상태 강제 변경 (Force Status Change)");
      const rule = "-".repeat(104);
      const list = [...db.anns].sort((a, b) => (a.end === b.end ? a.id - b.id : a.end < b.end ? 1 : -1));
      println(IND, WHTB([padR("ID", 6), padR("상태", 8), padR("시작일", 12), padR("마감일", 12), padR("기관명", 15), "제목"].join(" | ")));
      println(IND, GRY(rule));
      list.forEach((a) => {
        const color = a.status === "공고중" ? SUC : a.status === "마감" ? ERR : a.status === "공고예정" ? PRI : WHT;
        println(IND, padR(a.id, 6) + " | ", color(padR(a.status, 8)), " | " + [padR(a.start, 12), padR(a.end, 12), padR(cut(a.agency, 14), 15), cut(a.title, 30)].join(" | "));
      });
      println(IND, GRY(rule));

      const annId = await io.intInRange("상태 변경할 공고 ID 입력 (0: 이전 메뉴로 돌아가기)", 0, 2147483647, { hints: [["103 (마감 · 기간 지남)", "103"], ["104 (마감 · 기간 남음)", "104"], ["0", "0"]] });
      if (annId === 0) return;
      const info = db.anns.find((a) => a.id === annId);
      if (!info) { error(`해당 공고 ID(${annId})를 찾을 수 없습니다.`); continue; }
      blank();
      println(IND, PRI("┌─ [ 선택한 공고 정보 ] " + "─".repeat(24) + "┐"));
      println(IND, PRI("│  "), GRY("현재 상태 : "), WHT(info.status));
      println(IND, PRI("│  "), GRY("마감 일자 : "), WHT(info.end || "미설정"));
      println(IND, PRI("└" + "─".repeat(47) + "┘"));

      const next = await io.required("변경할 상태 (공고중 / 공고예정 / 마감)", { hints: ANN_STATUS.map((s) => [s, s]) });
      if (!ANN_STATUS.includes(next)) { error("잘못된 상태입니다. (공고중, 공고예정, 마감 중 하나만 입력 가능)"); continue; }
      if (next === info.status) { error(`이미 선택하신 상태(${next})로 설정되어 있습니다.`); continue; }
      // 정책: 마감 → 공고중 은 마감일이 오늘 이후일 때만 가능
      if (next === "공고중" && info.status === "마감") {
        if (!info.end) { error("마감일이 설정되어 있지 않아 '공고중'으로 변경할 수 없습니다."); continue; }
        if (!(info.end > TODAY)) { error(`공고 기간이 남아있지 않아 '공고중'으로 변경할 수 없습니다. (마감일: ${info.end})`); continue; }
      }
      if (!(await io.confirmYN(`상태를 [${info.status} -> ${next}]로 강제 변경하시겠습니까? (Y/N)`))) { error("상태 변경을 취소했습니다."); continue; }
      info.status = next;
      success("공고 상태가 성공적으로 변경되었습니다.");
    }
  }

  // ------------------------------------------------
  // 권한 신청 관리 (USH_AdminRoleApplicationService + USH_RoleApplicationDAO)
  // ------------------------------------------------
  async function roleMenu() {
    for (;;) {
      subTitle("권한 신청 관리 (Role Application)");
      option("1", "권한 신청(Pending) 목록 전체 조회");
      bar();
      option("0", "이전 메뉴로 돌아가기 (Back)");
      blank();
      const no = await menuPick(0, 1);
      if (no === 0) return;
      await pendingFlow();
    }
  }

  async function pendingFlow() {
    for (;;) {
      subTitle("권한 신청 관리 (Role Application Approval)");
      const list = db.roleApps.filter((r) => !r.done).sort((a, b) => (a.at < b.at ? 1 : -1));
      if (!list.length) { println(IND, GRY("  현재 승인 대기 중인 권한 신청 내역이 없습니다.")); return; }
      const rule = "-".repeat(80);
      println(IND, WHTB([padR("ID", 6), padR("신청자", 12), padR("신청권한", 8), padR("신청일", 12), "신청사유"].join(" | ")));
      println(IND, GRY(rule));
      list.forEach((r) => {
        let reason = r.reason == null ? "사유 없음" : r.reason;
        if (reason.length > 24) reason = reason.slice(0, 22) + "..";
        println(IND, padR(r.id, 6) + " | " + padR(r.user, 12) + " | ", PRI(padR(r.role, 8)), " | " + padR(r.at, 12) + " | " + reason);
      });
      println(IND, GRY(rule));

      const id = await io.intInRange("처리할 신청 ID 입력 (0: 이전 메뉴로 돌아가기)", 0, 2147483647, { hints: [...list.map((r) => [String(r.id), String(r.id)]), ["0", "0"]] });
      if (id === 0) return;
      const target = list.find((r) => r.id === id);
      if (!target) { error("방금 출력된 대기 목록에 존재하지 않는 ID입니다."); continue; }
      blank();
      println(IND, PRI("┌─ [ 선택한 신청 내역 ] " + "─".repeat(24) + "┐"));
      println(IND, PRI("│  "), GRY("신청자 ID : "), WHT(target.user));
      println(IND, PRI("│  "), GRY("신청 권한 : "), WHT(target.role));
      println(IND, PRI("└" + "─".repeat(47) + "┘"));
      blank();
      option("1", "권한 승인 처리 (Approve)");
      option("2", "권한 거부 처리 (Reject)");
      bar();
      option("0", "작업 취소 (Cancel)");
      const no = await io.intInRange("처리 방식 선택", 0, 2);
      if (no === 0) continue;
      if (no === 1) {
        // PENDING 인 신청만 승인 → 신청자 권한 변경 (한 트랜잭션)
        const user = findUser(target.user);
        if (target.done || !user) { error("이미 처리되었거나 오류가 발생했습니다."); continue; }
        target.done = "APPROVED"; user.role = target.role; user.updated = `${TODAY} 12:00:00`;
        success("해당 권한 신청이 정상적으로 승인 처리되었습니다.");
        println(IND, GRY(`  userinfo 갱신: ${target.user} 의 권한이 ${target.role} 로 변경되었습니다.`));
      } else {
        inputTag("거부 사유 입력");
        const reason = await readLine({ hints: [["서류 미비", "증빙 서류 미비"]] });
        if (target.done) { error("이미 처리되었거나 오류가 발생했습니다."); continue; }
        target.done = "REJECTED"; target.rejectReason = reason;
        success("해당 권한 신청이 거부(반려) 처리되었습니다.");
      }
    }
  }

  // ------------------------------------------------
  // 실행 · 다시 시작 · 열기/닫기
  // ------------------------------------------------
  async function start() {
    generation += 1;
    if (pending) { const p = pending; pending = null; p.reject(new Restart()); }
    db = freshData();
    screen.replaceChildren();
    line = null;
    liveOptions = [];
    const myGen = generation;
    println(GRY("$ java -cp bin;libs/ojdbc8.jar kr.krd.main.UserMain"));
    println(GRY("  (데모: 실제 Oracle DB 대신 가상 데이터로 동작합니다 · 오늘 날짜 " + TODAY + ")"));
    try {
      await mainMenu();
    } catch (err) {
      if (err instanceof Restart || myGen !== generation) return;
      if (!(err instanceof Exit)) { console.error(err); println(ERR("  예기치 못한 오류가 발생했습니다.")); }
      blank();
      println(GRY("Process finished with exit code 0"));
      input.disabled = true;
      setHints([["▶ 다시 실행", "__restart__"]]);
      scrollDown();
    }
  }

  let started = false;
  document.querySelectorAll("[data-krd-demo-open]").forEach((button) => {
    button.addEventListener("click", () => {
      // 터미널 글꼴(D2Coding: 한글 2칸 · 영문 1칸)은 데모를 처음 열 때만 불러옵니다
      if (!document.querySelector("link[data-krd-font]")) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/d2coding@1.3.2/d2coding-full.css";
        link.dataset.krdFont = "";
        document.head.appendChild(link);
      }
      dialog.showModal();
      document.body.style.overflow = "hidden";
      if (!started) { started = true; start(); } else { scrollDown(); }
      if (window.matchMedia("(hover: hover)").matches && !input.disabled) input.focus({ preventScroll: true });
    });
  });
  restartButton.addEventListener("click", () => start());
  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { document.body.style.overflow = ""; });
  // 터미널 아무 곳이나 누르면 입력창으로 초점을 옮깁니다 (글자를 드래그해 복사할 때는 제외)
  screen.addEventListener("mouseup", (event) => {
    if (event.target.closest("button")) return;
    if (window.getSelection()?.toString()) return;
    if (!input.disabled) input.focus({ preventScroll: true });
  });
})();

/**
 * PRD 11-2 화면 부품 규칙표 · 11-3 화면 연결 규칙을 그대로 옮긴 판정 로직.
 * 판정은 이 파일 안에서만 한다.
 */

import {
  Answers,
  FollowUpId,
  Track,
  UNKNOWN,
  followUpById,
  followUpsFor,
} from "@/data/questions";

export type PartId =
  | "A_LIST"
  | "A_DETAIL"
  | "A_FORM"
  | "A_SUMMARY"
  | "A_SEARCH"
  | "B_INPUT"
  | "B_STEPS"
  | "B_RESULT"
  | "B_HISTORY"
  | "B_NOTE"
  | "C_MAIN"
  | "C_SECTION"
  | "C_SUB"
  | "C_CONTACT";

export type Screen = {
  id: PartId;
  /** 부품 기본명 (PRD 11-4 "생성되는 화면" 열 기준) */
  baseName: string;
  /** Q1 입력값 + 부품 기본명 (PRD 11-2 화면 이름 생성 규칙) */
  name: string;
  /** 이 화면에 딸려오는 것 */
  includes: string[];
};

export type Link = {
  /** 화면 이름. C 갈래의 "어디서든"은 화면이 아니다. */
  from: string;
  to: string;
  /** 이동 방법. 없으면 빈 문자열 */
  via: string;
  twoWay: boolean;
  /** 그대로 화면에 쓸 수 있는 한 줄 */
  text: string;
};

export type DefaultUsed = {
  id: FollowUpId;
  question: string;
  /** 적용된 기본값 */
  applied: string;
};

export type Plan = {
  screens: Screen[];
  links: Link[];
  defaultsUsed: DefaultUsed[];
  /** 규칙상 켜지지 않은 부품 이름 (PRD 11-2 "부품" 열 기준) */
  offParts: string[];
};

/** PRD 11-2 화면 상한 */
const MAX_SCREENS = 5;

const ANYWHERE = "어디서든";

type Resolved = Record<FollowUpId, string>;

type PartRule = {
  id: PartId;
  track: Track;
  /** 화면 이름에 붙는 기본명 (PRD 11-4 "생성되는 화면" 열 기준) */
  baseName: string;
  /** 부품 이름 (PRD 11-2 "부품" 열). 제외 범위에 쓴다. */
  partName: string;
  /** PRD 11-2 "켜지는 조건" */
  when: (v: Resolved) => boolean;
  /** PRD 11-2 "딸려오는 것" 중 그 화면 안에 들어가는 것 */
  extras?: string[];
  /** 화면이 아니라 다른 화면에 포함되는 부품 */
  includedIn?: PartId;
};

/** PRD 11-2 화면 부품 규칙표 */
const PART_RULES: PartRule[] = [
  {
    id: "A_LIST",
    track: "A",
    baseName: "목록",
    partName: "목록 화면",
    when: () => true,
    extras: ["빈 상태 안내"],
  },
  {
    id: "A_DETAIL",
    track: "A",
    baseName: "상세",
    partName: "상세 화면",
    when: (v) => v.A1 === "있다",
  },
  {
    id: "A_FORM",
    track: "A",
    baseName: "입력 폼",
    partName: "입력 폼",
    when: (v) => v.A2 === "직접 등록",
    extras: ["필수 입력 오류 안내"],
  },
  {
    id: "A_SUMMARY",
    track: "A",
    baseName: "요약",
    partName: "요약 화면",
    when: (v) => v.A3 === "필요하다",
  },
  {
    id: "A_SEARCH",
    track: "A",
    baseName: "검색·필터",
    partName: "검색·필터",
    when: (v) => v.A4 === "그렇다",
    includedIn: "A_LIST",
  },

  {
    id: "B_INPUT",
    track: "B",
    baseName: "입력 화면",
    partName: "단일 입력 화면",
    when: (v) => v.B1 === "1~3개",
  },
  {
    id: "B_STEPS",
    track: "B",
    baseName: "단계별 질문 화면",
    partName: "단계별 질문 화면",
    when: (v) => v.B1 === "4개 이상",
    extras: ["진행 표시"],
  },
  {
    id: "B_RESULT",
    track: "B",
    baseName: "결과 화면",
    partName: "결과 화면",
    when: () => true,
    extras: ["다시 하기 버튼"],
  },
  {
    id: "B_HISTORY",
    track: "B",
    baseName: "기록 목록 화면",
    partName: "기록 목록 화면",
    when: (v) => v.B3 === "필요하다",
  },
  {
    // PRD 11-2 규칙표에는 없고 11-1 B2의 "결과" 열에 적힌 줄이다.
    // 화면이 아니라 결과 화면 안에 들어가는 요소다.
    id: "B_NOTE",
    track: "B",
    baseName: "설명 영역",
    partName: "결과 화면 설명 영역",
    when: (v) => v.B2 === "붙는다",
    includedIn: "B_RESULT",
  },

  {
    id: "C_MAIN",
    track: "C",
    baseName: "메인 페이지",
    partName: "메인 페이지",
    when: () => true,
  },
  {
    id: "C_SECTION",
    track: "C",
    baseName: "목록 섹션",
    partName: "목록 섹션",
    when: (v) => v.C2 === "있다",
    includedIn: "C_MAIN",
  },
  {
    id: "C_SUB",
    track: "C",
    baseName: "하위 페이지",
    partName: "하위 페이지",
    when: (v) => v.C1 === "5개 이상",
  },
  {
    id: "C_CONTACT",
    track: "C",
    baseName: "문의 폼",
    partName: "문의 폼",
    when: (v) => v.C3 === "필요하다",
  },
];

/**
 * PRD 11-2 "화면 상한 5개. 초과 시 절단 순서".
 * 앞에 적힌 화면부터 남긴다.
 */
const KEEP_ORDER: Record<Track, PartId[]> = {
  A: ["A_LIST", "A_FORM", "A_DETAIL", "A_SUMMARY"],
  B: ["B_INPUT", "B_STEPS", "B_RESULT", "B_HISTORY"],
  C: ["C_MAIN", "C_SUB", "C_CONTACT"],
};

/**
 * "잘 모르겠어요"와 미응답에 기본값을 적용한다.
 * 어떤 항목이 기본값이었는지 함께 돌려준다.
 */
function resolve(input: Answers): {
  values: Resolved;
  defaultsUsed: DefaultUsed[];
} {
  const values = {} as Resolved;
  const defaultsUsed: DefaultUsed[] = [];

  for (const id of Object.keys(followUpById) as FollowUpId[]) {
    values[id] = followUpById[id].unknownDefault;
  }

  for (const question of followUpsFor(input.track)) {
    const given = input.answers[question.id];
    if (given === undefined || given === UNKNOWN) {
      defaultsUsed.push({
        id: question.id,
        question: question.question,
        applied: question.unknownDefault,
      });
      continue;
    }
    values[question.id] = given;
  }

  return { values, defaultsUsed };
}

/** PRD 11-2 화면 이름 생성 규칙 — Q1 입력값 + 부품 기본명 */
function screenName(q1: string, baseName: string): string {
  const subject = q1.trim();
  return subject ? `${subject} ${baseName}` : baseName;
}

function buildScreens(
  input: Answers,
  values: Resolved,
): { screens: Screen[]; offParts: string[] } {
  const trackRules = PART_RULES.filter((rule) => rule.track === input.track);
  const onRules = trackRules.filter((rule) => rule.when(values));

  let screens: Screen[] = onRules
    .filter((rule) => !rule.includedIn)
    .map((rule) => ({
      id: rule.id,
      baseName: rule.baseName,
      name: screenName(input.q1, rule.baseName),
      includes: [...(rule.extras ?? [])],
    }));

  // PRD 11-2 화면 상한. 앞에 적힌 화면부터 남긴다.
  if (screens.length > MAX_SCREENS) {
    const keepOrder = KEEP_ORDER[input.track];
    const kept = new Set(
      [...screens]
        .sort((a, b) => keepOrder.indexOf(a.id) - keepOrder.indexOf(b.id))
        .slice(0, MAX_SCREENS)
        .map((screen) => screen.id),
    );
    screens = screens.filter((screen) => kept.has(screen.id));
  }

  for (const rule of onRules) {
    if (!rule.includedIn) continue;
    const host = screens.find((screen) => screen.id === rule.includedIn);
    if (host) host.includes.push(rule.baseName);
  }

  const live = new Set<PartId>();
  for (const screen of screens) live.add(screen.id);
  for (const rule of onRules) {
    if (rule.includedIn && live.has(rule.includedIn)) live.add(rule.id);
  }

  const offParts = trackRules
    .filter((rule) => !live.has(rule.id))
    .map((rule) => rule.partName);

  return { screens, offParts };
}

function linkText(from: string, to: string, via: string, twoWay: boolean) {
  if (twoWay) return `${from} ↔ ${to}${via ? ` (${via})` : ""}`;
  if (from === to) return `${from} 안에서 ${via}`;
  if (!via) return `${from} → ${to}`;
  return `${from} → ${via} → ${to}`;
}

/** PRD 11-3 화면 연결 규칙 */
function buildLinks(input: Answers, screens: Screen[]): Link[] {
  const has = (id: PartId) => screens.some((screen) => screen.id === id);
  const nameOf = (id: PartId) =>
    screens.find((screen) => screen.id === id)?.name ?? "";

  const links: Link[] = [];
  const add = (from: string, to: string, via: string, twoWay = false) => {
    links.push({ from, to, via, twoWay, text: linkText(from, to, via, twoWay) });
  };

  if (input.track === "A") {
    if (has("A_LIST") && has("A_DETAIL"))
      add(nameOf("A_LIST"), nameOf("A_DETAIL"), "항목 클릭");
    if (has("A_LIST") && has("A_FORM"))
      add(nameOf("A_LIST"), nameOf("A_FORM"), "추가 버튼");
    if (has("A_FORM") && has("A_LIST"))
      add(nameOf("A_FORM"), nameOf("A_LIST"), "입력 완료");
    if (has("A_LIST") && has("A_SUMMARY"))
      add(nameOf("A_LIST"), nameOf("A_SUMMARY"), "상단 탭", true);
  }

  if (input.track === "B") {
    const inputId: PartId | null = has("B_INPUT")
      ? "B_INPUT"
      : has("B_STEPS")
        ? "B_STEPS"
        : null;

    if (inputId && has("B_RESULT")) {
      add(nameOf(inputId), nameOf("B_RESULT"), "");
      add(nameOf("B_RESULT"), nameOf(inputId), "다시 하기");
    }
    if (has("B_RESULT") && has("B_HISTORY")) {
      add(nameOf("B_RESULT"), nameOf("B_HISTORY"), "저장");
      add(nameOf("B_HISTORY"), nameOf("B_RESULT"), "항목 클릭");
    }
  }

  if (input.track === "C") {
    if (has("C_MAIN"))
      add(nameOf("C_MAIN"), nameOf("C_MAIN"), "스크롤 이동");
    if (has("C_MAIN") && has("C_SUB"))
      add(nameOf("C_MAIN"), nameOf("C_SUB"), "");
    if (has("C_CONTACT")) add(ANYWHERE, nameOf("C_CONTACT"), "");
  }

  return links;
}

export function plan(input: Answers): Plan {
  const { values, defaultsUsed } = resolve(input);
  const { screens, offParts } = buildScreens(input, values);
  const links = buildLinks(input, screens);
  return { screens, links, defaultsUsed, offParts };
}

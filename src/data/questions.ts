/**
 * PRD 11-1 질문지를 그대로 옮긴 데이터.
 * 표에 없는 조건은 넣지 않는다.
 */

/** 화면에 노출하지 않는 내부 값 (PRD NF-03) */
export type Track = "A" | "B" | "C";
export type Audience = "self" | "team" | "guest";

/** "잘 모르겠어요"를 고른 상태 (PRD 11-6 저장 구조의 'unknown') */
export const UNKNOWN = "unknown";

export type FollowUpId =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "B1"
  | "B2"
  | "B3"
  | "C1"
  | "C2"
  | "C3";

export type Choice = {
  /** 내부 값 */
  value: string;
  /** 화면에 보이는 문구 */
  label: string;
};

/** 판정에 쓰는 답변 값 */
export type Answers = {
  q1: string;
  q2: Audience;
  track: Track;
  answers: Partial<Record<FollowUpId, string>>;
};

/** localStorage 저장 형태 (PRD 11-6) */
export type Draft = Answers & { updatedAt: number };

export const STORAGE_KEY = "vibe-prd-draft";

// ─────────────────────────────────────────────
// 공통 질문 (PRD 11-1)
//
// 공통 질문 표에는 "모르겠음 기본값" 열이 없다.
// 따라서 Q1~Q3에는 "잘 모르겠어요"를 두지 않는다.
// ─────────────────────────────────────────────

export const q1 = {
  id: "Q1",
  question: "무엇을 다루는 서비스인가요?",
  input: "text",
  prdItem: "프로젝트 이름",
  note: "여기 적은 말이 모든 화면 이름에 들어갑니다",
} as const;

export const q2 = {
  id: "Q2",
  question: "누가 쓰나요?",
  input: "choice",
  prdItem: "타겟 사용자",
  note: "쓰는 사람이 정해져야 무엇을 뺄지 정해집니다",
  choices: [
    { value: "self", label: "나만" },
    { value: "team", label: "우리 팀·가족" },
    { value: "guest", label: "손님·외부인" },
  ],
} as const;

/** Q3 선택지. label만 화면에 보이고 value는 내부에만 둔다. */
export const q3 = {
  id: "Q3",
  question: "만들려는 것과 가장 비슷한 걸 골라주세요",
  input: "choice",
  prdItem: "사용자 흐름",
  note: "이 선택이 화면 구성을 결정합니다",
  choices: [
    {
      value: "A",
      icon: "🗂",
      label: "가계부처럼",
      detail: "뭔가를 계속 적어서 쌓아둡니다",
    },
    {
      value: "B",
      icon: "🧮",
      label: "BMI 계산기처럼",
      detail: "입력하면 답이 나옵니다",
    },
    {
      value: "C",
      icon: "📄",
      label: "가게 소개 페이지처럼",
      detail: "정해진 내용을 보여줍니다",
    },
  ],
} as const;

export const AUDIENCE_LABEL: Record<Audience, string> = {
  self: "나만",
  team: "우리 팀·가족",
  guest: "손님·외부인",
};

// ─────────────────────────────────────────────
// 갈래별 후속 질문 (PRD 11-1)
// ─────────────────────────────────────────────

export type FollowUpQuestion = {
  id: FollowUpId;
  track: Track;
  question: string;
  choices: Choice[];
  /** PRD "결과" 열 */
  effect: string;
  /** PRD "모르겠음 기본값" 열이 가리키는 선택지 값 */
  unknownDefault: string;
  prdItem: string;
  note: string;
};

export const followUps: FollowUpQuestion[] = [
  {
    id: "A1",
    track: "A",
    question: "항목 하나마다 자세히 볼 내용이 있나요?",
    choices: [
      { value: "있다", label: "있다" },
      { value: "목록에 다 보인다", label: "목록에 다 보인다" },
    ],
    effect: "있다 → 상세 화면",
    unknownDefault: "있다",
    prdItem: "사용자 흐름",
    note: "자세히 볼 내용이 있으면 화면이 하나 더 필요합니다",
  },
  {
    id: "A2",
    track: "A",
    question: "사용자가 직접 등록하나요?",
    choices: [
      { value: "직접 등록", label: "직접 등록" },
      { value: "미리 넣어둔 것만 본다", label: "미리 넣어둔 것만 본다" },
    ],
    effect: "직접 등록 → 입력 폼",
    unknownDefault: "직접 등록",
    prdItem: "핵심 기능",
    note: "직접 등록한다면 입력 화면이 필요합니다",
  },
  {
    id: "A3",
    track: "A",
    question: "쌓인 것을 요약해서 봐야 하나요?",
    choices: [
      { value: "필요하다", label: "필요하다" },
      { value: "목록이면 충분하다", label: "목록이면 충분하다" },
    ],
    effect: "필요하다 → 요약 화면",
    unknownDefault: "목록이면 충분하다",
    prdItem: "핵심 기능",
    note: "요약은 없어도 되는 경우가 많습니다",
  },
  {
    id: "A4",
    track: "A",
    question: "항목이 수십 개 이상 쌓일까요?",
    choices: [
      { value: "그렇다", label: "그렇다" },
      { value: "적다", label: "적다" },
    ],
    effect: "그렇다 → 검색·필터",
    unknownDefault: "적다",
    prdItem: "비기능 요구사항",
    note: "많이 쌓이면 찾는 기능이 있어야 합니다",
  },
  {
    id: "B1",
    track: "B",
    question: "결과를 내려면 몇 가지를 물어봐야 하나요?",
    choices: [
      { value: "1~3개", label: "1~3개" },
      { value: "4개 이상", label: "4개 이상" },
    ],
    effect: "1~3개 → 단일 입력 화면 · 4개 이상 → 단계별 질문 화면",
    unknownDefault: "4개 이상",
    prdItem: "사용자 흐름",
    note: "물어볼 것이 많으면 한 화면에 다 넣지 않습니다",
  },
  {
    id: "B2",
    track: "B",
    question: "결과에 설명이나 근거가 붙나요?",
    choices: [
      { value: "붙는다", label: "붙는다" },
      { value: "값만 나온다", label: "값만 나온다" },
    ],
    effect: "붙는다 → 결과 화면에 설명 영역",
    unknownDefault: "붙는다",
    prdItem: "사용자 가치",
    note: "설명이 붙어야 결과를 믿게 됩니다",
  },
  {
    id: "B3",
    track: "B",
    question: "지난 결과를 다시 볼 수 있어야 하나요?",
    choices: [
      { value: "필요하다", label: "필요하다" },
      { value: "필요 없다", label: "필요 없다" },
    ],
    effect: "필요하다 → 기록 목록 화면",
    unknownDefault: "필요 없다",
    prdItem: "데이터 구조",
    note: "다시 본다면 저장할 곳이 필요합니다",
  },
  {
    id: "C1",
    track: "C",
    question: "보여줄 내용이 몇 덩어리인가요?",
    choices: [
      { value: "1~4개", label: "1~4개" },
      { value: "5개 이상", label: "5개 이상" },
    ],
    effect: "5개 이상 → 하위 페이지 분리",
    unknownDefault: "1~4개",
    prdItem: "사용자 흐름",
    note: "내용이 많으면 페이지를 나눕니다",
  },
  {
    id: "C2",
    track: "C",
    question: "나열해서 보여줄 것이 있나요?",
    choices: [
      { value: "있다", label: "있다" },
      { value: "없다", label: "없다" },
    ],
    effect: "있다 → 목록 섹션",
    unknownDefault: "있다",
    prdItem: "핵심 기능",
    note: "메뉴나 상품처럼 여러 개면 목록으로 만듭니다",
  },
  {
    id: "C3",
    track: "C",
    question: "연락받을 창구가 필요한가요?",
    choices: [
      { value: "필요하다", label: "필요하다" },
      { value: "필요 없다", label: "필요 없다" },
    ],
    effect: "필요하다 → 문의 폼",
    unknownDefault: "필요하다",
    prdItem: "제외 범위",
    note: "연락 방법이 없으면 보고 끝나는 페이지가 됩니다",
  },
];

export const followUpById: Record<FollowUpId, FollowUpQuestion> =
  Object.fromEntries(followUps.map((q) => [q.id, q])) as Record<
    FollowUpId,
    FollowUpQuestion
  >;

export function followUpsFor(track: Track): FollowUpQuestion[] {
  return followUps.filter((q) => q.track === track);
}

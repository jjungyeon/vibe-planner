/**
 * PRD 11-4 예시 카드 프리셋 8개.
 * 카드는 질문 답변 값만 갖는다. 결과 화면 데이터는 갖지 않는다.
 *
 * PRD 11-4에는 갈래와 생성되는 화면만 적혀 있다.
 * 화면 목록에서 역산되지 않는 값(Q2, B2, C2)은 따로 정한 값이다.
 */

import { Answers } from "@/data/questions";

export type Preset = {
  /** 내부 값 */
  id: string;
  answers: Answers;
};

export const presets: Preset[] = [
  {
    id: "daily-expense",
    answers: {
      q1: "하루 지출 기록",
      q2: "self",
      track: "A",
      answers: {
        A1: "있다",
        A2: "직접 등록",
        A3: "목록이면 충분하다",
        A4: "적다",
      },
    },
  },
  {
    id: "reading-log",
    answers: {
      q1: "개인 독서 기록",
      q2: "self",
      track: "A",
      answers: {
        A1: "있다",
        A2: "직접 등록",
        A3: "필요하다",
        A4: "적다",
      },
    },
  },
  {
    id: "club-dues",
    answers: {
      q1: "동아리 회비 관리",
      q2: "team",
      track: "A",
      answers: {
        A1: "목록에 다 보인다",
        A2: "직접 등록",
        A3: "필요하다",
        A4: "적다",
      },
    },
  },
  {
    id: "team-minutes",
    answers: {
      q1: "우리 팀 회의록 모음",
      q2: "team",
      track: "A",
      answers: {
        A1: "있다",
        A2: "직접 등록",
        A3: "목록이면 충분하다",
        A4: "그렇다",
      },
    },
  },
  {
    id: "health-calculator",
    answers: {
      q1: "간단 건강 계산기",
      q2: "guest",
      track: "B",
      answers: {
        B1: "1~3개",
        B2: "붙는다",
        B3: "필요 없다",
      },
    },
  },
  {
    id: "personality-test",
    answers: {
      q1: "성향 진단 테스트",
      q2: "guest",
      track: "B",
      answers: {
        B1: "4개 이상",
        B2: "붙는다",
        B3: "필요 없다",
      },
    },
  },
  {
    id: "small-shop",
    answers: {
      q1: "소규모 가게 소개",
      q2: "guest",
      track: "C",
      answers: {
        C1: "1~4개",
        C2: "있다",
        C3: "필요하다",
      },
    },
  },
  {
    id: "course-guide",
    answers: {
      q1: "강의 안내 페이지",
      q2: "guest",
      track: "C",
      answers: {
        C1: "5개 이상",
        C2: "있다",
        C3: "필요하다",
      },
    },
  },
];

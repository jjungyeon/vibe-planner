/**
 * PRD 11-5 줄글 경로 프롬프트 템플릿.
 *
 * 줄글은 요약·가공·재작성하지 않고 원문 그대로 끼워 넣는다.
 * 갈래 판정도 화면 계산도 하지 않는다.
 */

/** PRD 11-5 기본 목록 */
export const DEFAULT_EXCLUSIONS = [
  "로그인·회원가입",
  "결제",
  "다국어",
  "실시간 알림",
  "관리자 승인",
];

export function buildFreePrompt(freeText: string, exclusions: string): string {
  const written = exclusions.trim();
  const notMaking = written ? written : DEFAULT_EXCLUSIONS.join(", ");

  return `아래 요구사항으로 웹앱을 만들어줘.

[만들려는 것]
${freeText}

[개발 조건]
- Next.js(App Router) + TypeScript + Tailwind CSS
- 서버·DB·로그인 없이 브라우저 저장(localStorage)만 사용
- 한 번에 다 만들지 말고, 먼저 화면 목록과 파일 구조를 제안하고
  내가 확인하면 구현할 것
- 위 요구사항에 없는 기능은 추가하지 말 것.
  필요하다고 판단되면 만들지 말고 나에게 질문할 것
- 무엇을 왜 만들었는지 각 단계마다 한 줄로 설명할 것

[이번 버전에서 만들지 않을 것]
${notMaking}
`;
}

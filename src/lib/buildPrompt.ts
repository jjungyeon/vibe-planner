/**
 * 질문 경로 개발 프롬프트.
 * 답변과 판정 결과를 합쳐 문자열 하나로 만든다.
 */

import { AUDIENCE_LABEL, Answers } from "@/data/questions";
import { Plan } from "@/lib/planner";
import { DEFAULT_EXCLUSIONS } from "@/lib/buildFreePrompt";

export function buildPrompt(input: Answers, result: Plan): string {
  const subject = input.q1.trim();

  const screenList = result.screens
    .map((screen, index) => `${index + 1}. ${screen.name}`)
    .join("\n");

  const screenParts = result.screens
    .map(
      (screen) =>
        `- ${screen.name}: ${
          screen.includes.length ? screen.includes.join(", ") : "따로 없음"
        }`,
    )
    .join("\n");

  const linkList = result.links.map((link) => `- ${link.text}`).join("\n");

  // 규칙상 켜지지 않은 부품을 먼저 적고, 그 뒤에 기본 목록을 붙인다.
  const notMaking = [...result.offParts, ...DEFAULT_EXCLUSIONS]
    .map((item) => `- ${item}`)
    .join("\n");

  return `아래 요구사항으로 웹앱을 만들어줘.

[만들려는 것]
${subject}

[쓰는 사람]
${AUDIENCE_LABEL[input.q2]}

[만들 화면]
${screenList}

[각 화면에 들어갈 것]
${screenParts}

[화면 간 이동]
${linkList}

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

이 목록에 없는 기능은 추가하지 말 것.
`;
}

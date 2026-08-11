import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "무엇을 만들지 정하기",
  description: "질문에 답하면 화면 구성안과 개발 프롬프트를 만들어 줍니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

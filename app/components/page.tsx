import { Metadata } from "next";
import ComponentsClient from "./components-client";

export const metadata: Metadata = {
  title: "Component Library - Bible Soom",
  description:
    "Bible Soom의 재사용 가능한 UI 컴포넌트 라이브러리. 모든 디자인 시스템 컴포넌트를 확인하고 테스트할 수 있습니다.",
};

export default function ComponentsPage() {
  return <ComponentsClient />;
}

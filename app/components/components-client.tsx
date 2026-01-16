"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/ui/Modal";
import Drawer from "@/components/ui/Drawer";
import Tabs from "@/components/ui/Tabs";
import SectionHeader from "@/components/ui/SectionHeader";
import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";
import ColorPicker from "@/components/ui/ColorPicker";
import BackgroundDecoration from "@/components/ui/BackgroundDecoration";

// Code Snippet Component
interface CodeSnippetProps {
  code: string;
  language?: string;
}

function CodeSnippet({ code, language = "tsx" }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
        {isExpanded ? "Hide Code" : "Show Code"}
      </button>

      {isExpanded && (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={copyToClipboard}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="bg-stone-900 dark:bg-black text-stone-100 p-4 rounded-xl overflow-x-auto text-sm">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ComponentsClient() {
  // 상태 관리
  const [inputValue, setInputValue] = useState("");
  const [dropdownValue, setDropdownValue] = useState("option1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [showAlert, setShowAlert] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const categories = [
    { id: "buttons", label: "Buttons" },
    { id: "cards", label: "Cards" },
    { id: "badges", label: "Badges" },
    { id: "forms", label: "Forms" },
    { id: "layout", label: "Layout" },
    { id: "feedback", label: "Feedback" },
    { id: "special", label: "Special" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen bg-paper-50 dark:bg-primary-950 transition-colors duration-500">
      {/* 헤더 */}
      <section className="relative py-16 md:py-20 overflow-hidden border-b border-stone-200 dark:border-primary-900">
        <BackgroundDecoration variant="blob" position="top-left" />
        <BackgroundDecoration variant="gradient" position="bottom-right" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-primary-800 dark:text-primary-50 mb-4">
            Component Library
          </h1>
          <p className="text-lg text-stone-500 dark:text-primary-300 max-w-2xl mx-auto">
            Bible Soom의 재사용 가능한 UI 컴포넌트 라이브러리입니다.
            <br />
            모든 컴포넌트를 직접 테스트하고 확인할 수 있습니다.
          </p>
        </div>
      </section>

      {/* Sticky 네비게이션 */}
      <nav className="sticky top-0 z-30 bg-white/80 dark:bg-primary-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-primary-800">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToSection(category.id)}
                className="px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-primary-100 dark:hover:bg-primary-800 text-stone-600 dark:text-primary-300 transition-colors"
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-20">
        {/* Buttons Section */}
        <section id="buttons" className="scroll-mt-24">
          <SectionHeader
            title="Buttons"
            subtitle="다양한 스타일의 버튼 컴포넌트"
          />

          <div className="space-y-8">
            {/* Primary Buttons */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">1-1</span>
                  Button - Primary
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary" size="sm">
                    Small
                  </Button>
                  <Button variant="primary" size="md">
                    Medium
                  </Button>
                  <Button variant="primary" size="lg">
                    Large
                  </Button>
                  <Button variant="primary" loading>
                    Loading
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                </div>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">1-2</span>
                  Button - Secondary
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
                <div className="flex flex-wrap gap-4">
                  <Button variant="secondary">Cancel</Button>
                  <Button variant="secondary" size="sm">
                    Small Secondary
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled
                  </Button>
                </div>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">1-3</span>
                  Button - Tab
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
                <div className="flex gap-2">
                  <Button variant="tab" active={true}>
                    Active Tab
                  </Button>
                  <Button variant="tab" active={false}>
                    Inactive Tab
                  </Button>
                </div>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">1-4</span>
                  Button - Icon
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
                <div className="flex gap-4">
                  <Button
                    variant="icon"
                    size="sm"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    }
                  />
                  <Button
                    variant="icon"
                    size="md"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                    }
                  />
                  <Button
                    variant="icon"
                    size="lg"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-7 h-7"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Button Code Examples */}
            <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl">
              <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
                Usage Examples
              </h4>
              <CodeSnippet
                code={`import Button from "@/components/ui/Button";

// Primary Button
<Button variant="primary" size="md">
  Click Me
</Button>

// Secondary Button
<Button variant="secondary">
  Cancel
</Button>

// Tab Button
<Button variant="tab" active={true}>
  Active Tab
</Button>

// Icon Button
<Button variant="icon" icon={<SearchIcon />} />

// Loading State
<Button variant="primary" loading>
  Loading...
</Button>

// Disabled State
<Button variant="primary" disabled>
  Disabled
</Button>`}
              />
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section id="cards" className="scroll-mt-24">
          <SectionHeader
            title="Cards"
            subtitle="다양한 타입의 카드 컴포넌트"
          />

          <div className="space-y-6">
            {/* Base Card */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">2-1</span>
                  Card - Base
                </h3>
              </div>
              <Card type="base">
                <p className="text-stone-600 dark:text-primary-300">
                  기본 카드 스타일입니다. 다양한 콘텐츠를 담을 수 있습니다.
                </p>
              </Card>
            </div>

            {/* Stat Card */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">2-2</span>
                  Card - Stat
                </h3>
              </div>
              <Card
                type="stat"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                }
                count={42}
                label="Total Users"
              />
            </div>

            {/* Result Card */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">2-3</span>
                  Card - Result
                </h3>
              </div>
              <Card
                type="result"
                badge="Genesis"
                subtitle="1:1"
                href="#"
              >
                <p className="font-bible text-2xl text-primary-900 dark:text-primary-50">
                  태초에 하나님이 천지를 창조하시니라
                </p>
              </Card>
            </div>

            {/* Book Card */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">2-4</span>
                  Card - Book
                </h3>
              </div>
              <Card type="book" decoration={true}>
                <h3 className="text-xl font-bold text-primary-900 dark:text-primary-50 mb-2">
                  Book Card
                </h3>
              <p className="text-stone-600 dark:text-primary-300">
                배경 장식이 있는 카드입니다.
              </p>
            </Card>
            </div>
          </div>

          {/* Card Code Examples */}
          <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl mt-6">
            <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
              Usage Examples
            </h4>
            <CodeSnippet
              code={`import Card from "@/components/ui/Card";

// Base Card
<Card type="base">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</Card>

// Stat Card
<Card
  type="stat"
  icon={<UserIcon />}
  count={42}
  label="Total Users"
/>

// Result Card (clickable)
<Card
  type="result"
  badge="Genesis"
  subtitle="1:1"
  href="/passage/gen1"
>
  <p>태초에 하나님이 천지를 창조하시니라</p>
</Card>

// Book Card with decoration
<Card type="book" decoration={true}>
  <h3>Beautiful Card</h3>
  <p>With background decoration</p>
</Card>`}
            />
          </div>
        </section>

        {/* Badges Section */}
        <section id="badges" className="scroll-mt-24">
          <SectionHeader
            title="Badges"
            subtitle="라벨 및 태그 컴포넌트"
          />

          <div className="space-y-4">
            <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">3</span>
                Badge
              </h3>
            </div>
            <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <div className="flex flex-wrap gap-4">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="primary" size="sm">
                Small
              </Badge>
              <Badge variant="primary" size="lg">
                Large
              </Badge>
              </div>
            </div>
          </div>

          {/* Badge Code Examples */}
          <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl mt-6">
            <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
              Usage Examples
            </h4>
            <CodeSnippet
              code={`import Badge from "@/components/ui/Badge";

// Different variants
<Badge variant="primary">Primary</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>

// Different sizes
<Badge variant="primary" size="sm">Small</Badge>
<Badge variant="primary" size="md">Medium</Badge>
<Badge variant="primary" size="lg">Large</Badge>`}
            />
          </div>
        </section>

        {/* Forms Section */}
        <section id="forms" className="scroll-mt-24">
          <SectionHeader
            title="Forms"
            subtitle="입력 및 선택 컴포넌트"
          />

          <div className="space-y-4">
            <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">4</span>
                Forms (Input, Label, Dropdown)
              </h3>
            </div>
            <div className="space-y-6 p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              {/* Input */}
              <div>
                <Label htmlFor="demo-input">이메일 주소</Label>
                <Input
                  id="demo-input"
                  type="email"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="example@email.com"
                />
              </div>

              {/* Input with Icon */}
              <div>
                <Label htmlFor="search-input">검색 (with Icon)</Label>
                <Input
                  id="search-input"
                  type="search"
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="검색어를 입력하세요"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Dropdown */}
              <div>
                <Label htmlFor="demo-dropdown">옵션 선택</Label>
                <Dropdown
                  options={[
                    { value: "option1", label: "옵션 1" },
                    { value: "option2", label: "옵션 2" },
                    { value: "option3", label: "옵션 3" },
                  ]}
                  value={dropdownValue}
                  onChange={setDropdownValue}
                />
              </div>
            </div>
          </div>

          {/* Forms Code Examples */}
          <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl mt-6">
            <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
              Usage Examples
            </h4>
            <CodeSnippet
              code={`import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Dropdown from "@/components/ui/Dropdown";

const [inputValue, setInputValue] = useState("");
const [dropdownValue, setDropdownValue] = useState("option1");

// Basic Input
<div>
  <Label htmlFor="email">이메일 주소</Label>
  <Input
    id="email"
    type="email"
    value={inputValue}
    onChange={setInputValue}
    placeholder="example@email.com"
  />
</div>

// Input with Icon
<Input
  type="search"
  value={inputValue}
  onChange={setInputValue}
  placeholder="검색..."
  icon={<SearchIcon />}
/>

// Input with Error
<Input
  type="text"
  value={inputValue}
  onChange={setInputValue}
  error="This field is required"
/>

// Dropdown
<Dropdown
  options={[
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" }
  ]}
  value={dropdownValue}
  onChange={setDropdownValue}
  placeholder="Select an option"
/>`}
            />
          </div>
        </section>

        {/* Layout Section */}
        <section id="layout" className="scroll-mt-24">
          <SectionHeader
            title="Layout"
            subtitle="모달, 드로어, 탭 등 레이아웃 컴포넌트"
          />

          <div className="space-y-8">
            {/* Modal Demo */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">5-1</span>
                  Modal
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
              >
                <p className="text-stone-600 dark:text-primary-300">
                  이것은 모달 컴포넌트의 예시입니다. Escape 키나 외부를
                  클릭하여 닫을 수 있습니다.
                </p>
              </Modal>
              </div>
            </div>

            {/* Drawer Demo */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">5-2</span>
                  Drawer
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <Button onClick={() => setIsDrawerOpen(true)}>
                Open Drawer
              </Button>
              <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                position="right"
              >
                <h3 className="text-xl font-bold text-primary-900 dark:text-primary-50 mb-4">
                  Drawer Content
                </h3>
                <p className="text-stone-600 dark:text-primary-300">
                  드로어는 오른쪽에서 슬라이드되어 나타납니다.
                </p>
              </Drawer>
              </div>
            </div>

            {/* Tabs Demo */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">5-3</span>
                  Tabs
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <Tabs
                tabs={[
                  { id: "tab1", label: "Tab 1", count: 5 },
                  { id: "tab2", label: "Tab 2", count: 12 },
                  { id: "tab3", label: "Tab 3" },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="contained"
              />
              <div className="mt-6 p-4 bg-stone-50 dark:bg-primary-950 rounded-xl">
                <p className="text-stone-600 dark:text-primary-300">
                  Active Tab: <strong>{activeTab}</strong>
                </p>
              </div>
              </div>
            </div>

            {/* SectionHeader Demo */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">5-4</span>
                  SectionHeader
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <SectionHeader
                title="Section Header"
                subtitle="This is a subtitle"
                action={<Button size="sm">Action</Button>}
              />
              <p className="text-stone-600 dark:text-primary-300">
                섹션 헤더는 제목, 부제목, 액션 버튼을 포함할 수 있습니다.
              </p>
              </div>
            </div>
          </div>

          {/* Layout Code Examples */}
          <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl mt-6">
            <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
              Usage Examples
            </h4>
            <CodeSnippet
              code={`import Modal from "@/components/ui/Modal";
import Drawer from "@/components/ui/Drawer";
import Tabs from "@/components/ui/Tabs";
import SectionHeader from "@/components/ui/SectionHeader";

const [isModalOpen, setIsModalOpen] = useState(false);
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [activeTab, setActiveTab] = useState("tab1");

// Modal
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Modal Title"
>
  <p>Modal content here...</p>
</Modal>

// Drawer (supports left, right, top, bottom)
<Drawer
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  position="right"
  width="400px"
>
  <h3>Drawer Content</h3>
</Drawer>

// Tabs
<Tabs
  tabs={[
    { id: "tab1", label: "Tab 1", count: 5 },
    { id: "tab2", label: "Tab 2" }
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="contained"
/>

// Section Header
<SectionHeader
  title="Section Title"
  subtitle="Optional subtitle"
  action={<Button>Action</Button>}
/>`}
            />
          </div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="scroll-mt-24">
          <SectionHeader
            title="Feedback"
            subtitle="로딩, 스켈레톤, 알림 컴포넌트"
          />

          <div className="space-y-8">
            {/* Spinner */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">6-1</span>
                  Spinner
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <div className="flex items-center gap-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
              </div>
            </div>

            {/* Skeleton */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">6-2</span>
                  Skeleton
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <div className="space-y-4">
                <Skeleton width="100%" height="60px" rounded="xl" />
                <Skeleton width="80%" height="20px" />
                <Skeleton width="60%" height="20px" />
              </div>
              </div>
            </div>

            {/* Alert */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">6-3</span>
                  Alert
                </h3>
              </div>
              <Alert variant="info" title="Information">
                정보성 메시지입니다.
              </Alert>
              <Alert variant="success" title="Success">
                작업이 성공적으로 완료되었습니다.
              </Alert>
              <Alert variant="warning" title="Warning">
                주의가 필요합니다.
              </Alert>
              <Alert variant="error" title="Error" onClose={() => setShowAlert(false)}>
                오류가 발생했습니다.
              </Alert>
            </div>
          </div>

          {/* Feedback Code Examples */}
          <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl mt-6">
            <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
              Usage Examples
            </h4>
            <CodeSnippet
              code={`import Spinner from "@/components/ui/Spinner";
import Skeleton from "@/components/ui/Skeleton";
import Alert from "@/components/ui/Alert";

// Spinner
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

// Skeleton (loading placeholder)
<Skeleton width="100%" height="60px" rounded="xl" />
<Skeleton width="80%" height="20px" />
<Skeleton width="60%" height="20px" />

// Alert with variants
<Alert variant="info" title="Information">
  This is an informational message.
</Alert>

<Alert variant="success" title="Success">
  Operation completed successfully!
</Alert>

<Alert variant="warning" title="Warning">
  Please be careful with this action.
</Alert>

<Alert
  variant="error"
  title="Error"
  onClose={() => setShowAlert(false)}
>
  An error occurred. Please try again.
</Alert>`}
            />
          </div>
        </section>

        {/* Special Section */}
        <section id="special" className="scroll-mt-24">
          <SectionHeader
            title="Special"
            subtitle="특수 목적 컴포넌트"
          />

          <div className="space-y-8">
            {/* ColorPicker */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">7-1</span>
                  ColorPicker
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800">
              <ColorPicker
                onSelect={(color) => setSelectedColor(color)}
              />
              {selectedColor && (
                <p className="mt-4 text-sm font-bold text-stone-600 dark:text-primary-300">
                  Selected: {selectedColor}
                </p>
              )}
              </div>
            </div>

            {/* BackgroundDecoration */}
            <div className="space-y-4">
              <div className="pb-3 border-b-2 border-primary-200 dark:border-primary-800">
                <h3 className="text-lg font-bold text-primary-900 dark:text-primary-50 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white font-black text-sm flex items-center justify-center">7-2</span>
                  BackgroundDecoration
                </h3>
              </div>
              <div className="p-8 bg-white dark:bg-primary-900 rounded-2xl border border-stone-200 dark:border-primary-800 relative overflow-hidden min-h-[200px]">
                <BackgroundDecoration variant="blob" position="top-right" />
              <p className="text-stone-600 dark:text-primary-300 relative z-10">
                배경 장식 요소는 페이지에 시각적 깊이를 추가합니다.
              </p>
              </div>
            </div>
          </div>

          {/* Special Code Examples */}
          <div className="p-6 bg-stone-50 dark:bg-primary-950 rounded-2xl mt-6">
            <h4 className="text-md font-bold text-primary-900 dark:text-primary-50 mb-2">
              Usage Examples
            </h4>
            <CodeSnippet
              code={`import ColorPicker from "@/components/ui/ColorPicker";
import BackgroundDecoration from "@/components/ui/BackgroundDecoration";

const [selectedColor, setSelectedColor] = useState(null);

// Color Picker (for Bible verse highlights)
<ColorPicker
  onSelect={(color) => setSelectedColor(color)}
/>

// With custom colors
<ColorPicker
  colors={[
    { name: "Red", color: "#ef4444", class: "bg-red-500" },
    { name: "Blue", color: "#3b82f6", class: "bg-blue-500" }
  ]}
  onSelect={(color) => setSelectedColor(color)}
  columns={3}
/>

// Background Decoration
<div className="relative">
  <BackgroundDecoration
    variant="blob"
    position="top-left"
  />
  <BackgroundDecoration
    variant="gradient"
    position="bottom-right"
  />
  {/* Your content */}
</div>

// Variants: blob, gradient, corner
// Positions: top-left, top-right, bottom-left, bottom-right`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef, RefObject } from "react";

/**
 * 특정 요소 외부 클릭을 감지하는 커스텀 훅
 * 드롭다운, 모달, 팝오버 등에서 외부 클릭 시 닫기 기능에 사용됩니다.
 *
 * @param callback - 외부 클릭 시 실행할 콜백 함수
 * @param enabled - 훅 활성화 여부 (기본: true)
 * @returns RefObject - 감지할 요소에 연결할 ref 객체
 *
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);
 *
 * return (
 *   <div ref={ref}>
 *     {isOpen && <Dropdown />}
 *   </div>
 * );
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    // mousedown 이벤트 사용 (click보다 빠르게 감지)
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
}

/**
 * 여러 요소에 대해 외부 클릭을 감지하는 커스텀 훅
 * 복수의 ref를 전달받아 모든 요소 외부 클릭 시 콜백을 실행합니다.
 *
 * @param refs - 감지할 요소들의 ref 배열
 * @param callback - 외부 클릭 시 실행할 콜백 함수
 * @param enabled - 훅 활성화 여부 (기본: true)
 *
 * @example
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * const menuRef = useRef<HTMLDivElement>(null);
 *
 * useClickOutsideMultiple(
 *   [buttonRef, menuRef],
 *   () => setIsOpen(false),
 *   isOpen
 * );
 */
export function useClickOutsideMultiple(
  refs: RefObject<HTMLElement | null>[],
  callback: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );

      if (isOutside) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, callback, enabled]);
}

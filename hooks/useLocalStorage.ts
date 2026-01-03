"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * localStorage 값을 읽고 쓰는 커스텀 훅
 * useState와 유사한 인터페이스를 제공하며, 값이 변경될 때 자동으로 localStorage에 저장됩니다.
 *
 * @template T - 저장할 값의 타입
 * @param key - localStorage 키
 * @param initialValue - 초기값 (localStorage에 값이 없을 때 사용)
 * @returns [value, setValue] - 현재 값과 값을 설정하는 함수
 *
 * @example
 * const [fontSize, setFontSize] = useLocalStorage<number>('fontSize', 3);
 * const [isEnabled, setIsEnabled] = useLocalStorage<boolean>('isEnabled', false);
 * const [user, setUser] = useLocalStorage<User | null>('user', null);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 초기값 설정: localStorage에서 읽어오거나, 없으면 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      // JSON 파싱 시도
      return JSON.parse(item) as T;
    } catch (error) {
      // JSON 파싱 실패 시 문자열로 반환 시도
      console.warn(`Error parsing localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 값 설정 함수
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prevValue) => {
        const valueToStore =
          value instanceof Function ? value(prevValue) : value;

        // localStorage에 저장
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
          }
        }

        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}

/**
 * localStorage에서 배열을 관리하는 커스텀 훅
 * 배열에 항목을 추가/제거하는 편의 함수를 제공합니다.
 *
 * @template T - 배열 항목의 타입
 * @param key - localStorage 키
 * @param initialValue - 초기값 (기본: 빈 배열)
 * @returns [array, { add, remove, toggle, clear }] - 배열과 조작 함수들
 *
 * @example
 * const [bookmarks, { add, remove, toggle }] = useLocalStorageArray<string>('bookmarks');
 * toggle('Genesis-1'); // 있으면 제거, 없으면 추가
 */
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [
  T[],
  {
    add: (item: T) => void;
    remove: (item: T) => void;
    toggle: (item: T) => boolean;
    clear: () => void;
    includes: (item: T) => boolean;
  }
] {
  const [array, setArray] = useLocalStorage<T[]>(key, initialValue);

  const add = useCallback(
    (item: T) => {
      setArray((prev) => {
        if (prev.includes(item)) return prev;
        return [...prev, item];
      });
    },
    [setArray]
  );

  const remove = useCallback(
    (item: T) => {
      setArray((prev) => prev.filter((i) => i !== item));
    },
    [setArray]
  );

  const toggle = useCallback(
    (item: T): boolean => {
      let added = false;
      setArray((prev) => {
        if (prev.includes(item)) {
          return prev.filter((i) => i !== item);
        } else {
          added = true;
          return [...prev, item];
        }
      });
      return added;
    },
    [setArray]
  );

  const clear = useCallback(() => {
    setArray([]);
  }, [setArray]);

  const includes = useCallback(
    (item: T): boolean => {
      return array.includes(item);
    },
    [array]
  );

  return [array, { add, remove, toggle, clear, includes }];
}

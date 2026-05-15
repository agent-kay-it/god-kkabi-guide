/**
 * shadcn/ui 표준 `cn` 헬퍼.
 * clsx + tailwind-merge로 Tailwind 클래스 충돌 해소.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

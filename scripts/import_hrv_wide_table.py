#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
개역개정4판 성경을 Wide Table 구조로 데이터베이스에 삽입하는 스크립트
"""

import os
import re
import glob
from supabase import create_client, Client

# Supabase 설정
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("환경 변수가 설정되지 않았습니다")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 성경 책 이름 매핑 (파일명 → 데이터베이스 이름)
BOOK_MAPPING = {
    '1-01': '창세기',
    '1-02': '출애굽기',
    '1-03': '레위기',
    '1-04': '민수기',
    '1-05': '신명기',
    '1-06': '여호수아',
    '1-07': '사사기',
    '1-08': '룻기',
    '1-09': '사무엘상',
    '1-10': '사무엘하',
    '1-11': '열왕기상',
    '1-12': '열왕기하',
    '1-13': '역대상',
    '1-14': '역대하',
    '1-15': '에스라',
    '1-16': '느헤미야',
    '1-17': '에스더',
    '1-18': '욥기',
    '1-19': '시편',
    '1-20': '잠언',
    '1-21': '전도서',
    '1-22': '아가',
    '1-23': '이사야',
    '1-24': '예레미야',
    '1-25': '예레미야애가',
    '1-26': '에스겔',
    '1-27': '다니엘',
    '1-28': '호세아',
    '1-29': '요엘',
    '1-30': '아모스',
    '1-31': '오바댜',
    '1-32': '요나',
    '1-33': '미가',
    '1-34': '나훔',
    '1-35': '하박국',
    '1-36': '스바냐',
    '1-37': '학개',
    '1-38': '스가랴',
    '1-39': '말라기',
    '2-01': '마태복음',
    '2-02': '마가복음',
    '2-03': '누가복음',
    '2-04': '요한복음',
    '2-05': '사도행전',
    '2-06': '로마서',
    '2-07': '고린도전서',
    '2-08': '고린도후서',
    '2-09': '갈라디아서',
    '2-10': '에베소서',
    '2-11': '빌립보서',
    '2-12': '골로새서',
    '2-13': '데살로니가전서',
    '2-14': '데살로니가후서',
    '2-15': '디모데전서',
    '2-16': '디모데후서',
    '2-17': '디도서',
    '2-18': '빌레몬서',
    '2-19': '히브리서',
    '2-20': '야고보서',
    '2-21': '베드로전서',
    '2-22': '베드로후서',
    '2-23': '요한1서',
    '2-24': '요한2서',
    '2-25': '요한3서',
    '2-26': '유다서',
    '2-27': '요한계시록'
}

def parse_bible_file(file_path):
    """성경 텍스트 파일 파싱"""
    verses = []

    try:
        with open(file_path, 'r', encoding='euc-kr') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                match = re.match(r'^[가-힣]+(\d+):(\d+)\s+(<[^>]+>)?\s*(.+)', line)
                if match:
                    chapter = int(match.group(1))
                    verse = int(match.group(2))
                    text = match.group(4).strip()

                    verses.append({
                        'chapter': chapter,
                        'verse': verse,
                        'text': text
                    })
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return None

    return verses

def import_book(file_path, book_code):
    """
    한 권의 성경을 Wide Table 구조로 데이터베이스에 삽입

    전략:
    1. 해당 책의 모든 구절을 먼저 생성 (book, chapter, verse만)
    2. korHRV 컬럼을 UPDATE로 채움
    """

    book_name = BOOK_MAPPING.get(book_code)
    if not book_name:
        print(f"Unknown book code: {book_code}")
        return

    print(f"\nImporting {book_name} ({file_path})...")

    verses = parse_bible_file(file_path)
    if not verses:
        print(f"  Failed to parse {book_name}")
        return

    print(f"  Parsed {len(verses)} verses")

    # 배치로 삽입
    batch_size = 100
    total_inserted = 0

    for i in range(0, len(verses), batch_size):
        batch = verses[i:i+batch_size]
        verse_data = []

        for v in batch:
            verse_data.append({
                'book': book_name,
                'chapter': v['chapter'],
                'verse': v['verse'],
                'korhrv': v['text']  # 소문자로 변경 (PostgreSQL)
            })

        # verses 테이블에 직접 삽입 (upsert)
        try:
            # upsert: 이미 존재하면 UPDATE, 없으면 INSERT
            supabase.table('verses').upsert(
                verse_data,
                on_conflict='book,chapter,verse'
            ).execute()

            total_inserted += len(batch)
            print(f"  Inserted {total_inserted}/{len(verses)} verses...")
        except Exception as e:
            print(f"  Error inserting batch: {e}")
            import traceback
            traceback.print_exc()

    print(f"  [OK] Completed {book_name}: {total_inserted} verses")

def main():
    """전체 성경 66권 가져오기"""

    files = sorted(glob.glob('HRV(ver.4)/*.txt'))

    if not files:
        print("No files found")
        return

    print(f"Found {len(files)} files")
    print("Starting import...")

    for file_path in files:
        # 파일명에서 책 코드 추출 (예: 1-01, 2-27)
        filename = os.path.basename(file_path)
        match = re.match(r'(\d-\d+)', filename)
        if match:
            book_code = match.group(1)
            import_book(file_path, book_code)

    print("\n[OK] Import completed!")
    print("\nVerifying data...")

    # 데이터 확인
    result = supabase.table('verses').select('id', count='exact').execute()
    print(f"Total verses in database: {result.count}")

if __name__ == '__main__':
    main()

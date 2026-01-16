#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
개역개정4판 성경을 정규화된 스키마로 데이터베이스에 삽입하는 스크립트
"""

import os
import re
import glob
from pathlib import Path
from supabase import create_client, Client

# Load environment variables
def load_env():
    env_path = Path(__file__).parent.parent / '.env.local'
    env_vars = {}
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value
    return env_vars

# Get Supabase connection
env = load_env()
url = env['NEXT_PUBLIC_SUPABASE_URL']
service_role_key = env['SUPABASE_SERVICE_ROLE_KEY']

supabase: Client = create_client(url, service_role_key)

# 성경 책 코드 → 영어 약어 매핑
BOOK_CODE_TO_ABBR = {
    '1-01': 'Gen', '1-02': 'Exo', '1-03': 'Lev', '1-04': 'Num', '1-05': 'Deu',
    '1-06': 'Jos', '1-07': 'Jdg', '1-08': 'Rut', '1-09': '1Sa', '1-10': '2Sa',
    '1-11': '1Ki', '1-12': '2Ki', '1-13': '1Ch', '1-14': '2Ch', '1-15': 'Ezr',
    '1-16': 'Neh', '1-17': 'Est', '1-18': 'Job', '1-19': 'Psa', '1-20': 'Pro',
    '1-21': 'Ecc', '1-22': 'Sng', '1-23': 'Isa', '1-24': 'Jer', '1-25': 'Lam',
    '1-26': 'Eze', '1-27': 'Dan', '1-28': 'Hos', '1-29': 'Joe', '1-30': 'Amo',
    '1-31': 'Oba', '1-32': 'Jon', '1-33': 'Mic', '1-34': 'Nah', '1-35': 'Hab',
    '1-36': 'Zep', '1-37': 'Hag', '1-38': 'Zec', '1-39': 'Mal',
    '2-01': 'Mat', '2-02': 'Mar', '2-03': 'Luk', '2-04': 'Joh', '2-05': 'Act',
    '2-06': 'Rom', '2-07': '1Co', '2-08': '2Co', '2-09': 'Gal', '2-10': 'Eph',
    '2-11': 'Phi', '2-12': 'Col', '2-13': '1Th', '2-14': '2Th', '2-15': '1Ti',
    '2-16': '2Ti', '2-17': 'Tit', '2-18': 'Phm', '2-19': 'Heb', '2-20': 'Jam',
    '2-21': '1Pe', '2-22': '2Pe', '2-23': '1Jo', '2-24': '2Jo', '2-25': '3Jo',
    '2-26': 'Jud', '2-27': 'Rev'
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

def import_book_normalized(file_path, book_code):
    """
    한 권의 성경을 정규화된 스키마로 데이터베이스에 삽입

    전략:
    1. books 테이블에서 book_id 찾기 (abbr_eng 기준)
    2. translations 테이블에서 korHRV translation_id 찾기
    3. verses 테이블에 정규 구절 생성 (book_id, chapter, verse)
    4. verse_translations 테이블에 번역 텍스트 삽입 (verse_id, translation_id, text)
    """

    book_abbr = BOOK_CODE_TO_ABBR.get(book_code)
    if not book_abbr:
        print(f"Unknown book code: {book_code}")
        return

    print(f"\nImporting {book_abbr} ({file_path})...")

    # Step 1: Get book_id
    book_result = supabase.table('books').select('id, abbr_eng').eq('abbr_eng', book_abbr).single().execute()
    if not book_result.data:
        print(f"  Book not found in database: {book_abbr}")
        return

    book_id = book_result.data['id']
    print(f"  Book ID: {book_id}")

    # Step 2: Get translation_id for korHRV
    trans_result = supabase.table('translations').select('id').eq('code', 'korHRV').single().execute()
    if not trans_result.data:
        print(f"  Translation korHRV not found in database")
        return

    translation_id = trans_result.data['id']
    print(f"  Translation ID: {translation_id}")

    # Step 3: Parse verses
    verses_data = parse_bible_file(file_path)
    if not verses_data:
        print(f"  Failed to parse {book_abbr}")
        return

    print(f"  Parsed {len(verses_data)} verses")

    # Step 4 & 5: Insert verses and verse_translations in batches
    batch_size = 100
    total_inserted = 0

    for i in range(0, len(verses_data), batch_size):
        batch = verses_data[i:i+batch_size]

        # Step 4: Insert canonical verses
        canonical_verses = []
        for v in batch:
            canonical_verses.append({
                'book_id': book_id,
                'chapter': v['chapter'],
                'verse': v['verse']
            })

        try:
            # Insert verses (upsert to handle duplicates)
            verse_insert_result = supabase.table('verses').upsert(
                canonical_verses,
                on_conflict='book_id,chapter,verse'
            ).execute()

            # Get verse IDs for the inserted/updated verses
            verse_ids = {}
            for verse_row in verse_insert_result.data:
                key = f"{verse_row['chapter']}:{verse_row['verse']}"
                verse_ids[key] = verse_row['id']

            # Step 5: Insert verse translations
            translations_batch = []
            for v in batch:
                key = f"{v['chapter']}:{v['verse']}"
                verse_id = verse_ids.get(key)

                if verse_id:
                    translations_batch.append({
                        'verse_id': verse_id,
                        'translation_id': translation_id,
                        'text': v['text']
                    })

            if translations_batch:
                supabase.table('verse_translations').upsert(
                    translations_batch,
                    on_conflict='verse_id,translation_id'
                ).execute()

            total_inserted += len(batch)
            print(f"  Inserted {total_inserted}/{len(verses_data)} verses...")

        except Exception as e:
            print(f"  Error inserting batch: {e}")
            import traceback
            traceback.print_exc()

    print(f"  [OK] Completed {book_abbr}: {total_inserted} verses")

def main():
    """전체 성경 66권 가져오기"""

    files = sorted(glob.glob('HRV(ver.4)/*.txt'))

    if not files:
        print("No files found in HRV(ver.4)/ directory")
        print("Please ensure the HRV text files are in the correct location")
        return

    print(f"Found {len(files)} files")
    print("Starting normalized import...")
    print("=" * 60)

    for file_path in files:
        # 파일명에서 책 코드 추출 (예: 1-01, 2-27)
        filename = os.path.basename(file_path)
        match = re.match(r'(\d-\d+)', filename)
        if match:
            book_code = match.group(1)
            import_book_normalized(file_path, book_code)

    print("\n" + "=" * 60)
    print("[OK] Import completed!")
    print("\nVerifying data...")

    # 데이터 확인
    verses_result = supabase.table('verses').select('id', count='exact').execute()
    print(f"Total canonical verses: {verses_result.count}")

    translations_result = supabase.table('verse_translations').select('id', count='exact').eq('translation_id', 1).execute()
    print(f"Total korHRV translations: {translations_result.count}")

if __name__ == '__main__':
    main()

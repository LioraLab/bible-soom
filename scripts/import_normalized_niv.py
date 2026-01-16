#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bolls.life API에서 NIV2011 성경을 가져와서 정규화된 스키마로 데이터베이스에 삽입하는 스크립트
"""

import os
import time
import requests
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

# bolls.life API URL
BOLLS_API_URL = "https://bolls.life/get-text/NIV2011/{book}/{chapter}/"

def fetch_chapter_from_bolls(book_number, chapter):
    """
    bolls.life API에서 특정 장의 NIV2011 데이터를 가져옴

    Args:
        book_number: 책 번호 (1-66)
        chapter: 장 번호

    Returns:
        list: [{"verse": 1, "text": "..."}, ...]
    """
    url = BOLLS_API_URL.format(book=book_number, chapter=chapter)

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # API 응답: [{"pk": ..., "verse": 1, "text": "..."}, ...]
        return data
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None

def import_book_niv_normalized(book_info, translation_id):
    """
    한 권의 성경 NIV2011 데이터를 정규화된 스키마로 삽입

    전략:
    1. verses 테이블에서 해당 책의 정규 구절들을 가져옴
    2. bolls.life API에서 NIV 텍스트 가져옴
    3. verse_translations 테이블에 삽입

    Args:
        book_info: {id, abbr_eng, book_order, chapters} from books table
        translation_id: NIV translation ID
    """
    book_id = book_info['id']
    book_abbr = book_info['abbr_eng']
    book_order = book_info['book_order']
    total_chapters = book_info['chapters']

    print(f"\n[{book_order}/66] Importing {book_abbr} (NIV2011)...", flush=True)

    total_updated = 0

    for chapter in range(1, total_chapters + 1):
        # bolls.life API에서 데이터 가져오기
        verses_data = fetch_chapter_from_bolls(book_order, chapter)

        if not verses_data:
            print(f"  Failed to fetch {book_abbr} {chapter}", flush=True)
            continue

        # Get canonical verse IDs from database
        canonical_verses = supabase.table('verses').select('id, verse').eq('book_id', book_id).eq('chapter', chapter).execute()

        if not canonical_verses.data:
            print(f"  No canonical verses found for {book_abbr} {chapter}", flush=True)
            continue

        # Create verse_id mapping
        verse_id_map = {}
        for cv in canonical_verses.data:
            verse_id_map[cv['verse']] = cv['id']

        # Prepare batch for verse_translations
        translations_batch = []
        for verse_item in verses_data:
            verse_number = verse_item['verse']
            text = verse_item['text']
            verse_id = verse_id_map.get(verse_number)

            if verse_id:
                translations_batch.append({
                    'verse_id': verse_id,
                    'translation_id': translation_id,
                    'text': text
                })

        # Insert batch
        if translations_batch:
            try:
                supabase.table('verse_translations').upsert(
                    translations_batch,
                    on_conflict='verse_id,translation_id'
                ).execute()

                total_updated += len(translations_batch)
                print(f"  Chapter {chapter}/{total_chapters} - {len(translations_batch)} verses updated", flush=True)

            except Exception as e:
                print(f"  Error inserting translations for {book_abbr} {chapter}: {e}", flush=True)

        # API Rate Limit 방지
        time.sleep(0.1)

    print(f"  [OK] Completed {book_abbr}: {total_updated} verses", flush=True)

def main():
    """전체 성경 66권 NIV2011 가져오기"""

    print("Fetching books from database...", flush=True)

    # books 테이블에서 모든 책 정보 가져오기
    result = supabase.table('books').select('id, abbr_eng, book_order, chapters').order('book_order').execute()

    books = result.data
    print(f"Found {len(books)} books\n", flush=True)

    # Get NIV translation ID
    trans_result = supabase.table('translations').select('id').eq('code', 'NIV').single().execute()
    if not trans_result.data:
        print("NIV translation not found in database")
        return

    translation_id = trans_result.data['id']
    print(f"NIV Translation ID: {translation_id}\n", flush=True)

    print("Starting NIV2011 import from bolls.life API...")
    print("=" * 60)

    # 전체 66권 임포트
    for book in books:
        import_book_niv_normalized(book, translation_id)

    print("\n" + "=" * 60)
    print("[OK] NIV2011 Import completed!", flush=True)

    # 데이터 확인
    result = supabase.table('verse_translations').select('id', count='exact').eq('translation_id', translation_id).execute()
    print(f"Total verses with NIV translation: {result.count}")

if __name__ == '__main__':
    main()

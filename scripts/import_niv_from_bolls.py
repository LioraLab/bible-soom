#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bolls.life API에서 NIV2011 성경을 가져와서 데이터베이스에 삽입하는 스크립트
"""

import os
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# .env.local 파일 로드
load_dotenv('.env.local')

# Supabase 설정
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("환경 변수가 설정되지 않았습니다")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

def import_book_niv(book_info):
    """
    한 권의 성경 NIV2011 데이터를 데이터베이스에 삽입

    Args:
        book_info: {name, book_order, chapters} from books table
    """
    book_name = book_info['name']
    book_order = book_info['book_order']
    total_chapters = book_info['chapters']

    print(f"\n[{book_order}/66] Importing {book_name} (NIV2011)...", flush=True)

    total_updated = 0

    for chapter in range(1, total_chapters + 1):
        # bolls.life API에서 데이터 가져오기
        verses_data = fetch_chapter_from_bolls(book_order, chapter)

        if not verses_data:
            print(f"  Failed to fetch {book_name} {chapter}", flush=True)
            continue

        # 배치로 업데이트
        batch_size = 50
        for i in range(0, len(verses_data), batch_size):
            batch = verses_data[i:i+batch_size]

            for verse_item in batch:
                verse_number = verse_item['verse']
                text = verse_item['text']

                try:
                    # verses 테이블의 niv 컬럼 업데이트
                    supabase.table('verses').update({
                        'niv': text
                    }).eq('book', book_name).eq('chapter', chapter).eq('verse', verse_number).execute()

                    total_updated += 1
                except Exception as e:
                    print(f"  Error updating {book_name} {chapter}:{verse_number}: {e}", flush=True)

        print(f"  Chapter {chapter}/{total_chapters} - {len(verses_data)} verses updated", flush=True)

        # API Rate Limit 방지
        time.sleep(0.1)

    print(f"  [OK] Completed {book_name}: {total_updated} verses", flush=True)

def main():
    """전체 성경 66권 NIV2011 가져오기"""

    print("Fetching books from database...", flush=True)

    # books 테이블에서 모든 책 정보 가져오기
    result = supabase.table('books').select('name, book_order, chapters').order('book_order').execute()

    books = result.data
    print(f"Found {len(books)} books\n", flush=True)

    print("Starting NIV2011 import from bolls.life API...", flush=True)

    # 전체 66권 임포트
    for book in books:
        import_book_niv(book)

    print("\n[OK] NIV2011 Import completed!", flush=True)

    # 데이터 확인
    result = supabase.table('verses').select('id', count='exact').not_.is_('niv', 'null').execute()
    print(f"Total verses with NIV translation: {result.count}")

if __name__ == '__main__':
    main()

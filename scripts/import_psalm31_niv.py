#!/usr/bin/env python3
"""
Psalm 31 NIV import - 누락된 장 재시도
"""
import os
import sys
import time
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: Missing Supabase credentials in .env.local")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def fetch_chapter_from_bolls(book_number, chapter):
    """bolls.life API에서 특정 장 가져오기"""
    url = f"https://bolls.life/get-text/NIV2011/{book_number}/{chapter}/"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data
    except Exception as e:
        print(f"Error fetching chapter {chapter}: {e}")
        return None

def import_psalm31():
    """Psalm 31 재import"""
    print("=" * 60)
    print("Psalm 31 NIV Re-import")
    print("=" * 60)

    # Get Psalms book info (book_order = 19)
    book_result = supabase.table('books').select('id, abbr_eng, book_order, chapters').eq('abbr_eng', 'Psa').single().execute()
    book = book_result.data
    book_id = book['id']

    print(f"\nBook: {book['abbr_eng']} (ID: {book_id}, Order: {book['book_order']})")

    # Get NIV translation_id
    trans_result = supabase.table('translations').select('id').eq('code', 'NIV').single().execute()
    translation_id = trans_result.data['id']
    print(f"Translation: NIV (ID: {translation_id})")

    # Fetch Psalm 31 from API
    chapter = 31
    print(f"\nFetching Psalm {chapter}...")

    verses_data = fetch_chapter_from_bolls(book['book_order'], chapter)

    if not verses_data:
        print(f"Failed to fetch Psalm {chapter}")
        return False

    print(f"✓ Fetched {len(verses_data)} verses")

    # Get canonical verse IDs from database
    canonical_result = supabase.table('verses').select('id, verse').eq('book_id', book_id).eq('chapter', chapter).execute()
    canonical_verses = canonical_result.data

    if not canonical_verses:
        print(f"No canonical verses found for Psalm {chapter}")
        return False

    print(f"✓ Found {len(canonical_verses)} canonical verses in DB")

    # Create verse_id mapping
    verse_id_map = {}
    for cv in canonical_verses:
        verse_id_map[cv['verse']] = cv['id']

    # Prepare translations batch
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

    # Insert/update verse_translations
    if translations_batch:
        print(f"\nInserting {len(translations_batch)} verse translations...")
        result = supabase.table('verse_translations').upsert(
            translations_batch,
            on_conflict='verse_id,translation_id'
        ).execute()
        print(f"✓ Inserted/updated {len(result.data)} translations")

    print("\n✅ Psalm 31 import completed successfully!")
    return True

if __name__ == '__main__':
    try:
        success = import_psalm31()
        if success:
            # Verify
            print("\n" + "=" * 60)
            print("Verification")
            print("=" * 60)

            result = supabase.table('verses').select('id').eq('book_id', 19).eq('chapter', 31).execute()
            canonical_count = len(result.data)

            result = supabase.table('verse_translations').select('id', count='exact').eq('translation_id', 2).execute()
            total_niv = result.count

            print(f"Psalm 31 canonical verses: {canonical_count}")
            print(f"Total NIV translations: {total_niv}")

            sys.exit(0)
        else:
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

#!/usr/bin/env python3
"""
Run migration SQL directly via Supabase Python client
"""
import os
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

# Read migration file
migration_path = Path(__file__).parent.parent / 'supabase' / 'migrations' / '20260116_normalized_schema.sql'
with open(migration_path, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

print("🚀 Running migration...")
print(f"📄 File: {migration_path.name}")
print(f"📏 Size: {len(migration_sql)} characters")
print("-" * 50)

try:
    # Execute migration SQL
    response = supabase.rpc('exec_sql', {'query': migration_sql}).execute()

    print("✅ Migration executed successfully!")
    print("\n📊 Verifying tables...")

    # Verify tables were created
    tables_to_check = ['new_books', 'book_names', 'translations', 'new_verses', 'verse_translations']

    for table in tables_to_check:
        try:
            # Try to query each table
            result = supabase.table(table).select('count').execute()
            print(f"  ✓ {table}: exists")
        except Exception as e:
            print(f"  ✗ {table}: {str(e)}")

except Exception as e:
    print(f"❌ Migration failed!")
    print(f"Error: {str(e)}")
    exit(1)

print("\n🎉 Migration complete!")

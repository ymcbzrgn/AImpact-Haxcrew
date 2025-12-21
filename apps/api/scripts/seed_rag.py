"""
Seed RAG Database - Load initial documents for testing
Run from apps/api: python -m scripts.seed_rag
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

from services.database import init_db, close_db
from services.gemini_service import init_gemini
from services.rag_service import (
    add_document,
    chunk_text,
    get_document_count,
    CATEGORIES
)


# Document directory
DOCS_DIR = Path(__file__).parent.parent.parent.parent / "data" / "rag_documents"


async def seed_documents():
    """Load all documents from data/rag_documents into the database"""

    print("=" * 50)
    print("RAG Document Seeder")
    print("=" * 50)

    # Initialize services
    print("\n1. Initializing services...")
    init_gemini()
    await init_db()

    # Check initial count
    initial_count = await get_document_count()
    print(f"   Current document count: {initial_count}")

    # Find all .txt files
    if not DOCS_DIR.exists():
        print(f"\n❌ Documents directory not found: {DOCS_DIR}")
        return

    txt_files = list(DOCS_DIR.glob("*.txt"))
    print(f"\n2. Found {len(txt_files)} document files in {DOCS_DIR}")

    # Category mapping based on filename
    category_map = {
        "kevin_hale": "pitch_tips",
        "pitch_tips": "pitch_tips",
        "series_a": "fundraising",
        "fundraising": "fundraising",
        "best_practices": "pitch_tips",
        "market": "market_analysis",
        "competitor": "competitors",
        "financial": "financials",
        "team": "team_building",
    }

    def guess_category(filename: str) -> str:
        """Guess category from filename"""
        filename_lower = filename.lower()
        for key, category in category_map.items():
            if key in filename_lower:
                return category
        return "pitch_tips"  # Default

    # Process each file
    added_count = 0
    chunk_count = 0

    print("\n3. Processing documents...")
    for txt_file in txt_files:
        print(f"\n   📄 {txt_file.name}")

        try:
            # Read content
            content = txt_file.read_text(encoding="utf-8")
            category = guess_category(txt_file.stem)
            source = txt_file.name

            print(f"      Category: {category}")
            print(f"      Length: {len(content)} chars")

            # Chunk the document
            chunks = chunk_text(content, max_chars=1500, overlap=200)
            print(f"      Chunks: {len(chunks)}")

            # Add each chunk
            for i, chunk in enumerate(chunks):
                await add_document(
                    content=chunk,
                    category=category,
                    source=f"{source}#chunk{i+1}",
                    character=None
                )
                chunk_count += 1
                print(f"      ✅ Chunk {i+1}/{len(chunks)} added")

            added_count += 1

        except Exception as e:
            print(f"      ❌ Error: {e}")
            continue

    # Final count
    final_count = await get_document_count()

    print("\n" + "=" * 50)
    print("Summary")
    print("=" * 50)
    print(f"Files processed: {added_count}/{len(txt_files)}")
    print(f"Chunks added: {chunk_count}")
    print(f"Total documents in DB: {final_count}")
    print("=" * 50)

    # Cleanup
    await close_db()
    print("\n✅ Done!")


if __name__ == "__main__":
    asyncio.run(seed_documents())

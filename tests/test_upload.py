"""
File upload endpoint tests
"""

import pytest
import io


@pytest.mark.asyncio
async def test_upload_invalid_file_type(client):
    """Test uploading unsupported file type"""
    # Create session first
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Upload invalid file type
    files = {"file": ("test.txt", io.BytesIO(b"test content"), "text/plain")}
    response = await client.post(f"/api/session/{session_id}/upload", files=files)

    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_FILE_TYPE"


@pytest.mark.asyncio
async def test_upload_to_nonexistent_session(client):
    """Test uploading to a session that doesn't exist"""
    files = {"file": ("test.pdf", io.BytesIO(b"%PDF-1.4 test"), "application/pdf")}
    response = await client.post("/api/session/fake-session-id/upload", files=files)

    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "SESSION_NOT_FOUND"


@pytest.mark.asyncio
async def test_upload_pdf_success(client):
    """Test uploading a valid PDF file"""
    # Create session
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Create minimal valid PDF content
    pdf_content = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
    files = {"file": ("pitch.pdf", io.BytesIO(pdf_content), "application/pdf")}
    response = await client.post(f"/api/session/{session_id}/upload", files=files)

    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "uploaded"
    assert data["data"]["filename"] == "pitch.pdf"


@pytest.mark.asyncio
async def test_upload_pptx_success(client):
    """Test uploading a PPTX file (content type check)"""
    # Create session
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Use valid PPTX content type with minimal content
    pptx_content = b"PK\x03\x04"  # PPTX files are ZIP-based
    files = {
        "file": (
            "pitch.pptx",
            io.BytesIO(pptx_content),
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    }
    response = await client.post(f"/api/session/{session_id}/upload", files=files)

    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "uploaded"


@pytest.mark.asyncio
async def test_upload_image_success(client):
    """Test uploading an image file"""
    # Create session
    create_resp = await client.post("/api/session", json={})
    session_id = create_resp.json()["data"]["session_id"]

    # Minimal PNG header
    png_content = b"\x89PNG\r\n\x1a\n"
    files = {"file": ("slide.png", io.BytesIO(png_content), "image/png")}
    response = await client.post(f"/api/session/{session_id}/upload", files=files)

    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "uploaded"

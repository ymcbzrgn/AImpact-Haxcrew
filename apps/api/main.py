from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

from services.database import init_db, close_db
from services.gemini_service import init_gemini


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("[START] Starting PitchDrill API...")

    # Initialize Gemini
    try:
        init_gemini()
        print("[OK] Gemini AI initialized")
    except Exception as e:
        print(f"[WARN] Gemini initialization failed: {e}")

    # Initialize Database
    try:
        await init_db()
    except Exception as e:
        print(f"[WARN] Database connection failed: {e}")
        print("   Continuing without database...")

    yield

    # Shutdown
    print("[STOP] Shutting down PitchDrill API...")
    await close_db()


app = FastAPI(
    title="PitchDrill API",
    description="AI-Powered Pitch Simulation Backend",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pitchdrill.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
from routers import session, websocket
app.include_router(session.router, prefix="/api", tags=["session"])
app.include_router(websocket.router, tags=["websocket"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "pitchdrill-api",
        "version": "0.1.0"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "PitchDrill API", "docs": "/docs"}

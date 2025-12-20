from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health

app = FastAPI(
    title="DeckMate API",
    description="Backend API for DeckMate platform",
    version="0.1.0",
)

# CORS configuration - Demo-Safe Mode (wildcard)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Demo: Wildcard for hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])


@app.get("/")
async def root():
    return {"message": "DeckMate API", "version": "0.1.0"}

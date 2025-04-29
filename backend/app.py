from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import auth_router
from chat import chat_router

# Initialize FastAPI app
app = FastAPI()

# CORS configuration for frontend
origins = ["http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(chat_router)

# To run: uvicorn backend.app:app --reload --port 8001

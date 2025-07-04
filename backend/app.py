from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from chat import chat_router

# Initialize FastAPI app
app = FastAPI()

# CORS configuration for frontend (includes Docker container networking)
origins = [
    "http://localhost:3000",  # React dev server
    "http://localhost:8000",  # Original frontend
    "http://localhost:80",    # Docker nginx
    "http://localhost",       # Docker nginx without port
    "http://frontend",        # Docker container name
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat_router)

# To run: uvicorn backend.app:app --reload --port 8001

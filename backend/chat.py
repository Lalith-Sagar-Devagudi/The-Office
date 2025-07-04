import os
import json
import logging
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from supreme.supreme import run_supreme_agent
from agents.developer import run_developer
from agents.hr import run_hr
from agents.ceo import run_ceo

# Load environment
load_dotenv()

# Configure logging for chat router
logging.basicConfig(level=logging.INFO)
chat_logger = logging.getLogger('ChatRouter')

# Router
chat_router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    agent: Optional[str] = None  # Optional agent selection

class ChatResponse(BaseModel):
    response: str
    agent_used: Optional[str] = None

@chat_router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Routes the user message to the specified agent or supreme agent system.
    """
    chat_logger.info("🌐 NEW CHAT REQUEST RECEIVED")
    chat_logger.info("=" * 50)
    chat_logger.info(f"📨 User Message: {req.message}")
    chat_logger.info(f"🎯 Requested Agent: {req.agent or 'None (Supreme Agent)'}")
    
    try:
        # Route to specific agent if requested
        if req.agent:
            agent_name = req.agent.upper()
            
            if agent_name == "DEVELOPER":
                chat_logger.info("🔄 Forwarding to Developer Agent...")
                result = run_developer(req.message)
                agent_used = "Developer"
                chat_logger.info("💻 Response from Developer Agent")
                
            elif agent_name == "HR":
                chat_logger.info("🔄 Forwarding to HR Agent...")
                result = run_hr(req.message)
                agent_used = "HR"
                chat_logger.info("👔 Response from HR Agent")
                
            elif agent_name == "CEO":
                chat_logger.info("🔄 Forwarding to CEO Agent...")
                result = run_ceo(req.message)
                agent_used = "CEO"
                chat_logger.info("👔 Response from CEO Agent")
                
            else:
                chat_logger.info(f"❌ Unknown agent requested: {agent_name}, falling back to Supreme Agent")
                result = run_supreme_agent(req.message)
                agent_used = "Supreme Agent"
                
        else:
            # Use the supreme agent system when no specific agent is requested
            chat_logger.info("🔄 Forwarding to Supreme Agent System...")
            result = run_supreme_agent(req.message)
            
            # Extract agent info from the response if present
            agent_used = None
            if "Agent HR:" in result:
                agent_used = "HR"
                result = result.replace("Agent HR: ", "")
                chat_logger.info("🏢 Response from Agent HR")
            elif "Agent CEO:" in result:
                agent_used = "CEO"
                result = result.replace("Agent CEO: ", "")
                chat_logger.info("👔 Response from Agent CEO")
            elif "Agent Developer:" in result:
                agent_used = "Developer"
                result = result.replace("Agent Developer: ", "")
                chat_logger.info("💻 Response from Agent Developer")
            else:
                agent_used = "Supreme Agent"
                chat_logger.info("🤖 Response from Supreme Agent")
        
        chat_logger.info("✅ CHAT REQUEST COMPLETED")
        chat_logger.info(f"📤 Final Response Length: {len(result)} characters")
        chat_logger.info(f"🎯 Agent Used: {agent_used}")
        chat_logger.info("=" * 50)
        
        return {"response": result, "agent_used": agent_used}
    
    except Exception as e:
        chat_logger.error(f"❌ CHAT REQUEST FAILED: {str(e)}")
        chat_logger.error("=" * 50)
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@chat_router.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "message": "Chat service is running"}

import os
import json
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from auth import get_current_active_user
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
)

# Load environment
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in environment")

# Initialize specialized agents
agents = {
    role: ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=OPENAI_KEY)
    for role in ("CEO", "HR", "Dev")
}

# Build router chain prompt template
router_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
"""
You are the **Orchestrator**, an AI coordinator that routes user requests to specialized assistant agents or handles them yourself.

**Specialized Agents and Domains:**
- **CEO** – Expert in high-level strategy, business decisions, company vision, and executive matters.
- **HR** – Expert in human resources and internal policies.
- **Dev** – Expert in software development and technical engineering.

**Guidelines:**
1. **Route or Answer:** If the query falls clearly under a specialist, route to them. Otherwise, answer as Orchestrator.
2. **High Confidence Routing:** Only route if extremely confident. If in doubt, answer yourself.
3. **Output Format (JSON only):** Always output a JSON object **and nothing else**:
   - If routing to a specialist: `{{"route": "<AgentName>"}}`
   - If answering yourself: `{{"route": "Orchestrator", "answer": "<YourAnswer>"}}`
4. **Answer Style (for Orchestrator answers):** Helpful, accurate, professional. No mention of being an orchestrator. No extra text outside the JSON.

**Examples:**

- **Example 1**  
  **User Query:** "Our revenue growth is slowing down. What strategy shifts can we consider to improve profits next quarter?"  
  **Decision:** Specialist needed → CEO.  
  **JSON Output:** `{{"route": "CEO"}}`

- **Example 2**  
  **User Query:** "I need to update my healthcare benefits enrollment. How can I do that?"  
  **Decision:** Specialist needed → HR.  
  **JSON Output:** `{{"route": "HR"}}`

- **Example 3**  
  **User Query:** "There’s a bug in the login feature. Could it be due to the OAuth callback handling? How do I fix it?"  
  **Decision:** Specialist needed → Dev.  
  **JSON Output:** `{{"route": "Dev"}}`

- **Example 4**  
  **User Query:** "Tell me something interesting about our company culture."  
  **Decision:** Handled by Orchestrator.  
  **JSON Output:** `{{"route": "Orchestrator", "answer": "Sure! One fun fact about our culture is..."}}`

Now, apply the above rules for the next user query.
"""
    ),
    HumanMessagePromptTemplate.from_template("{query}")
])
router_chain = LLMChain(
    llm=ChatOpenAI(model="gpt-4-turbo", temperature=0, openai_api_key=OPENAI_KEY),
    prompt=router_prompt
)

# Routing function
def route_and_handle(query: str) -> dict:
    routing = router_chain.run({"query": query})
    try:
        result = json.loads(routing.strip())
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse routing JSON")
    agent = result.get("route")
    answer = result.get("answer")

    # If routed to a specialist agent, you could call them here (not implemented)
    return {"agent": agent, "answer": answer}

# Router
chat_router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    agent: str
    # answer optional
    answer: Optional[str] = None

@chat_router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Routes the user message to the appropriate agent (or handles it) and returns the result.
    """
    result = route_and_handle(req.message)
    return {"agent": result["agent"], "answer": result.get("answer")}

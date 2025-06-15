import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from prompts import PROMPT_CEO

# Load environment
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in environment")

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0.5, api_key=OPENAI_KEY)

def run_ceo(user_query: str) -> str:
    """Run CEO on the given user query."""
    messages = [
        SystemMessage(content=PROMPT_CEO),
        HumanMessage(content=user_query)
    ]
    response = llm.invoke(messages)
    return response.content

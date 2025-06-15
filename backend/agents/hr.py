import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_community.tools import Tool
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from prompts import PROMPT_HR

# Load environment
load_dotenv()
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in environment")

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0.0, api_key=OPENAI_KEY)

# Web search tool using Serper API (if available)
tools = []


def run_hr(user_query: str) -> str:
    """Run HR on the given user query."""
    if tools:
        # Use agent with tools if search is available
        try:
            # Create a prompt template for the agent
            prompt = ChatPromptTemplate.from_messages([
                ("system", PROMPT_HR),
                ("placeholder", "{chat_history}"),
                ("human", "{input}"),
                ("placeholder", "{agent_scratchpad}"),
            ])
            
            # Create the agent
            agent = create_tool_calling_agent(llm, tools, prompt)
            agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)
            
            result = agent_executor.invoke({"input": user_query})
            return result["output"]
        except Exception as e:
            # Fallback to basic chat if agent fails
            messages = [
                SystemMessage(content=PROMPT_HR + " (Note: Web search unavailable due to error)"),
                HumanMessage(content=user_query)
            ]
            response = llm.invoke(messages)
            return response.content
    else:
        # Basic chat without tools
        messages = [
            SystemMessage(content=PROMPT_HR + " (Note: Web search unavailable)"),
            HumanMessage(content=user_query)
        ]
        response = llm.invoke(messages)
        return response.content

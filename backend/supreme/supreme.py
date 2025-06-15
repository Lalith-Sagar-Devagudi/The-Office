import json
import logging
from typing import TypedDict, Annotated
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain.schema import HumanMessage, SystemMessage

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from prompts import PROMPT_SUPREME
from agents.hr import run_hr
from agents.ceo import run_ceo
from agents.developer import run_developer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('supreme_agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('SupremeAgent')

# Define the state structure
class State(TypedDict):
    messages: Annotated[list, add_messages]
    decision: dict

# Supervisor LLM
supervisor_llm = ChatOpenAI(model="gpt-4o", temperature=0.0)

# Define supervisor as a React-style agent that chooses sub-agents as tools
def supreme_agent(state: State):
    # Build prompt with conversation history
    history = state["messages"]
    user_query = history[-1] if isinstance(history[-1], str) else history[-1].content
    
    logger.info("=" * 80)
    logger.info("🧠 SUPREME AGENT - ROUTING DECISION")
    logger.info("=" * 80)
    logger.info(f"📝 Incoming Query: {user_query}")
    logger.info(f"📋 Decision Criteria:")
    logger.info(f"   • Employee related questions → HR")
    logger.info(f"   • General company related questions → CEO")
    logger.info(f"   • Technical questions or code-related queries → Developer")
    
    prompt = SystemMessage(content=PROMPT_SUPREME)
    user_msg = HumanMessage(content=user_query)

    # Supervisor decides which agent to call
    logger.info("🤔 Analyzing query with GPT-4o...")
    decision_response = supervisor_llm.invoke([prompt, user_msg]).content
    logger.info(f"🎯 Raw LLM Decision Response: {decision_response}")
    
    try:
        # Clean up the response in case it's wrapped in markdown code blocks
        cleaned_response = decision_response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]  # Remove ```json
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]  # Remove ```
        cleaned_response = cleaned_response.strip()
        
        decision = json.loads(cleaned_response)
        raw_agent_name = decision.get("agent", "unknown")
        
        # Map agent names to internal routing names
        agent_mapping = {
            "HR": "agent_hr",
            "CEO": "agent_ceo", 
            "Developer": "agent_developer",
            "agent_hr": "agent_hr",
            "agent_ceo": "agent_ceo",
            "agent_developer": "agent_developer"
        }
        
        agent_name = agent_mapping.get(raw_agent_name, "agent_ceo")  # Default to CEO
        agent_display = f"Agent {raw_agent_name}" if raw_agent_name in ["HR", "CEO", "Developer"] else raw_agent_name
        
        # Update the decision with the mapped agent name
        decision["agent"] = agent_name
        
        logger.info(f"✅ Decision Successfully Parsed:")
        logger.info(f"   • Selected Agent: {agent_display}")
        logger.info(f"   • Query to Process: {decision.get('query', 'N/A')}")
        logger.info("=" * 80)
        
        return {"decision": decision}
    except json.JSONDecodeError as e:
        logger.warning(f"❌ JSON Parsing Failed: {e}")
        logger.warning(f"🔄 Falling back to CEO Agent")
        # Fallback to agent_ceo if parsing fails
        fallback_decision = {"agent": "agent_ceo", "query": user_query}
        logger.info(f"✅ Fallback Decision: CEO Agent")
        logger.info("=" * 80)
        return {"decision": fallback_decision}

# Wrap agent_1 and agent_2 as tools for the supervisor
def tool_hr(state: State):
    decision = state["decision"]
    query = decision["query"]
    
    logger.info("🏢 AGENT HR - PROCESSING QUERY")
    logger.info("=" * 60)
    logger.info(f"📝 Query: {query}")
    logger.info("⚙️  Processing with HR agent (web search capability)...")
    
    result = run_hr(query)
    
    logger.info(f"✅ Agent HR Response Generated:")
    logger.info(f"📄 Response Preview: {result[:200]}{'...' if len(result) > 200 else ''}")
    logger.info("=" * 60)
    
    return {"messages": [f"Agent HR: {result}"]}

def tool_ceo(state: State):
    decision = state["decision"]
    query = decision["query"]
    
    logger.info("👔 AGENT CEO - PROCESSING QUERY")
    logger.info("=" * 60)
    logger.info(f"📝 Query: {query}")
    logger.info("⚙️  Processing with CEO agent (general conversation)...")
    
    result = run_ceo(query)
    
    logger.info(f"✅ Agent CEO Response Generated:")
    logger.info(f"📄 Response Preview: {result[:200]}{'...' if len(result) > 200 else ''}")
    logger.info("=" * 60)
    
    return {"messages": [f"Agent CEO: {result}"]}

def tool_developer(state: State):
    decision = state["decision"]
    query = decision["query"]
    
    logger.info("💻 AGENT DEVELOPER - PROCESSING QUERY")
    logger.info("=" * 60)
    logger.info(f"📝 Query: {query}")
    logger.info("⚙️  Processing with Developer agent (technical expertise)...")
    
    result = run_developer(query)
    
    logger.info(f"✅ Agent Developer Response Generated:")
    logger.info(f"📄 Response Preview: {result[:200]}{'...' if len(result) > 200 else ''}")
    logger.info("=" * 60)
    
    return {"messages": [f"Agent Developer: {result}"]}

# Build the graph
builder = StateGraph(State)
builder.add_node("supervisor", supreme_agent)
builder.add_node("agent_hr", tool_hr)
builder.add_node("agent_ceo", tool_ceo)
builder.add_node("agent_developer", tool_developer)

# Start at supervisor
builder.add_edge(START, "supervisor")

# Supervisor → chosen agent
def route_decision(state: State):
    return state["decision"]["agent"]

builder.add_conditional_edges(
    "supervisor",
    route_decision,
    {
        "agent_hr": "agent_hr",
        "agent_ceo": "agent_ceo",
        "agent_developer": "agent_developer"
    }
)

# End after agent response
builder.add_edge("agent_hr", END)
builder.add_edge("agent_ceo", END)
builder.add_edge("agent_developer", END)

supreme_agent_app = builder.compile()

def run_supreme_agent(user_query: str) -> str:
    """Run the supreme agent system with a user query and return the response."""
    logger.info("🚀 SUPREME AGENT SYSTEM STARTED")
    logger.info("=" * 80)
    logger.info(f"🎯 Processing Query: {user_query}")
    
    initial_state = {
        "messages": [user_query],
        "decision": {}
    }
    
    try:
        result = supreme_agent_app.invoke(initial_state)
        
        # Get the last message which should be the agent's response
        if result["messages"] and len(result["messages"]) > 1:
            last_message = result["messages"][-1]
            final_response = last_message if isinstance(last_message, str) else (
                last_message.content if hasattr(last_message, 'content') else str(last_message)
            )
            
            logger.info("🎉 SUPREME AGENT SYSTEM COMPLETED")
            logger.info("=" * 80)
            logger.info(f"📤 Final Response: {final_response[:200]}{'...' if len(final_response) > 200 else ''}")
            logger.info(f"📊 Agent Decision: {result.get('decision', {}).get('agent', 'Unknown')}")
            logger.info("=" * 80)
            
            return final_response
        
        logger.warning("⚠️  No response generated from agents")
        return "No response generated"
        
    except Exception as e:
        logger.error(f"❌ Error in Supreme Agent System: {str(e)}")
        logger.error("=" * 80)
        raise e

# # quick example usage
# if __name__ == "__main__":
#     test_query = "What's the latest news on AI ethics?"
#     result = run_supreme_agent(test_query)
#     print("Result:", result)

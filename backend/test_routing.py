#!/usr/bin/env python3
"""
Test script to demonstrate Supreme Agent routing decisions.
Run this to see how different types of queries are routed to different agents.
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supreme.supreme import run_supreme_agent

def test_routing_decisions():
    """Test different types of queries to see routing decisions."""
    
    # Test queries that should go to different agents
    test_queries = [
        # Should go to Agent 1 (HR) - complex/factual queries
        {
            "query": "What are the latest developments in artificial intelligence?",
            "expected_agent": "agent_1",
            "reason": "Complex factual lookup required"
        },
        {
            "query": "Can you research the current market trends in renewable energy?",
            "expected_agent": "agent_1", 
            "reason": "Research/web search needed"
        },
        
        # Should go to Agent 2 (CEO) - general conversation
        {
            "query": "Hello, how are you today?",
            "expected_agent": "agent_2",
            "reason": "Simple greeting/conversation"
        },
        {
            "query": "What's your favorite color?",
            "expected_agent": "agent_2",
            "reason": "Simple personal question"
        },
        {
            "query": "Can you help me brainstorm ideas for a birthday party?",
            "expected_agent": "agent_2",
            "reason": "Creative/conversational task"
        }
    ]
    
    print("🧪 SUPREME AGENT ROUTING TEST")
    print("=" * 80)
    print("This will test different queries to see how the Supreme Agent routes them.")
    print("Watch the logs to see the decision-making process!\n")
    
    for i, test_case in enumerate(test_queries, 1):
        print(f"🎯 Test Case {i}/5")
        print(f"Query: {test_case['query']}")
        print(f"Expected: {test_case['expected_agent']} ({test_case['reason']})")
        print("-" * 60)
        
        try:
            # This will trigger all the logging we added
            response = run_supreme_agent(test_case['query'])
            print(f"✅ Response received (length: {len(response)} chars)")
        
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("\n" + "="*80 + "\n")
        
        # Small delay between tests to make logs easier to read
        import time
        time.sleep(1)
    
    print("🎉 All test cases completed!")
    print("📄 Check 'supreme_agent.log' for detailed logs")

if __name__ == "__main__":
    test_routing_decisions() 
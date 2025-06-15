#!/usr/bin/env python3
"""
Log viewer for Supreme Agent routing decisions.
This script helps you monitor the logs in real-time.
"""

import os
import time
import sys
from datetime import datetime

def tail_log_file(filename, lines=50):
    """Display the last N lines of a log file."""
    try:
        with open(filename, 'r') as f:
            # Read all lines and get the last N
            all_lines = f.readlines()
            recent_lines = all_lines[-lines:] if len(all_lines) > lines else all_lines
            
            print(f"📄 Last {len(recent_lines)} lines from {filename}:")
            print("=" * 80)
            
            for line in recent_lines:
                print(line.rstrip())
                
            print("=" * 80)
            
    except FileNotFoundError:
        print(f"❌ Log file not found: {filename}")
        print("💡 Run a test query first to generate logs!")

def follow_log_file(filename):
    """Follow a log file in real-time (like tail -f)."""
    try:
        print(f"👀 Following log file: {filename}")
        print("Press Ctrl+C to stop...")
        print("=" * 80)
        
        with open(filename, 'r') as f:
            # Go to end of file
            f.seek(0, 2)
            
            while True:
                line = f.readline()
                if line:
                    print(line.rstrip())
                else:
                    time.sleep(0.1)
                    
    except FileNotFoundError:
        print(f"❌ Log file not found: {filename}")
        print("💡 Run a test query first to generate logs!")
    except KeyboardInterrupt:
        print("\n👋 Stopped following log file.")

def view_logs_menu():
    """Interactive menu for viewing logs."""
    log_file = "supreme_agent.log"
    
    while True:
        print("\n🔍 SUPREME AGENT LOG VIEWER")
        print("=" * 40)
        print("1. View recent logs (last 50 lines)")
        print("2. View recent logs (last 20 lines)")
        print("3. Follow logs in real-time")
        print("4. Clear screen")
        print("5. Exit")
        print("=" * 40)
        
        choice = input("Select an option (1-5): ").strip()
        
        if choice == "1":
            print("\n")
            tail_log_file(log_file, 50)
        elif choice == "2":
            print("\n")
            tail_log_file(log_file, 20)
        elif choice == "3":
            print("\n")
            follow_log_file(log_file)
        elif choice == "4":
            os.system('clear' if os.name == 'posix' else 'cls')
        elif choice == "5":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please select 1-5.")

def main():
    """Main function."""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--follow":
            follow_log_file("supreme_agent.log")
        elif sys.argv[1] == "--tail":
            lines = int(sys.argv[2]) if len(sys.argv) > 2 else 50
            tail_log_file("supreme_agent.log", lines)
        else:
            print("Usage:")
            print("  python view_logs.py                 # Interactive menu")
            print("  python view_logs.py --follow        # Follow logs in real-time")
            print("  python view_logs.py --tail [lines]  # Show last N lines")
    else:
        view_logs_menu()

if __name__ == "__main__":
    main() 
from datetime import datetime
from typing import List, Dict
import os

# Centralized in-memory log storage
_logs: List[Dict] = []

def add_log(
    message: str, 
    log_type: str = "info", 
    source: str = "system",
    event: str = None,
    issue: str = None,
    action: str = None,
    status: str = None
):
    """
    Appends a structured log entry to the in-memory log list.
    `log_type` is conventionally 'info', 'warning', or 'error'
    """
    new_log = {
        "message": message,
        "type": log_type,
        "source": source,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event": event,
        "issue": issue,
        "action": action,
        "status": status
    }
    # Insert at the beginning so the newest is first, or standard append
    _logs.insert(0, new_log)
    
    # Write directly to logs/app.log
    write_raw_log(f"[{new_log['timestamp']}] [{log_type.upper()}] [{source}] - {message}")

def write_raw_log(message: str):
    """
    Writes a raw string directly to logs/app.log to allow simulating native error tracebacks.
    """
    os.makedirs(os.path.join(os.path.dirname(__file__), '..', '..', 'logs'), exist_ok=True)
    log_file = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'app.log')
    with open(log_file, "a") as f:
        f.write(message + "\n")

def log_event(event: str, message: str, status: str = None, issue: str = None, action: str = None):
    """
    Wrapper over add_log to strictly format AI-healer pipeline traces.
    Maps status to log_type for backward compatibility.
    """
    log_type = "info"
    if status == "failure":
        log_type = "error"
    elif status == "in-progress" or status == "warning":
        log_type = "warning"

    add_log(
        message=message,
        log_type=log_type,
        source=event,  # store the 'event' (e.g., monitor, ai, executor) in source as well for UI compatibility
        event=event,
        issue=issue,
        action=action,
        status=status
    )

def get_logs() -> List[Dict]:
    """
    Returns the list of logs.
    """
    return _logs

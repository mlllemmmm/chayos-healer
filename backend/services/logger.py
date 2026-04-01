from datetime import datetime
from typing import List, Dict

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

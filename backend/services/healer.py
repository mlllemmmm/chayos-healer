from services.ai_engine import get_ai_fix
from services.executor import execute_fix
from services.verifier import verify_recovery
from services.logger import log_event

def trigger_healer(issue: str, raw_error: str, source: str = "monitor"):
    """
    The orchestrator that handles the whole healing lifecycle.
    """
    print(f"\n🚨 INCIDENT DETECTED: [{issue}] {raw_error}")
    
    # 1. Detection
    log_event(
        event="monitor",
        message=f"Detected anomaly: {raw_error}", 
        status="in-progress",
        issue=issue
    )
    
    # 2. Ask AI
    action = get_ai_fix(raw_error)
    print(f"🧠 AI Decision: {action}")
    
    if action == "unknown_action" or not action:
        print("❌ No valid action found by AI.")
        log_event(
            event="ai",
            message="No valid fix found in playbook",
            status="failure",
            issue=issue
        )
        return False

    log_event(
        event="ai",
        message=f"AI selected action: {action}", 
        status="in-progress",
        issue=issue,
        action=action
    )

    # 3. Execute Action securely
    # executor.py handles its own log_event tracing
    success = execute_fix(action, issue)
    
    if success:
        # 4. Verify Recovery
        log_event(
            event="verifier",
            message=f"Starting verification for {action}...",
            status="in-progress",
            issue=issue,
            action=action
        )
        
        verification = verify_recovery(action)
        status_str = verification.get("status", "failure")
        details = verification.get("details", "")
        
        if status_str == "success":
            print("✅ SYSTEM RECOVERED\n")
            log_event(
                event="verifier",
                message=f"Verification passed: {details}",
                status="success",
                issue=issue,
                action=action
            )
            return True
        else:
            print(f"⚠ Verification failed: {details}\n")
            log_event(
                event="verifier",
                message=f"Verification failed: {details}",
                status="failure",
                issue=issue,
                action=action
            )
            return False
            
    return False
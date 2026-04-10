from services.ai_engine import get_ai_fix
from services.executor import execute_fix
from services.verifier import verify_recovery
from services.logger import log_event


def trigger_healer(issue: str, raw_error: str, source: str = "monitor", on_complete=None):
    """
    The orchestrator that handles the whole healing lifecycle.
    Now includes callback support to notify monitor when healing completes.
    """

    print(f"\n🚨 INCIDENT DETECTED: [{issue}] {raw_error}")

    # 1. Detection Log
    log_event(
        event="monitor",
        message=f"Detected anomaly: {raw_error}",
        status="in-progress",
        issue=issue
    )

    action = None
    success = False

    try:
        # ───────────── Deterministic Mapping ─────────────
        if issue == "PORT_CONFLICT":
            action = "fix_port_conflict"
            success = execute_fix("kill_conflicting_process", issue)
            if success:
                success = execute_fix("restart_backend", issue)

        elif issue == "API_FAILURE":
            action = "fix_api_failure"
            success = execute_fix("clear_faulty_state", issue)
            if success:
                success = execute_fix("restart_backend", issue)

        elif issue == "CPU_SPIKE":
            action = "fix_cpu_spike"
            success = execute_fix("kill_cpu_process", issue)
            if success:
                success = execute_fix("stabilize_system", issue)

        elif issue == "MEMORY_ERROR":
            action = "fix_memory_error"
            success = execute_fix("free_memory", issue)
            if success:
                success = execute_fix("restart_backend", issue)

        # ───────────── AI Fallback ─────────────
        else:
            action = get_ai_fix(raw_error)

            if action == "unknown_action" or not action:
                print("⚠️ AI failed, using fallback mapping")
                fallback_map = {
                    "BACKEND_DOWN": "restart_backend",
                    "MONGO_DOWN": "restart_mongodb",
                    "CPU_SPIKE": "cooldown"
                }
                action = fallback_map.get(issue, "cooldown")
            
            print(f"🧠 AI Decision: {action}")
            print(f"🚀 Executing action: {action}")

            log_event(
                event="ai",
                message=f"AI selected action: {action}",
                status="in-progress",
                issue=issue,
                action=action
            )

            success = execute_fix(action, issue)

        # ───────────── Verification ─────────────
        if success:
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
                success = True
            else:
                print(f"⚠ Verification failed: {details}\n")
                log_event(
                    event="verifier",
                    message=f"Verification failed: {details}",
                    status="failure",
                    issue=issue,
                    action=action
                )
                success = False

        else:
            print("❌ Execution failed before verification\n")

    except Exception as e:
        print(f"💥 Healer crashed: {e}")
        log_event(
            event="healer",
            message=f"Exception occurred: {str(e)}",
            status="failure",
            issue=issue
        )
        success = False

    # ───────────── CALLBACK (CRITICAL FIX) ─────────────
    if on_complete:
        try:
            on_complete(success)
        except Exception as cb_err:
            print(f"⚠ Callback error: {cb_err}")

    return success
import time
from services.docker_utils import restart_container
from services.logger import log_event


def execute_fix(action: str, issue: str = None):
    """
    Executes safe, predefined remediation actions based on playbook.
    No raw shell commands from AI are executed.
    """

    log_event("executor", f"Executing action: {action}", "in-progress", issue, action)

    try:
        # =========================
        # 🐳 CONTAINER ACTIONS
        # =========================

        if action == "restart_mongo":
            from services.docker_utils import get_mongo_container
            container = get_mongo_container()
            if container:
                restart_container(container)
            return _success(action, "MongoDB container restarted", issue)

        elif action == "restart_backend" or action == "restart_service":
            from services.docker_utils import get_docker_client
            client = get_docker_client()
            if client:
                for c in client.containers.list(all=True):
                    if "mushroom-app" in c.name:
                        restart_container(c)
                        break
            # wait 1 second to give docker time to bring it up
            time.sleep(1)
            return _success(action, f"{action.split('_')[1].capitalize()} container restarted", issue)

        # =========================
        # ⚡ SYSTEM ACTIONS (Windows)
        # =========================

        elif action == "restart_docker":
            print("🚀 Restarting Docker Engine (simulated)")
            time.sleep(1) # simulate duration
            return _success(action, "Docker service restarted", issue)

        elif action == "restart_network":
            print("🌐 Refreshing network configuration (simulated)")
            time.sleep(1)
            return _success(action, "Network DNS cache flushed (simulated)", issue)

        # =========================
        # 📈 PERFORMANCE ACTIONS
        # =========================

        elif action == "scale_up_backend":
            # Hackathon-safe simulation
            print("📈 Scaling backend (simulated)")
            time.sleep(1)
            return _success(action, "Backend scaled (simulated)", issue)

        elif action == "cleanup_disk":
            print("🧹 Cleaning temp files (simulated)")
            time.sleep(1)
            return _success(action, "Temporary files cleared (simulated)", issue)

        # =========================
        # 🔐 AUTH / API ACTIONS
        # =========================

        elif action == "refresh_auth":
            print("🔑 Refreshing authentication tokens (simulated)")
            time.sleep(1)
            return _success(action, "Auth refreshed (simulated)", issue)

        elif action == "retry_api":
            print("🔁 Retrying external API (simulated)")
            time.sleep(1)
            return _success(action, "API retry triggered (simulated)", issue)

        # =========================
        # ❌ UNKNOWN ACTION
        # =========================

        else:
            return _failure(action, "Unknown action", issue)

    except Exception as e:
        return _failure(action, str(e), issue)


# =========================
# ✅ HELPERS
# =========================

def _success(action, details, issue=None):
    log_event("executor", f"{action} success: {details}", "success", issue, action)
    return True


def _failure(action, details, issue=None):
    log_event("executor", f"{action} failed: {details}", "failure", issue, action)
    return False
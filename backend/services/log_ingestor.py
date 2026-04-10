import time
import threading
from typing import Dict, List

# Import your existing detection pipeline
from services.healer import trigger_healer

# =========================
# GLOBAL LOG STORE (for UI / debugging)
# =========================
logs_buffer: List[Dict] = []
MAX_LOGS = 500  # prevent memory overflow

# Lock for thread safety (important because multiple sources write logs)
log_lock = threading.Lock()


# =========================
# MAIN INGEST FUNCTION
# =========================
def ingest_log(message: str, source: str = "unknown"):
    """
    Central entry point for ALL logs in the system.
    """
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

    log_entry = {
        "timestamp": timestamp,
        "source": source,
        "message": message
    }

    # Store safely
    with log_lock:
        logs_buffer.append(log_entry)
        if len(logs_buffer) > MAX_LOGS:
            logs_buffer.pop(0)

    # Print for debugging (you’ll see this in terminal)
    print(f"[{timestamp}] [{source}] {message}")

    # Send to detection pipeline
    process_log(message, source)


# =========================
# DETECTION ENGINE
# =========================
def process_log(message: str, source: str):
    """
    Central detection logic (ALL anomalies pass through here)
    """
    msg = message.lower()

    # ===== CPU SPIKE =====
    if "cpu" in msg or "high cpu" in msg:
        print("⚠️ Detected CPU Spike")
        trigger_healer("CPU_SPIKE")

    # ===== MONGO DOWN =====
    elif any(x in msg for x in [
        "connection refused",
        "econnrefused",
        "mongonetworkerror",
        "failed to connect"
    ]):
        print("⚠️ Detected MongoDB Failure")
        trigger_healer("MONGO_DOWN")

    # ===== BACKEND DOWN =====
    elif any(x in msg for x in [
        "server crashed",
        "unhandled exception"
    ]):
        print("⚠️ Detected Backend Crash")
        trigger_healer("BACKEND_DOWN")

    # ===== PORT CONFLICT =====
    elif "port already in use" in msg:
        print("⚠️ Detected Port Conflict")
        trigger_healer("PORT_CONFLICT")


# =========================
# OPTIONAL: FETCH LOGS (for dashboard)
# =========================
def get_logs():
    """
    Returns recent logs (for API/UI)
    """
    with log_lock:
        return list(logs_buffer)


# =========================
# OPTIONAL: CLEAR LOGS
# =========================
def clear_logs():
    with log_lock:
        logs_buffer.clear()
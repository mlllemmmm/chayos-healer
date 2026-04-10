import asyncio
import os
import time
import threading
from services.logger import add_log
from services.healer import trigger_healer
import re

# ─── Timing constants ────────────────────────────────────────────
DEDUPLICATION_WINDOW = 5      # sec — suppresses identical raw log line
HEALING_LOCK_TIMEOUT = 90     # sec — max time a failure can stay "healing"
POST_HEAL_GRACE      = 30     # sec — ignore all logs for this issue after exec
COOLDOWN_PERIOD      = 60     # sec — replaces your old 15s (was too short)

print("🚀 Monitor started...")

# ─── Internal log tags to skip ───────────────────────────────────
INTERNAL_TAGS = [
    "[monitor]", "[executor]", "[verifier]", "[healer]",
    "detected anomaly", "healing triggered", "trigger_healer",
    "recovery attempt", "restarting", "docker restart",
]

# ─── State tracking (the missing piece) ──────────────────────────
# Structure per issue_type:
#   status        : "idle" | "healing" | "cooldown"
#   heal_start    : timestamp when healing began
#   last_triggered: timestamp of last trigger
#   grace_until   : timestamp until which logs are suppressed post-heal
_state: dict[str, dict] = {}
_state_lock = threading.Lock()

def get_state(issue_type: str) -> dict:
    with _state_lock:
        if issue_type not in _state:
            _state[issue_type] = {
                "status": "idle",
                "heal_start": 0,
                "last_triggered": 0,
                "grace_until": 0,
            }
        return _state[issue_type]

def set_state(issue_type: str, **kwargs):
    with _state_lock:
        s = _state.setdefault(issue_type, {
            "status": "idle", "heal_start": 0,
            "last_triggered": 0, "grace_until": 0,
        })
        s.update(kwargs)

# Called by the healer/verifier once healing completes
def notify_heal_complete(issue_type: str, success: bool):
    """
    Call this from your healer/verifier after execution finishes.
    Sets a post-heal grace window so recovery-phase logs are muted.
    """
    now = time.time()
    if success:
        set_state(issue_type,
                  status="cooldown",
                  grace_until=now + POST_HEAL_GRACE)
        print(f"✅ [{issue_type}] Heal succeeded → cooldown {POST_HEAL_GRACE}s")
    else:
        # Failed heal → go back to idle after cooldown so it can retry
        set_state(issue_type,
                  status="idle",
                  grace_until=now + COOLDOWN_PERIOD)
        print(f"⚠️  [{issue_type}] Heal failed → will retry after {COOLDOWN_PERIOD}s")

# ─── Log normalization ────────────────────────────────────────────
def normalize_log(line: str) -> str:
    line = line.lower()
    line = re.sub(r'\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[\w.+-]*', '', line)  # ISO timestamps
    line = re.sub(r'\d+', '', line)          # remaining numbers
    line = re.sub(r'\s+', ' ', line).strip() # collapse whitespace
    return line

# ─── Deduplication cache ──────────────────────────────────────────
_last_raw_triggers: dict[str, float] = {}

def _is_duplicate_raw(issue_type: str, raw_line: str) -> bool:
    key = f"{issue_type}:{normalize_log(raw_line)[:120]}"
    now = time.time()
    if now - _last_raw_triggers.get(key, 0) < DEDUPLICATION_WINDOW:
        return True
    _last_raw_triggers[key] = now
    return False

# ─── Core trigger gate ────────────────────────────────────────────
def check_and_trigger(issue_type: str, raw_line: str):
    now = time.time()
    s = get_state(issue_type)

    # 1. Grace period — logs right after a heal are noise
    if now < s["grace_until"]:
        remaining = round(s["grace_until"] - now)
        print(f"🔇 [{issue_type}] In grace period ({remaining}s left), suppressing log")
        return

    # 2. Healing lock — never retrigger while already healing
    if s["status"] == "healing":
        elapsed = now - s["heal_start"]
        if elapsed < HEALING_LOCK_TIMEOUT:
            print(f"🔒 [{issue_type}] Heal in progress ({round(elapsed)}s), skipping")
            return
        else:
            # Stale lock — healer probably crashed without calling notify_heal_complete
            print(f"⚠️  [{issue_type}] Stale heal lock ({round(elapsed)}s), resetting")
            set_state(issue_type, status="idle", grace_until=0)

    # 3. Cooldown period
    if s["status"] == "cooldown":
        if now < s["grace_until"]:
            print(f"⏳ [{issue_type}] In cooldown ({round(s['grace_until'] - now)}s left)")
            return
        else:
            set_state(issue_type, status="idle")   # cooldown expired → back to idle

    # 4. Raw deduplication (same log line seen twice quickly)
    if _is_duplicate_raw(issue_type, raw_line):
        print(f"⏭  [{issue_type}] Duplicate raw log, skipping")
        return

    # 5. Global cooldown between any two triggers of same type
    if now - s["last_triggered"] < COOLDOWN_PERIOD:
        print(f"⏳ [{issue_type}] Global cooldown active")
        return

    # ✅ All gates passed — trigger healer
    set_state(issue_type,
              status="healing",
              heal_start=now,
              last_triggered=now,
              grace_until=0)

    print(f"🚨 [{issue_type}] Anomaly confirmed → triggering healer")
    print(f"📄 Log: {raw_line}")

    trigger_healer(
        issue=issue_type,
        raw_error=raw_line,
        source="monitor",
        on_complete=lambda success: notify_heal_complete(issue_type, success),
    )

# ─── Detection Rules Extraction ───────────────────────────────────
def process_log(clean_line: str, source: str = "app.log") -> None:
    if not clean_line:
        return
        
    line_lower = clean_line.lower()

    # ── Loop prevention ──────────────────────────────────
    if len(clean_line) > 500:
        # print(f"⏭ Oversized log from {source}, skipping")
        return

    if any(tag in line_lower for tag in INTERNAL_TAGS):
        # print(f"⏭ Internal log suppressed from {source}: {clean_line[:60]}")
        return

    # ── Detection rules ──────────────────────────────────
    if "eaddrinuse" in line_lower or ("port" in line_lower and "in use" in line_lower) or "only one usage of each socket address" in line_lower or "winerror 10048" in line_lower:
        check_and_trigger("PORT_CONFLICT", f"[{source}] {clean_line}")

    elif "mongonetworkerror" in line_lower or "connection refused" in line_lower or "econnrefused" in line_lower or "failed to connect" in line_lower:
        check_and_trigger("MONGO_DOWN", f"[{source}] {clean_line}")

    elif "internal server error" in line_lower or "502" in line_lower or " 500 " in line_lower or "server crashed" in line_lower or "unhandled exception" in line_lower or "container exited" in line_lower:
        check_and_trigger("BACKEND_DOWN", f"[{source}] {clean_line}")

    elif "no space left" in line_lower:
        check_and_trigger("DISK_FULL", f"[{source}] {clean_line}")

    elif "high cpu" in line_lower or "event loop blocked" in line_lower:
        check_and_trigger("CPU_SPIKE", f"[{source}] {clean_line}")

    elif "heap out of memory" in line_lower or "memoryerror" in line_lower:
        check_and_trigger("MEMORY_ERROR", f"[{source}] {clean_line}")
        
    elif "dns resolution failed" in line_lower:
        check_and_trigger("NETWORK_ISSUE", f"[{source}] {clean_line}")
        
    elif "unauthorized" in line_lower:
        check_and_trigger("AUTH_FAILURE", f"[{source}] {clean_line}")
        
    elif "service crashed repeatedly" in line_lower:
        check_and_trigger("CRASH_LOOP", f"[{source}] {clean_line}")
        
    elif "query timeout" in line_lower:
        check_and_trigger("DB_SLOW", f"[{source}] {clean_line}")
        
    elif "docker not running" in line_lower:
        check_and_trigger("DOCKER_ISSUE", f"[{source}] {clean_line}")
        
    elif "oom detected" in line_lower:
        check_and_trigger("MEMORY_PRESSURE", f"[{source}] {clean_line}")
        
    elif "connection timeout" in line_lower:
        check_and_trigger("NETWORK_ISOLATION", f"[{source}] {clean_line}")

# ─── System Resource Monitoring ───────────────────────────────────
async def monitor_cpu():
    import psutil
    print("🔄 Starting CPU monitoring...")
    while True:
        try:
            # interval=1 blocks for 1 second synchronously in thread, better to use 0.0 and sleep
            cpu_percent = psutil.cpu_percent(interval=None)
            if cpu_percent > 85:  # threshold
                process_log("HIGH CPU usage detected", source="psutil")
        except Exception as e:
            print(f"Error in CPU monitor: {e}")
            
        await asyncio.sleep(2)

# ─── App Log Tailing ──────────────────────────────────────────────
async def tail_app_log():
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    log_path = os.path.join(BASE_DIR, 'logs', 'app.log')
    print(f"📂 App Log path: {log_path}")

    while not os.path.exists(log_path):
        print("⏳ Waiting for app log file...")
        await asyncio.sleep(1)

    print(f"📂 Tailing: {log_path}")

    with open(log_path, 'r', encoding="utf-8", errors="ignore") as f:
        f.seek(0, 2)  # tail from end

        while True:
            line = f.readline()
            if not line:
                await asyncio.sleep(0.5)
                continue

            clean_line = line.strip()
            process_log(clean_line, source="app.log")

# ─── Main monitoring loop ─────────────────────────────────────────
async def start_monitoring():
    print("🔄 Starting background log monitoring loop...")
    
    # Initialize psutil cpu tracking before loop
    import psutil
    psutil.cpu_percent()
    
    # Run tailing and CPU tasks concurrently
    await asyncio.gather(
        tail_app_log(),
        monitor_cpu()
    )

if __name__ == "__main__":
    asyncio.run(start_monitoring())
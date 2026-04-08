import random
import sys
import subprocess
from fastapi import APIRouter
from services.inject import inject_cpu, inject_memory, inject_crash, inject_mongo
from services.state import state
from services.logger import log_event
from services.healer import trigger_healer

router = APIRouter()

def start_dummy_server():
    """Starts a python dummy server on 8000 to simulate port conflict safely"""
    try:
        if state.port_conflict_process is None or state.port_conflict_process.poll() is not None:
            proc = subprocess.Popen([sys.executable, "-m", "http.server", "8000"])
            state.port_conflict_process = proc
            log_event(
                event="inject",
                message="Injected Port Conflict on port 8000",
                status="warning",
                issue="port_conflict"
            )
            trigger_healer("port_conflict", "Address already in use", "inject")
    except Exception as e:
        print(f"Error starting dummy server: {e}")

@router.post("/run")
def run_chaos_mode():
    failures = [
        "cpu_spike",
        "memory_leak",
        "mongo_down",
        "port_conflict",
        "safe_latency_spike",
        "crash_loop"
    ]
    # Optionally, we can weight them or keep them completely random
    selected = random.choice(failures)
    
    if selected == "cpu_spike":
        inject_cpu()
    elif selected == "memory_leak":
        inject_memory()
    elif selected == "mongo_down":
        inject_mongo()
    elif selected == "crash_loop":
        inject_crash()
    elif selected == "port_conflict":
        start_dummy_server()
    elif selected == "safe_latency_spike":
        state.latency_spiked = True
        log_event(
            event="inject",
            message="Injected Safe Latency Spike",
            status="warning",
            issue="latency_spike"
        )
        trigger_healer("latency_spike", "Response time > threshold", "inject")
        
    return {"injected": selected}

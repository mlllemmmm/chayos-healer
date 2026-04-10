from fastapi import APIRouter
from services.docker_utils import get_mongo_container, stop_container
from services.logger import log_event, write_raw_log
import time
import multiprocessing
import threading
from services.state import state

router = APIRouter(prefix="/inject")

@router.post("/failure")
def inject_failure(data: dict):
    service = data.get("service")

    if service == "mongodb":
        container = get_mongo_container()
        if container:
            log_event(
                event="inject", 
                message="Injected manual database failure", 
                status="warning", 
                issue="mongodb_down", 
                action="stop_mongo"
            )
            stop_container(container)
            return {"status": "failure injected"}
        else:
            return {"status": "container not found"}

    return {"status": "ignored"}


@router.post("/mongo")
def inject_mongo():
    print("Attempting to inject MongoDB failure...")
    container = get_mongo_container()
    if container:
        print(f"Found container: {container.name}")
        print("Stopping container...")
        success = stop_container(container)
        if success:
            print("Container stopped successfully")
            write_raw_log("MongoNetworkError: connection refused") # Simulation fallback
            return {"status": "MongoDB failure injected (Docker container stopped)"}
        else:
            print("Error: Failed to stop container")
            return {"status": "Failed to stop MongoDB container"}
    
    print("Error: MongoDB container not found")
    write_raw_log("MongoNetworkError: connection refused") # Simulation fallback
    return {"status": "MongoDB container not found (Used simulated failure)"}


@router.post("/backend")
def inject_backend():
    print("Attempting to inject Backend failure...")
    from services.docker_utils import get_backend_container
    container = get_backend_container()
    
    if container:
        print(f"Found container: {container.name}")
        print("Stopping container...")
        success = stop_container(container)
        if success:
            print("Container stopped successfully")
            write_raw_log("502 bad gateway") # Simulation fallback
            return {"status": "Backend failure injected (Docker container stopped)"}
        else:
            print("Error: Failed to stop backend container")
            return {"status": "Failed to stop Backend container"}
            
    print("Backend container not found, attempting local process kill...")
    import sys, subprocess, os, threading
    
    def kill_local_process():
        try:
            if sys.platform == 'win32':
                # Windows
                output = subprocess.check_output("netstat -ano | findstr :8000", shell=True).decode()
                for line in output.splitlines():
                    if "LISTENING" in line:
                        pid = line.strip().split()[-1]
                        if int(pid) != os.getpid():  # Avoid killing self if possible, though this process is the backend
                            subprocess.run(f"taskkill /F /PID {pid}", shell=True)
                        else:
                            # If it's this exact process, wait briefly to return response, then exit
                            threading.Timer(1.0, lambda: os._exit(1)).start()
                        return True
            else:
                # Unix
                output = subprocess.check_output("lsof -i :8000 -t", shell=True).decode()
                pid = output.strip()
                if pid:
                    if int(pid) != os.getpid():
                        subprocess.run(f"kill -9 {pid}", shell=True)
                    else:
                        threading.Timer(1.0, lambda: os._exit(1)).start()
                    return True
        except Exception as e:
            print(f"Local kill failed: {e}")
        return False
        
    # If the current process is the backend, self-terminate after returning
    threading.Timer(1.0, lambda: os._exit(1)).start()
    return {"status": "Backend failure injected (Local process killing)"}


def cpu_stress_worker():
    import time
    end = time.time() + 10
    while time.time() < end:
        pass


@router.post("/cpu")
def inject_cpu():
    if state.cpu_stress_process is None or not state.cpu_stress_process.is_alive():
        # 🔥 WRITE LOG (IMPORTANT)
        write_raw_log("HIGH CPU usage detected")

        p = multiprocessing.Process(target=cpu_stress_worker)
        p.start()
        state.cpu_stress_process = p

        return {"status": "High CPU injected"}
    
    return {"status": "Already running"}

@router.post("/memory")
def inject_memory():
    def _mem_worker():
        import os
        chunks = []
        try:
            # We want to hit the memory error boundary but do it safely.
            max_chunks = 90 # arbitrary safe limit ~90MB
            for i in range(120):
                if len(chunks) >= max_chunks:
                    raise MemoryError("safe limit reached")
                chunks.append(" " * (1024 * 1024))
                time.sleep(0.05)
        except MemoryError:
            write_raw_log(f"[{time.time()}] [ERROR] [uvicorn] - heap out of memory")
        finally:
            chunks.clear()
            
    threading.Thread(target=_mem_worker).start()
    return {"status": "High Memory injected"}

@router.post("/disk")
def inject_disk():
    write_raw_log("no space left on device")
    return {"status": "Disk Full injected"}

@router.post("/crash")
def inject_crash():
    write_raw_log("service crashed repeatedly")
    return {"status": "Crash Loop injected"}

@router.post("/network")
def inject_network():
    write_raw_log("dns resolution failed")
    return {"status": "Network Issue injected"}

@router.post("/db-slow")
def inject_db_slow():
    write_raw_log("query timeout exceeded")
    return {"status": "DB Slow injected"}

@router.post("/auth")
def inject_auth():
    write_raw_log("unauthorized access token invalid")
    return {"status": "Auth Failure injected"}

@router.post("/api-failure")
def inject_api():
    def _api_worker():
        import httpx
        try:
            httpx.get("http://localhost:8000/force-500", timeout=5)
        except Exception:
            pass
            
    threading.Thread(target=_api_worker).start()
    return {"status": "API Failure injected"}

@router.post("/docker")
def inject_docker():
    write_raw_log("docker not running")
    return {"status": "Docker Issue injected"}

from services.docker_utils import get_backend_container, disconnect_from_network, inject_memory_pressure


@router.post("/memory-pressure")
def inject_memory_pressure_route():
    container = get_backend_container()
    if container:
        success = inject_memory_pressure(container)
        if success:
            write_raw_log("OOM detected: memory limit exceeded")
            return {"status": "Container Memory Pressure injected"}
        return {"status": "Failed to inject memory pressure"}
    return {"status": "Backend container not found"}

@router.post("/network-isolation")
def inject_network_isolation():
    container = get_backend_container()
    if container:
        success = disconnect_from_network(container, "chaos-net")
        if success:
            write_raw_log("connection timeout")
            return {"status": "Container Network Isolation injected"}
        return {"status": "Failed to disconnect container"}
    return {"status": "Backend container not found"}

@router.post("/port-conflict")
def inject_port_conflict():
    import subprocess
    import sys
    import os
    from services.logger import write_raw_log
    try:
        if state.port_conflict_process is None or state.port_conflict_process.poll() is not None:
            log_path = os.path.join(os.path.dirname(__file__), '..', '..', 'logs', 'app.log')
            f = open(log_path, 'a', encoding="utf-8")
            backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            # Attempt to start another backend instance on 8000 using sys.executable
            # Ensure PYTHONIOENCODING is utf-8 so emojis don't crash Windows cp1252 charmap
            env = dict(os.environ)
            env["PYTHONIOENCODING"] = "utf-8"
            proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8000"], stderr=f, stdout=f, cwd=backend_dir, env=env)
            state.port_conflict_process = proc
            return {"status": "Port Conflict injected"}
    except Exception as e:
        write_raw_log(f"Failed to start port conflict process: {e}")
    return {"status": "Port conflict already running"}

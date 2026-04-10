from dotenv import load_dotenv
load_dotenv()

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.inject import router as inject_router
from services.monitor import start_monitoring
from services.logger import get_logs
from services.docker_utils import get_mongo_container, restart_container
import psutil
import time
import os
from fastapi import Request
from services.logger import write_raw_log
from datetime import datetime

from services.state import state
from services.playbook_manager import router as playbook_router
from services.chaos_engine import router as chaos_router
from services.scaler import router as scaler_router
from services.metrics import router as metrics_router
from services.metrics import collect_metrics_loop
from services.scaler import monitor_and_scale

async def event_loop_monitor():
    """
    Background worker that continuously measures event loop latency.
    If delayed significantly, it simulates a real log line indicating starvation.
    """
    last_time = time.time()
    while True:
        await asyncio.sleep(0.5)
        current_time = time.time()
        latency = current_time - last_time - 0.5
        if latency > 2.0:
            write_raw_log(f"[{datetime.utcnow().isoformat()+'Z'}] [ERROR] [uvicorn] - WARNING: timeout / event loop blocked due to high CPU usage")
        last_time = current_time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def latency_middleware(request: Request, call_next):
    if state.latency_spiked:
        await asyncio.sleep(state.latency_delay)
    response = await call_next(request)
    return response

app.include_router(inject_router)
app.include_router(playbook_router, prefix="/playbooks", tags=["playbooks"])
app.include_router(chaos_router, prefix="/chaos", tags=["chaos"])
app.include_router(scaler_router, prefix="/scaling", tags=["scaling"])
app.include_router(metrics_router, prefix="/metrics", tags=["metrics"])

from services.healer import trigger_healer

@app.on_event("startup")
async def startup_event():
    # Run the background monitors indefinitely
    asyncio.create_task(start_monitoring())
    asyncio.create_task(collect_metrics_loop())
    asyncio.create_task(monitor_and_scale())
    asyncio.create_task(event_loop_monitor())

@app.get("/")
def home():
    return {"status": "Chaos Healer running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/logs")
def logs():
    return get_logs()

@app.get("/force-500")
def force_500():
    write_raw_log(f"[{datetime.utcnow().isoformat()+'Z'}] [ERROR] [fastapi] - Internal Server Error: forced failure")
    raise Exception("Forced failure")

@app.get("/detect")
def detect():
    container = get_mongo_container()
    if container:
        container.reload()
        return {"mongodb": container.status}
    return {"mongodb": "not found"}

@app.post("/auto-heal")
def auto_heal():
    """
    Manually triggers the auto-healing pipeline for testing purposes.
    """
    container = get_mongo_container()
    if container:
        container.reload()
        if container.status != "running":
            success = trigger_healer(issue="mongodb_down", raw_error="mongo db down", source="manual-trigger")
            if success:
                return {"status": "Healed successfully. See logs."}
            else:
                return {"status": "Healing failed. See logs."}
        else:
            return {"status": "Mongo is healthy."}
    return {"status": "MongoDB container not found"}


# =========================
# 🔥 NEW: METRICS ENDPOINT
# =========================
@app.get("/metrics/standard")
def get_metrics():
    try:
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().used / (1024 ** 3)  # GB
        uptime = 99.9  # You can later compute real uptime

        return {
            "cpu": round(cpu, 2),
            "memory": round(memory, 2),
            "uptime": uptime
        }

    except Exception as e:
        # fallback so frontend never breaks
        return {
            "cpu": 0,
            "memory": 0,
            "uptime": 0,
            "error": str(e)
        }
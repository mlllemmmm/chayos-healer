import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.inject import router as inject_router
from services.monitor import start_monitoring
from services.logger import get_logs
from services.docker_utils import get_mongo_container, restart_container

# ✅ NEW IMPORT
import psutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inject_router)

from services.healer import trigger_healer

@app.on_event("startup")
async def startup_event():
    # Run the background monitor indefinitely
    asyncio.create_task(start_monitoring())

@app.get("/")
def home():
    return {"status": "Chaos Healer running"}

@app.get("/logs")
def logs():
    return get_logs()

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
@app.get("/metrics")
def get_metrics():
    try:
        cpu = psutil.cpu_percent(interval=0.5)
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
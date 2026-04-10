from dotenv import load_dotenv
load_dotenv()

import asyncio
import psutil

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from services.inject import router as inject_router
from services.monitor import start_monitoring
from services.logger import get_logs
from services.docker_utils import get_mongo_container
from services.state import state
from services.playbook_manager import router as playbook_router
from services.chaos_engine import router as chaos_router
from services.scaler import router as scaler_router, monitor_and_scale
from services.metrics import router as metrics_router, collect_metrics_loop
from services.adaptive_healer import handle_incident_adaptively
from services.teacher import teach_system
from services.promotion import get_promotable_cases
from services.experience_store import load_experiences
from services.healer import trigger_healer

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


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(start_monitoring())
    asyncio.create_task(collect_metrics_loop())
    asyncio.create_task(monitor_and_scale())


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


@app.get("/experiences")
def experiences():
    return load_experiences()


@app.get("/promotion-candidates")
def promotion_candidates():
    return get_promotable_cases()


@app.post("/auto-heal")
def auto_heal():
    container = get_mongo_container()
    if container:
        container.reload()
        if container.status != "running":
            success = trigger_healer(
                issue="mongodb_down",
                raw_error="mongo db down",
                source="manual-trigger",
            )
            if success:
                return {"status": "Healed successfully. See logs."}
            return {"status": "Healing failed. See logs."}
        return {"status": "Mongo is healthy."}
    return {"status": "MongoDB container not found"}


@app.get("/metrics/standard")
def get_metrics():
    try:
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().used / (1024 ** 3)

        return {
            "cpu": round(cpu, 2),
            "memory": round(memory, 2),
            "uptime": 99.9,
        }
    except Exception as e:
        return {
            "cpu": 0,
            "memory": 0,
            "uptime": 0,
            "error": str(e),
        }


@app.post("/adaptive-heal")
def adaptive_heal(data: dict):
    return handle_incident_adaptively(data)


@app.post("/teach-fix")
def teach_fix(data: dict):
    incident = data.get("incident", {})
    action_id = data.get("action_id")

    if not action_id:
        return {"status": "error", "message": "action_id is required"}

    return teach_system(incident, action_id)


@app.get("/status")
def status():
    container = get_mongo_container()
    mongo_status = "down"

    if container:
        try:
            container.reload()
            mongo_status = "healthy" if container.status == "running" else "down"
        except Exception:
            mongo_status = "down"

    return {
        "mongo": mongo_status,
        "backend": "healthy",
    }
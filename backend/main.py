import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.inject import router as inject_router
from services.monitor import start_monitoring
from services.logger import get_logs
from services.docker_utils import get_mongo_container, restart_container

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inject_router)

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

@app.post("/auto-heal")
def auto_heal():
    container = get_mongo_container()
    if container:
        # Reload just in case
        container.reload()
        if container.status != "running":
            success = restart_container(container)
            if success:
                return {"status": "Mongo was DOWN → restarted"}
            else:
                return {"status": "Failed to restart Mongo"}
    return {"status": "Mongo is healthy or not found"}
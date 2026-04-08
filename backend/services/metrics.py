import asyncio
import time
import psutil
from fastapi import APIRouter
from services.state import state

router = APIRouter()

async def collect_metrics_loop():
    while True:
        try:
            cpu = psutil.cpu_percent(interval=None)
            memory = psutil.virtual_memory().percent
            
            metric = {
                "timestamp": time.time(),
                "cpu": round(cpu, 2),
                "memory": round(memory, 2)
            }
            state.add_metric(metric)
        except Exception as e:
            print(f"Metrics collection error: {e}")
            
        await asyncio.sleep(2)  # Update every 2 seconds

@router.get("/history")
def get_metrics_history():
    return state.metrics_history

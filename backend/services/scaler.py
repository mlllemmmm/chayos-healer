import asyncio
import psutil
from fastapi import APIRouter
from services.state import state
from services.logger import log_event
from services.alert_service import send_alert

router = APIRouter()

async def monitor_and_scale():
    while True:
        try:
            # Check conditions
            cpu = psutil.cpu_percent(interval=None)
            
            needs_scaling = False
            reason = ""
            
            if cpu > 80:
                needs_scaling = True
                reason = "High CPU"
            elif state.latency_spiked:
                needs_scaling = True
                reason = "High Latency"
                
            if needs_scaling and state.scaling_instances < 2: # Keep simulation simple
                state.scaling_instances = 2
                state.scaling_reason = reason
                print(f"⚡ SCALING: Spinning up genuine container backend_replica_2 due to {reason}")
                
                from services.docker_utils import scale_up_backend
                scale_up_backend(state.scaling_instances)
                
                log_event(
                    event="scaler",
                    message=f"Scaling from 1 to 2 instances. Reason: {reason}",
                    status="success",
                    issue="auto_scale"
                )
                
                send_alert(f"Auto-scaling triggered. Instaces: 2. Reason: {reason}", "WARNING")
                
            elif not needs_scaling and state.scaling_instances > 1:
                # Scale down if healthy for a while (optional enhancement)
                # Keep it simple for now and leave it, or naturally revert:
                pass
                
        except Exception as e:
            print(f"Scaler error: {e}")
            
        await asyncio.sleep(5)

@router.get("/status")
def scaling_status():
    return {
        "instances": state.scaling_instances,
        "reason": state.scaling_reason
    }

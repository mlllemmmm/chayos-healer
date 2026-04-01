import asyncio
from services.logger import add_log
from services.docker_utils import get_mongo_container
from services.healer import trigger_healer

async def start_monitoring():
    """
    Background worker that indefinitely monitors the database container.
    """
    print("Initiating background monitoring loop...")
    while True:
        try:
            container = get_mongo_container()
            if container:
                # Reload container metadata to get the latest status
                container.reload()
                if container.status != "running":
                    # Detected an offline database!
                    trigger_healer(issue="mongodb_down", raw_error="mongo db down", source="monitor")
                    
                    # Wait briefly to ensure state transitions properly
                    await asyncio.sleep(2)
            else:
                 pass
                
        except Exception as e:
            print(f"Monitor encountered an error: {e}")
            
        # Polling interval
        await asyncio.sleep(5)
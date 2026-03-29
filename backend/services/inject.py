from fastapi import APIRouter
from services.docker_utils import get_mongo_container, stop_container
from services.logger import add_log

router = APIRouter()

@router.post("/inject-failure")
def inject_failure(data: dict):
    service = data.get("service")

    if service == "mongodb":
        container = get_mongo_container()
        if container:
            add_log("Injected manual database failure", log_type="warning", source="user")
            stop_container(container)
            return {"status": "failure injected"}
        else:
            return {"status": "container not found"}

    return {"status": "ignored"}
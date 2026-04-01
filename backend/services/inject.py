from fastapi import APIRouter
from services.docker_utils import get_mongo_container, stop_container
from services.logger import log_event
from services.healer import trigger_healer

router = APIRouter()

@router.post("/inject-failure")
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


def handle_injection(issue_key: str, error_msg: str, display_name: str):
    log_event(
        event="monitor",
        message=f"Injected failure: {display_name}",
        status="in-progress",
        issue=issue_key
    )
    # Trigger healer directly
    trigger_healer(issue=issue_key, raw_error=error_msg, source="inject")


@router.post("/inject-mongo")
def inject_mongo():
    container = get_mongo_container()
    if container:
        stop_container(container)
    handle_injection("mongodb_down", "connection refused", "MongoDB Down")
    return {"status": "MongoDB failure injected"}

@router.post("/inject-backend")
def inject_backend():
    handle_injection("backend_down", "502 bad gateway", "Backend Down")
    return {"status": "Backend failure injected"}

@router.post("/inject-cpu")
def inject_cpu():
    handle_injection("high_cpu", "cpu usage high", "High CPU")
    return {"status": "High CPU injected"}

@router.post("/inject-memory")
def inject_memory():
    handle_injection("high_memory", "out of memory", "High Memory")
    return {"status": "High Memory injected"}

@router.post("/inject-disk")
def inject_disk():
    handle_injection("disk_full", "no space left", "Disk Full")
    return {"status": "Disk Full injected"}

@router.post("/inject-crash")
def inject_crash():
    handle_injection("crash_loop", "crash loop", "Service Crash Loop")
    return {"status": "Crash Loop injected"}

@router.post("/inject-network")
def inject_network():
    handle_injection("network_issue", "dns error", "Network Issue")
    return {"status": "Network Issue injected"}

@router.post("/inject-db-slow")
def inject_db_slow():
    handle_injection("db_slow", "query timeout", "DB Slow")
    return {"status": "DB Slow injected"}

@router.post("/inject-auth")
def inject_auth():
    handle_injection("auth_failure", "unauthorized", "Auth Failure")
    return {"status": "Auth Failure injected"}

@router.post("/inject-api")
def inject_api():
    handle_injection("external_api_down", "api connection error", "API Failure")
    return {"status": "API Failure injected"}

@router.post("/inject-docker")
def inject_docker():
    handle_injection("docker_issue", "docker not running", "Docker Engine Down")
    return {"status": "Docker Issue injected"}
from fastapi import APIRouter
from services.docker_utils import get_mongo_container, stop_container
from services.logger import add_log
from services.healer import trigger_healer

router = APIRouter()


def handle_known_injection(display_message: str, error_message: str):
    add_log(display_message, log_type="error", source="monitor-agent")
    trigger_healer(error_message)


@router.post("/inject-mongo")
def inject_mongo():
    container = get_mongo_container()
    if container:
        add_log("Injected manual database failure", log_type="warning", source="user")
        stop_container(container)
        add_log("MongoDB DOWN detected", log_type="error", source="monitor-agent")
        return {"status": "mongo failure injected"}
    return {"status": "mongo container not found"}


@router.post("/inject-backend")
def inject_backend():
    handle_known_injection("Injected backend down incident", "502 bad gateway")
    return {"status": "backend failure injected"}


@router.post("/inject-cpu")
def inject_cpu():
    handle_known_injection("Injected high CPU incident", "cpu usage high")
    return {"status": "cpu failure injected"}


@router.post("/inject-memory")
def inject_memory():
    handle_known_injection("Injected known memory pressure incident", "FATAL: JavaScript heap out of memory")
    return {"status": "memory failure injected"}


@router.post("/inject-disk")
def inject_disk():
    handle_known_injection("Injected disk full incident", "no space left on device")
    return {"status": "disk failure injected"}


@router.post("/inject-crash")
def inject_crash():
    handle_known_injection("Injected crash loop incident", "service crash loop detected")
    return {"status": "crash failure injected"}


@router.post("/inject-network")
def inject_network():
    handle_known_injection("Injected network issue incident", "dns resolution failure")
    return {"status": "network failure injected"}


@router.post("/inject-db-slow")
def inject_db_slow():
    handle_known_injection("Injected slow database incident", "database query timeout")
    return {"status": "db slow failure injected"}


@router.post("/inject-auth")
def inject_auth():
    handle_known_injection("Injected auth failure incident", "401 unauthorized")
    return {"status": "auth failure injected"}


@router.post("/inject-api")
def inject_api():
    handle_known_injection("Injected external API failure incident", "external api connection error")
    return {"status": "api failure injected"}


@router.post("/inject-docker")
def inject_docker():
    handle_known_injection("Injected docker engine issue", "docker daemon unavailable")
    return {"status": "docker failure injected"}


@router.post("/inject-port-conflict")
def inject_port_conflict():
    handle_known_injection("Injected known port conflict", "Error: listen EADDRINUSE: address already in use :::3000")
    return {"status": "port conflict injected"}


@router.post("/inject-network-isolation")
def inject_network_isolation():
    handle_known_injection("Injected network isolation incident", "connection timeout")
    return {"status": "network isolation injected"}


@router.post("/inject-memory-pressure")
def inject_memory_pressure():
    handle_known_injection("Injected memory pressure incident", "OOM detected: memory limit exceeded")
    return {"status": "memory pressure injected"}


@router.post("/inject-unknown")
def inject_unknown():
    error = "CRITICAL: cache layer failure - unknown signature"
    incident = {
        "service": "app",
        "error_log": error,
        "symptom": "unknown_failure",
        "container_status": "unknown",
        "source": "monitor"
    }

    add_log(error, log_type="error", source="monitor-agent")
    add_log("No playbook match found. Entering adaptive mode.", log_type="warning", source="adaptive-healer")

    return {
        "status": "unknown injected",
        "incident": incident
    }
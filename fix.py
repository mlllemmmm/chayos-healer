import sys
with open('backend/services/inject.py', 'rb') as f:
    raw = f.read()
if raw.startswith(b'\xff\xfe'):
    code = raw.decode('utf-16')
else:
    code = raw.decode('utf-8')

code = code.replace('router = APIRouter(prefix="/inject")', 'router = APIRouter()')
code = code.replace('@router.post("/mongo")', '@router.post("/inject-mongo")')
code = code.replace('@router.post("/backend")', '@router.post("/inject-backend")')
code = code.replace('@router.post("/cpu")', '@router.post("/inject-cpu")')
code = code.replace('@router.post("/memory")', '@router.post("/inject-memory")')
code = code.replace('@router.post("/api-failure")', '@router.post("/inject-api")')
code = code.replace('@router.post("/port-conflict")', '@router.post("/inject-port-conflict")')

code += '''
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
    from services.logger import add_log
    add_log(error, log_type="error", source="monitor-agent")
    add_log("No playbook match found. Entering adaptive mode.", log_type="warning", source="adaptive-healer")
    return {
        "status": "unknown injected",
        "incident": incident
    }
'''

with open('backend/services/inject.py', 'w', encoding='utf-8') as f:
    f.write(code)

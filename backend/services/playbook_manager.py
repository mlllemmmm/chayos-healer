from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from services.playbook import load_playbook

router = APIRouter()

# Initialize from existing playbook to retain backward compatibility with pipeline
playbooks_db: Dict[str, Any] = load_playbook()
for k, v in playbooks_db.items():
    if "severity" not in v:
        v["severity"] = "CRITICAL" if "down" in k or "crash" in k else "WARNING"
    if "steps" not in v:
        v["steps"] = [v["action"]]
    if "error_pattern" not in v:
        v["error_pattern"] = v["keywords"][0] if "keywords" in v and len(v["keywords"]) > 0 else k

def get_playbook_db():
    return playbooks_db

@router.get("")
@router.get("/")
def get_playbooks():
    return [{"id": k, **v} for k, v in playbooks_db.items()]

@router.post("")
@router.post("/")
def add_playbook(data: dict):
    pb_id = data.get("id")
    if not pb_id or pb_id in playbooks_db:
        raise HTTPException(status_code=400, detail="Invalid playbook ID or already exists")
    
    playbooks_db[pb_id] = {
        "keywords": [data.get("error_pattern", pb_id)],
        "error_pattern": data.get("error_pattern", pb_id),
        "steps": data.get("steps", []),
        "action": data.get("steps", ["unknown_action"])[0] if data.get("steps") else "unknown_action",
        "severity": data.get("severity", "INFO"),
        "verify": "check_custom"
    }
    return playbooks_db[pb_id]

@router.put("/{pb_id}")
def edit_playbook(pb_id: str, data: dict):
    if pb_id not in playbooks_db:
        raise HTTPException(status_code=404, detail="Playbook not found")
        
    if "error_pattern" in data:
        playbooks_db[pb_id]["error_pattern"] = data["error_pattern"]
        if "keywords" in playbooks_db[pb_id]:
            playbooks_db[pb_id]["keywords"][0] = data["error_pattern"]
        else:
            playbooks_db[pb_id]["keywords"] = [data["error_pattern"]]
            
    if "steps" in data and len(data["steps"]) > 0:
        playbooks_db[pb_id]["steps"] = data["steps"]
        playbooks_db[pb_id]["action"] = data["steps"][0]
        
    if "severity" in data:
        playbooks_db[pb_id]["severity"] = data["severity"]
        
    return playbooks_db[pb_id]

@router.delete("/{pb_id}")
def delete_playbook(pb_id: str):
    if pb_id in playbooks_db:
        del playbooks_db[pb_id]
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Playbook not found")

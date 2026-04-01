from groq import Groq
import os
import json
from services.playbook import load_playbook

from dotenv import load_dotenv
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_ai_fix(error_message: str):
    playbook = load_playbook()
    playbook_context = json.dumps(playbook, indent=2)

    system_prompt = f"""
You are an AIOps system.

Match the error to ONE action from the playbook.

PLAYBOOK:
{playbook_context}

RULES:
- Return ONLY action name (example: restart_mongo)
- No explanation
- If no match: unknown_action
"""

    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": error_message}
        ],
        model="llama-3.3-70b-versatile"
    )

    result = response.choices[0].message.content.strip()
    result = result.replace('"','').replace("'","").replace(".","")

    valid_actions = {v["action"] for v in playbook.values()}

    if result not in valid_actions:
        return "unknown_action"

    return result
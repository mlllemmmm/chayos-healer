from services.logger import log_event

def send_alert(message: str, severity: str = "INFO"):
    """
    Simulates sending an alert via Twilio / Slack.
    Severity can be: CRITICAL, WARNING, INFO
    """
    prefix = ""
    if severity == "CRITICAL":
        prefix = "🚨 CRITICAL ALERT:"
    elif severity == "WARNING":
        prefix = "⚠ WARNING ALERT:"
    else:
        prefix = "ℹ INFO ALERT:"

    formatted_message = f"{prefix} {message}"
    print(f"\n[TWILIO MOCK] Sending SMS/Slack: {formatted_message}\n")
    
    log_event(
        event="alert",
        message=formatted_message,
        status="sent",
        issue=f"alert_{severity.lower()}"
    )

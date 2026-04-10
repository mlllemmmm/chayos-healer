# centralized memory store for shared state
import time

class SharedState:
    def __init__(self):
        self.latency_spiked = False
        self.latency_delay = 5.0
        self.scaling_instances = 1
        self.scaling_reason = "Normal operation"
        self.port_conflict_process = None
        self.cpu_stress_process = None
        self.memory_stress_process = None
        
        # Keep metrics as a list: { "timestamp": float, "cpu": float, "memory": float }
        self.metrics_history = []
        
    def add_metric(self, metric: dict):
        self.metrics_history.append(metric)
        # Keep only the last 60 items (approx 60 seconds if polled every 1s)
        if len(self.metrics_history) > 60:
            self.metrics_history.pop(0)

# Global instance
state = SharedState()

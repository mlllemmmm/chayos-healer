import re
import os

def load_playbook():
    return {

        # 1️⃣ MongoDB Down
        "mongodb_down": {
            "keywords": [
                "connection refused",
                "mongo not reachable",
                "mongo db down",
                "container exited",
                "database down"
            ],
            "action": "restart_mongodb",
            "verify": "check_mongo"
        },

        # 2️⃣ Backend API Down
        "backend_down": {
            "keywords": [
                "502 bad gateway",
                "backend unreachable",
                "api timeout",
                "connection failed",
                "server error"
            ],
            "action": "restart_backend",
            "verify": "check_backend"
        },

        # 3️⃣ High CPU Usage
        "high_cpu": {
            "keywords": [
                "cpu usage high",
                "cpu spike",
                "100% cpu",
                "resource exhaustion"
            ],
            "action": "cooldown",
            "verify": "check_cpu"
        },

        # 4️⃣ High Memory Usage
        "high_memory": {
            "keywords": [
                "out of memory",
                "memory leak",
                "ram full",
                "memory usage high"
            ],
            "action": "restart_backend",
            "verify": "check_memory"
        },

        # 5️⃣ Disk Space Full
        "disk_full": {
            "keywords": [
                "no space left",
                "disk full",
                "storage exhausted"
            ],
            "action": "cleanup_disk",
            "verify": "check_disk"
        },

        # 6️⃣ Service Crash Loop
        "crash_loop": {
            "keywords": [
                "crash loop",
                "restarting again and again",
                "container restarting"
            ],
            "action": "restart_service",
            "verify": "check_service"
        },

        # 7️⃣ Network / DNS Failure
        "network_issue": {
            "keywords": [
                "getaddrinfo failed",
                "dns error",
                "network unreachable",
                "temporary failure in name resolution"
            ],
            "action": "restart_network",
            "verify": "check_network"
        },

        # 8️⃣ Database Slow Response
        "db_slow": {
            "keywords": [
                "query timeout",
                "slow database",
                "db latency high"
            ],
            "action": "restart_mongodb",
            "verify": "check_mongo"
        },

        # 9️⃣ Authentication Failure
        "auth_failure": {
            "keywords": [
                "unauthorized",
                "invalid token",
                "authentication failed",
                "403 forbidden"
            ],
            "action": "refresh_auth",
            "verify": "check_auth"
        },

        # 🔟 External API Failure (VERY IMPRESSIVE)
        "external_api_down": {
            "keywords": [
                "api connection error",
                "third party api failed",
                "timeout from external service"
            ],
            "action": "retry_api",
            "verify": "check_api"
        },

        # 1️⃣1️⃣ Docker Engine Issue
        "docker_issue": {
            "keywords": [
                "docker not running",
                "cannot connect to docker daemon",
                "docker service down"
            ],
            "action": "restart_docker",
            "verify": "check_docker"
        },

        # 1️⃣2️⃣ Container Network Isolation
        "container_network_isolation": {
            "keywords": [
                "network isolated",
                "chaos-net disconnect",
                "connection timeout",
                "ECONNREFUSED"
            ],
            "action": "reconnect_network",
            "verify": "check_network"
        },

        # 1️⃣3️⃣ Container Memory Pressure
        "container_memory_pressure": {
            "keywords": [
                "OOM detected",
                "memory limit exceeded",
                "container out of memory"
            ],
            "action": "restart_backend",
            "verify": "check_memory"
        },
        
        # 1️⃣4️⃣ Port Conflict
        "port_conflict": {
            "keywords": [
                "Address already in use",
                "bind failed",
                "port is allocated"
            ],
            "action": "kill_conflicting_process",
            "verify": "check_port"
        }
    }
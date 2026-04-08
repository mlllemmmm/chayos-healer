import docker
from typing import Optional

def get_docker_client():
    """Initializes and returns the Docker client."""
    try:
        return docker.from_env()
    except Exception as e:
        print(f"Error connecting to Docker: {e}")
        return None

def get_mongo_container(client=None) -> Optional[docker.models.containers.Container]:
    """
    Dynamically searches for the MongoDB container.
    Returns the container object if found, otherwise None.
    """
    if not client:
        client = get_docker_client()
    if not client:
        return None

    try:
        # Instead of just running status='running', get all containers to check correctly
        # because the monitor needs to be able to find it even when it's stopped/exited.
        containers = client.containers.list(all=True)
        for c in containers:
            # Check by container image name
            tags = c.image.tags
            if any("mongo" in tag for tag in tags):
                return c
            # Fallback: check by container name
            if "database" in c.name or "mongo" in c.name:
                return c
    except Exception as e:
        print(f"Failed to list containers: {e}")

    return None

def restart_container(container) -> bool:
    """Restarts a container and verifies it started successfully."""
    try:
        container.restart()
        # Reload container state after restart
        container.reload()
        return container.status == "running"
    except Exception as e:
        print(f"Failed to restart container: {e}")
        return False

def stop_container(container) -> bool:
    """Stops a container."""
    try:
        if container.status == "running":
            container.stop()
        return True
    except Exception as e:
        print(f"Failed to stop container: {e}")
        return False

def get_backend_container(client=None) -> Optional[docker.models.containers.Container]:
    """Dynamically searches for the backend container."""
    if not client:
        client = get_docker_client()
    if not client:
        return None

    try:
        containers = client.containers.list(all=True)
        for c in containers:
            if "backend" in c.name or "mushroom-app" in c.name: # existing executor logic checks for mushroom-app
                return c
    except Exception as e:
        print(f"Failed to list containers for backend: {e}")
    return None

def disconnect_from_network(container, network_name="chaos-net") -> bool:
    """Disconnects a container from a specified Docker network."""
    client = get_docker_client()
    if not client:
        return False
    try:
        network = client.networks.get(network_name)
        network.disconnect(container)
        return True
    except Exception as e:
        print(f"Failed to disconnect from network {network_name}: {e}")
        return False

def connect_to_network(container, network_name="chaos-net") -> bool:
    """Connects a container to a specified Docker network."""
    client = get_docker_client()
    if not client:
        return False
    try:
        network = client.networks.get(network_name)
        network.connect(container)
        return True
    except Exception as e:
        print(f"Failed to connect to network {network_name}: {e}")
        return False

def inject_memory_pressure(container, target_mb=500) -> bool:
    """Safely executes a Python script inside the container to allocate memory."""
    try:
        # script allocates approx target_mb megabytes using a list of strings
        cmd = f"python3 -c \"a=[]; import time; [a.append(' ' * 1024 * 1024) for _ in range({target_mb})]; time.sleep(60)\""
        container.exec_run(cmd, detach=True)
        return True
    except Exception as e:
        print(f"Failed to inject memory pressure into container: {e}")
        return False

def scale_up_backend(replica_id: int) -> bool:
    """Dynamically finds the base backend container and clones it for autoscaling."""
    client = get_docker_client()
    if not client:
        return False
        
    base = get_backend_container(client)
    if not base:
        print("No base backend container found to scale from.")
        return False
        
    try:
        # Determine base container details
        image = base.image
        networks = base.attrs['NetworkSettings']['Networks']
        network_name = list(networks.keys())[0] if networks else "bridge"
        
        new_name = f"backend_replica_{replica_id}"
        print(f"Spawning genuine docker container: {new_name} using image {image.tags[0] if image.tags else image.id} on network {network_name}")
        
        # Deploy actual container
        client.containers.run(
            image,
            name=new_name,
            detach=True,
            network=network_name
        )
        return True
    except Exception as e:
        print(f"Failed to spawn replica container {replica_id}: {e}")
        return False

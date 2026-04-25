from fastapi import APIRouter, HTTPException

from app.schemas.settings import ProvisionRequest
from app.services.docker import execute_docker_command, get_free_port

provision_router = APIRouter()


@provision_router.post("/provision")
async def provision(request: ProvisionRequest):
    """
    Создаёт новый Docker-контейнер OpenClaw и возвращает его имя.
    """

    user_id = request.user_id
    container_name = f"openclaw-{user_id}"
    volume_name = f"openclaw-data-{user_id}"

    host_port = get_free_port()
    container_port = 18789

    cmd = [
        [
            "docker",
            "run",
            "-d",
            "--name",
            container_name,
            "--user",
            "root",
            "--restart",
            "unless-stopped",
            "-p",
            f"{host_port}:{container_port}",
            "-v",
            f"{volume_name}:/root/.openclaw",
            "-v",
            "/root/my-control-ui:/app/dist/control-ui",
            "ghcr.io/openclaw/openclaw:latest",
        ]
    ]

    try:
        await execute_docker_command(cmd)
        return {
            "status": "success",
            "container_name": container_name,
            "port": host_port,
            "url": f"http://<your-server-ip>:{host_port}",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

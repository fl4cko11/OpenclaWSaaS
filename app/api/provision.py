from fastapi import APIRouter, HTTPException

from app.schemas.settings import ProvisionRequest
from app.services.docker import execute_docker_command

provision_router = APIRouter()


@provision_router.post("/provision")
async def provision(request: ProvisionRequest):
    """
    Создаёт новый Docker-контейнер OpenClaw и возвращает его имя.
    """
    user_id = request.user_id
    container_name = f"openclaw-{user_id}"
    volume_name = f"openclaw-data-{user_id}"

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
            "18789:18789",
            "-v",
            f"{volume_name}:/root/.openclaw",
            "-v",
            "/root/my-control-ui:/app/dist/control-ui",
            "ghcr.io/openclaw/openclaw:latest",
        ]
    ]

    try:
        await execute_docker_command(cmd)
        return {"status": "success", "container_id": container_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

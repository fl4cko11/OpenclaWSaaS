import uuid

from fastapi import APIRouter, HTTPException

from app.services.messangers import execute_docker_command

router = APIRouter()


@router.post("/provision")
async def provision():
    """
    Создаёт новый Docker-контейнер OpenClaw и возвращает его имя.
    """
    container_name = f"openclaw-{uuid.uuid4().hex[:8]}"

    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "--restart", "unless-stopped",
        "openclaw/agent:latest",
    ]

    try:
        await execute_docker_command(cmd)
        return {"status": "success", "container_id": container_name}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException

from app.schemas.settings import (
    DiscordSettingsRequest,
    MarkdownSettingsRequest,
    SlackSettingsRequest,
    TelegramSettingsRequest,
    WhatsAPPSettingsRequest,
)

from app.services.llm import llm_req
from app.services.messangers import execute_docker_command

router = APIRouter(prefix="/settings")


@router.post("/telegram")
async def TelegramSettings(request: TelegramSettingsRequest):
    """
    Обновляет токен Telegram в конфигурации OpenClaw через Docker.
    """

    id = request.id
    allowList = request.id_allowList
    token = request.token

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = id

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.telegram.botToken",
            token,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.telegram.allowFrom",
            allowList,
        ],
    ]

    try:
        for cmd in commands:
            await execute_docker_command(cmd)
        return {"status": "success", "message": "Telegram token updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/whatsapp")
async def WhatsAppSettings(request: WhatsAPPSettingsRequest):
    """
    Обновляет токен Telegram в конфигурации OpenClaw через Docker.
    """

    id = request.id
    allowList = request.whatsapp_id_allowList

    container_name = id

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.whatsapp.allowFrom",
            allowList,
        ],
    ]

    try:
        for cmd in commands:
            await execute_docker_command(cmd)
        return {"status": "success", "message": "Telegram token updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/discord")
async def DiscordSettings(request: DiscordSettingsRequest):
    """
    Обновляет токен Telegram в конфигурации OpenClaw через Docker.
    """

    id = request.id
    allowList = request.allowList
    token = request.token

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = id

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.discord.token",
            token,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.discord.allowFrom",
            allowList,
        ],
    ]

    try:
        for cmd in commands:
            await execute_docker_command(cmd)
        return {"status": "success", "message": "Discord settings updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/markdown")
async def MarkdownSettings(request: MarkdownSettingsRequest):

    id = request.id
    answerList = request.answerList

    mdList = [
        "AGENTS.md",
        "SOUL.md",
        "TOOLS.md",
        "IDENTITY.md",
        "USER.md",
        "HEARTBEAT.md",
        "BOOTSTRAP.md",
        "MEMORY.md",
    ]

    container_name = id

    for i in range(min(len(answerList), len(mdList))):
        messages = [{"role": "user", "content": answerList[i]}]
        response = llm_req(messages)

        cmd = [
            "docker",
            "exec",
            container_name,
            "bash",
            "-c",
            f"echo '{response}' > ~/.openclaw/workspace/context/{mdList[i]}",
        ]
        await execute_docker_command(cmd)

    return {"status": "success", "message": "Markdown files updated successfully"}


@router.post("/slack")
async def SlackSettings(request: SlackSettingsRequest):
    """
    Обновляет токен Slack в конфигурации OpenClaw через Docker.
    """
    id = request.id
    token = request.token
    allowList = request.allowList

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = id

    commands = [
        [
            "docker", "exec", container_name,
            "openclaw", "config", "set",
            "channels.slack.token", token,
        ],
        [
            "docker", "exec", container_name,
            "openclaw", "config", "set",
            "channels.slack.allowFrom", allowList,
        ],
    ]

    try:
        for cmd in commands:
            await execute_docker_command(cmd)
        return {"status": "success", "message": "Slack settings updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

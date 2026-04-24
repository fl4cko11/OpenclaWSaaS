from fastapi import APIRouter, HTTPException

from app.schemas.settings import (
    DiscordSettingsRequest,
    MarkdownSettingsRequest,
    SlackSettingsRequest,
    TelegramSettingsRequest,
    WhatsAPPSettingsRequest,
)
from app.services.docker import execute_docker_command
from app.services.presets import readPreset

settings_router = APIRouter(prefix="/settings")


@settings_router.post("/telegram")
async def TelegramSettings(request: TelegramSettingsRequest):
    """
    Обновляет токен Telegram в конфигурации OpenClaw через Docker.
    """

    user_id = request.user_id
    allowList = ",".join(request.allowList)
    token = request.token

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.telegram.enabled",
            "true",
        ],
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
            "channels.telegram.dmPolicy",
            "allowlist",
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
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "gateway",
            "restart",
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


@settings_router.post("/discord")
async def DiscordSettings(request: DiscordSettingsRequest):
    """
    Обновляет токен Telegram в конфигурации OpenClaw через Docker.
    """

    user_id = request.user_id
    allowList = ",".join(request.allowList)
    token = request.token

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.discord.enabled",
            "true",
        ],
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
            "channels.discord.dmPolicy",
            "allowlist",
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
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "gateway",
            "restart",
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


@settings_router.post("/whatsapp")
async def WhatsAppSettings(request: WhatsAPPSettingsRequest):
    """
    Обновляет токен Telegram в конфигурации OpenClaw через Docker.
    """

    user_id = request.user_id
    token = request.token
    allowList = ",".join(request.allowList)
    phNumId = ",".join(request.phoneNumbId)
    busId = ",".join(request.BusId)

    container_name = f"openclaw-{user_id}"

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.whatsapp.enabled",
            "true",
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.whatsapp.token",
            token,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.whatsapp.phoneNumberId",
            phNumId,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.whatsapp.businessAccountId",
            busId,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.whatsapp.dmPolicy",
            "allowlist",
        ],
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
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "gateway",
            "restart",
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


@settings_router.post("/slack")
async def SlackSettings(request: SlackSettingsRequest):
    """
    Обновляет токен Slack в конфигурации OpenClaw через Docker.
    """
    user_id = request.user_id
    token = request.token
    app_token = request.app_token
    signing_secret = request.signingSecret
    allowList = ",".join(request.allowList)

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"

    commands = [
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.enabled",
            "true",
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.botToken",
            token,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.appToken",
            app_token,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.signingSecret",
            signing_secret,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.dmPolicy",
            "allowlist",
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.allowFrom",
            allowList,
        ],
        [
            "docker",
            "exec",
            container_name,
            "openclaw",
            "config",
            "set",
            "channels.slack.commands.native",
            "auto",
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


@settings_router.post("/markdown")
async def MarkdownSettings(request: MarkdownSettingsRequest):
    user_id = request.user_id
    preset_id = request.preset_id

    content = readPreset(preset_id)

    if not content or len(content) < 8:
        raise HTTPException(
            status_code=400, detail="Preset content must contain at least 8 items"
        )

    container_name = f"openclaw-{user_id}"

    filenames = [
        "AGENTS.md",
        "BOOTSTRAP.md",
        "HEARTBEAT.md",
        "IDENTITY.md",
        "MEMORY.md",
        "SOUL.md",
        "TOOLS.md",
        "USER.md",
    ]

    try:
        for i, filename in enumerate(filenames):
            file_content = content[i].replace('"', '\\"')
            cmd = [
                "docker",
                "exec",
                container_name,
                "sh",
                "-c",
                f'echo "{file_content}" > /root/.openclaw/workspace/{filename}',
            ]
            await execute_docker_command(cmd)

        return {"status": "success", "message": "Markdown files updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update markdown files: {str(e)}"
        )

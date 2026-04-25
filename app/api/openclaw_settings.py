import json
import os

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
    Обновляет настройки Telegram в конфигурации OpenClaw через batch-файл.
    """
    user_id = request.user_id
    allowList = request.allowList
    token = request.token

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"
    batch_file = f"/tmp/openclaw_telegram_{user_id}.json"

    batch_config = [
        {"path": "channels.telegram.enabled", "value": True},
        {"path": "channels.telegram.botToken", "value": token},
        {"path": "channels.telegram.allowFrom", "value": allowList},
        {"path": "channels.telegram.dmPolicy", "value": "allowlist"},
    ]

    try:
        with open(batch_file, "w") as f:
            json.dump(batch_config, f, indent=2)

        copy_cmd = [
            [
                "docker",
                "cp",
                batch_file,
                f"{container_name}:/tmp/telegram_config.json",
            ]
        ]
        await execute_docker_command(copy_cmd)

        commands = [
            [
                "docker",
                "exec",
                container_name,
                "openclaw",
                "config",
                "set",
                "--batch-file",
                "/tmp/telegram_config.json",
            ],
            ["docker", "exec", container_name, "openclaw", "gateway", "restart"],
        ]
        await execute_docker_command(commands)

        return {
            "status": "success",
            "message": "Telegram settings updated successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(batch_file):
            os.remove(batch_file)


@settings_router.post("/discord")
async def DiscordSettings(request: DiscordSettingsRequest):
    """
    Обновляет настройки Discord в конфигурации OpenClaw через batch-файл.
    """
    user_id = request.user_id
    token = request.token
    allow_list = request.allowList

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"
    batch_file = f"/tmp/openclaw_discord_{user_id}.json"

    batch_config = [
        {"path": "channels.discord.enabled", "value": True},
        {"path": "channels.discord.token", "value": token},
        {"path": "channels.discord.dmPolicy", "value": "allowlist"},
        {"path": "channels.discord.allowFrom", "value": allow_list},
    ]

    try:
        with open(batch_file, "w") as f:
            json.dump(batch_config, f, indent=2)

        copy_cmd = [
            ["docker", "cp", batch_file, f"{container_name}:/tmp/discord_config.json"]
        ]
        await execute_docker_command(copy_cmd)

        commands = [
            [
                "docker",
                "exec",
                container_name,
                "openclaw",
                "config",
                "set",
                "--batch-file",
                "/tmp/discord_config.json",
            ],
            ["docker", "exec", container_name, "openclaw", "gateway", "restart"],
        ]
        await execute_docker_command(commands)

        return {"status": "success", "message": "Discord settings updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(batch_file):
            os.remove(batch_file)


@settings_router.post("/whatsapp")
async def WhatsAppSettings(request: WhatsAPPSettingsRequest):
    """
    Обновляет настройки WhatsApp в конфигурации OpenClaw через batch-файл.
    """
    user_id = request.user_id
    token = request.token

    # Передаем списки как есть, без ручного join
    phone_num_ids = request.phoneNumbId
    bus_ids = request.BusId
    allow_list = request.allowList

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"
    batch_file = f"/tmp/openclaw_whatsapp_{user_id}.json"

    batch_config = [
        {"path": "channels.whatsapp.enabled", "value": True},
        {"path": "channels.whatsapp.token", "value": token},
        {"path": "channels.whatsapp.phoneNumberId", "value": phone_num_ids},
        {"path": "channels.whatsapp.businessAccountId", "value": bus_ids},
        {"path": "channels.whatsapp.dmPolicy", "value": "allowlist"},
        {"path": "channels.whatsapp.allowFrom", "value": allow_list},
    ]

    try:
        with open(batch_file, "w") as f:
            json.dump(batch_config, f, indent=2)

        copy_cmd = [
            ["docker", "cp", batch_file, f"{container_name}:/tmp/whatsapp_config.json"]
        ]
        await execute_docker_command(copy_cmd)

        commands = [
            [
                "docker",
                "exec",
                container_name,
                "openclaw",
                "config",
                "set",
                "--batch-file",
                "/tmp/whatsapp_config.json",
            ],
            ["docker", "exec", container_name, "openclaw", "gateway", "restart"],
        ]
        await execute_docker_command(commands)

        return {
            "status": "success",
            "message": "WhatsApp settings updated successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(batch_file):
            os.remove(batch_file)


@settings_router.post("/slack")
async def SlackSettings(request: SlackSettingsRequest):
    """
    Обновляет настройки Slack в конфигурации OpenClaw через batch-файл.
    """
    user_id = request.user_id
    token = request.token
    app_token = request.app_token
    signing_secret = request.signingSecret
    allow_list = request.allowList

    if not token or len(token) < 10:
        raise HTTPException(status_code=400, detail="Invalid token format")

    container_name = f"openclaw-{user_id}"
    batch_file = f"/tmp/openclaw_slack_{user_id}.json"

    batch_config = [
        {"path": "channels.slack.enabled", "value": True},
        {"path": "channels.slack.botToken", "value": token},
        {"path": "channels.slack.appToken", "value": app_token},
        {"path": "channels.slack.signingSecret", "value": signing_secret},
        {"path": "channels.slack.dmPolicy", "value": "allowlist"},
        {"path": "channels.slack.allowFrom", "value": allow_list},
        {"path": "channels.slack.commands.native", "value": "auto"},
    ]

    try:
        with open(batch_file, "w") as f:
            json.dump(batch_config, f, indent=2)

        copy_cmd = [
            ["docker", "cp", batch_file, f"{container_name}:/tmp/slack_config.json"]
        ]
        await execute_docker_command(copy_cmd)

        commands = [
            [
                "docker",
                "exec",
                container_name,
                "openclaw",
                "config",
                "set",
                "--batch-file",
                "/tmp/slack_config.json",
            ],
            ["docker", "exec", container_name, "openclaw", "gateway", "restart"],
        ]
        await execute_docker_command(commands)

        return {"status": "success", "message": "Slack settings updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(batch_file):
            os.remove(batch_file)


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
                [
                    "docker",
                    "exec",
                    container_name,
                    "sh",
                    "-c",
                    f'echo "{file_content}" > /root/.openclaw/workspace/{filename}',
                ]
            ]
            await execute_docker_command(cmd)

        return {"status": "success", "message": "Markdown files updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update markdown files: {str(e)}"
        )

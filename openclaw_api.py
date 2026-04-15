import subprocess


def TelegramSettings(MsgToken: str):
    if not MsgToken or not MsgToken.strip():
        raise ValueError("Токен не может быть пустым")

    container = "openclaw-iqnv-openclaw-1"
    base_cmd = ["docker", "exec", container, "openclaw", "config", "set"]

    for path in ("gateway.auth.token", "gateway.remote.token"):
        subprocess.run(
            base_cmd + [path, MsgToken], check=True, capture_output=True, text=True
        )

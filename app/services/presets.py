import os


def readPreset(preset_id: int):

    current_dir = os.path.dirname(os.path.abspath(__file__))
    preset_path = os.path.join(current_dir, "presets", str(preset_id))

    content = []
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

    for filename in filenames:
        filepath = os.path.join(preset_path, filename)

        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")

        with open(filepath, encoding="utf-8") as f:
            content.append(f.read())

    return content

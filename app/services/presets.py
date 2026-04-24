# 1 - assistent; 2 - creative manager; 3 - Mentor; 4 - Product Manager; 5 - Research; 6 - Engineer


def readPreset(preset_id: int):

    content = []

    with open(f"/app/services/presets/{preset_id}/AGENTS.md") as agentsMD:
        agentsMD_content = agentsMD.read()
        content.append(agentsMD_content)
    with open(f"/app/services/presets/{preset_id}/BOOTSTRAP.md") as bootstrapMD:
        bootstrapMD_content = bootstrapMD.read()
        content.append(bootstrapMD_content)
    with open(f"/app/services/presets/{preset_id}/HEARTBEAT.md") as heartbeatMD:
        heartbeatMD_content = heartbeatMD.read()
        content.append(heartbeatMD_content)
    with open(f"/app/services/presets/{preset_id}/IDENTITY.md") as identityMD:
        identityMD_content = identityMD.read()
        content.append(identityMD_content)
    with open(f"/app/services/presets/{preset_id}/MEMORY.md") as memoryMD:
        memoryMD_content = memoryMD.read()
        content.append(memoryMD_content)
    with open(f"/app/services/presets/{preset_id}/SOUL.md") as soulMD:
        souldMD_content = soulMD.read()
        content.append(souldMD_content)
    with open(f"/app/services/presets/{preset_id}/TOOLS.md") as toolsMD:
        toolsMD_content = toolsMD.read()
        content.append(toolsMD_content)
    with open(f"/app/services/presets/{preset_id}/USER.md") as userMD:
        userMD_content = userMD.read()
        content.append(userMD_content)

    return content

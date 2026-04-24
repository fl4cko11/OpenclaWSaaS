import asyncio

from fastapi import HTTPException


async def execute_docker_command(commands: list[list[str]]) -> list[str]:
    results = []

    for cmd in commands:
        if not cmd:
            continue
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_detail = stderr.decode().strip() or "Unknown error"
                raise HTTPException(
                    status_code=500,
                    detail=f"Command '{' '.join(cmd)}' failed: {error_detail}",
                )

            results.append(stdout.decode().strip())
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Execution error for '{' '.join(cmd)}': {str(e)}",
            )
    return results

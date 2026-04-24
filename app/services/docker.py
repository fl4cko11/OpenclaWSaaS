import asyncio

from fastapi import HTTPException


async def execute_docker_command(command: list[str]):
    """Асинхронное выполнение docker exec команды."""
    try:
        process = await asyncio.create_subprocess_exec(
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = stderr.decode().strip()
            raise Exception(f"Docker command failed: {error_msg}")

        return stdout.decode().strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

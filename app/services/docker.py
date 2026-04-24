import asyncio

from fastapi import HTTPException


async def execute_docker_command(command: list[str]):
    """Асинхронное выполнение docker команды."""
    try:
        process = await asyncio.create_subprocess_exec(
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        stdout_str = stdout.decode().strip()
        stderr_str = stderr.decode().strip()

        if process.returncode != 0:
            print(f"Command failed: {' '.join(command)}")
            print(f"Stderr: {stderr_str}")
            raise Exception(f"Docker command failed: {stderr_str or 'Unknown error'}")

        return stdout_str
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

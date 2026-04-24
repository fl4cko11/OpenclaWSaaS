from fastapi import Request


def get_settings(request: Request):
    return request.app.state.settings

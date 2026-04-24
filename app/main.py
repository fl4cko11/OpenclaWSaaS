from fastapi import FastAPI

from app.api.openclaw_settings import settings_router
from app.api.provision import provision_router

app = FastAPI()

app.include_router(provision_router)
app.include_router(settings_router)

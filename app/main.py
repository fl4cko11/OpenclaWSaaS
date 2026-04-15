from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.openclaw_settings import router as settings_router
from app.api.provision import router as provision_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(provision_router)
app.include_router(settings_router)

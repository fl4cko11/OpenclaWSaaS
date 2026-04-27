from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.openclaw_settings import settings_router
from app.api.provision import provision_router

app = FastAPI()

# Allow browser preflight requests from the frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(provision_router)
app.include_router(settings_router)

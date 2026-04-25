from uuid import UUID

from pydantic import BaseModel


class ProvisionRequest(BaseModel):
    user_id: UUID


class TelegramSettingsRequest(BaseModel):
    user_id: UUID
    allowList: list[str]
    token: str


class WhatsAPPSettingsRequest(BaseModel):
    user_id: UUID
    token: str
    phoneNumbId: int
    BusId: int
    allowList: list[str]


class DiscordSettingsRequest(BaseModel):
    user_id: UUID
    token: str
    allowList: list[str]


class SlackSettingsRequest(BaseModel):
    user_id: UUID
    bot_token: str
    app_token: str
    signingSecret: str
    allowList: list[str] = []


class MarkdownSettingsRequest(BaseModel):
    user_id: UUID
    preset_id: int

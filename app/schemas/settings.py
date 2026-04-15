from pydantic import BaseModel


class TelegramSettingsRequest(BaseModel):
    id: str
    id_allowList: list[int]
    token: str


class WhatsAPPSettingsRequest(BaseModel):
    id: str
    whatsapp_id_allowList: list[str]


class DiscordSettingsRequest(BaseModel):
    id: str
    allowList: list[int]
    token: str


class SlackSettingsRequest(BaseModel):
    id: str
    token: str
    allowList: list[str] = []


class MarkdownSettingsRequest(BaseModel):
    id: str
    answerList: list[str]

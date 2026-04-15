from pydantic import BaseModel


class TelegramSettingsRequest(BaseModel):
    id: int
    id_allowList: list[int]
    token: str


class WhatsAPPSettingsRequest(BaseModel):
    id: int
    whatsapp_id_allowList: list[int]


class DiscordSettingsRequest(BaseModel):
    id: int
    allowList: list[int]
    token: str


class MarkdownSettingsRequest(BaseModel):
    id: int
    answerList = list[str]

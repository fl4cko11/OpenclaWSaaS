from pydantic import BaseModel


class Settings(BaseModel):

    LLM_API: str = "ТОКЕН ЕГОРА"
    MODEL_NAME: str = "НАЗВАНИЕ МОДЕЛИ"

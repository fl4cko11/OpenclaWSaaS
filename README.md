# BACKEND

HoSTInG@1JJo

## Инициализация с оптимизациями:

### Загружаем на сервер кастомный интерфейс и setup.json
```
scp setup.json root@187.77.110.16:/root
scp -r dist/* root@187.77.110.16:/root/my-control-ui
загружаем пресеты на сервер
```

### Создаём контейнер
```
docker run -d \
  --name ИМЯ \
  --user root \
  -p 18789:18789 \
  -v ИМЯ_волума:/root/.openclaw \
  -v /root/my-control-ui:/app/dist/control-ui \
  ghcr.io/openclaw/openclaw:latest
```

### Секьюрити + гс модели + мультимодалки + LLM API
```
docker exec -i ИМЯ openclaw config set --file - < /root/setup.json
docker restart ИМЯ
```

### LCM
```
docker exec ИМЯ openclaw plugins install @martian-engineering/lossless-claw
docker exec ИМЯ openclaw config set plugins.allow '["lossless-claw"]'
docker restart ИМЯ
```

### Переменные окружения и либы
```
API токены, для моделей которые мы выберем
ффмпеги
```

## Настройка по выбору:

### Мессенджеры:

#### Telegram

```
docker exec ИМЯ openclaw config set channels.telegram.enabled true
docker exec ИМЯ openclaw config set channels.telegram.botToken "ВАШ_ТОКЕН"
docker exec ИМЯ openclaw config set channels.telegram.dmPolicy "allowlist"
docker exec ИМЯ openclaw config set channels.telegram.allowFrom "[123456789]"
docker exec ИМЯ openclaw gateway restart
```

#### Discord

```
docker exec ИМЯ openclaw config set channels.discord.enabled true
docker exec ИМЯ openclaw config set channels.discord.token "ВАШ_BOT_TOKEN"
docker exec ИМЯ openclaw config set channels.discord.dmPolicy "allowlist"
docker exec ИМЯ openclaw config set channels.discord.allowFrom "[\"123456789012345678\"]"
docker exec ИМЯ openclaw gateway restart
```

#### WhatsApp

```
docker exec ИМЯ openclaw config set channels.whatsapp.enabled true
docker exec ИМЯ openclaw config set channels.whatsapp.token "ВАШ_WHATSAPP_TOKEN"
docker exec ИМЯ openclaw config set channels.whatsapp.phoneNumberId "ВАШ_PHONE_NUMBER_ID"
docker exec ИМЯ openclaw config set channels.whatsapp.businessAccountId "ВАШ_BUSINESS_ACCOUNT_ID"
docker exec ИМЯ openclaw config set channels.whatsapp.dmPolicy "allowlist"
docker exec ИМЯ openclaw config set channels.whatsapp.allowFrom '["79991234567"]'
docker exec ИМЯ openclaw gateway restart
```

#### Slack

```
docker exec ИМЯ openclaw config set channels.slack.enabled true
docker exec ИМЯ openclaw config set channels.slack.botToken "xoxb-ВАШ_BOT_TOKEN"
docker exec ИМЯ openclaw config set channels.slack.appToken "xapp-ВАШ_APP_TOKEN"
docker exec ИМЯ openclaw config set channels.slack.signingSecret "ВАШ_SIGNING_SECRET"
docker exec ИМЯ openclaw config set channels.slack.dmPolicy "allowlist"
docker exec ИМЯ openclaw config set channels.slack.allowFrom '["U012AB3CD4E"]'
docker exec ИМЯ openclaw config set channels.slack.commands.native "auto"
docker exec ИМЯ openclaw gateway restart
```

### .md:
```
docker cp ./my-config.json ИМЯ_КОНТЕЙНЕРА:/root/.openclaw/workspace/config.json
```

# FRONTEND

## Настройки:

получить нужную и рабочую статику для прокликивания создания контейнера + выбора мессенджеров + чат с llm для .md

## Внутренний интерфейс опенклова:

допилить рабочую версию внутреннего интерфейса, чтобы с ним инит норм происходил
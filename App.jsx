import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "http://187.77.110.16:8000";

const USER_ID_STORAGE_KEYS = ["user_id", "uuid"];
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CHANNELS = [
  {
    id: "web",
    name: "Веб-интерфейс",
    icon: "🌐",
    description: "Встроенная панель OpenClaw без доп. настройки",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    description: "Подключение Telegram-бота",
  },
  {
    id: "discord",
    name: "Discord",
    icon: "🎮",
    description: "Подключение Discord-бота",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    description: "Интеграция WhatsApp Business",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "⚡",
    description: "Интеграция со Slack workspace",
  },
];

const PRESETS = [
  {
    id: 1,
    title: "CEO",
    icon: "👔",
    description: "Стратегия, решения, управление командой и приоритетами.",
  },
  {
    id: 2,
    title: "Creative Director",
    icon: "🎨",
    description: "Креативные концепции, визуальные идеи и tone of voice.",
  },
  {
    id: 3,
    title: "Mentor",
    icon: "🎓",
    description: "Наставничество, обучение, объяснения и развитие навыков.",
  },
  {
    id: 4,
    title: "Product Manager",
    icon: "📊",
    description: "Roadmap, гипотезы, аналитика и продуктовые решения.",
  },
  {
    id: 5,
    title: "Researcher",
    icon: "🔬",
    description: "Аналитика, проверка фактов и структурирование исследований.",
  },
  {
    id: 6,
    title: "Software Engineer",
    icon: "💻",
    description: "Архитектура, код, дебаг и технические рекомендации.",
  },
];

const MESSENGER_CONFIG = {
  telegram: {
    name: "Telegram",
    icon: "✈️",
    instructions: [
      "Создайте бота через @BotFather.",
      "Скопируйте `Bot Token`.",
      "Укажите `allowList` через запятую: например, `123456789`.",
    ],
    fields: [
      {
        key: "token",
        label: "Bot Token",
        placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
      },
      {
        key: "allowListText",
        label: "Разрешённые Telegram ID",
        placeholder: "123456789, 987654321",
      },
    ],
    buildPayload: (userId, values) => ({
      user_id: userId,
      token: values.token.trim(),
      allowList: parseAllowList(values.allowListText),
    }),
  },
  discord: {
    name: "Discord",
    icon: "🎮",
    instructions: [
      "Создайте приложение в Discord Developer Portal.",
      "Возьмите `Bot Token` из раздела `Bot`.",
      "Укажите `allowList` через ID пользователей или каналов.",
    ],
    fields: [
      {
        key: "token",
        label: "Bot Token",
        placeholder: "MTEx...discord-token",
      },
      {
        key: "allowListText",
        label: "Разрешённые Discord ID",
        placeholder: "123456789012345678",
      },
    ],
    buildPayload: (userId, values) => ({
      user_id: userId,
      token: values.token.trim(),
      allowList: parseAllowList(values.allowListText),
    }),
  },
  whatsapp: {
    name: "WhatsApp",
    icon: "💬",
    instructions: [
      "Подготовьте данные из Meta for Developers.",
      "Нужны `Phone Number ID`, `Business Account ID` и permanent token.",
      "В `allowList` укажите номера в международном формате без пробелов.",
    ],
    fields: [
      {
        key: "phoneNumbId",
        label: "Phone Number ID",
        placeholder: "1029384756",
        inputMode: "numeric",
      },
      {
        key: "BusId",
        label: "Business Account ID",
        placeholder: "1029384756",
        inputMode: "numeric",
      },
      {
        key: "token",
        label: "Permanent Access Token",
        placeholder: "EAA...",
      },
      {
        key: "allowListText",
        label: "Разрешённые номера",
        placeholder: "79991234567, 79997654321",
      },
    ],
    buildPayload: (userId, values) => ({
      user_id: userId,
      token: values.token.trim(),
      phoneNumbId: Number(values.phoneNumbId),
      BusId: Number(values.BusId),
      allowList: parseAllowList(values.allowListText),
    }),
  },
  slack: {
    name: "Slack",
    icon: "⚡",
    instructions: [
      "Создайте Slack App и установите его в workspace.",
      "Нужны `Bot User OAuth Token`, `App-Level Token` и `Signing Secret`.",
      "В `allowList` укажите Slack user IDs через запятую.",
    ],
    fields: [
      {
        key: "bot_token",
        label: "Bot User OAuth Token",
        placeholder: "xoxb-...",
      },
      {
        key: "app_token",
        label: "App-Level Token",
        placeholder: "xapp-...",
      },
      {
        key: "signingSecret",
        label: "Signing Secret",
        placeholder: "abc123...",
      },
      {
        key: "allowListText",
        label: "Разрешённые Slack user IDs",
        placeholder: "U012AB3CD4E, U045FG6HI7J",
      },
    ],
    buildPayload: (userId, values) => ({
      user_id: userId,
      bot_token: values.bot_token.trim(),
      app_token: values.app_token.trim(),
      signingSecret: values.signingSecret.trim(),
      allowList: parseAllowList(values.allowListText),
    }),
  },
};

const styles = {
  shell: {
    background:
      "radial-gradient(circle at top right, rgba(84,139,255,.14), transparent 25%), radial-gradient(circle at left 20%, rgba(120,255,194,.10), transparent 30%), #06070c",
    color: "#fff",
    fontFamily: "'Sora', sans-serif",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  page: {
    maxWidth: 760,
    margin: "0 auto",
    minHeight: "100vh",
    padding: "56px 24px 120px",
    position: "relative",
    zIndex: 1,
  },
  heroPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "40px 24px",
    position: "relative",
    zIndex: 1,
  },
  card: {
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 24,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: "0 20px 80px rgba(0,0,0,.25)",
  },
  heading: {
    fontSize: "clamp(30px, 4vw, 52px)",
    fontWeight: 300,
    lineHeight: 1.05,
    letterSpacing: "-.04em",
    margin: 0,
    background: "linear-gradient(135deg,#fff 0%,rgba(255,255,255,.64) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sectionTitle: {
    fontSize: "clamp(24px, 3vw, 34px)",
    fontWeight: 300,
    lineHeight: 1.15,
    margin: "0 0 10px",
    letterSpacing: "-.03em",
  },
  text: {
    color: "rgba(255,255,255,.64)",
    lineHeight: 1.65,
    fontSize: 15,
    margin: 0,
  },
  stepBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    padding: "7px 14px",
    fontSize: 12,
    letterSpacing: ".08em",
    color: "rgba(255,255,255,.5)",
    background: "rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,.08)",
    marginBottom: 18,
  },
  button: {
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.18)",
    padding: "14px 28px",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    fontSize: 15,
    fontFamily: "'Sora', sans-serif",
    transition: "all .2s ease",
  },
  primaryButton: {
    borderRadius: 999,
    border: "1px solid #fff",
    padding: "15px 30px",
    background: "#fff",
    color: "#000",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'Sora', sans-serif",
    transition: "transform .2s ease, opacity .2s ease",
  },
  input: {
    width: "100%",
    padding: "13px 15px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(0,0,0,.22)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    fontFamily: "'Sora', sans-serif",
  },
};

function parseAllowList(value) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidUuid(value) {
  return UUID_REGEX.test(String(value || "").trim());
}

function buildServiceUrl(rawUrl, port) {
  if (rawUrl && !String(rawUrl).includes("<your-server-ip>")) {
    return rawUrl;
  }

  try {
    const baseOrigin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const apiUrl = new URL(API_BASE, baseOrigin);
    return `http://${apiUrl.hostname}:${port}`;
  } catch {
    return rawUrl || "";
  }
}

function getOrCreateUserId() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of USER_ID_STORAGE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (isValidUuid(value)) {
      return value;
    }
  }

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : null;

  if (generated) {
    window.localStorage.setItem("user_id", generated);
    window.localStorage.setItem("uuid", generated);
  }

  return generated;
}

async function apiRequest(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function Background() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

function StepBadge({ step, total }) {
  return <div style={styles.stepBadge}>{`ШАГ ${step} ИЗ ${total}`}</div>;
}

function Hero({ onStart, userId }) {
  return (
    <div style={styles.heroPage}>
      <div style={{ maxWidth: 640 }}>
        <div
          style={{
            ...styles.card,
            width: 92,
            height: 92,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            fontSize: 36,
          }}
        >
          ◎
        </div>
        <h1 style={styles.heading}>OpenClaw Setup</h1>
        <p style={{ ...styles.text, maxWidth: 460, margin: "18px auto 16px" }}>
          Один сценарий настройки под ваш текущий backend: создать контейнер,
          подключить каналы и применить preset.
        </p>
        <p
          style={{
            color: "rgba(255,255,255,.35)",
            fontSize: 12,
            letterSpacing: ".05em",
            marginBottom: 30,
          }}
        >
          {userId ? `user_id: ${userId}` : "UUID в localStorage не найден"}
        </p>
        <button style={styles.primaryButton} onClick={onStart} disabled={!userId}>
          Создать сервис
        </button>
      </div>
    </div>
  );
}

function Provisioning({ userId, onSuccess, onBack }) {
  const [progress, setProgress] = useState(8);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("Создаём контейнер OpenClaw...");
  const finishedRef = useRef(false);

  useEffect(() => {
    let timerId;
    let progressId;

    const run = async () => {
      try {
        progressId = window.setInterval(() => {
          setProgress((current) => Math.min(current + Math.random() * 7, 92));
        }, 250);

        const data = await apiRequest("/provision", { user_id: userId });
        setPhase("Контейнер готов, получаем параметры...");
        finishedRef.current = true;
        window.clearInterval(progressId);
        setProgress(100);
        timerId = window.setTimeout(() => onSuccess(data), 450);
      } catch (requestError) {
        finishedRef.current = true;
        window.clearInterval(progressId);
        setError(requestError.message);
        setPhase("Не удалось создать контейнер");
      }
    };

    run();

    return () => {
      window.clearInterval(progressId);
      window.clearTimeout(timerId);
    };
  }, [onSuccess, userId]);

  useEffect(() => {
    if (error) {
      return;
    }
    if (progress < 35) {
      setPhase("Проверяем user_id и запускаем provision...");
      return;
    }
    if (progress < 70) {
      setPhase("Docker-контейнер создаётся...");
      return;
    }
    if (!finishedRef.current) {
      setPhase("Ждём ответ backend...");
    }
  }, [error, progress]);

  return (
    <div style={styles.heroPage}>
      <div style={{ ...styles.card, width: "100%", maxWidth: 560, padding: 34 }}>
        <div
          style={{
            width: 112,
            height: 112,
            borderRadius: "50%",
            margin: "0 auto 24px",
            position: "relative",
            border: "1px solid rgba(255,255,255,.10)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
        <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>
          Инициализация сервиса
        </h2>
        <p style={{ ...styles.text, textAlign: "center", marginBottom: 16 }}>
          {phase}
        </p>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "rgba(255,255,255,.07)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(90deg,#fff,rgba(120,255,194,.9))",
              transition: "width .25s ease",
            }}
          />
        </div>
        {error ? (
          <>
            <p style={{ color: "#ff8f8f", marginBottom: 18 }}>{error}</p>
            <button style={styles.button} onClick={onBack}>
              ← Назад
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ChannelStep({ selected, onToggle, onNext }) {
  return (
    <div style={styles.page}>
      <StepBadge step={1} total={3} />
      <h2 style={styles.sectionTitle}>Куда подключаем ассистента?</h2>
      <p style={{ ...styles.text, marginBottom: 24 }}>
        Можно выбрать веб-интерфейс и любое количество мессенджеров.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {CHANNELS.map((channel) => {
          const active = selected.has(channel.id);
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => onToggle(channel.id)}
              style={{
                ...styles.card,
                textAlign: "left",
                padding: 22,
                cursor: "pointer",
                border: active
                  ? "1px solid rgba(120,255,194,.55)"
                  : "1px solid rgba(255,255,255,.08)",
                background: active
                  ? "rgba(120,255,194,.08)"
                  : "rgba(255,255,255,.03)",
              }}
            >
              <div style={{ fontSize: 30, marginBottom: 14 }}>{channel.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
                {channel.name}
              </div>
              <div style={{ color: "rgba(255,255,255,.56)", lineHeight: 1.5 }}>
                {channel.description}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 28 }}>
        <button
          style={{
            ...styles.primaryButton,
            opacity: selected.size ? 1 : 0.45,
            cursor: selected.size ? "pointer" : "not-allowed",
          }}
          disabled={selected.size === 0}
          onClick={onNext}
        >
          Далее →
        </button>
      </div>
    </div>
  );
}

function MessengerCard({ id, values, onChange, status }) {
  const config = MESSENGER_CONFIG[id];
  const hasError = status?.type === "error";
  const isSuccess = status?.type === "success";

  return (
    <div style={{ ...styles.card, padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 26, marginBottom: 8 }}>{config.icon}</div>
          <h3 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{config.name}</h3>
        </div>
        {isSuccess ? (
          <span style={{ color: "rgba(120,255,194,.92)", fontSize: 13 }}>
            Сохранено
          </span>
        ) : null}
      </div>

      <div style={{ marginBottom: 18 }}>
        {config.instructions.map((item) => (
          <div
            key={item}
            style={{ color: "rgba(255,255,255,.52)", marginBottom: 8, lineHeight: 1.55 }}
          >
            {item}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {config.fields.map((field) => (
          <label key={field.key} style={{ display: "grid", gap: 8 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,.72)" }}>
              {field.label}
            </span>
            <input
              value={values[field.key] || ""}
              onChange={(event) => onChange(id, field.key, event.target.value)}
              placeholder={field.placeholder}
              inputMode={field.inputMode}
              style={styles.input}
            />
          </label>
        ))}
      </div>

      {hasError ? (
        <p style={{ color: "#ff8f8f", margin: "14px 0 0" }}>{status.message}</p>
      ) : null}
    </div>
  );
}

function MessengerStep({
  userId,
  selected,
  formData,
  statusMap,
  loading,
  onBack,
  onChange,
  onSubmit,
}) {
  const activeMessengers = useMemo(
    () => Array.from(selected).filter((id) => id in MESSENGER_CONFIG),
    [selected],
  );

  return (
    <div style={styles.page}>
      <button style={{ ...styles.button, marginBottom: 18 }} onClick={onBack}>
        ← Назад
      </button>
      <StepBadge step={2} total={3} />
      <h2 style={styles.sectionTitle}>Настройка каналов</h2>
      <p style={{ ...styles.text, marginBottom: 24 }}>
        Backend ожидает конкретные поля. Все формы ниже уже совпадают со схемами
        FastAPI для `/settings/*`.
      </p>
      <div style={{ display: "grid", gap: 18 }}>
        {activeMessengers.map((messengerId) => (
          <MessengerCard
            key={messengerId}
            id={messengerId}
            values={formData[messengerId] || {}}
            onChange={onChange}
            status={statusMap[messengerId]}
          />
        ))}
      </div>
      <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button style={styles.button} onClick={onBack} disabled={loading}>
          ← Назад
        </button>
        <button
          style={{
            ...styles.primaryButton,
            opacity: loading ? 0.65 : 1,
            cursor: loading ? "wait" : "pointer",
          }}
          onClick={() => onSubmit(userId, activeMessengers)}
          disabled={loading}
        >
          {loading ? "Сохраняем каналы..." : "Сохранить каналы →"}
        </button>
      </div>
    </div>
  );
}

function PresetStep({
  selectedPreset,
  loading,
  error,
  onBack,
  onSelect,
  onSubmit,
}) {
  return (
    <div style={styles.page}>
      <button style={{ ...styles.button, marginBottom: 18 }} onClick={onBack}>
        ← Назад
      </button>
      <StepBadge step={3} total={3} />
      <h2 style={styles.sectionTitle}>Выберите preset</h2>
      <p style={{ ...styles.text, marginBottom: 24 }}>
        Будет вызван ровно один backend endpoint: `/settings/markdown` с
        `preset_id`.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {PRESETS.map((preset) => {
          const active = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              style={{
                ...styles.card,
                padding: 22,
                textAlign: "left",
                cursor: "pointer",
                border: active
                  ? "1px solid rgba(120,255,194,.55)"
                  : "1px solid rgba(255,255,255,.08)",
                background: active
                  ? "rgba(120,255,194,.08)"
                  : "rgba(255,255,255,.03)",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{preset.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                {preset.title}
              </div>
              <div style={{ color: "rgba(255,255,255,.56)", lineHeight: 1.55 }}>
                {preset.description}
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p style={{ color: "#ff8f8f", marginTop: 18 }}>{error}</p> : null}
      <div style={{ marginTop: 28 }}>
        <button
          style={{
            ...styles.primaryButton,
            opacity: !selectedPreset || loading ? 0.45 : 1,
            cursor: !selectedPreset || loading ? "not-allowed" : "pointer",
          }}
          disabled={!selectedPreset || loading}
          onClick={onSubmit}
        >
          {loading ? "Применяем preset..." : "Завершить настройку"}
        </button>
      </div>
    </div>
  );
}

function Done({ provisionData, selected, selectedPreset, onReset }) {
  const activeChannels = CHANNELS.filter((channel) => selected.has(channel.id));
  const preset = PRESETS.find((item) => item.id === selectedPreset);
  const serviceUrl = buildServiceUrl(provisionData?.url, provisionData?.port);

  return (
    <div style={styles.heroPage}>
      <div style={{ ...styles.card, maxWidth: 680, width: "100%", padding: 34 }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            margin: "0 auto 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            background: "rgba(120,255,194,.08)",
            border: "1px solid rgba(120,255,194,.25)",
          }}
        >
          ✦
        </div>
        <h2 style={{ ...styles.sectionTitle, textAlign: "center" }}>
          Сервис готов
        </h2>
        <p style={{ ...styles.text, textAlign: "center", marginBottom: 28 }}>
          Контейнер создан, каналы сохранены, preset применён.
        </p>
        <div
          style={{
            display: "grid",
            gap: 12,
            textAlign: "left",
            marginBottom: 22,
          }}
        >
          <div>
            <strong>Контейнер:</strong> {provisionData?.container_name || "n/a"}
          </div>
          <div>
            <strong>Порт:</strong> {provisionData?.port || "n/a"}
          </div>
          <div>
            <strong>URL:</strong> {serviceUrl || "n/a"}
          </div>
          <div>
            <strong>Preset:</strong> {preset?.title || "n/a"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          {activeChannels.map((channel) => (
            <span
              key={channel.id}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.08)",
                color: "rgba(255,255,255,.72)",
              }}
            >
              {channel.icon} {channel.name}
            </span>
          ))}
        </div>
        <button style={styles.button} onClick={onReset}>
          Создать ещё один сервис
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [userId, setUserId] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [provisionData, setProvisionData] = useState(null);
  const [messengerForm, setMessengerForm] = useState({});
  const [messengerStatus, setMessengerStatus] = useState({});
  const [messengerLoading, setMessengerLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [presetLoading, setPresetLoading] = useState(false);
  const [presetError, setPresetError] = useState("");

  useEffect(() => {
    setUserId(getOrCreateUserId());
  }, []);

  const hasMessengerChannels = useMemo(
    () => Array.from(selected).some((channelId) => channelId in MESSENGER_CONFIG),
    [selected],
  );

  const toggleChannel = (channelId) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  };

  const handleMessengerFieldChange = (messengerId, fieldKey, value) => {
    setMessengerForm((previous) => ({
      ...previous,
      [messengerId]: {
        ...(previous[messengerId] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const validateMessenger = (messengerId) => {
    const values = messengerForm[messengerId] || {};
    const config = MESSENGER_CONFIG[messengerId];

    for (const field of config.fields) {
      const rawValue = String(values[field.key] || "").trim();
      if (!rawValue) {
        throw new Error(`Поле "${field.label}" обязательно для ${config.name}.`);
      }
    }

    if ("allowListText" in values && parseAllowList(values.allowListText).length === 0) {
      throw new Error(`Для ${config.name} нужно заполнить allowList.`);
    }

    if (messengerId === "whatsapp") {
      if (!Number.isInteger(Number(values.phoneNumbId))) {
        throw new Error("Phone Number ID должен быть числом.");
      }
      if (!Number.isInteger(Number(values.BusId))) {
        throw new Error("Business Account ID должен быть числом.");
      }
    }
  };

  const submitMessengers = async (stableUserId, activeMessengers) => {
    setMessengerLoading(true);
    const nextStatus = {};

    try {
      for (const messengerId of activeMessengers) {
        validateMessenger(messengerId);
        const payload = MESSENGER_CONFIG[messengerId].buildPayload(
          stableUserId,
          messengerForm[messengerId] || {},
        );

        await apiRequest(`/settings/${messengerId}`, payload);
        nextStatus[messengerId] = { type: "success", message: "OK" };
      }

      setMessengerStatus(nextStatus);
      setScreen("preset");
    } catch (error) {
      const firstFailed =
        activeMessengers.find((id) => !(id in nextStatus)) || activeMessengers[0];
      nextStatus[firstFailed] = { type: "error", message: error.message };
      setMessengerStatus(nextStatus);
    } finally {
      setMessengerLoading(false);
    }
  };

  const submitPreset = async () => {
    setPresetLoading(true);
    setPresetError("");

    try {
      await apiRequest("/settings/markdown", {
        user_id: userId,
        preset_id: selectedPreset,
      });
      setScreen("done");
    } catch (error) {
      setPresetError(error.message);
    } finally {
      setPresetLoading(false);
    }
  };

  const resetFlow = () => {
    setScreen("landing");
    setSelected(new Set());
    setProvisionData(null);
    setMessengerForm({});
    setMessengerStatus({});
    setSelectedPreset(null);
    setPresetError("");
    setPresetLoading(false);
    setMessengerLoading(false);
  };

  return (
    <div style={styles.shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:disabled { pointer-events: none; }
        input::placeholder { color: rgba(255,255,255,.24); }
        .orb { position: absolute; border-radius: 50%; filter: blur(90px); }
        .orb-1 { width: 380px; height: 380px; top: -5%; right: -5%; background: rgba(84,139,255,.16); }
        .orb-2 { width: 340px; height: 340px; bottom: 10%; left: -7%; background: rgba(120,255,194,.12); }
        .orb-3 { width: 240px; height: 240px; top: 38%; left: 46%; background: rgba(255,255,255,.06); }
      `}</style>
      <Background />

      {screen === "landing" ? (
        <Hero onStart={() => setScreen("provision")} userId={userId} />
      ) : null}

      {screen === "provision" ? (
        <Provisioning
          userId={userId}
          onBack={() => setScreen("landing")}
          onSuccess={(data) => {
            setProvisionData(data);
            setScreen("channels");
          }}
        />
      ) : null}

      {screen === "channels" ? (
        <ChannelStep
          selected={selected}
          onToggle={toggleChannel}
          onNext={() => setScreen(hasMessengerChannels ? "messengers" : "preset")}
        />
      ) : null}

      {screen === "messengers" ? (
        <MessengerStep
          userId={userId}
          selected={selected}
          formData={messengerForm}
          statusMap={messengerStatus}
          loading={messengerLoading}
          onBack={() => setScreen("channels")}
          onChange={handleMessengerFieldChange}
          onSubmit={submitMessengers}
        />
      ) : null}

      {screen === "preset" ? (
        <PresetStep
          selectedPreset={selectedPreset}
          loading={presetLoading}
          error={presetError}
          onBack={() => setScreen(hasMessengerChannels ? "messengers" : "channels")}
          onSelect={setSelectedPreset}
          onSubmit={submitPreset}
        />
      ) : null}

      {screen === "done" ? (
        <Done
          provisionData={provisionData}
          selected={selected}
          selectedPreset={selectedPreset}
          onReset={resetFlow}
        />
      ) : null}
    </div>
  );
}

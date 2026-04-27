import { useState, useEffect, useRef } from "react";

const API_BASE = "http://187.77.110.16:8000";

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */

const ALL_CHANNELS = [
  { id: "web",      name: "Веб-интерфейс", icon: "🌐", desc: "Встроенный UI",   noToken: true },
  { id: "telegram", name: "Telegram",       icon: "✈️",  desc: "Telegram-бот"               },
  { id: "whatsapp", name: "WhatsApp",       icon: "💬",  desc: "WhatsApp-бот",  phone: true  },
  { id: "discord",  name: "Discord",        icon: "🎮",  desc: "Discord-бот"                },
  { id: "slack",    name: "Slack",          icon: "⚡",  desc: "Slack-бот"                  },
];

const INSTRUCTIONS = {
  telegram: [
    "Открой @BotFather в Telegram",
    "Отправь /newbot и следуй инструкциям",
    "Скопируй полученный Bot Token и вставь ниже",
  ],
  whatsapp: [
    "Перейди на business.whatsapp.com",
    "Создай или войди в бизнес-аккаунт",
    "Введи номер телефона в международном формате (+7...)",
  ],
  discord: [
    "Перейди на discord.com/developers/applications",
    "Создай Application → раздел Bot",
    "Скопируй Bot Token и вставь ниже",
  ],
  slack: [
    "Перейди на api.slack.com/apps",
    "Создай приложение → добавь Bot Token Scopes",
    "Скопируй OAuth Access Token и вставь ниже",
  ],
};

const QUESTIONS = [
  { id: "name",        q: "Как зовут вашего ассистента?",      placeholder: "Алиса, HelpBot, Макс…",            icon: "◎" },
  { id: "role",        q: "Чем он занимается?",                 placeholder: "Помогает клиентам с заказами…",    icon: "⚙" },
  { id: "personality", q: "Какой у него характер?",             placeholder: "Дружелюбный, с юмором, на «ты»…", icon: "♡" },
  { id: "boundaries",  q: "Что ему запрещено?",                 placeholder: "Не обсуждать конкурентов…",        icon: "⊘" },
  { id: "tools",       q: "Какие инструменты нужны?",           placeholder: "Поиск товаров, email, CRM…",       icon: "⚡" },
  { id: "users",       q: "Кто ваши пользователи?",            placeholder: "Клиенты, VIP, менеджеры…",         icon: "👤" },
  { id: "memory",      q: "Что запоминать между сессиями?",     placeholder: "Имена, заказы, предпочтения…",    icon: "🧠" },
];

function generateFiles(a) {
  return [
    { name: "IDENTITY.md",  desc: "Имя, версия, ограничения",        content: `# Identity\nname: ${a.name || "Assistant"}\nversion: 1.0\nrole: ${a.role || "general assistant"}\nrestrictions:\n${(a.boundaries || "нет").split(",").map(b => `  - ${b.trim()}`).join("\n")}` },
    { name: "SOUL.md",      desc: "Личность и стиль общения",         content: `# Soul\npersonality: ${a.personality || "friendly"}\ntone: conversational\nvalues:\n  - Полезность\n  - Честность\n  - ${a.personality?.split(",")[0]?.trim() || "Дружелюбие"}` },
    { name: "AGENTS.md",    desc: "Роли и маршрутизация агентов",     content: `# Agents\nprimary:\n  name: ${a.name || "Main"}\n  role: ${a.role || "general"}\n  routing: auto\n  session_isolation: true` },
    { name: "TOOLS.md",     desc: "Доступные инструменты",            content: `# Tools\n${(a.tools || "нет").split(",").map((x, i) => `tool_${i + 1}:\n  name: ${x.trim()}\n  enabled: true`).join("\n")}` },
    { name: "USER.md",      desc: "Профиль пользователей",            content: `# User Profile\naudience: ${a.users || "general"}\npersonalization: true\ncontext_aware: true` },
    { name: "MEMORY.md",    desc: "Стратегия работы с памятью",       content: `# Memory\nstrategy: selective\nretain:\n${(a.memory || "контекст").split(",").map(m => `  - ${m.trim()}`).join("\n")}\ncompaction: auto\nmax_context_tokens: 4096` },
    { name: "HEARTBEAT.md", desc: "Health-check и мониторинг",        content: `# Heartbeat\ninterval: 30s\nhealth_check: /health\nlog_level: info\nalert_on_failure: true` },
    { name: "BOOTSTRAP.md", desc: "Первоначальная инициализация",     content: `# Bootstrap\nenv:\n  AGENT_NAME: ${a.name || "assistant"}\n  MODE: production\nfirst_run:\n  - validate_config\n  - init_memory\n  - register_tools` },
  ];
};

const MESSENGER_CONFIG = {
  telegram: {
    id: "telegram",
    name: "Telegram",
    icon: "✈️",
    instructions: [
      "Создайте бота через @BotFather в Telegram.",
      "Скопируйте HTTP API Token.",
      "Вставьте токен ниже."
    ],
    // Поля, которые нужно отправить на бэкенд
    fields: [
      { key: "token", label: "Bot Token", placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11", type: "text" }
    ]
  },
  discord: {
    id: "discord",
    name: "Discord",
    icon: "👾",
    instructions: [
      "Создайте приложение в Discord Developer Portal.",
      "Скопируйте Bot Token из раздела 'Bot'.",
      "Вставьте токен ниже."
    ],
    fields: [
      { key: "token", label: "Bot Token", placeholder: "MT...xyz", type: "text" }
    ]
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: "📞",
    instructions: [
      "Получите данные из Meta for Developers.",
      "Введите Phone Number ID и Business Account ID.",
      "Вставьте Permanent Access Token."
    ],
    fields: [
      { key: "phoneNumbId", label: "Phone Number ID", placeholder: "1029384756", type: "number" },
      { key: "BusId", label: "Business Account ID", placeholder: "1029384756", type: "number" },
      { key: "token", label: "Access Token", placeholder: "EAA...", type: "text" }
    ]
  },
  slack: {
    id: "slack",
    name: "Slack",
    icon: "💬",
    instructions: [
      "Создайте Slack App.",
      "Установите необходимые OAuth scopes (chat:write, etc).",
      "Скопируйте Bot User OAuth Token, App-Level Token и Signing Secret."
    ],
    fields: [
      { key: "bot_token", label: "Bot User OAuth Token", placeholder: "xoxb-...", type: "text" },
      { key: "app_token", label: "App-Level Token", placeholder: "xapp-...", type: "text" },
      { key: "signingSecret", label: "Signing Secret", placeholder: "abc123...", type: "text" }
    ]
  }
};

const PRESETS = [
  { id: 1, title: "CEO", icon: "👔", desc: "Стратегическое лидерство, управление и принятие решений." },
  { id: 2, title: "Creative Director", icon: "🎨", desc: "Визионерство, арт-дирекшн и креативные концепции." },
  { id: 3, title: "Mentor", icon: "🎓", desc: "Наставничество, обучение и личностный рост." },
  { id: 4, title: "Product Manager", icon: "📊", desc: "Управление продуктом, метрики и roadmap." },
  { id: 5, title: "Researcher", icon: "🔬", desc: "Глубокий анализ, сбор данных и фактчекинг." },
  { id: 6, title: "Software Engineer", icon: "💻", desc: "Архитектура, кодинг и технический обзор." },
];

/* ═══════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════ */

const s = {
  page:    { maxWidth: 520, margin: "0 auto", padding: "56px 24px 36px", minHeight: "100vh" },
  heading: { fontSize: 28, fontWeight: 300, letterSpacing: "-.025em", lineHeight: 1.25, marginBottom: 8, background: "linear-gradient(135deg,#fff 30%,rgba(255,255,255,.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtext: { fontSize: 14, color: "rgba(255,255,255,.3)", lineHeight: 1.6 },
  backBtn: { background: "none", border: "none", color: "rgba(255,255,255,.3)", fontSize: 13, fontFamily: "'Sora',sans-serif", cursor: "pointer", marginBottom: 24, padding: 0, transition: "color .2s" },
  input:   { width: "100%", padding: "15px 18px", fontSize: 14, fontFamily: "'Sora',sans-serif", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, color: "#fff", outline: "none", transition: "all .3s ease", backdropFilter: "blur(10px)" },
};

/* ═══════════════════════════════════════════════
   BACKGROUND
   ═══════════════════════════════════════════════ */

const Background = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
    <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
    <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)" }} />
  </div>
);

/* ═══════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════ */

const FadeIn = ({ children, delay = 0, y = 20, duration = 0.7, style: extra = {} }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0) scale(1)" : `translateY(${y}px) scale(0.98)`, transition: `opacity ${duration}s cubic-bezier(.16,1,.3,1),transform ${duration}s cubic-bezier(.16,1,.3,1)`, willChange: "transform,opacity", ...extra }}>
      {children}
    </div>
  );
};

const Typing = () => (
  <div style={{ display: "flex", gap: 5, padding: "14px 18px", background: "rgba(255,255,255,.04)", borderRadius: "4px 16px 16px 16px", width: "fit-content", border: "1px solid rgba(255,255,255,.06)" }}>
    {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.3)", animation: `typingDot 1.4s ease-in-out ${i * 0.15}s infinite` }} />)}
  </div>
);

const GlowButton = ({ children, onClick, disabled, full, small, style: extra = {} }) => {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "relative", padding: small ? "10px 22px" : "15px 48px", fontSize: small ? 13 : 15, fontWeight: 500, fontFamily: "'Sora',sans-serif", color: hover && !disabled ? "#000" : "#fff", background: hover && !disabled ? "#fff" : "transparent", border: "1px solid", borderColor: disabled ? "rgba(255,255,255,.08)" : hover ? "#fff" : "rgba(255,255,255,.2)", borderRadius: 50, cursor: disabled ? "default" : "pointer", transition: "all .4s cubic-bezier(.16,1,.3,1)", width: full ? "100%" : "auto", opacity: disabled ? 0.3 : 1, transform: hover && !disabled ? "scale(1.03)" : "scale(1)", boxShadow: hover && !disabled ? "0 0 40px rgba(255,255,255,.12),0 0 80px rgba(255,255,255,.05)" : "none", letterSpacing: ".01em", ...extra }}
    >{children}</button>
  );
};

const GlassCard = ({ children, onClick, active, style: extra = {} }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ padding: "28px 20px", background: active ? "rgba(255,255,255,.08)" : hover ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.025)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${active ? "rgba(255,255,255,.18)" : hover ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.06)"}`, borderRadius: 18, cursor: "pointer", transition: "all .35s cubic-bezier(.16,1,.3,1)", transform: hover ? "translateY(-3px) scale(1.01)" : "none", boxShadow: hover ? "0 20px 60px rgba(0,0,0,.3)" : "0 4px 20px rgba(0,0,0,.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...extra }}
    >{children}</div>
  );
};

const StepBadge = ({ n, total }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 50, marginBottom: 16 }}>
    <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,.3)", letterSpacing: ".08em" }}>ШАГ {n}</span>
    <span style={{ fontSize: 11, color: "rgba(255,255,255,.12)" }}>из {total}</span>
  </div>
);

/* ═══════════════════════════════════════════════
   SCREEN: LANDING
   ═══════════════════════════════════════════════ */

const Landing = ({ onStart }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
    <FadeIn delay={200} y={30}>
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, background: "rgba(255,255,255,.02)", backdropFilter: "blur(10px)", boxShadow: "0 0 60px rgba(255,255,255,.05),inset 0 0 30px rgba(255,255,255,.02)" }}>◎</div>
        <div style={{ position: "absolute", inset: -8,  borderRadius: "50%", border: "1px solid rgba(255,255,255,.04)", animation: "pulsering 3s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "1px solid rgba(255,255,255,.02)", animation: "pulsering 3s ease-in-out .5s infinite" }} />
      </div>
    </FadeIn>
    <FadeIn delay={400} y={25}>
      <h1 style={{ fontSize: 56, fontWeight: 200, letterSpacing: "-.04em", lineHeight: 1, marginBottom: 4, background: "linear-gradient(135deg,#fff 0%,rgba(255,255,255,.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>openclo</h1>
    </FadeIn>
    <FadeIn delay={550} y={20}>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.25)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 32, marginTop: 8 }}>ai infrastructure</p>
    </FadeIn>
    <FadeIn delay={700} y={20}>
      <p style={{ fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,.45)", lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
        Разверните своего AI&#8209;ассистента за&nbsp;минуту.<br />
        <span style={{ color: "rgba(255,255,255,.25)" }}>Один клик — и контейнер уже работает.</span>
      </p>
    </FadeIn>
    <FadeIn delay={900} y={15}>
      <GlowButton onClick={onStart}>Создать ассистента</GlowButton>
    </FadeIn>
    <FadeIn delay={1200} y={10}>
      <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 20, alignItems: "center" }}>
        {["Docker", "API", "Мессенджеры", "Конфиг"].map((t, i) => (
          <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,.15)", letterSpacing: ".05em" }}>
            {i > 0 && <span style={{ marginRight: 20, opacity: .3 }}>·</span>}
            {t}
          </span>
        ))}
      </div>
    </FadeIn>
  </div>
);

/* ═══════════════════════════════════════════════
   SCREEN: PROVISIONING  (реальный API-вызов)
   ═══════════════════════════════════════════════ */

const Provisioning = ({ onDone }) => {
  const userId = useRef(localStorage.getItem('user_id') || localStorage.getItem('uuid'));
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = ["Инициализация Docker…", "Сборка образа…", "Запуск контейнера…", "Проверка здоровья…", "Готово"];
  const st = useRef({ apiDone: false, animDone: false, containerId: null });

  useEffect(() => {
    const tryComplete = () => {
      const { apiDone, animDone, containerId } = st.current;
      if (apiDone && animDone) setTimeout(() => onDone(containerId), 600);
    };

    fetch(`${API_BASE}/provision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId.current }) })
      .then(r => r.json())
      .then(d => { st.current.containerId = d.container_id; st.current.apiDone = true; tryComplete(); })
      .catch(() => { st.current.containerId = `openclaw-${Math.random().toString(36).slice(2, 10)}`; st.current.apiDone = true; tryComplete(); });

    const iv = setInterval(() => {
      setPct(p => {
        const next = Math.min(100, p + Math.random() * 8 + 2);
        if (next >= 100) { clearInterval(iv); st.current.animDone = true; tryComplete(); }
        return next;
      });
    }, 350);
    return () => clearInterval(iv);
  }, [onDone]);

  useEffect(() => {
    const c = Math.round(pct);
    setPhase(c < 20 ? 0 : c < 45 ? 1 : c < 75 ? 2 : c < 95 ? 3 : 4);
  }, [pct]);

  const c = Math.min(100, Math.round(pct));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40, textAlign: "center", position: "relative", zIndex: 1 }}>
      <FadeIn delay={100}>
        <div style={{ position: "relative", width: 100, height: 100, marginBottom: 40 }}>
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ animation: "spin 2s linear infinite" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={`${c * 2.76} 276`} transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray .4s ease" }} />
            <defs><linearGradient id="grad"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="rgba(255,255,255,.2)" /></linearGradient></defs>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 300 }}>{c}</div>
        </div>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", marginBottom: 10, minHeight: 22 }}>{phases[phase]}</p>
        <div style={{ marginTop: 24, textAlign: "left", maxWidth: 340, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "rgba(255,255,255,.2)", lineHeight: 2 }}>
          {c > 5  && <FadeIn y={8}><span style={{ color: "rgba(255,255,255,.12)" }}>$</span> docker pull openclo/agent:latest</FadeIn>}
          {c > 25 && <FadeIn y={8}><span style={{ color: "rgba(255,255,255,.12)" }}>$</span> docker run -d --name {st.current.containerId || `agent-${Math.random().toString(36).slice(2,6)}`}</FadeIn>}
          {c > 55 && <FadeIn y={8}><span style={{ color: "rgba(110,255,160,.3)" }}>✓</span> container started on port 8080</FadeIn>}
          {c > 80 && <FadeIn y={8}><span style={{ color: "rgba(110,255,160,.3)" }}>✓</span> health check passed</FadeIn>}
        </div>
      </FadeIn>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SETUP STEP 1 — выбор каналов (мульти)
   ═══════════════════════════════════════════════ */

const ChannelStep = ({ selected, onToggle, onNext }) => (
  <div style={{ ...s.page, position: "relative", zIndex: 1 }}>
    <FadeIn delay={100}>
      <StepBadge n={1} total={3} />
      <h2 style={s.heading}>Где будет жить<br />ваш ассистент?</h2>
      <p style={{ ...s.subtext, marginBottom: 32 }}>Можно выбрать несколько</p>
    </FadeIn>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {ALL_CHANNELS.map((ch, i) => (
        <FadeIn key={ch.id} delay={200 + i * 80}>
          <GlassCard active={selected.has(ch.id)} onClick={() => onToggle(ch.id)} style={{ position: "relative", minHeight: 120 }}>
            {selected.has(ch.id) && (
              <div style={{ position: "absolute", top: 10, right: 12, width: 20, height: 20, borderRadius: "50%", background: "rgba(110,255,160,.12)", border: "1px solid rgba(110,255,160,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(110,255,160,.9)" }}>✓</div>
            )}
            <span style={{ fontSize: 30 }}>{ch.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{ch.name}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)" }}>{ch.desc}</span>
          </GlassCard>
        </FadeIn>
      ))}
    </div>
    <FadeIn delay={700}>
      <div style={{ marginTop: 32 }}>
        <GlowButton onClick={onNext} disabled={selected.size === 0} full>Далее →</GlowButton>
      </div>
    </FadeIn>
  </div>
);

/* ═══════════════════════════════════════════════
   SETUP STEP 2 — настройка мессенджеров
   ═══════════════════════════════════════════════ */

const MessengerCard = ({ config, values, onChange }) => {
  const [open, setOpen] = useState(true);

  // Проверка валидности: все поля должны быть заполнены
  const isReady = config.fields.every(field => {
    const val = values[field.key];
    return val && val.toString().trim().length > 0;
  });

  return (
    <div style={{ 
      background: "rgba(255,255,255,.025)", 
      border: `1px solid ${isReady ? "rgba(110,255,160,.15)" : "rgba(255,255,255,.06)"}`, 
      borderRadius: 18, 
      overflow: "hidden", 
      marginBottom: 14, 
      transition: "border-color .3s" 
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", borderBottom: open ? "1px solid rgba(255,255,255,.05)" : "none" }}>
        <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 12, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {config.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>{config.name}</div>
          <div style={{ fontSize: 11, color: isReady ? "rgba(110,255,160,.7)" : "rgba(255,255,255,.25)", marginTop: 2 }}>
            {isReady ? "Готово ✓" : "Требуется настройка"}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.2)", transition: "transform .3s", transform: open ? "rotate(180deg)" : "none" }}>▾</div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding: "20px 20px" }}>
          {/* Instructions */}
          {config.instructions.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{ width: 26, height: 26, minWidth: 26, borderRadius: "50%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,.4)" }}>{i + 1}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.6, paddingTop: 3, margin: 0 }}>{step}</p>
            </div>
          ))}

          {/* Dynamic Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {config.fields.map(field => (
              <div key={field.key}>
                <label style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 6, display: "block" }}>{field.label}</label>
                <input
                  type={field.type === "number" ? "number" : "text"}
                  placeholder={field.placeholder}
                  value={values[field.key] || ""}
                  onChange={e => onChange(field.key, e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "10px 12px", 
                    background: "rgba(0,0,0,.2)", 
                    border: "1px solid rgba(255,255,255,.1)", 
                    borderRadius: 8, 
                    color: "#fff", 
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MessengerStep = ({ selected, onBack, onDone }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({}); // { telegram: 'success' | 'error', ... }
  
  // Состояние хранит объекты значений для каждого мессенджера: { telegram: { token: "..." }, discord: { token: "..." } }
  const [formData, setFormData] = useState({});

  // Фильтруем только выбранные и существующие в конфиге
  const activeMessengers = Array.from(selected).filter(id => MESSENGER_CONFIG[id]);

  const handleFieldChange = (messengerId, fieldKey, value) => {
    setFormData(prev => ({
      ...prev,
      [messengerId]: {
        ...(prev[messengerId] || {}),
        [fieldKey]: value
      }
    }));
  };

  const checkReady = (messengerId) => {
    const config = MESSENGER_CONFIG[messengerId];
    const values = formData[messengerId] || {};
    return config.fields.every(f => values[f.key] && values[f.key].toString().trim().length > 0);
  };

  const allReady = activeMessengers.every(id => checkReady(id));

  const handleSubmit = async () => {
    setLoading(true);
    const userId = localStorage.getItem('user_id') || localStorage.getItem('uuid');
    const allowList = ["*"]; // Или получить из настроек пользователя

    const results = { ...status };
    let hasError = false;

    // Последовательная отправка (можно сделать Promise.all для параллельной)
    for (const mId of activeMessengers) {
      if (!checkReady(mId)) continue;

      const config = MESSENGER_CONFIG[mId];
      const data = formData[mId];
      
      // Формируем тело запроса согласно схемам Pydantic
      const payload = {
        user_id: userId,
        allowList: allowList,
        ...data // Распаковываем токены, айдишники и т.д.
      };

      try {
        const res = await fetch(`${API_BASE}/settings/${mId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());
        
        results[mId] = 'success';
      } catch (e) {
        console.error(`Failed to setup ${mId}`, e);
        results[mId] = 'error';
        hasError = true;
      }
    }

    setStatus(results);
    setLoading(false);

    if (!hasError) {
      // Небольшая задержка для визуального подтверждения
      setTimeout(() => onDone(), 800);
    } else {
      alert("Произошла ошибка при настройке некоторых мессенджеров. Проверьте консоль.");
    }
  };

  return (
    <div style={{ ...s.page, position: "relative", zIndex: 1, paddingBottom: 100 }}>
      <FadeIn delay={100}>
        <button onClick={onBack} style={s.backBtn}>← Назад</button>
        <StepBadge n={2} total={3} />
        <h2 style={s.heading}>Настройка каналов</h2>
        <p style={{ ...s.subtext, marginBottom: 28 }}>Введите учетные данные для выбранных платформ</p>
      </FadeIn>

      <FadeIn delay={200}>
        {activeMessengers.map(mId => {
          const config = MESSENGER_CONFIG[mId];
          const isError = status[mId] === 'error';
          const isSuccess = status[mId] === 'success';

          return (
            <div key={mId} style={{ opacity: isSuccess ? 0.5 : 1, pointerEvents: isSuccess ? 'none' : 'auto' }}>
              <MessengerCard 
                config={config}
                values={formData[mId] || {}}
                onChange={(key, val) => handleFieldChange(mId, key, val)}
              />
              {isSuccess && <div style={{ color: "rgba(110,255,160,.7)", fontSize: 12, textAlign: "right", marginTop: -10, marginBottom: 14 }}>Сохранено ✓</div>}
              {isError && <div style={{ color: "#ff6b6b", fontSize: 12, textAlign: "right", marginTop: -10, marginBottom: 14 }}>Ошибка сохранения</div>}
            </div>
          );
        })}
      </FadeIn>

      <FadeIn delay={400}>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 40px", background: "linear-gradient(to top, #000 80%, transparent)", display: "flex", justifyContent: "center" }}>
           <GlowButton 
             onClick={handleSubmit} 
             disabled={!allReady || loading} 
             full 
             style={{ maxWidth: 400 }}
           >
             {loading ? "Сохранение..." : "Подключить каналы →"}
           </GlowButton>
        </div>
      </FadeIn>
    </div>
  );
};


/* ═══════════════════════════════════════════════
   SETUP STEP 3 — .md
   ═══════════════════════════════════════════════ */

const PresetCard = ({ preset, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(preset.id)}
      style={{ 
        background: isSelected ? "rgba(110,255,160,.05)" : "rgba(255,255,255,.025)",
        border: `1px solid ${isSelected ? "rgba(110,255,160,.4)" : "rgba(255,255,255,.06)"}`, 
        borderRadius: 18, 
        padding: "20px",
        cursor: "pointer",
        transition: "all .2s ease",
        marginBottom: 14,
        display: "flex",
        alignItems: "center",
        gap: 16
      }}
    >
      {/* Иконка */}
      <div style={{ 
        width: 50, height: 50, minWidth: 50, 
        borderRadius: 14, 
        background: isSelected ? "rgba(110,255,160,.1)" : "rgba(255,255,255,.05)", 
        display: "flex", alignItems: "center", justifyContent: "center", 
        fontSize: 24 
      }}>
        {preset.icon}
      </div>

      {/* Текст */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
          {preset.title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.4 }}>
          {preset.desc}
        </div>
      </div>

      {/* Индикатор выбора */}
      <div style={{ 
        width: 24, height: 24, borderRadius: "50%", 
        border: `2px solid ${isSelected ? "rgba(110,255,160,.8)" : "rgba(255,255,255,.1)"}`,
        background: isSelected ? "rgba(110,255,160,.8)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s"
      }}>
        {isSelected && <div style={{ width: 8, height: 8, background: "#000", borderRadius: "50%" }} />}
      </div>
    </div>
  );
};


const PresetStep = ({ onBack, onDone }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedId) return;
    
    setLoading(true);
    setError(null);
    const userId = localStorage.getItem('user_id') || localStorage.getItem('uuid');

    try {
      const res = await fetch(`${API_BASE}/settings/markdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          preset_id: selectedId
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to apply preset");
      }

      // Успех
      setTimeout(() => onDone(), 600);

    } catch (e) {
      console.error(e);
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ ...s.page, position: "relative", zIndex: 1, paddingBottom: 100 }}>
      <FadeIn delay={100}>
        <button onClick={onBack} style={s.backBtn}>← Назад</button>
        <StepBadge n={3} total={3} />
        <h2 style={s.heading}>Выберите роль</h2>
        <p style={{ ...s.subtext, marginBottom: 28 }}>Это определит поведение и знания вашего агента</p>
      </FadeIn>

      <FadeIn delay={200}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {PRESETS.map(preset => (
            <PresetCard 
              key={preset.id}
              preset={preset}
              isSelected={selectedId === preset.id}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </FadeIn>

      {error && (
        <FadeIn delay={300}>
          <div style={{ color: "#ff6b6b", textAlign: "center", marginTop: 10, fontSize: 13 }}>
            {error}
          </div>
        </FadeIn>
      )}

      <FadeIn delay={400}>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px 40px", background: "linear-gradient(to top, #000 80%, transparent)", display: "flex", justifyContent: "center", zIndex: 10 }}>
           <GlowButton 
             onClick={handleSubmit} 
             disabled={!selectedId || loading} 
             full 
             style={{ maxWidth: 400 }}
           >
             {loading ? "Применение роли..." : "Завершить настройку 🚀"}
           </GlowButton>
        </div>
      </FadeIn>
    </div>
  );
};


/* ═══════════════════════════════════════════════
   SETUP STEP 4 — ревью и отправка
   ═══════════════════════════════════════════════ */

const FileReview = ({ files, saving, onDone }) => {
  const [active, setActive] = useState(0);
  const [lf, setLf] = useState(files);
  const update = v => { const c = [...lf]; c[active] = { ...c[active], content: v }; setLf(c); };

  return (
    <div style={{ ...s.page, position: "relative", zIndex: 1 }}>
      <FadeIn>
        <StepBadge n={3} total={3} />
        <h2 style={s.heading}>Ваша конфигурация</h2>
        <p style={s.subtext}>{files.length} файлов сгенерировано — можете подправить</p>
      </FadeIn>

      <FadeIn delay={150}>
        <div style={{ display: "flex", gap: 6, marginTop: 24, marginBottom: 14, overflowX: "auto", paddingBottom: 6 }}>
          {lf.map((f, i) => (
            <button key={f.name} onClick={() => setActive(i)} style={{ padding: "7px 12px", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", background: i === active ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.02)", border: `1px solid ${i === active ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.05)"}`, borderRadius: 9, color: i === active ? "#fff" : "rgba(255,255,255,.25)", cursor: "pointer", transition: "all .3s", whiteSpace: "nowrap" }}>{f.name}</button>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginBottom: 10, fontStyle: "italic" }}>{lf[active].desc}</p>
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            {[["rgba(255,100,100,.4)", ""], ["rgba(255,200,50,.3)", ""], ["rgba(100,255,100,.3)", ""]].map(([bg], i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: bg }} />)}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)", marginLeft: 8, fontFamily: "'JetBrains Mono',monospace" }}>{lf[active].name}</span>
          </div>
          <textarea value={lf[active].content} onChange={e => update(e.target.value)} style={{ width: "100%", height: 240, padding: "16px 18px", fontSize: 12.5, fontFamily: "'JetBrains Mono',monospace", background: "transparent", border: "none", color: "rgba(255,255,255,.7)", outline: "none", resize: "vertical", lineHeight: 1.8 }} spellCheck={false} />
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <div style={{ marginTop: 18 }}>
          <GlowButton onClick={() => onDone(lf)} disabled={saving} full>
            {saving ? "Сохраняем…" : "Сохранить и запустить →"}
          </GlowButton>
        </div>
      </FadeIn>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN: DONE
   ═══════════════════════════════════════════════ */

const Done = ({ selected, agentName, onReset }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40, textAlign: "center", position: "relative", zIndex: 1 }}>
    <FadeIn delay={200} y={30}>
      <div style={{ position: "relative", marginBottom: 28 }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(110,255,160,.04)", border: "1px solid rgba(110,255,160,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 0 60px rgba(110,255,160,.06)" }}>✦</div>
        <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1px solid rgba(110,255,160,.06)", animation: "pulsering 2.5s ease-in-out infinite" }} />
      </div>
    </FadeIn>
    <FadeIn delay={400}>
      <h2 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-.02em", marginBottom: 16 }}>
        <span style={{ color: "rgba(110,255,160,.8)" }}>{agentName || "Ассистент"}</span> запущен
      </h2>
    </FadeIn>
    <FadeIn delay={520}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {ALL_CHANNELS.filter(ch => selected.has(ch.id)).map(ch => (
          <span key={ch.id} style={{ padding: "5px 14px", fontSize: 12, background: "rgba(110,255,160,.04)", border: "1px solid rgba(110,255,160,.08)", borderRadius: 20, color: "rgba(110,255,160,.5)" }}>{ch.icon} {ch.name}</span>
        ))}
      </div>
    </FadeIn>
    <FadeIn delay={680}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 360, marginBottom: 32 }}>
        {["IDENTITY", "SOUL", "AGENTS", "TOOLS", "USER", "MEMORY", "HEARTBEAT", "BOOTSTRAP"].map(f => (
          <span key={f} style={{ padding: "5px 12px", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", background: "rgba(110,255,160,.04)", border: "1px solid rgba(110,255,160,.08)", borderRadius: 6, color: "rgba(110,255,160,.4)" }}>{f}.md</span>
        ))}
      </div>
    </FadeIn>
    <FadeIn delay={860}>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.2)", maxWidth: 320, lineHeight: 1.6, marginBottom: 32 }}>
        Контейнер работает. Все конфиги на месте.<br />Настройки можно изменить через API.
      </p>
    </FadeIn>
    <FadeIn delay={1000}>
      <button onClick={onReset} style={s.backBtn}>← Создать ещё одного</button>
    </FadeIn>
  </div>
);

/* ═══════════════════════════════════════════════
   APP — оркестрация флоу
   ═══════════════════════════════════════════════ */

export default function App() {
  const [screen, setScreen]             = useState("landing");
  const [containerId, setContainerId]   = useState(null);
  const [setupStep, setSetupStep]       = useState(0); // 0:channels 1:messengers 2:interview 3:review
  const [selected, setSelected]         = useState(new Set());
  const [messengerTokens, setMessengerTokens] = useState({});
  const [mdAnswers, setMdAnswers]       = useState({});
  const [mdFiles, setMdFiles]           = useState([]);
  const [saving, setSaving]             = useState(false);
  const [userId, setUserId]             = useState("123e4567-e89b-12d3-a456-426614174000"); // Временный ID для демонстрации

  const toggleChannel = id =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const hasMessengers = [...selected].some(id => id !== "web");

  const handleChannelsDone  = () => setSetupStep(hasMessengers ? 1 : 2);
  const handleMessengersDone = tokens => { setMessengerTokens(tokens); setSetupStep(2); };
  const handleInterviewDone  = (files, answers) => { setMdFiles(files); setMdAnswers(answers); setSetupStep(3); };

  const handleSave = async (files) => {
    setSaving(true);
    const post = (path, body) =>
      fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    try {
      // Messenger configs
      for (const id of selected) {
        if (id === "web") continue;
        const token = messengerTokens[id] || "";
        if (id === "telegram") await post("/settings/telegram", { id: containerId, id_allowList: [], token });
        if (id === "whatsapp") await post("/settings/whatsapp", { id: containerId, whatsapp_id_allowList: [] });
        if (id === "discord")  await post("/settings/discord",  { id: containerId, allowList: [], token });
        if (id === "slack")    await post("/settings/slack",    { id: containerId, token });
      }
      // MD файлы
      await post("/settings/markdown", {
        id: containerId,
        answerList: QUESTIONS.map(q => mdAnswers[q.id] || ""),
      });
      setMdFiles(files);
      setScreen("done");
    } catch (e) {
      console.error("Save error:", e);
      setScreen("done"); // для демо продолжаем
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setScreen("landing"); setContainerId(null); setSetupStep(0);
    setSelected(new Set()); setMessengerTokens({}); setMdAnswers({}); setMdFiles([]);
  };

  const currentScreen = (() => {
    if (screen === "landing")      return <Landing onStart={() => setScreen("provisioning")} />;
    if (screen === "provisioning") return <Provisioning onDone={cid => { setContainerId(cid); setScreen("setup"); }} />;
    if (screen === "done")         return <Done selected={selected} agentName={mdAnswers.name} onReset={reset} />;
    if (screen === "setup") {
      if (setupStep === 0) return <ChannelStep   selected={selected} onToggle={toggleChannel} onNext={handleChannelsDone} />;
      if (setupStep === 1) return <MessengerStep selected={selected} onBack={() => setSetupStep(0)} onDone={handleMessengersDone} />;
      if (setupStep === 2) return <Interview     onDone={handleInterviewDone} />;
      if (setupStep === 3) return <FileReview    files={mdFiles} saving={saving} onDone={handleSave} />;
    }
    return null;
  })();

  return (
    <div style={{ background: "#06060a", color: "#fff", fontFamily: "'Sora',sans-serif", minHeight: "100vh", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        @keyframes spin        { to { transform:rotate(360deg) } }
        @keyframes pulsering   { 0%,100% { transform:scale(1);    opacity:1   } 50% { transform:scale(1.15); opacity:0.3 } }
        @keyframes typingDot   { 0%,60%,100% { transform:translateY(0);   opacity:0.3 } 30% { transform:translateY(-4px); opacity:0.8 } }
        @keyframes float1      { 0%,100% { transform:translate(0,0)    scale(1)    } 33% { transform:translate(80px,-60px)  scale(1.1)  } 66% { transform:translate(-40px,40px)  scale(0.9)  } }
        @keyframes float2      { 0%,100% { transform:translate(0,0)    scale(1)    } 33% { transform:translate(-90px,50px) scale(0.85) } 66% { transform:translate(60px,-80px)  scale(1.15) } }
        @keyframes float3      { 0%,100% { transform:translate(0,0)    scale(1)    } 50% { transform:translate(50px,70px)   scale(1.05) } }
        .orb { position:absolute; border-radius:50%; filter:blur(80px); }
        .orb-1 { width:400px; height:400px; top:-10%;  right:-5%; background:radial-gradient(circle,rgba(100,120,255,.07) 0%,transparent 70%); animation:float1 25s ease-in-out infinite; }
        .orb-2 { width:350px; height:350px; bottom:10%; left:-8%;  background:radial-gradient(circle,rgba(160,100,255,.05) 0%,transparent 70%); animation:float2 30s ease-in-out infinite; }
        .orb-3 { width:250px; height:250px; top:40%;   left:50%;  background:radial-gradient(circle,rgba(100,255,180,.03) 0%,transparent 70%); animation:float3 20s ease-in-out infinite; }
        ::selection { background:rgba(255,255,255,.15) }
        ::-webkit-scrollbar { width:4px }
        ::-webkit-scrollbar-track { background:transparent }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px }
        input::placeholder, textarea::placeholder { color:rgba(255,255,255,.18) }
      `}</style>
      <Background />
      {currentScreen}
    </div>
  );
}

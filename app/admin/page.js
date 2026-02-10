"use client";

import { useEffect, useMemo, useState } from "react";

const MESSAGES = {
  en: {
    badgeLabel: "Admin",
    title: "Admin Codes",
    subtitle: "Live list of recent codes for all recipients.",
    statusSearching: "Scanning inbox...",
    statusWaiting: "Waiting for new codes...",
    statusError: "Unable to reach the server.",
    statusUnauthorized: "Unauthorized. Check your password.",
    resultsTitle: "All Results",
    checkedAtLabel: "Checked at",
    emptyDefault: "No codes found in the lookback window.",
    langLabel: "العربية",
    adminPassword: "Admin password",
    enterPassword: "Enter password",
    unlock: "Unlock",
    minutesAgo: (n) => `${n} minutes ago`,
    unknownTime: "Unknown time",
    unknownRecipient: "Unknown recipient",
    copyBtn: "Copy",
    copiedBtn: "Copied!",
  },
  ar: {
    badgeLabel: "لوحة التحكم",
    title: "لوحة الأكواد",
    subtitle: "قائمة مباشرة بالرموز الحديثة لكل المستلمين.",
    statusSearching: "جارٍ فحص البريد...",
    statusWaiting: "بانتظار رموز جديدة...",
    statusError: "تعذر الاتصال بالخادم.",
    statusUnauthorized: "غير مصرح. تحقق من كلمة المرور.",
    resultsTitle: "كل النتائج",
    checkedAtLabel: "تم الفحص في",
    emptyDefault: "لا توجد رموز ضمن المدة المحددة.",
    langLabel: "English",
    adminPassword: "كلمة مرور المسؤول",
    enterPassword: "أدخل كلمة المرور",
    unlock: "دخول",
    minutesAgo: (n) => `منذ ${n} دقيقة`,
    unknownTime: "وقت غير معروف",
    unknownRecipient: "مستلم غير معروف",
    copyBtn: "نسخ",
    copiedBtn: "تم النسخ!",
  },
};

function itemTimestamp(item) {
  if (item.timestamp) {
    return Number(item.timestamp) * 1000;
  }
  if (item.time) {
    const parsed = Date.parse(item.time);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function minutesAgo(value) {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return null;
  }
  const diffMs = Date.now() - time;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  return minutes;
}

export default function AdminPage() {
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState(MESSAGES.en.statusSearching);
  const [statusType, setStatusType] = useState("");
  const [checkedAt, setCheckedAt] = useState("");
  const [items, setItems] = useState([]);
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const currentLang = MESSAGES[lang] || MESSAGES.en;
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const isRTL = lang === "ar";

  const statusClass = useMemo(() => {
    if (!statusType) {
      return "status";
    }
    return `status ${statusType}`;
  }, [statusType]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!authorized) {
        return;
      }
      setStatusType("");
      setStatus(currentLang.statusSearching);
      try {
        const response = await fetch("/api/admin/codes");
        const data = await response.json();
        if (!active) {
          return;
        }
        if (!response.ok) {
          setStatusType("error");
          setStatus(
            response.status === 401
              ? currentLang.statusUnauthorized
              : data.error || currentLang.statusError
          );
          setAuthorized(false);
          return;
        }
        const sortedItems = (data.items || [])
          .slice()
          .sort((a, b) => itemTimestamp(b) - itemTimestamp(a));
        setItems(sortedItems);
        setCheckedAt(data.checkedAt || "");
        setStatusType("success");
        setStatus(currentLang.statusWaiting);
      } catch {
        if (!active) {
          return;
        }
        setStatusType("error");
        setStatus(currentLang.statusError);
      }
    }

    load();
    const timer = setInterval(load, 8000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [
    authorized,
    currentLang.statusError,
    currentLang.statusSearching,
    currentLang.statusWaiting,
  ]);

  function handleUnlock(event) {
    event.preventDefault();
    if (!password.trim()) {
      return;
    }
    setStatusType("");
    setStatus(currentLang.statusSearching);
    fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        setAuthorized(true);
        setStatusType("success");
        setStatus(currentLang.statusWaiting);
      })
      .catch(() => {
        setStatusType("error");
        setStatus(currentLang.statusUnauthorized);
        setAuthorized(false);
      });
  }

  useEffect(() => {
    let active = true;
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/codes");
        if (!active) {
          return;
        }
        if (response.ok) {
          setAuthorized(true);
          setStatusType("success");
          setStatus(currentLang.statusWaiting);
        } else {
          setAuthorized(false);
        }
      } catch {
        if (!active) {
          return;
        }
        setAuthorized(false);
      }
    }
    checkSession();
    return () => {
      active = false;
    };
  }, [currentLang.statusWaiting]);

  function handleCopy(code, index) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }

  return (
    <div
      className={isRTL ? "app-rtl" : "app-ltr"}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="ambient">
        <div className="halo"></div>
        <div className="ribbon"></div>
      </div>

      <main className="page">
        <header className="hero">
          <div className="hero-top">
            <div className="badge">{currentLang.badgeLabel}</div>
            <button
              type="button"
              className="lang-toggle"
              onClick={() => setLang((prev) => (prev === "en" ? "ar" : "en"))}
            >
              <span className="lang-toggle-icon">🌐</span>
              {currentLang.langLabel}
            </button>
          </div>
          <h1>{currentLang.title}</h1>
          <p>{currentLang.subtitle}</p>
        </header>

        <section className="card">
          {!authorized ? (
            <form className="form" onSubmit={handleUnlock}>
              <label htmlFor="admin-password">
                {currentLang.adminPassword}
              </label>
              <input
                id="admin-password"
                name="admin-password"
                type="password"
                placeholder={currentLang.enterPassword}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="submit" className="primary-button">
                {currentLang.unlock}
              </button>
              <div className={statusClass}>{status}</div>
            </form>
          ) : (
            <div className={statusClass}>{status}</div>
          )}

          <div className="results">
            <div className="results-header">
              <span>{currentLang.resultsTitle}</span>
              <span>
                {checkedAt
                  ? `${currentLang.checkedAtLabel} ${new Date(
                    checkedAt
                  ).toLocaleTimeString(locale)}`
                  : ""}
              </span>
            </div>
            <div className="result-content">
              {items.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📬</span>
                  <span>{currentLang.emptyDefault}</span>
                </div>
              ) : (
                <div className="result-list">
                  {items.map((item, index) => (
                    <div className="result-row" key={`${item.code}-${index}`}>
                      <div className="result-meta">
                        <span className="result-meta-time">
                          {item.time
                            ? currentLang.minutesAgo(
                              minutesAgo(item.time) ?? 0
                            )
                            : currentLang.unknownTime}
                        </span>
                        <span className="result-meta-divider">|</span>
                        <span className="result-meta-sender">
                          {item.to || currentLang.unknownRecipient}
                        </span>
                      </div>
                      <div className="result-code-row">
                        <div className="result-code" dir="ltr">
                          {item.code}
                        </div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopy(item.code, index)}
                        >
                          {copiedIndex === index
                            ? currentLang.copiedBtn
                            : currentLang.copyBtn}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

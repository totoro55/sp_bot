const REQUIRED_ENV = ["BOT_TOKEN", "CRM_URL", "CRM_API_KEY", "CRM_PASSWORD", "CRM_USER"] as const;

const DEFAULT_TELEGRAM_PROXY = "http://mow2-it-proxy-haproxy.partner.ru:3128";

export function assertRuntimeEnv(): void {
    const missing = REQUIRED_ENV.filter((name) => !process.env[name]?.trim());
    if (missing.length > 0) {
        throw new Error(`Не заданы переменные окружения: ${missing.join(", ")}`);
    }
}

export function telegramProxyUrl(): string | undefined {
    const raw = process.env.TELEGRAM_PROXY_URL?.trim();
    if (raw === "none") {
        return undefined;
    }
    return raw || DEFAULT_TELEGRAM_PROXY;
}

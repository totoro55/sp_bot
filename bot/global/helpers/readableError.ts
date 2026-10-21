const readableError = (error: unknown): string => {
    const message = error instanceof Error ? error.message.trim() : "";
    if (!message || message === "{}" || message.length > 200) {
        return "Обратитесь к ответственным сотрудникам — Admins.Southproject@dns-shop.ru";
    }
    return message;
};

export {readableError};

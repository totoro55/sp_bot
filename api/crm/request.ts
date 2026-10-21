type CrmResponse = {
    status?: string;
    data?: unknown;
    error_message?: string;
};

export async function crmPost(params: unknown): Promise<Response> {
    const url = process.env.CRM_URL?.trim();
    if (!url) {
        throw new Error("Не задана переменная окружения CRM_URL");
    }

    return fetch(url, {
        method: "POST",
        body: JSON.stringify(params),
        keepalive: false,
    });
}

export async function crmPostSuccess<T>(params: unknown): Promise<T> {
    const res = await crmPost(params);
    const body = await res.json() as CrmResponse;

    if (res.status !== 200) {
        throw new Error("Ошибка сервера");
    }

    if (body.status == "success") {
        return body.data as T;
    }

    if (body.status == "error") {
        throw new Error(body.error_message);
    }

    throw new Error("Ошибка сервера");
}

type CrmResult = {
    status: "success" | "error";
    message: string;
};

const crmResult = async (
    action: () => Promise<unknown>,
    successMessage: string,
    emptyMessage: string,
): Promise<CrmResult> => {
    try {
        const result = await action();
        if (result) {
            return {status: "success", message: successMessage};
        }
        return {status: "error", message: emptyMessage};
    } catch (error) {
        if (error instanceof Error) {
            return {status: "error", message: error.message};
        }
        return {status: "error", message: "Произошла неизвестная ошибка."};
    }
};

const crmQuery = async <T>(action: () => Promise<T>): Promise<T> => {
    try {
        return await action();
    } catch (error) {
        const message = error instanceof Error ? error.message : JSON.stringify(error);
        throw new Error(message);
    }
};

export {crmQuery, crmResult};
export type {CrmResult};

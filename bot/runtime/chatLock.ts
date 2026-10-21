import {Context, Middleware} from "grammy";

const tails = new Map<number, Promise<unknown>>();

const withChatLock = <T>(chatId: number, task: () => Promise<T>): Promise<T> => {
    const previous = tails.get(chatId) ?? Promise.resolve();
    const run = previous.then(task, task);
    tails.set(chatId, run.then(() => undefined, () => undefined));
    return run;
};

const chatLock = (): Middleware<Context> => async (ctx, next) => {
    if (!ctx.chatId) return next();
    await withChatLock(ctx.chatId, async () => {
        await next();
    });
};

export {chatLock, withChatLock};

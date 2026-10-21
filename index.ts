import bot from "./bot";

const shutdown = (signal: string) => {
    console.log(`Получен ${signal}, останавливаю бота`);
    bot.stop().finally(() => {
        process.exit(0);
    });
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

bot.start({
    onStart: (info) => {
        console.log(`Бот запущен: @${info.username}`);
    },
}).catch((error: unknown) => {
    console.error("Бот остановился с ошибкой:", error);
    process.exit(1);
});

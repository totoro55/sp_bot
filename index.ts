import bot from "./bot";

const start = async () => {
    try {
        await bot.api.setMyCommands([
            { command: "start", description: "Запуск бота. Возврат " },
            { command: "help", description: "Show help text" },
        ])

        await bot.start()
    } catch (e) {
        console.log(e)
    }
}

start();
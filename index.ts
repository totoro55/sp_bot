import bot from "./bot";

const start = async () => {
    try {
        await bot.start()
    } catch (e) {
        console.log(e)
    }
}

start();
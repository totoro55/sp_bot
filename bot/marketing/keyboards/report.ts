import {Keyboard} from "grammy";

const chooseFilialKeyboard = new Keyboard()
    .text("Выбор филиала").row()
    .text("Назад в меню").resized();

const marketingMenuKeyboard = new Keyboard()
    .text("Отчеты о рекламных конструкциях").row()
    .text("Видеоинструкция").row()
    .text("Назад в меню").resized();

const filialActionsKeyboard = new Keyboard()
    .text("Заполнение отчета о РК").row()
    .text("Выбор филиала").row()
    .text("Назад в меню").resized();

const reportActionsKeyboard = new Keyboard()
    .text("Выбрать рекламную конструкцию").row()
    .text("Назад в меню").resized();

const choosePeriodKeyboard = new Keyboard()
    .text("Выбрать другой период").row()
    .text("Назад в меню").resized();

const changeStructureOrPeriodKeyboard = new Keyboard()
    .text("Выбрать рекламную конструкцию").row()
    .text("Выбрать другой период").row()
    .text("Назад в меню").resized();

const continueReportKeyboard = new Keyboard()
    .text("Заполнение отчета о РК").row()
    .text("Назад в меню").resized();

const backToMenuKeyboard = new Keyboard()
    .text("Назад в меню").resized();

const addFilesKeyboard = (finishLabel: string) => new Keyboard()
    .text(finishLabel).row()
    .text("Отменить создание отчета").resized();

const structureReportKeyboard = (hasReport: boolean) => {
    const keyboard = new Keyboard();
    if (hasReport) {
        keyboard
            .text("Редактировать отчет").row()
            .text("Добавить фото/видео к отчету").row();
    } else {
        keyboard.text("Заполнить отчет").row();
    }
    return keyboard
        .text("Выбрать рекламную конструкцию").row()
        .text("Выбрать другой период").row()
        .text("Назад в меню").resized();
};

export {
    addFilesKeyboard,
    backToMenuKeyboard,
    changeStructureOrPeriodKeyboard,
    chooseFilialKeyboard,
    choosePeriodKeyboard,
    continueReportKeyboard,
    filialActionsKeyboard,
    marketingMenuKeyboard,
    reportActionsKeyboard,
    structureReportKeyboard,
};

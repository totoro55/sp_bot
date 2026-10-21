import {Keyboard} from "grammy";

const chooseFilialKeyboard = new Keyboard()
    .text("Выбор филиала").row()
    .text("Назад в меню").row();

const marketingMenuKeyboard = new Keyboard()
    .text("Отчеты о рекламных конструкциях").row()
    .text("Видеоинструкция").row()
    .text("Назад в меню").row();

const filialActionsKeyboard = new Keyboard()
    .text("Заполнение отчета о РК").row()
    .text("Выбор филиала").row()
    .text("Назад в меню").row();

const reportActionsKeyboard = new Keyboard()
    .text("Выбрать рекламную конструкцию").row()
    .text("Назад в меню").row();

const choosePeriodKeyboard = new Keyboard()
    .text("Выбрать другой период").row()
    .text("Назад в меню").row();

const changeStructureOrPeriodKeyboard = new Keyboard()
    .text("Выбрать рекламную конструкцию").row()
    .text("Выбрать другой период").row()
    .text("Назад в меню").row();

const continueReportKeyboard = new Keyboard()
    .text("Заполнение отчета о РК").row()
    .text("Назад в меню").row();

const backToMenuKeyboard = new Keyboard()
    .text("Назад в меню").row();

const addFilesKeyboard = (finishLabel: string) => new Keyboard()
    .text(finishLabel).row()
    .text("Отменить создание отчета").row();

const structureReportKeyboard = (hasReport: boolean) => {
    const keyboard = new Keyboard();
    if (hasReport) {
        keyboard
            .text("Редактировать отчет").row()
            .text("Добавить фото/видео к имеющемуся отчету").row();
    } else {
        keyboard.text("Заполнить отчет").row();
    }
    return keyboard
        .text("Выбрать рекламную конструкцию").row()
        .text("Выбрать другой период").row()
        .text("Назад в меню").row();
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

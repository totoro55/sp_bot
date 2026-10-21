import {InlineKeyboard} from "grammy";
import {MyContext} from "../../types/global/myContext";
import {startKeyboard} from "../global/keyboards/start";
import {
    isVideoUpload,
    maxUploadBytes,
    MIN_REPORT_FILE_BYTES,
    SEND_FILE_HINT,
} from "../../config/filesConfig";
import {acceptedFileText} from "./helpers/reportContext";
import {reportFileCount} from "./helpers/reportPhotoUrls";
import {createFileId} from "./helpers/fileIds";
import {telegramFileName} from "./upload/fileName";
import {filialActionsKeyboard, structureReportKeyboard} from "./keyboards/report";

const acceptReportFile = async (ctx: MyContext): Promise<void> => {
    const draft = ctx.session.marketing_report;
    if (!draft) {
        await ctx.reply("Сейчас отчет не заполняется. Выберите конструкцию и начните отчет, затем отправьте фото как файл.", {
            reply_markup: ctx.session.selected_filial ? filialActionsKeyboard : startKeyboard,
        });
        return;
    }
    if (!draft.acceptFiles) {
        await ctx.reply(draft.reportId
            ? "Сначала отредактируйте отчет или нажмите «Добавить фото/видео к отчету». Фото и видео можно отправить после этого."
            : "Сначала заполните отчет. Фото и видео можно отправить после этого шага.", {
            reply_markup: structureReportKeyboard(Boolean(draft.reportId)),
        });
        return;
    }
    if (!ctx.message) return;

    if (ctx.message?.photo) {
        await ctx.reply(`Файл отправлен неправильно. ${SEND_FILE_HINT}`);
        return;
    }
    const mediaType = /video|image/i;
    const fileName = ctx.message.document?.file_name || ctx.message.video?.file_name;
    const mimeType = ctx.message.document?.mime_type || ctx.message.video?.mime_type;
    const namedHeif = /\.hei[cf]$/i.test(fileName || "") || /heic|heif/i.test(mimeType || "");

    if ((ctx.message.document || ctx.message.video) && !mediaType.test(mimeType || "") && !namedHeif) {
        await ctx.reply(`Файл ${fileName} не принят, так как не является изображением или видео.\n${SEND_FILE_HINT}`);
        return;
    }

    const file = await ctx.getFile();
    const video = isVideoUpload(fileName, mimeType, Boolean(ctx.message.video));
    const maxBytes = maxUploadBytes(video);
    if (file.file_size && file.file_size < MIN_REPORT_FILE_BYTES) {
        await ctx.reply(`Размер файла не должен быть меньше 1 МБ.\n\n${SEND_FILE_HINT}`, {
            reply_parameters: {message_id: ctx.message.message_id},
        });
        return;
    }
    if (file.file_size && file.file_size > maxBytes) {
        const hint = video
            ? "Можно отправить видео со сжатием или отредактировать его перед отправкой."
            : "Отправьте фото как файл, без сжатия.";
        await ctx.reply(`Размер ${video ? "видео" : "фото"} не должен превышать 20 МБ. ${hint}\n\n${SEND_FILE_HINT}`, {
            reply_parameters: {message_id: ctx.message.message_id},
        });
        return;
    }

    const fileId = createFileId();
    ctx.session.marketing_report = {
        ...draft,
        newFiles: [...(draft.newFiles ?? []), {
            fileId,
            telegramFileId: file.file_id,
            fileName: telegramFileName(fileName, mimeType),
            sourceMessageId: ctx.message.message_id,
            video,
        }],
    };
    await ctx.reply(acceptedFileText(reportFileCount(ctx)), {
        reply_parameters: {message_id: ctx.message.message_id},
        reply_markup: new InlineKeyboard().text("Удалить этот файл", `delete_file_${fileId}`),
    });
    try {
        await ctx.react("👍");
    } catch (error) {
        console.log(error);
    }
};

export {acceptReportFile};

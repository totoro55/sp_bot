export const MAX_PHOTO_SIZE_IN_BYTES = 2000000;

export const MIN_REPORT_FILE_BYTES = 1000000;
export const MAX_PHOTO_FILE_BYTES = 20000000;
export const MAX_VIDEO_FILE_BYTES = 20000000;

const VIDEO_FILE_NAME = /\.(mp4|mov|m4v|webm|avi|mkv)$/i;

const isVideoUpload = (fileName?: string, mimeType?: string, videoMessage = false): boolean => {
    if (videoMessage) return true;
    if (mimeType?.toLowerCase().startsWith("video/")) return true;
    return VIDEO_FILE_NAME.test(fileName || "");
};

const maxUploadBytes = (video: boolean): number => video ? MAX_VIDEO_FILE_BYTES : MAX_PHOTO_FILE_BYTES;

export const REPORT_FILE_RULES =
    "Минимальный размер файла - 1 МБ\nМаксимальный размер файла - 20 МБ.\n\n" +
    "Фото отправляйте без сжатия, как файл. Видео можно отправлять со сжатием.";

export const ADD_REPORT_FILES_PROMPT =
    "Добавьте фото/видео, отображающие состояние конструкции.\n" + REPORT_FILE_RULES;

export const NEED_REPORT_FILE_PROMPT =
    "Необходимо добавить как минимум 1 фото/видео, отображающие состояние конструкции.\n" + REPORT_FILE_RULES;

export const SEND_FILE_HINT =
    "Фото должны быть отправлены как файл, без сжатия.\nВидео можно отправить со сжатием.\n\n" +
    "Размер файла: от 1 МБ до 20 МБ.\n\n" +
    "После загрузки всех файлов нажмите \"Завершить добавление файлов\".";

export {isVideoUpload, maxUploadBytes};

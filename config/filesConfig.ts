export const MAX_PHOTO_SIZE_IN_BYTES = 2000000;

export const MIN_REPORT_FILE_BYTES = 1000000;
export const MAX_REPORT_FILE_BYTES = 20000000;

export const REPORT_FILE_RULES =
    "Минимальный размер файла - 1 МБ\nМаксимальный размер файла - 20 МБ.\n\n" +
    "Для корректной отправки необходимо отправлять фото без сжатия, как файлы. Видео можно отправлять со сжатием.";

export const ADD_REPORT_FILES_PROMPT =
    "Добавьте фото/видео, отображающие состояние конструкции.\n" + REPORT_FILE_RULES;

export const NEED_REPORT_FILE_PROMPT =
    "Необходимо добавить как минимум 1 фото/видео, отображающие состояние конструкции.\n" + REPORT_FILE_RULES;

export const SEND_FILE_HINT =
    "Фото должны быть отправлены как файл, без сжатия.\nВидео можно отправить со сжатием.\n\nПосле загрузки всех файлов нажмите \"Завершить добавление файлов\".";

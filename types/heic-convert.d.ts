declare module "heic-convert" {
    type HeicFormat = "JPEG" | "PNG";

    type HeicConvertOptions = {
        buffer: Buffer | Uint8Array;
        format: HeicFormat;
        quality?: number;
    };

    function convert(options: HeicConvertOptions): Promise<ArrayBuffer>;

    export default convert;
}

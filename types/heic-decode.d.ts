declare module "heic-decode" {
    type DecodedHeif = {
        width: number;
        height: number;
        data: Uint8ClampedArray;
    };

    type HeifImage = {
        width: number;
        height: number;
        decode: () => Promise<DecodedHeif>;
    };

    type HeifImageList = HeifImage[] & {dispose: () => void};

    function decode(options: {buffer: Buffer | Uint8Array}): Promise<DecodedHeif>;

    namespace decode {
        function all(options: {buffer: Buffer | Uint8Array}): Promise<HeifImageList>;
    }

    export default decode;
}

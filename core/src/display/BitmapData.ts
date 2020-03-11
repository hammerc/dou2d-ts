namespace dou2d {
    /**
     * 位图数据
     * @author wizardc
     */
    export class BitmapData {
        private static _map: Map<BitmapData, DisplayObject[]> = new Map();

        public static create(type: "arraybuffer", data: ArrayBuffer, callback?: (bitmapData: BitmapData) => void): BitmapData;
        public static create(type: "base64", data: string, callback?: (bitmapData: BitmapData) => void): BitmapData;
        public static create(type: "arraybuffer" | "base64", data: ArrayBuffer | string, callback?: (bitmapData: BitmapData) => void): BitmapData {
            let base64 = "";
            if (type === "arraybuffer") {
                base64 = Base64Util.encode(data as ArrayBuffer);
            }
            else {
                base64 = data as string;
            }
            let imageType = "image/png";
            if (base64.charAt(0) === "/") {
                imageType = "image/jpeg";
            }
            else if (base64.charAt(0) === "R") {
                imageType = "image/gif";
            }
            else if (base64.charAt(0) === "i") {
                imageType = "image/png";
            }
            let img = new Image();
            img.src = "data:" + imageType + ";base64," + base64;
            img.crossOrigin = "*";
            let bitmapData = new BitmapData(img);
            img.onload = function () {
                img.onload = undefined;
                bitmapData.source = img;
                bitmapData.height = img.height;
                bitmapData.width = img.width;
                if (callback) {
                    callback(bitmapData);
                }
            }
            return bitmapData;
        }

        public static addDisplayObject(displayObject: DisplayObject, bitmapData: BitmapData): void {
            if (!BitmapData._map.has(bitmapData)) {
                BitmapData._map.set(bitmapData, [displayObject]);
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            if (list.indexOf(displayObject) < 0) {
                list.push(displayObject);
            }
        }

        public static removeDisplayObject(displayObject: DisplayObject, bitmapData: BitmapData): void {
            if (!BitmapData._map.has(bitmapData)) {
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            let index = list.indexOf(displayObject);
            if (index >= 0) {
                list.splice(index, 1);
            }
        }

        public static invalidate(bitmapData: BitmapData): void {
            if (!BitmapData._map.has(bitmapData)) {
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            for (let i = 0; i < list.length; i++) {
                if (list[i] instanceof Bitmap) {
                    (<Bitmap>list[i]).$refreshImageData();
                }
                let bitmap = list[i];
                bitmap.$renderDirty = true;
                let p = bitmap.parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = bitmap.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
        }

        public static dispose(bitmapData: BitmapData): void {
            if (!BitmapData._map.has(bitmapData)) {
                return;
            }
            let list = BitmapData._map.get(bitmapData);
            for (let node of list) {
                if (node instanceof Bitmap) {
                    node.$bitmapData = null;
                }
                node.$renderDirty = true;
                let p = node.parent;
                if (p && !p.$cacheDirty) {
                    p.$cacheDirty = true;
                    p.$cacheDirtyUp();
                }
                let maskedObject = node.$maskedObject;
                if (maskedObject && !maskedObject.$cacheDirty) {
                    maskedObject.$cacheDirty = true;
                    maskedObject.$cacheDirtyUp();
                }
            }
            BitmapData._map.delete(bitmapData);
        }

        /**
         * 宽度
         */
        public width: number;

        /**
         * 高度
         */
        public height: number;

        /**
         * 原始图像
         */
        public source: any;

        /**
         * 对应的贴图
         */
        public webGLTexture: any;

        /**
         * webgl纹理生成后，是否删掉原始图像数据
         */
        public deleteSource: boolean = true;

        public constructor(source: any) {
            this.source = source;
            this.source = source;
            if (this.source) {
                this.width = +source.width;
                this.height = +source.height;
            }
        }

        public dispose(): void {
            if (this.webGLTexture) {
                WebGLUtil.deleteTexture(this.webGLTexture);
                this.webGLTexture = null;
            }
            if (this.source && this.source.dispose) {
                this.source.dispose();
            }
            if (this.source && this.source.src) {
                this.source.src = "";
            }
            this.source = null;
            BitmapData.dispose(this);
        }
    }
}

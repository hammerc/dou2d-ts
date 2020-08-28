namespace dou2d {
    /**
     * 图片加载器
     * @author wizardc
     */
    export class ImageAnalyzer implements dou.IAnalyzer {
        public load(url: string, callback: (url: string, data: any) => void, thisObj: any): void {
            let loader = new dou.ImageLoader();
            loader.crossOrigin = true;
            loader.on(dou.Event.COMPLETE, () => {
                callback.call(thisObj, url, this.createTexture(loader.data));
            });
            loader.on(dou.IOErrorEvent.IO_ERROR, () => {
                callback.call(thisObj, url);
            });
            loader.load(url);
        }

        private createTexture(img: HTMLImageElement): Texture {
            let bitmapData = new BitmapData(img);
            let texture = new Texture();
            texture.$setBitmapData(bitmapData);
            return texture;
        }

        public release(url: string, data: Texture): boolean {
            if (data) {
                data.dispose();
                return true;
            }
            return false;
        }
    }
}

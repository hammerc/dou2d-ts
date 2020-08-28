namespace dou2d {
    /**
     * 位图字体加载器
     * @author wizardc
     */
    export class FontAnalyzer implements dou.IAnalyzer {
        public load(url: string, callback: (url: string, data: any) => void, thisObj: any): void {
            let jsonAnalyzer = new dou.JsonAnalyzer();
            jsonAnalyzer.load(url, (url, data: SheetConfig) => {
                if (data) {
                    let imageAnalyzer = new dou2d.ImageAnalyzer();
                    imageAnalyzer.load(HtmlUtil.getRelativePath(url, data.file), (url, texture: Texture) => {
                        if (texture) {
                            callback.call(thisObj, url, this.createFont(data, texture));
                        }
                        else {
                            callback.call(thisObj, url);
                        }
                    }, this);
                }
                else {
                    callback.call(thisObj, url);
                }
            }, this);
        }

        private createFont(data: SheetConfig, texture: Texture): BitmapFont {
            return new BitmapFont(texture, data.frames);
        }

        public release(url: string, data: BitmapFont): boolean {
            if (data) {
                data.dispose();
                return true;
            }
            return false;
        }
    }
}

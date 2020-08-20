namespace dou2d {
    /**
     * 图集加载器
     * @author wizardc
     */
    export class SheetAnalyzer implements dou.IAnalyzer {
        public load(url: string, callback: (url: string, data: any) => void, thisObj: any): void {
            let jsonAnalyzer = new dou.JsonAnalyzer();
            jsonAnalyzer.load(url, (url, data: SheetConfig) => {
                if (data) {
                    let imageAnalyzer = new dou2d.ImageAnalyzer();
                    imageAnalyzer.load(HtmlUtil.getRelativePath(url, data.file), (url, texture: Texture) => {
                        if (texture) {
                            callback.call(thisObj, url, this.createSheet(data, texture));
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

        private createSheet(data: SheetConfig, texture: Texture): SpriteSheet {
            let frames = data.frames;
            let sheet = new SpriteSheet(texture);
            for (let name in frames) {
                let frame = frames[name];
                sheet.createTexture(name, frame.x, frame.y, frame.w, frame.h, frame.offX, frame.offY, frame.sourceW, frame.sourceH);
            }
            return sheet;
        }

        public release(data: SpriteSheet): boolean {
            if (data) {
                data.dispose();
                return true;
            }
            return false;
        }
    }
}

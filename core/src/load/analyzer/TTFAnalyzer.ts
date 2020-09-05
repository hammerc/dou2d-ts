namespace dou2d {
    /**
     * TrueTypeFont 字体加载器
     * @author wizardc
     */
    export class TTFAnalyzer implements dou.IAnalyzer {
        public load(url: string, callback: (url: string, data: any) => void, thisObj: any): void {
            let bytesAnalyzer = new dou.BytesAnalyzer();
            bytesAnalyzer.load(url, (url, data: dou.ByteArray) => {
                if (data) {
                    $2d.fontResMap[url] = data.rawBuffer;
                    callback.call(thisObj, url, data);
                }
                else {
                    callback.call(thisObj, url);
                }
            }, this);
        }

        public release(url: string, data: dou.ByteArray): boolean {
            delete $2d.fontResMap[url];
            return true;
        }
    }
}

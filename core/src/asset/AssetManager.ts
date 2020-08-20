namespace dou2d {
    /**
     * 资源管理器
     * * 提供资源配置文件, 通过该文件可以方便的使用一个简单的名称来指定特定的资源而不使用资源的路径
     * * 使用该管理器需要保证资源名称的唯一性
     * * 支持获取图集中的某个图片资源
     * @author wizardc
     */
    export class AssetManager {
        private static _instance: AssetManager;

        public static get instance(): AssetManager {
            return AssetManager._instance || (AssetManager._instance = new AssetManager());
        }

        private _itemMap: { [name: string]: ConfigItem };
        private _sheetLoadingMap: { [name: string]: { source: string, callBack: (data: any, source: string) => void, thisObject: any }[] };

        private constructor() {
            this._itemMap = {};
            this._sheetLoadingMap = {};
        }

        public $init(): void {
            dou.loader.registerAnalyzer(AssetType.text, new dou.TextAnalyzer());
            dou.loader.registerExtension("txt", AssetType.text);
            dou.loader.registerExtension("xml", AssetType.text);
            dou.loader.registerAnalyzer(AssetType.json, new dou.JsonAnalyzer());
            dou.loader.registerExtension("json", AssetType.json);
            dou.loader.registerAnalyzer(AssetType.binary, new dou.BytesAnalyzer());
            dou.loader.registerExtension("bin", AssetType.binary);
            dou.loader.registerAnalyzer(AssetType.image, new dou2d.ImageAnalyzer());
            dou.loader.registerExtension("jpg", AssetType.image);
            dou.loader.registerExtension("jpeg", AssetType.image);
            dou.loader.registerExtension("png", AssetType.image);
            dou.loader.registerExtension("webp", AssetType.image);
            dou.loader.registerAnalyzer(AssetType.sound, new dou.SoundAnalyzer());
            dou.loader.registerExtension("mp3", AssetType.sound);
            dou.loader.registerExtension("wav", AssetType.sound);
            dou.loader.registerExtension("ogg", AssetType.sound);
            dou.loader.registerAnalyzer(AssetType.sheet, new dou2d.SheetAnalyzer());
        }

        /**
         * 加载配置
         */
        public loadConfig(url: string, resourceRoot?: string, callback?: (success: boolean) => void, thisObj?: any): void {
            dou.loader.load(url, (data, url) => {
                if (data) {
                    this.addConfig(data, resourceRoot);
                    if (callback) {
                        callback.call(thisObj, true);
                    }
                }
                else {
                    console.error(`资源配置文件加载失败: ${url}`);
                    callback.call(thisObj, false);
                }
            }, this, AssetType.json);
        }

        /**
         * 加载配置
         */
        public loadConfigAsync(url: string, resourceRoot?: string): Promise<void> {
            return new Promise<any>((resolve: (value?: void) => void, reject: (reason?: any) => void) => {
                this.loadConfig(url, resourceRoot, (success) => {
                    if (success) {
                        resolve();
                    }
                    else {
                        reject();
                    }
                }, this);
            });
        }

        /**
         * 添加配置
         */
        public addConfig(config: AssetConfigItem[], resourceRoot?: string): void {
            for (let item of config) {
                if (DEBUG && this._itemMap[item.name]) {
                    console.warn(`资源名称已存在: ${item.name}`);
                }
                this._itemMap[item.name] = {
                    name: item.name,
                    type: item.type,
                    root: resourceRoot,
                    url: item.url,
                    subkeys: item.subkeys
                };
            }
        }

        /**
         * 资源是否存在
         */
        public hasRes(source: string): boolean {
            return this._itemMap.hasOwnProperty(source);
        }

        /**
         * 资源是否已经加载
         */
        public isLoaded(source: string): boolean {
            let item = this.getItem(source);
            if (!item) {
                return false;
            }
            let url = this.getRealPath(item);
            return dou.loader.isLoaded(url);
        }

        private getItem(source: string): ConfigItem {
            if (source.indexOf(".") == -1) {
                return this._itemMap[source];
            }
            return this._itemMap[source.split(".")[0]];
        }

        private getRealPath(item: ConfigItem): string {
            return (item.root || "") + item.url;
        }

        /**
         * 加载资源
         */
        public loadRes(source: string, priority?: number, callBack?: (data: any, source: string) => void, thisObject?: any): void {
            let item = this.getItem(source);
            if (!item) {
                callBack.call(thisObject, null, source);
                return;
            }
            let realPath = this.getRealPath(item);
            let sheetInfo = this.getSheetInfo(source);
            if (sheetInfo) {
                if (dou.loader.isLoaded(realPath)) {
                    let sheet = dou.loader.get(realPath) as SpriteSheet;
                    callBack.call(thisObject, sheet.getTexture(sheetInfo.frame), source);
                }
                else {
                    if (!this._sheetLoadingMap[realPath]) {
                        this._sheetLoadingMap[realPath] = [];
                        dou.loader.load(realPath, this.onSheetLoaded, this, item.type, priority);
                    }
                    this._sheetLoadingMap[realPath].push({ source, callBack, thisObject });
                }
            }
            else {
                dou.loader.load(realPath, (data, url) => {
                    callBack.call(thisObject, data, source);
                }, this, item.type, priority);
            }
        }

        private getSheetInfo(source: string): SheetInfo {
            if (source.indexOf(".") == -1) {
                return null;
            }
            let items = source.split(".");
            return { file: items[0] + "_json", frame: items[1] };
        }

        private onSheetLoaded(data: SpriteSheet, url: string): void {
            let callBackList = this._sheetLoadingMap[url];
            delete this._sheetLoadingMap[url];
            for (let item of callBackList) {
                item.callBack.call(item.thisObject, data ? data.getTexture(item.source.split(".")[1]) : null, item.source);
            }
        }

        /**
         * 加载资源
         */
        public loadResAsync(source: string, priority?: number): Promise<any> {
            return new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
                this.loadRes(source, priority, (data, source) => {
                    resolve(data);
                }, this);
            });
        }

        /**
         * 获取已经加载的资源项
         */
        public getRes(source: string): any {
            let item = this.getItem(source);
            if (!item) {
                return null;
            }
            let realPath = this.getRealPath(item);
            let sheetInfo = this.getSheetInfo(source);
            if (sheetInfo) {
                let sheet = dou.loader.get(realPath) as SpriteSheet;
                if (sheet) {
                    return sheet.getTexture(sheetInfo.frame);
                }
                return null;
            }
            return dou.loader.get(realPath);
        }

        /**
         * 加载资源组
         */
        public loadGroup(sources: string[], priority?: number, callback?: (current: number, total: number, data: any, source: string) => void, thisObj?: any): void {
            let current = 0, total = sources.length;
            let itemCallback = (data: any, source: string) => {
                current++;
                callback.call(thisObj, current, total, data, source);
            };
            for (let source of sources) {
                this.loadRes(source, priority, itemCallback, this);
            }
        }

        /**
         * 加载资源组
         */
        public loadGroupAsync(sources: string[], priority?: number): Promise<void> {
            return new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
                this.loadGroup(sources, priority, (current, total, data, source) => {
                    if (current == total) {
                        resolve();
                    }
                }, this);
            });
        }

        /**
         * 销毁资源
         */
        public destroyRes(source: string): boolean {
            let item = this.getItem(source);
            if (!item) {
                return false;
            }
            let realPath = this.getRealPath(item);
            return dou.loader.release(realPath);
        }
    }

    interface SheetInfo {
        file: string;
        frame: string;
    }

    interface ConfigItem {
        name: string;
        type: AssetType;
        root: string;
        url: string;
        subkeys?: string[];
    }

    /**
     * 资源管理器快速访问
     */
    export const asset = AssetManager.instance;
}

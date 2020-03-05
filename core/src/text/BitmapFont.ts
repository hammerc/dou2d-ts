namespace dou2d {
    /**
     * 位图字体
     * @author wizardc
     */
    export class BitmapFont extends SpriteSheet {
        private _charList: { [key: string]: { x: number, y: number, w: number, h: number, offX: number, offY: number, sourceW: number, sourceH: number, xadvance: number } };
        private _firstCharHeight: number = 0;

        public constructor(texture: Texture, config: string | { [key: string]: { x: number, y: number, w: number, h: number, offX: number, offY: number, sourceW: number, sourceH: number, xadvance: number } }) {
            super(texture);
            if (typeof config == "string") {
                this._charList = JSON.parse(config);
            }
            else {
                this._charList = config;
            }
        }

        public getTexture(name: string): Texture {
            let texture = this._textureMap[name];
            if (!texture) {
                let c = this._charList[name];
                if (!c) {
                    return null;
                }
                texture = this.createTexture(name, c.x, c.y, c.w, c.h, c.offX, c.offY, c.sourceW, c.sourceH);
                this._textureMap[name] = texture;
            }
            return texture;
        }

        public getConfig(name: string, key: string): number {
            if (!this._charList[name]) {
                return 0;
            }
            return this._charList[name][key];
        }

        public getFirstCharHeight(): number {
            if (this._firstCharHeight == 0) {
                for (let str in this._charList) {
                    let c = this._charList[str];
                    if (c) {
                        let sourceH = c.sourceH;
                        if (sourceH === undefined) {
                            let h = c.h;
                            if (h === undefined) {
                                h = 0;
                            }
                            let offY = c.offY;
                            if (offY === undefined) {
                                offY = 0;
                            }
                            sourceH = h + offY;
                        }
                        if (sourceH <= 0) {
                            continue;
                        }
                        this._firstCharHeight = sourceH;
                        break;
                    }
                }
            }
            return this._firstCharHeight;
        }
    }
}

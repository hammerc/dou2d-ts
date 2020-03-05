namespace dou2d {
    /**
     * 播放器
     * @author wizardc
     */
    export class Player {
        private _screenDisplayList: DisplayList;

        private _stage: Stage;

        private _rootClass: any;
        private _root: DisplayObject;

        private _isPlaying: boolean = false;

        public constructor(buffer: RenderBuffer, stage: Stage, rootClass: any) {
            this._screenDisplayList = this.createDisplayList(stage, buffer);
            this._stage = stage;
            this._rootClass = rootClass;
        }

        private createDisplayList(stage: Stage, buffer: RenderBuffer): DisplayList {
            let displayList = new DisplayList(stage);
            displayList.renderBuffer = buffer;
            stage.$displayList = displayList;
            return displayList;
        }

        public start(): void {
            if (this._isPlaying) {
                return;
            }
            this._isPlaying = true;
            if (!this._root) {
                this.initialize();
            }
        }

        private initialize(): void {
            this._root = new this._rootClass();
            if (this._root instanceof DisplayObject) {
                this._stage.addChild(this._root);
            }
            else {
                console.error("Root class must inherit from dou2d.DisplayObject.");
            }
        }

        public pause(): void {
            if (!this._isPlaying) {
                return;
            }
            this._isPlaying = false;
        }

        /**
         * 渲染屏幕
         */
        public render(passedTime: number): void {
            let stage = this._stage;
            let t1 = dou.getTimer();
            let drawCalls = stage.$displayList.drawToSurface();
            let t2 = dou.getTimer();
            // TODO : FPS 等性能面板
        }

        /**
         * 更新舞台尺寸
         */
        public updateStageSize(stageWidth: number, stageHeight: number): void {
            let stage = this._stage;
            stage.$setStageSize(stageWidth, stageHeight);
            this._screenDisplayList.setClipRect(stageWidth, stageHeight);
            stage.dispatchEvent2D(Event2D.RESIZE);
        }
    }
}

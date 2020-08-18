namespace dou2d.sys {
    /**
     * 播放器
     * @author wizardc
     */
    export class Player {
        private _screenDisplayList: rendering.DisplayList;

        private _stage: Stage;

        private _rootClass: any;
        private _root: DisplayObject;

        private _isPlaying: boolean = false;

        public constructor(buffer: rendering.RenderBuffer, stage: Stage, rootClass: any) {
            this._screenDisplayList = this.createDisplayList(stage, buffer);
            this._stage = stage;
            this._rootClass = rootClass;
        }

        private createDisplayList(stage: Stage, buffer: rendering.RenderBuffer): rendering.DisplayList {
            let displayList = new rendering.DisplayList(stage);
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
                console.error(`根容器类必须继承自"dou2d.DisplayObject"`);
            }
        }

        public pause(): void {
            if (!this._isPlaying) {
                return;
            }
            this._isPlaying = false;
        }

        /**
         * 渲染
         */
        public render(passedTime: number): number {
            let stage = this._stage;
            let drawCalls = stage.$displayList.drawToSurface();
            return drawCalls;
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

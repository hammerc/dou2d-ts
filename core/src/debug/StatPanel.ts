namespace dou2d {
    /**
     * 简单的性能统计信息面板
     * * 推荐实际项目中自己实现该面板来统计更多有用的详细信息
     * @author wizardc
     */
    export class StatPanel extends DisplayObjectContainer {
        private _label: TextField;

        private _time: number = 0;
        private _frame: number = 0;
        private _drawCalls: number = 0;
        private _logicTime: number = 0;
        private _renderTime: number = 0;

        public constructor() {
            super();

            this._label = new TextField();
            this._label.text = "FPS: 0\rDraw: 0\rLogic: 0ms\rRender: 0ms";
            this._label.size = 20;
            this._label.textColor = 0xffffff;
            this._label.strokeColor = 0x000000;
            this._label.stroke = 1;
            this.addChild(this._label);

            sys.stat.setListener(this.receive, this);

            sys.stage.addChild(this);
        }

        private receive(logicTime: number, renderTime: number, drawCalls: number): void {
            this._time += Time.deltaTime;
            this._frame += 1;
            this._drawCalls += drawCalls;
            this._logicTime += logicTime;
            this._renderTime += renderTime;
            if (this._frame == sys.stage.frameRate) {
                let passedTime = this._time * 0.001;
                let fps = (this._frame / passedTime).toFixed(1);
                let draw = Math.ceil(this._drawCalls / this._frame);
                let logic = Math.ceil(this._logicTime / this._frame);
                let render = Math.ceil(this._renderTime / this._frame);
                this._label.text = `FPS: ${fps}\rDraw: ${draw}\rLogic: ${logic}ms\rRender: ${render}ms`;
                this._time = 0;
                this._frame = 0;
                this._drawCalls = 0;
                this._logicTime = 0;
                this._renderTime = 0;
            }
        }
    }
}

namespace dou2d {
    /**
     * 应用统计信息
     * @author wizardc
     */
    export class Stat {
        private _method: (logicTime: number, renderTime: number, drawCalls: number) => void;
        private _thisObj: any;

        public setListener(method: (logicTime: number, renderTime: number, drawCalls: number) => void, thisObj?: any): void {
            this._method = method;
            this._thisObj = thisObj;
        }

        public onFrame(logicTime: number, renderTime: number, drawCalls: number): void {
            if (this._method) {
                this._method.call(this._thisObj, logicTime, renderTime, drawCalls);
            }
        }
    }
}

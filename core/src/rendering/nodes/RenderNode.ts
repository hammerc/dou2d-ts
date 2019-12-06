namespace dou2d {
    /**
     * 渲染节点基类
     * @author wizardc
     */
    export abstract class RenderNode {
        /**
         * 节点类型
         */
        public type: RenderNodeType;

        /**
         * 绘制数据
         */
        public drawData: any[];

        /**
         * 绘制次数
         */
        protected _renderCount: number = 0;

        public constructor() {
            this.drawData = [];
        }

        public get renderCount(): number {
            return this.renderCount;
        }

        /**
         * 自动清空自身的绘制数据
         */
        public cleanBeforeRender(): void {
            this.drawData.length = 0;
            this._renderCount = 0;
        }
    }
}

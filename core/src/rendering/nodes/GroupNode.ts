namespace dou2d {
    /**
     * 组渲染节点, 用于组合多个渲染节点
     * @author wizardc
     */
    export class GroupNode extends RenderNode {
        /**
         * 相对偏移矩阵
         */
        public matrix: Matrix;

        public constructor() {
            super();
            this.type = RenderNodeType.groupNode;
        }

        public get renderCount(): number {
            let result = 0;
            let data = this.drawData;
            for (let i = data.length - 1; i >= 0; i--) {
                result += data[i].$getRenderCount();
            }
            return result;
        }

        public addNode(node: RenderNode): void {
            this.drawData.push(node);
        }

        public cleanBeforeRender(): void {
            let data = this.drawData;
            for (let i = data.length - 1; i >= 0; i--) {
                data[i].cleanBeforeRender();
            }
        }
    }
}

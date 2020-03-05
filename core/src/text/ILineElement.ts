namespace dou2d {
    /**
     * 文本行元素
     * @author wizardc
     */
    export interface ILineElement {
        /**
         * 文本占用宽度
         */
        width: number;

        /**
         * 文本占用高度
         */
        height: number;

        /**
         * 当前文本字符总数量, 包括换行符
         */
        charNum: number;

        /**
         * 是否含有换行符
         */
        hasNextLine: boolean;

        /**
         * 本行文本内容
         */
        elements: IWTextElement[];
    }
}

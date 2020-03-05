namespace dou2d {
    /**
     * 文本元素
     * @author wizardc
     */
    export interface ITextElement {
        /**
         * 字符串内容
         */
        text: string;

        /**
         * 文本样式
         */
        style?: ITextStyle;
    }
}

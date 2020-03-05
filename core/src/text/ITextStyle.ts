namespace dou2d {
    /**
     * 文本样式
     * @author wizardc
     */
    export interface ITextStyle {
        /**
         * 颜色值
         */
        textColor?: number;

        /**
         * 描边颜色值
         */
        strokeColor?: number;

        /**
         * 字号
         */
        size?: number;

        /**
         * 描边大小
         */
        stroke?: number;

        /**
         * 是否加粗
         */
        bold?: boolean;

        /**
         * 是否倾斜
         */
        italic?: boolean;

        /**
         * 是否加下划线
         */
        underline?: boolean;

        /**
         * 字体名称
         */
        fontFamily?: string;

        /**
         * 链接事件或者地址
         */
        href?: string;

        /**
         * 链接地址时的目标
         */
        target?: string;
    }
}

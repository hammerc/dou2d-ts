namespace dou2d {
    /**
     * 转换数字为颜色字符串
     */
    export function toColorString(value: number): string {
        if (value < 0) {
            value = 0;
        }
        if (value > 16777215) {
            value = 16777215;
        }
        let color = value.toString(16).toUpperCase();
        while (color.length > 6) {
            color = color.slice(1, color.length);
        }
        while (color.length < 6) {
            color = "0" + color;
        }
        return "#" + color;
    }
}

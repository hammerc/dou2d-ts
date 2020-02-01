(function () {

    // 覆盖原生的 isNaN() 方法实现, 在不同浏览器上有 2 ~ 10 倍性能提升
    window["isNaN"] = function (value: number): boolean {
        value = +value;
        return value !== value;
    };

})();

namespace dou2d {
    /**
     * 标记指定属性不可用
     */
    export function markCannotUse(instance: any, property: string, defaultValue: any): void {
        Object.defineProperty(instance.prototype, property, {
            get: function () {
                console.warn(`This class cannot use the property "${property}"`);
                return defaultValue;
            },
            set: function (value) {
                console.warn(`This class cannot use the property "${property}"`);
            },
            enumerable: true,
            configurable: true
        });
    }
}

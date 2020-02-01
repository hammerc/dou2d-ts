namespace dou2d {
    const _implementationMap: { [key: string]: any } = {};

    /**
     * 注册一个接口实现
     */
    export function registerImplementation(key: string, data: any): void {
        _implementationMap[key] = data;
    }

    /**
     * 获取一个接口实现
     */
    export function getImplementation(key: string): any {
        return _implementationMap[key];
    }
}

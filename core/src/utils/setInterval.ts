namespace dou2d {
    let index: number = 0;
    let map: { [key: number]: { method: Function, thisObj: any, delay: number, args: any[], originDelay: number } } = {};
    let size: number = 0;

    export function $updateInterval(passedTime: number): void {
        if (size > 0) {
            for (let key in map) {
                let data = map[key];
                data.delay -= passedTime;
                if (data.delay <= 0) {
                    data.delay = data.originDelay;
                    data.method.apply(data.thisObj, ...data.args);
                }
            }
        }
    }

    /**
     * 添加重复计时器
     */
    export function setInterval(method: Function, thisObj: any, delay: number, ...args): number {
        let data = { method, thisObj, delay, args, originDelay: delay };
        map[index++] = data;
        ++size;
        return index;
    }

    /**
     * 移除重复计时器
     */
    export function clearInterval(key: number): void {
        if (map[key]) {
            delete map[key];
            --size;
        }
    }
}

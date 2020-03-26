namespace dou2d {
    /**
     * 添加超时计时器
     */
    export function setTimeout(method: Function, thisObj: any, delay: number, ...args): number {
        return sys.setTimeout(method, thisObj, delay, ...args);
    }

    /**
     * 移除超时计时器
     */
    export function clearTimeout(key: number): void {
        sys.clearTimeout(key);
    }

    export namespace sys {
        let index: number = 0;
        let map: { [key: number]: { method: Function, thisObj: any, delay: number, args: any[] } } = {};
        let size: number = 0;

        export function updateTimeout(passedTime: number): void {
            if (size > 0) {
                for (let key in map) {
                    let data = map[key];
                    data.delay -= passedTime;
                    if (data.delay <= 0) {
                        clearTimeout(+key);
                        data.method.apply(data.thisObj, ...data.args);
                    }
                }
            }
        }

        export function setTimeout(method: Function, thisObj: any, delay: number, ...args): number {
            let data = { method, thisObj, delay, args };
            map[index++] = data;
            ++size;
            return index;
        }

        export function clearTimeout(key: number): void {
            if (map[key]) {
                delete map[key];
                --size;
            }
        }
    }
}

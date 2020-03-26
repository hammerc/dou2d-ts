namespace dou2d {
    /**
     * 注册一个下次渲染之前执行的方法
     */
    export function callLater(method: Function, thisObj: any, ...args): void {
        sys.callLater(method, thisObj, ...args);
    }

    export namespace sys {
        let functionList: Function[] = [];
        let thisList: any[] = [];
        let argsList: any[] = [];

        export function updateCallLater(): void {
            if (functionList.length > 0) {
                let fList = functionList;
                let tList = thisList;
                let aList = argsList;
                functionList = [];
                thisList = [];
                argsList = [];
                for (let i = 0, len = fList.length; i < len; i++) {
                    fList[i].apply(tList[i], ...aList[i]);
                }
            }
        }

        export function callLater(method: Function, thisObj: any, ...args): void {
            functionList.push(method);
            thisList.push(thisObj);
            argsList.push(args);
        }
    }
}

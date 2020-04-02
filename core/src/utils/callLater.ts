namespace dou2d {
    /**
     * 注册一个下次渲染之前执行的方法
     * * 同一个方法重复添加会多次调用
     */
    export function callLater(method: Function, thisObj: any, ...args): void {
        sys.callLater(method, thisObj, ...args);
    }

    /**
     * 注册一个下次渲染之前执行的方法
     * * 同一个方法重复添加只会调用一次
     */
    export function callLaterUnique(method: Function, thisObj: any, ...args): void {
        sys.callLaterUnique(method, thisObj, ...args);
    }

    export namespace sys {
        let functionList: Function[] = [];
        let thisList: any[] = [];
        let argsList: any[] = [];

        let functionUniqueList: Function[] = [];
        let thisUniqueList: any[] = [];
        let argsUniqueList: any[] = [];

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
            if (functionUniqueList.length > 0) {
                let fList = functionUniqueList;
                let tList = thisUniqueList;
                let aList = argsUniqueList;
                functionUniqueList = [];
                thisUniqueList = [];
                argsUniqueList = [];
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

        export function callLaterUnique(method: Function, thisObj: any, ...args): void {
            for (let i = 0, len = functionUniqueList.length; i < len; i++) {
                if (functionUniqueList[i] === method && thisUniqueList[i] === thisObj) {
                    return;
                }
            }
            functionUniqueList.push(method);
            thisUniqueList.push(thisObj);
            argsUniqueList.push(args);
        }
    }
}

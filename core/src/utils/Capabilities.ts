namespace dou2d {
    /**
     * 运行时环境信息
     * @author wizardc
     */
    export namespace Capabilities {
        /**
         * 引擎版本
         */
        export var engineVersion: string = "0.1.0";

        /**
         * 当前的操作系统
         */
        export var os: "Unknown" | "iOS" | "Android" | "Windows Phone" | "Windows PC" | "Mac OS" = "Unknown";

        /**
         * 系统的语言代码
         */
        export var language: string;

        /**
         * 是否处于移动环境
         */
        export var isMobile: boolean;

        /**
         * 客户端边界宽度
         */
        export var boundingClientWidth: number;

        /**
         * 客户端边界高度
         */
        export var boundingClientHeight: number;

        export function init(): void {
            let userAgent = navigator.userAgent.toLowerCase();
            isMobile = userAgent.indexOf("mobile") != -1 || userAgent.indexOf("android") != -1;
            if (isMobile) {
                if (userAgent.indexOf("windows") < 0 && (userAgent.indexOf("iphone") != -1 || userAgent.indexOf("ipad") != -1 || userAgent.indexOf("ipod") != -1)) {
                    os = "iOS";
                }
                else if (userAgent.indexOf("android") != -1 && userAgent.indexOf("linux") != -1) {
                    os = "Android";
                }
                else if (userAgent.indexOf("windows") != -1) {
                    os = "Windows Phone";
                }
            }
            else {
                if (userAgent.indexOf("windows nt") != -1) {
                    os = "Windows PC";
                }
                else if (userAgent.indexOf("mac os") != -1) {
                    os = "Mac OS";
                }
            }
            let language = navigator.language.toLowerCase();
            let strings = language.split("-");
            if (strings.length > 1) {
                strings[1] = strings[1].toUpperCase();
            }
            language = strings.join("-");
        }
    }
}

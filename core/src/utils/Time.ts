namespace dou2d {
    /**
     * 时间类
     * @author wizardc
     */
    export class Time {
        /**
         * 项目启动后经过的时间
         */
        public static get time(): number {
            return dou.getTimer();
        }

        /**
         * 上一帧到这一帧经过的时间
         */
        public static get deltaTime(): number {
            return sys.deltaTime;
        }

        /**
         * 固定频率刷新时间间隔, 默认值为 50 毫秒
         */
        public static set fixedDeltaTime(value: number) {
            sys.fixedDeltaTime = value;
        }
        public static get fixedDeltaTime(): number {
            return sys.fixedDeltaTime;
        }
    }

    export namespace sys {
        export let deltaTime: number = 0;
        export let fixedDeltaTime: number = 50;
        export let fixedPassedTime: number = 0;
    }
}

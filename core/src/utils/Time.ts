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
            return $2d.deltaTime;
        }

        /**
         * 固定频率刷新时间间隔, 默认值为 50 毫秒
         */
        public static set fixedDeltaTime(value: number) {
            $2d.fixedDeltaTime = value;
        }
        public static get fixedDeltaTime(): number {
            return $2d.fixedDeltaTime;
        }
    }

    export namespace $2d {
        export let deltaTime: number = 0;
        export let fixedDeltaTime: number = 50;
        export let fixedPassedTime: number = 0;
    }
}

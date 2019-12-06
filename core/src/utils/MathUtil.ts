namespace dou2d {
    /**
     * 数学工具类
     * @author wizardc
     */
    export namespace MathUtil {
        export const PI_HALF = Math.PI * 0.5;
        export const PI_QUARTER = Math.PI * 0.25;
        export const PI_DOUBLE = Math.PI * 2;

        /**
         * 弧度制到角度制相乘的系数
         */
        export const RAD_DEG = 180 / Math.PI;

        /**
         * 角度制到弧度制相乘的系数
         */
        export const DEG_RAD = Math.PI / 180;

        /**
         * 根号 2
         */
        export const SQRT_2 = 1.4142135623731;

        /**
         * 根号 2 的一半
         */
        export const SQRT1_2 = SQRT_2 * 0.5;

        /**
         * 把指定的数限制在指定的区间内
         */
        export function clamp(v: number, min: number = 0, max: number = 1): number {
            if (v < min) {
                return min;
            }
            if (v > max) {
                return max;
            }
            return v;
        }

        /**
         * 线性插值
         */
        export function lerp(from: number, to: number, t: number): number {
            return from + (to - from) * t;
        }

        /**
         * 转换为弧度
         */
        export function toRadians(degrees: number): number {
            return degrees * Math.PI / 180;
        }

        /**
         * 转换为角度
         */
        export function toDegrees(radians: number): number {
            return radians * 180 / Math.PI;
        }

        /**
         * 格式化弧线角度的值
         */
        export function clampAngle(value: number): number {
            value %= Math.PI * 2;
            if (value < 0) {
                value += Math.PI * 2;
            }
            return value;
        }

        /**
         * 格式化旋转角度的值
         */
        export function clampRotation(value: number): number {
            value %= 360;
            if (value > 180) {
                value -= 360;
            }
            else if (value < -180) {
                value += 360;
            }
            return value;
        }
    }
}

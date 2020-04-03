namespace dou2d {
    /**
     * 贝塞尔工具类
     * @author wizardc
     */
    export namespace BezierUtil {
        /**
         * 二次贝塞尔曲线
         */
        export function quadratic(factor: number, point1: Point, point2: Point, point3: Point, result?: Point): Point {
            if (!result) {
                result = dou.recyclable(Point);
            }
            result.x = (1 - factor) * (1 - factor) * point1.x + 2 * factor * (1 - factor) * point2.x + factor * factor * point3.x;
            result.y = (1 - factor) * (1 - factor) * point1.y + 2 * factor * (1 - factor) * point2.y + factor * factor * point3.y;
            return result;
        }

        /**
         * 三次贝塞尔曲线
         */
        export function cube(factor: number, startPoint: Point, point1: Point, point2: Point, endPoint: Point, result?: Point): Point {
            if (!result) {
                result = dou.recyclable(Point);
            }
            let left = 1 - factor;
            result.x = (startPoint.x * Math.pow(left, 3) + 3 * point1.x * Math.pow(left, 2) * factor + 3 * point2.x * Math.pow(factor, 2) * left + endPoint.x * Math.pow(factor, 3));
            result.y = (startPoint.y * Math.pow(left, 3) + 3 * point1.y * Math.pow(left, 2) * factor + 3 * point2.y * Math.pow(factor, 2) * left + endPoint.y * Math.pow(factor, 3));
            return result;
        }
    }
}

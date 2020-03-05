namespace dou2d {
    /**
     * 
     * @author wizardc
     */
    export class DropShadowFilter extends GlowFilter {
        constructor(distance:number = 4.0, angle:number = 45, color:number = 0, alpha:number = 1.0, blurX:number = 4.0, blurY:number = 4.0, strength:number = 1.0, quality:number = 1, inner:boolean = false, knockout:boolean = false, hideObject:boolean = false) {
            super(color, alpha, blurX, blurY, strength, quality, inner, knockout);
            let self = this;
            self.$distance = distance;
            self.$angle = angle;
            self.$hideObject = hideObject;

            self.$uniforms.dist = distance;
            self.$uniforms.angle = angle / 180 * Math.PI;
            self.$uniforms.hideObject = hideObject ? 1 : 0;
            self.onPropertyChange();
        }

        /**
         * @private
         */
        public $distance:number;

        /**
         * The offset distance of the bevel.
         * @version Egret 3.1.4
         * @platform Web
         * @language en_US
         */
        /**
         * 阴影的偏移距离，以像素为单位。
         * @version Egret 3.1.4
         * @platform Web
         * @language zh_CN
         */
        public get distance():number {
            return this.$distance;
        }

        public set distance(value:number) {
            let self = this;
            if(self.$distance == value) {
                return;
            }
            self.$distance = value;
            self.$uniforms.dist = value;
            self.onPropertyChange();
        }

        /**
         * @private
         */
        public $angle:number;

        /**
         * The angle of the bevel.
         * @version Egret 3.1.4
         * @platform Web
         * @language en_US
         */
        /**
         * 阴影的角度。
         * @version Egret 3.1.4
         * @platform Web
         * @language zh_CN
         */
        public get angle():number {
            return this.$angle;
        }

        public set angle(value:number) {
            let self = this;
            if(self.$angle == value) {
                return;
            }
            self.$angle = value;
            self.$uniforms.angle = value / 180 * Math.PI;
            self.onPropertyChange();
        }

        /**
         * @private
         */
        public $hideObject:boolean;

        /**
         * Indicates whether or not the object is hidden.
         * @version Egret 3.1.4
         * @platform Web
         * @language en_US
         */
        /**
         * 表示是否隐藏对象。
         * @version Egret 3.1.4
         * @platform Web
         * @language zh_CN
         */
        public get hideObject():boolean {
            return this.$hideObject;
        }

        public set hideObject(value:boolean) {
            if(this.$hideObject == value) {
                return;
            }
            this.$hideObject = value;
            this.$uniforms.hideObject = value ? 1 : 0;
        }

        /**
         * @private
         */
        public $toJson():string {
            return '{"distance": ' + this.$distance + ', "angle": ' + this.$angle + ', "color": ' + this.$color + ', "red": ' + this.$red + ', "green": ' + this.$green + ', "blue": ' + this.$blue + ', "alpha": ' + this.$alpha + ', "blurX": ' + this.$blurX + ', "blurY": ' + this.blurY + ', "strength": ' + this.$strength + ', "quality": ' + this.$quality + ', "inner": ' + this.$inner + ', "knockout": ' + this.$knockout + ', "hideObject": ' + this.$hideObject + '}';
        }

        protected updatePadding():void {
            let self = this;
            self.paddingLeft = self.blurX;
            self.paddingRight = self.blurX;
            self.paddingTop = self.blurY;
            self.paddingBottom = self.blurY;
            let distance: number = self.distance || 0;
            let angle: number = self.angle || 0;
            let distanceX = 0;
            let distanceY = 0;
            if (distance != 0) {
                distanceX = distance * Math.cos(angle);
                if (distanceX > 0) {
                    distanceX = Math.ceil(distanceX);
                }
                else {
                    distanceX = Math.floor(distanceX);
                }
                distanceY = distance * Math.sin(angle);
                if (distanceY > 0) {
                    distanceY = Math.ceil(distanceY);
                }
                else {
                    distanceY = Math.floor(distanceY);
                }
                self.paddingLeft += distanceX;
                self.paddingRight += distanceX;
                self.paddingTop += distanceY;
                self.paddingBottom += distanceY;
            }
        }
    }
}

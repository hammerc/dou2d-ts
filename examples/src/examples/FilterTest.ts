namespace examples {
    export class FilterTest extends dou2d.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: dou2d.Event2D): Promise<void> {
            let texture: dou2d.Texture = await dou.loader.loadAsync("resource/img/wicker.jpg");

            let colorMatrixFilter = new dou2d.ColorMatrixFilter([
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0, 0, 0, 1, 0
            ]);

            let blurFilter = new dou2d.BlurFilter(8, 8);

            let glowFilter = new dou2d.GlowFilter(0xffff00, 1, 32, 32);

            let dropShadowFilter = new dou2d.DropShadowFilter(32, 45, 0xffff00, 1, 32, 32);

            let bitmap1 = this.createBitmap(this, texture, 50, 50);
            bitmap1.filters = [colorMatrixFilter];

            let bitmap2 = this.createBitmap(this, texture, 250, 50);
            bitmap2.filters = [blurFilter];

            // FIXME : 注释掉其它 3 个显示对象后下面 2 个滤镜单独使用正常, 不注释其它 3 个显示对象, 取消下面两个显示对象的注释, 显示是异常的

            // let bitmap3 = this.createBitmap(this, texture, 50, 250);
            // bitmap3.filters = [glowFilter];

            // let bitmap4 = this.createBitmap(this, texture, 250, 250);
            // bitmap4.filters = [dropShadowFilter];

            let bitmap5 = this.createBitmap(this, texture, 50, 450);
            bitmap5.filters = [colorMatrixFilter, blurFilter];
        }

        private createBitmap(container: dou2d.DisplayObjectContainer, texture: dou2d.Texture, x: number, y: number): dou2d.Bitmap {
            let bitmap = new dou2d.Bitmap(texture);
            bitmap.x = x;
            bitmap.y = y;
            bitmap.scaleX = bitmap.scaleY = 0.5;
            container.addChild(bitmap);
            return bitmap;
        }
    }
}

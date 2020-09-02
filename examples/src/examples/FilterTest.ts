namespace examples {
    export class FilterTest extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: Dou.Event2D): Promise<void> {
            let texture: Dou.Texture = await Dou.loader.loadAsync("resource/img/wicker.jpg");

            let colorMatrixFilter = new Dou.ColorMatrixFilter([
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0.3, 0.6, 0, 0, 0,
                0, 0, 0, 1, 0
            ]);

            let blurFilter = new Dou.BlurFilter(8, 8);

            let glowFilter = new Dou.GlowFilter(0xffff00, 1, 32, 32);

            let dropShadowFilter = new Dou.DropShadowFilter(32, 45, 0xffff00, 1, 32, 32);

            let bitmap1 = this.createBitmap(this, texture, 50, 50);
            bitmap1.filters = [colorMatrixFilter];

            let bitmap2 = this.createBitmap(this, texture, 250, 50);
            bitmap2.filters = [blurFilter];

            let bitmap3 = this.createBitmap(this, texture, 50, 250);
            bitmap3.filters = [glowFilter];

            let bitmap4 = this.createBitmap(this, texture, 250, 250);
            bitmap4.filters = [dropShadowFilter];

            let bitmap5 = this.createBitmap(this, texture, 50, 450);
            bitmap5.filters = [colorMatrixFilter, blurFilter];
        }

        private createBitmap(container: Dou.DisplayObjectContainer, texture: Dou.Texture, x: number, y: number): Dou.Bitmap {
            let bitmap = new Dou.Bitmap(texture);
            bitmap.x = x;
            bitmap.y = y;
            bitmap.scaleX = bitmap.scaleY = 0.5;
            container.addChild(bitmap);
            return bitmap;
        }
    }
}

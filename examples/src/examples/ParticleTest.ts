namespace examples {
    export class ParticleTest extends dou2d.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(dou2d.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: dou2d.Event2D): Promise<void> {
            let json: any = await dou.loader.loadAsync("resource/particle/particle.json");
            let texture: dou2d.Texture = await dou.loader.loadAsync("resource/particle/particle.png");

            let particle = new dou2d.GravityParticleSystem(texture, json);
            // particle.blendMode = dou2d.BlendMode.add;
            this.addChild(particle);
            particle.start();

            this.stage.on(dou2d.TouchEvent.TOUCH_MOVE, (event: dou2d.TouchEvent) => {
                particle.emitterX = event.localX;
                particle.emitterY = event.localY;
            }, this);
        }
    }
}

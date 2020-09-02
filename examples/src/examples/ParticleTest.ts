namespace examples {
    export class ParticleTest extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: Dou.Event2D): Promise<void> {
            let json: any = await Dou.loader.loadAsync("resource/particle/particle.json");
            let texture: Dou.Texture = await Dou.loader.loadAsync("resource/particle/particle.png");

            let particle = new Dou.GravityParticleSystem(texture, json);
            // particle.blendMode = Dou.BlendMode.add;
            this.addChild(particle);
            particle.start();

            this.stage.on(Dou.TouchEvent.TOUCH_MOVE, (event: Dou.TouchEvent) => {
                particle.emitterX = event.localX;
                particle.emitterY = event.localY;
            }, this);
        }
    }
}

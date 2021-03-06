var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var examples;
(function (examples) {
    class ParticleTest extends Dou.DisplayObjectContainer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            return __awaiter(this, void 0, void 0, function* () {
                let json = yield Dou.loader.loadAsync("resource/particle/particle.json");
                let texture = yield Dou.loader.loadAsync("resource/particle/particle.png");
                let particle = new Dou.GravityParticleSystem(texture, json);
                // particle.blendMode = Dou.BlendMode.add;
                this.addChild(particle);
                particle.start();
                this.stage.on(Dou.TouchEvent.TOUCH_MOVE, (event) => {
                    particle.emitterX = event.localX;
                    particle.emitterY = event.localY;
                }, this);
            });
        }
    }
    examples.ParticleTest = ParticleTest;
})(examples || (examples = {}));

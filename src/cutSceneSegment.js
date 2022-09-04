import {AnimationGroup} from "@babylonjs/core/Animations/animationGroup";
import { Observable } from "@babylonjs/core/Misc/observable";

class CutSceneSegment {

    constructor(target, scene, ...animationSequence) {
        this.onEnd = new Observable();
        this.loopAnimation = false;

        this._target = target;
        let ag = new AnimationGroup(target.name + "-animGroupCS", scene);

        for (var an of animationSequence) {
            ag.addTargetedAnimation(an, target);
        }

        this.animationGroup = ag;
        this.onEnd = ag.onAnimationGroupEndObservable;
        this._scene = scene;

    }

    start() {
        this.animationGroup.start(this.loopAnimation);
    }
    stop() {
        this.animationGroup.stop();
    }
}
export default CutSceneSegment;

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Scene } from "@babylonjs/core/scene";
import { HemisphericLight, PointerEventTypes } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Color3 } from "@babylonjs/core/Maths/math";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Animation } from "@babylonjs/core/Animations/animation";
import { PlaneBuilder } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { Sound } from "@babylonjs/core/Audio/sound";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Observable } from "@babylonjs/core/Misc/observable";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { TextWrapping } from "@babylonjs/gui/index";

import CutSceneSegment from "./cutSceneSegment";
import logger from "./logger";
import SpaceTruckerInputProcessor from "./spaceTruckerInputProcessor";
import poweredByUrl from "../assets/powered-by.png";
import communityUrl from "../assets/splash-screen-community.png";
import spaceTruckerRigUrl from "../assets/space-trucker-and-rig.png";
import babylonLogoUrl from "../assets/babylonjs_identity_color.png";
import SpaceTruckerSoundManager from "./spaceTruckerSoundManager";

const animationFps = 60;
const flipAnimation = new Animation("flip", "rotation.x", animationFps, Animation.ANIMATIONTYPE_FLOAT, 0, true);
const fadeAnimation = new Animation("entranceAndExitFade", "visibility", animationFps, Animation.ANIMATIONTYPE_FLOAT, 0, true);
const scaleAnimation = new Animation("scaleTarget", "scaling", animationFps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE, true);

class SplashScene {
    // currentSegment;
    // poweredBy;
    // babylonBillboard;
    // communityProduction;
    // callToAction;
    get music() {
        return this.audioManager.sound("title");
    }
    // skipRequested = false;
    // onReadyObservable = new Observable();
    get scene() {
        return this._scene;
    }
    constructor(engine) {
        this.skipRequested = false;
        this.onReadyObservable = new Observable();
        let scene = this._scene = new Scene(engine);
        
        scene.clearColor = Color3.Black();
        this.camera = new ArcRotateCamera("camera", 0, Math.PI / 2, 5, Vector3.Zero(), scene);
        this.light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        this.light.groundColor = Color3.White();
        this.light.intensity = 0.5;
        const billboard = this.billboard = PlaneBuilder.CreatePlane("billboard", {
            width: 5,
            height: 3
        }, scene);
        billboard.rotation.z = Math.PI;
        billboard.rotation.x = Math.PI;
        billboard.rotation.y = Math.PI / 2;
        const billMat = new StandardMaterial("stdMat", scene);
        billboard.material = billMat;

        const poweredTexture = new Texture(poweredByUrl, scene);
        billMat.diffuseTexture = poweredTexture;

        const babylonTexture = new Texture(babylonLogoUrl, scene);
        const communityTexture = new Texture(communityUrl, scene);
        const rigTexture = new Texture(spaceTruckerRigUrl, scene);

        let callToActionTexture =
            this.callToActionTexture = AdvancedDynamicTexture.CreateFullscreenUI("splashGui");
        let ctaBlock = new TextBlock("ctaBlock", "Press any key or tap the screen to continue...");
        ctaBlock.textWrapping = TextWrapping.WordWrap;
        ctaBlock.color = "white";
        ctaBlock.fontSize = "18pt";
        ctaBlock.verticalAlignment =
            ctaBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
        ctaBlock.paddingBottom = "12%";
        ctaBlock.isVisible = false;
        callToActionTexture.addControl(ctaBlock);

        const poweredBy = this.poweredBy = this.buildPoweredByAnimations();
        const babylonBillboard = this.babylonBillboard = this.buildBabylonAnimations();
        const communityProduction = this.communityProduction = this.buildCommunityProductionAnimations();
        const callToAction = this.buildcallToActionAnimation();
        this.callToAction = callToAction;

        poweredBy.onEnd.addOnce(() => {
            console.log("powered End");
            billMat.diffuseTexture = babylonTexture;
            billboard.rotation.x = Math.PI;
            this.light.intensity = 0.667;
            billboard.visibility = 0;
            this.currentSegment = babylonBillboard;
        });

        babylonBillboard.onEnd.addOnce(() => {
            console.log("babylonEnd");
            billMat.diffuseTexture = communityTexture;
            billboard.rotation.x = Math.PI;
            billboard.visibility = 0;
            this.currentSegment = communityProduction;

        });

        communityProduction.onEnd.addOnce(() => {
            console.log("communityEnd");
            billboard.visibility = 0;
            this.currentSegment = callToAction;
            billMat.diffuseTexture = rigTexture;
        });

        callToAction.onEnd.addOnce(() => {
            console.log("callToAction end");
            ctaBlock.isVisible = true;
        });       
        this.audioManager = new SpaceTruckerSoundManager(scene, 'title');
        this.audioManager.onReadyObservable.addOnce(_ => this.onReadyObservable.notifyObservers());
        this.scene.onPointerObservable.addOnce((ev) => ev.type === PointerEventTypes.POINTERDOWN ? this.ACTIVATE() : null);
        this.scene.onKeyboardObservable.addOnce((ev) => ev.type === this.ACTIVATE());
    }

    run() {
        this.currentSegment = this.poweredBy;
        this.music.setVolume(0.01);
        this.music.play();
        this.music.setVolume(0.998, 300);
        this.currentSegment.start();
        // this.scene.onBeforeRenderObservable.add(() => {
        //     this.update
        // });
    }

    update() {
        let prior, curr = this.currentSegment;
        this.actionProcessor?.update();
        if (this.skipRequested) {
            this?.currentSegment?.stop();
            this.currentSegment = null;
            return;
        }
        curr = this.currentSegment;
        if (prior !== curr) {
            this.currentSegment?.start();
        }
    }

    ACTIVATE(priorState) {
        
        if (!this.skipRequested && !priorState) {
            logger.logInfo("Key press detected. Skipping cut scene.");
            this.skipRequested = true;
            this.music?.stop();
            return true;
        }
        return false;
    }

    buildcallToActionAnimation() {

        const start = 0;
        const enterTime = 3.0;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 3.0;
        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 1 }
        ];

        const startVector = new Vector3(1, 1, 1);
        const scaleKeys = [
            { frame: start, value: startVector },
            { frame: entranceFrame, value: new Vector3(1.25, 1, 1.25) },
            { frame: beginExitFrame, value: new Vector3(1.5, 1, 1.5) },
            { frame: endFrame, value: new Vector3(1, 1, 1) }
        ];

        fadeAnimation.setKeys(keys);
        scaleAnimation.setKeys(scaleKeys);

        const seg = new CutSceneSegment(this.billboard, this.scene, fadeAnimation, scaleAnimation);
        return seg;
    }

    buildCommunityProductionAnimations() {
        const start = 0;
        const enterTime = 4.0;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 3.0;
        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 0 }
        ];

        fadeAnimation.setKeys(keys);

        const seg2 = new CutSceneSegment(this.billboard, this.scene, fadeAnimation);
        return seg2;
    }

    buildBabylonAnimations() {
        const start = 0;
        const enterTime = 2.5;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 2.5;
        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 0 }
        ];
        fadeAnimation.setKeys(keys);

        const seg1 = new CutSceneSegment(this.billboard, this.scene, fadeAnimation);
        return seg1;
    }

    buildPoweredByAnimations() {
        const start = 0;
        const enterTime = 3.5;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 2.5;

        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 0 }
        ];
        fadeAnimation.setKeys(keys);

        const flipKeys = [
            { frame: start, value: Math.PI },
            { frame: entranceFrame, value: 0 },
            { frame: beginExitFrame, value: Math.PI },
            { frame: endFrame, value: 2 * Math.PI }
        ];
        flipAnimation.setKeys(flipKeys);

        const seg0 = new CutSceneSegment(this.billboard, this.scene, fadeAnimation, flipAnimation);
        return seg0;
    }
}

export default SplashScene;
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Observable } from "@babylonjs/core/Misc/observable";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { setAndStartTimer } from "@babylonjs/core/Misc/timer";
import stackedDialog from "./gui-dialog-buttons-scroll.json";

const SCENE_MASK = 0x1;

const CONTROL_NAMES = Object.freeze({
    cancel: 'userCancel',
    accept: 'userAccept',
    titleText: 'titleText',
    bodyText: 'dialogText',
    acceptText: 'userAcceptText',
    cancelText: 'userCancelText',
    dialog: 'dialogBorder',
    bodyScrollViewer: 'bodyContainer',
    bodyStackPanel: 'bodyStackPanel',
});

const defaultOptions = {
    bodyText: '',
    titleText: 'Dialog Box',
    acceptText: 'OK',
    cancelText: 'Cancel',
    displayOnLoad: false
};

class DialogBox {
    advancedTexture;
    scene;
    style;
    onAcceptedObservable = new Observable();
    #acceptPointerObserver = null;
    onCancelledObservable = new Observable();
    #cancelPointerObserver = null;
    #fadeInTransitionDurationMs = 800;
    #showTimer = null;

    get dialogContainer() {
        return this.advancedTexture.getControlByName(CONTROL_NAMES.dialog);
    }
    get titleText() {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.titleText);
        return ctrl.text;
    }
    set titleText(value) {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.titleText);
        ctrl.text = value;
    }
    get bodyContainer() {
        return this.advancedTexture.getControlByName(CONTROL_NAMES.bodyScrollViewer);
    }
    get bodyText() {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.bodyText);
        return ctrl.text;
    }
    set bodyText(value) {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.bodyText);
        if (!ctrl) {
            return;
        }
        ctrl.text = value;
    }
    get bodyStackPanel() {
        return this.advancedTexture.getControlByName(CONTROL_NAMES.bodyStackPanel);
    }
    get acceptText() {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.acceptText);
        return ctrl.text;
    }
    set acceptText(value) {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.acceptText);
        if (!ctrl) {
            return;
        }
        ctrl.text = value;
    }
    get cancelText() {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.cancelText);
        return ctrl.text;
    }
    set cancelText(value) {
        let ctrl = this.advancedTexture.getControlByName(CONTROL_NAMES.cancelText);
        if (!ctrl) {
            return;
        }
        ctrl.text = value;
    }
    get accept() {
        return this.advancedTexture.getControlByName(CONTROL_NAMES.accept);
    }
    get cancel() {
        return this.advancedTexture.getControlByName(CONTROL_NAMES.cancel);
    }

    constructor(options = defaultOptions, scene) {
        const {
            bodyText,
            titleText,
            displayOnLoad,
            acceptText,
            cancelText
        } = options;

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("dialog", false, scene, Texture.NEAREST_NEAREST, true);
        this.style = this.advancedTexture.createStyle();
        this.style.fontFamily = "Russo One";        

        this.advancedTexture.layer.layerMask = SCENE_MASK;
        this.advancedTexture.parseContent(stackedDialog, false);
        this.scene = scene;
        this.dialogContainer.isVisible = false;
         
        if (bodyText) {
            this.bodyText = bodyText;
        }
        this.titleText = titleText ?? "Space-Truckers: The Dialog Box";
        this.acceptText = acceptText ?? "OK";
        this.cancelText = cancelText ?? "Cancel";
        this.#acceptPointerObserver = this.accept.onPointerClickObservable
            .add((evt) => {
                this.onAccepted();
                this.onAcceptedObservable.notifyObservers();
            });
        this.#cancelPointerObserver = this.cancel.onPointerClickObservable
            .add((evt) => {
                this.onCancelled();
                this.onCancelledObservable.notifyObservers();
            });

        this.scene.executeWhenReady(() => {
            this.advancedTexture.getControlByName(CONTROL_NAMES.titleText).fontFamily = this.style.fontFamily; // temporary workaround
            this.advancedTexture.getControlByName(CONTROL_NAMES.bodyText).fontFamily = this.style.fontFamily; // temporary workaround
            this.advancedTexture.getControlByName(CONTROL_NAMES.acceptText).fontFamily = this.style.fontFamily; // temporary workaround
            this.advancedTexture.getControlByName(CONTROL_NAMES.cancelText).fontFamily = this.style.fontFamily; // temporary workaround
            if (displayOnLoad) {
                this.show();
            }
        });

        this.scene.onDisposeObservable.add(() => {
            this.dispose();
        });

    }

    async show() {
        return new Promise((resolve, reject) => {
            console.log('show');
            this.dialogContainer.alpha = 0;
            this.dialogContainer.isVisible = true;
            this.advancedTexture.isForeground = true;
            this.#showTimer = setAndStartTimer({
                contextObservable: this.scene.onBeforeRenderObservable,
                timeout: this.#fadeInTransitionDurationMs,
                onTick: (d) => this.dialogContainer.alpha = Scalar.SmoothStep(0, 1, d.completeRate),
                onEnded: () => resolve()
            });
        });
    }

    async hide() {
        return new Promise((resolve, reject) => {
            if (this.dialogContainer) {
                this.dialogContainer.alpha = 1;
                this.#showTimer = setAndStartTimer({
                    contextObservable: this.scene.onBeforeRenderObservable,
                    timeout: this.#fadeInTransitionDurationMs,
                    onTick: (d) => this.dialogContainer.alpha = Scalar.SmoothStep(0.998, 0, d.completeRate),
                    onEnded: () => {
                        this.advancedTexture.isForeground = false;
                        this.dialogContainer.isVisible = false;
                        resolve();
                    },
                    breakCondition: this.dialogContainer == null
                });
            }
        });
    }
    onAccepted() {
        this.hide();
    }

    onCancelled() {
        this.hide();
    }

    dispose() {
        if (this.#showTimer) {
            this.#showTimer = null;
        }
        this.onAcceptedObservable?.clear();
        this.onAcceptedObservable?.cancelAllCoroutines();
        this.onCancelledObservable?.clear();
        this.onCancelledObservable?.cancelAllCoroutines();
        this.advancedTexture?.clear();
    }
}

export default DialogBox;
export { CONTROL_NAMES };
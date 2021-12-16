import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import { Observable } from "@babylonjs/core/Misc/observable";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import stackedDialog from "./gui-dialog-buttons-scroll.json"

const CONTROL_NAMES = Object.freeze({
    cancel: 'userCancel',
    accept: 'userAccept',
    titleText: 'titleText',
    bodyText: 'dialogText',
    acceptText: 'userAcceptText',
    cancelText: 'userCancelText',
    dialog: 'dialogBorder',
    bodyScrollViewer: 'bodyContainer'
});

class DialogBox {
    advancedTexture;
    scene;
    onDisplayChangeComplete = new Observable();
    onAcceptedObservable = new Observable();
    #acceptPointerObserver = null;
    onCancelledObservable = new Observable();
    #cancelPointerObserver = null;
    #fadeInTransitionDurationMs = 800;
    #showTimer = null;

    get dialog() {
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

    constructor(options, scene) {
        const {
            bodyText,
            titleText,
            displayOnLoad,
            acceptText,
            cancelText
        } = options;

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("dialog", false, scene, Texture.NEAREST_NEAREST, true);
        this.advancedTexture.parseContent(stackedDialog, false);
        this.scene = scene;
        this.dialog.isVisible = false;
        this.bodyText = bodyText;
        this.titleText = titleText ?? "Space-Truckers: The Dialog Box";
        this.acceptText = acceptText ?? "OK";
        this.cancelText = cancelText ?? "Cancel";
        this.#acceptPointerObserver = this.accept.onPointerClickObservable
            .add((evt) => this.onAccepted());
        this.#cancelPointerObserver = this.cancel.onPointerClickObservable
            .add((evt) => this.onCancelled());

        this.scene.executeWhenReady(() => {
            if (displayOnLoad) {
                this.show();
            }
        });

        this.scene.onDisposeObservable.add(() => {
            this.dispose();
        });
    }

    show() {
        this.dialog.alpha = 0;
        this.dialog.isVisible = true;
        this.#showTimer = BABYLON.setAndStartTimer({
            contextObservable: this.scene.onBeforeRenderObservable,
            timeout: this.#fadeInTransitionDurationMs,
            onTick: (d) => this.dialog.alpha = Scalar.SmoothStep(0, 1, d.completeRate),
            onEnded: () => this.onDisplayChangeComplete.notifyObservers()
        });
    }

    hide() {
        this.dialog.alpha = 0.998;
        this.#showTimer = BABYLON.setAndStartTimer({
            contextObservable: this.scene.onBeforeRenderObservable,
            timeout: this.#fadeInTransitionDurationMs,
            onTick: (d) => this.dialog.alpha = Scalar.SmoothStep(1, 0, d.completeRate),
            onEnded: () => this.onDisplayChangeComplete.notifyObservers()
        });
    }
    onAccepted() {
        this.onAcceptedObservable.notifyObservers();
    }
    onCancelled() {
        this.onCancelledObservable.notifyObservers();
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
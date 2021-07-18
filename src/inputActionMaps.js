const inputControlsMap = {
    /* Keyboard Mappings */
    w: 'MOVE_UP', 87: 'MOVE_UP',
    s: 'MOVE_DOWN', 83: 'MOVE_DOWN',
    a: 'MOVE_LEFT', 65: 'MOVE_LEFT',
    d: 'MOVE_RIGHT', 68: 'MOVE_RIGHT',
    q: 'ROTATE_LEFT',
    e: 'ROTATE_RIGHT',
    Backspace: 'GO_BACK', Delete: 'GO_BACK', 46: 'GO_BACK', 8: 'GO_BACK',
    Enter: 'ACTIVATE', Return: 'ACTIVATE', 13: 'ACTIVATE',  Space: 'ACTIVATE', 32: 'ACTIVATE', ' ': 'ACTIVATE',
    Shift: 'MOVE_IN',
    Control: 'MOVE_OUT',
    ArrowUp: 'MOVE_UP',
    ArrowDown: 'MOVE_DOWN',
    ArrowLeft: 'MOVE_LEFT',
    ArrowRight: 'MOVE_RIGHT',
    /*                  */

    /* Mouse and Touch Mappings */
    //PointerTap: 'ACTIVATE',
    /*                  */

    /* Gamepad Mappings */
    button1: 'ACTIVATE', buttonStart: 'ACTIVATE',
    buttonBack: 'GO_BACK', button2: 'GO_BACK',
    dPadDown: 'MOVE_DOWN', lStickDown: 'MOVE_DOWN',
    dPadUp: 'MOVE_UP', lStickUp: 'MOVE_UP',
    dPadRight: 'MOVE_RIGHT', lStickRight: 'MOVE_RIGHT',
    dPadLeft: 'MOVE_LEFT', lStickLeft: 'MOVE_LEFT',
    rStickUp: 'ROTATE_UP',
    rStickDown: 'ROTATE_DOWN',
    rStickRight: 'ROTATE_RIGHT',
    rStickLeft: 'ROTATE_LEFT'
};

const gamePadControlMap = {
    /* deviceType */
    2: [
        { 0: 'button1' }, // BABYLON.Xbox360Button.A
        { 1: 'button2' },
        { 2: 'button3' },
        { 3: 'button4' }
    ]
};
function normalizeJoystickInputs(stick) {
    const stickAngularSensitivity = 400;
    const stickMoveSensitivity = 40; // see above link
    const stickValues = {};
    if (stick) {
        const normalizedLX = stick.x / stickMoveSensitivity;
        const normalizedLY = stick.y / stickMoveSensitivity;
        stickValues.x = Math.abs(normalizedLX) > 0.005 ? 0 + normalizedLX : 0;
        stickValues.y = Math.abs(normalizedLY) > 0.005 ? 0 + normalizedLY : 0;
    }
    else {
        stick.x = 0;
        stick.y = 0;
    }
    return stickValues;
}
function mapRotationInputToActions(stickInput, inputMap) {
    // NOTE: I have no idea if this is a reasonable threshold value, test with 5.0.0-alpha23+
    if (stickInput.x >= 0.05) {
        inputMap["rStickRight"] = stickInput.x;
    }
    else {
        delete inputMap["rStickRight"];
    }

    if (stickInput.x <= -0.05) {
        inputMap["rStickLeft"] = stickInput.x
    }
    else {
        delete inputMap["rStickLeft"];
    }
    if (stickInput.y >= 0.05) {
        inputMap["rStickUp"] = stickInput.y;
    }
    else {
        delete inputMap["rStickUp"];
    }

    if (stickInput.y <= -0.05) {
        inputMap["rStickDown"] = stickInput.y;
    }
    else {
        delete inputMap["rStickDown"];
    }
}
function mapStickTranslationInputToActions(stickInput, inputMap) {
    // NOTE: I have no idea if this is a reasonable threshold value, test with 5.0.0-alpha23+
    if (stickInput.x >= 0.05) {
        inputMap["lStickRight"] = stickInput.x;
    }
    else {
        delete inputMap["lStickRight"];
    }

    if (stickInput.x <= -0.05) {
        inputMap["lStickLeft"] = stickInput.x
    }
    else {
        delete inputMap["lStickLeft"];
    }
    if (stickInput.y >= 0.05) {
        inputMap["lStickUp"] = stickInput.y;
    }
    else {
        delete inputMap["lStickUp"];
    }

    if (stickInput.y <= -0.05) {
        inputMap["lStickDown"] = stickInput.y;
    }
    else {
        delete inputMap["lStickDown"];
    }

}

export default {
    inputControlsMap,
    gamePadControlMap,
    mapStickTranslationInputToActions,
    mapRotationInputToActions,
    normalizeJoystickInputs
};
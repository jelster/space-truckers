import { Sound } from "@babylonjs/core/Audio/sound";
import { Tools } from "@babylonjs/core/Misc/tools";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import DialogBox from "../guis/guiDialog";

function* nextColor() {
    while (true) {
        yield "#0d5088";
        yield "#94342c";
        yield "#e2ba77";
        yield "#787b6d";
    }
}
let colorPicker = nextColor();

function createScoringDialog(advancedTexture, scoreData, scene) {
    let opts = {
        bodyText: 'Time to earn payday!',
        titleText: 'The Drayage Report',
        displayOnLoad: true,
        acceptText: 'Main Menu',
        cancelText: 'Retry'
    };
    let sound = new Sound("scoreSound", scoreSoundUrl, scene, null, { autoplay: false });
    sound.setPlaybackRate(1.65);
    sound.setVolume(0.6);
    let scoreDialog = new DialogBox(advancedTexture, opts, scene);
    let dialog = { scoreDialog };
    dialog.height = "98%";
    let scoringCo = scoringAnimationCo();
    scoreDialog.onDisplayChangeComplete.addOnce(() =>
        scene.onBeforeRenderObservable.runCoroutineAsync(scoringCo))

    function* scoringAnimationCo() {
        let { finalScores } = scoreData;
        let bodyStack = scoreDialog.bodyContainer.children[0];
        let scrollBar = scoreDialog.bodyContainer.verticalBar;
        bodyStack.height = '100%';
        let computedHeight = 0;
        for (i in finalScores) {
            yield Tools.DelayAsync(500);
            let frameCounter = 0
            let label = i;
            let score = Number(finalScores[i]);
            let scoreBlock = new TextBlock("scoreLine", `${label}`);
            scoreBlock.width = "100%";
            scoreBlock.color = colorPicker.next().value;
            scoreBlock.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

            let isFinalScore = label.toLowerCase().includes("final");
            if (isFinalScore) {
                scoreBlock.height = "104px";
                scoreBlock.transformCenterX = scoreBlock.transformCenterY = 0;
                scoreBlock.scaleX = scoreBlock.scaleY = 1.05;
            }
            else {
                scoreBlock.height = "52px";
            }
            computedHeight += scoreBlock.heightInPixels;
            bodyStack.addControl(scoreBlock);
            bodyStack.heightInPixels = computedHeight;
            scrollBar.value = scrollBar.maximum;
            yield Tools.DelayAsync(1800);
            let skipCountUp = label.toLowerCase().includes("bonus");
            if (skipCountUp) {
                scoreBlock.text = `${label}.........${score.toFixed().toLocaleString()}`;
                sound.play();
            }
            else {
                const MAX_COUNT = 50;
                while (frameCounter <= MAX_COUNT) {
                    let currProgress = frameCounter / MAX_COUNT;
                    sound.play();
                    speed = Scalar.SmoothStep(0, score, currProgress);
                    scoreBlock.text = `${label}.........${speed.toFixed().toLocaleString()}`;
                    frameCounter++;
                    yield Tools.DelayAsync(50);
                }
            }
            yield;
        }
        return;
    }
}

export default createScoringDialog;
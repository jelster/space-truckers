import { Tools } from "@babylonjs/core/Misc/tools";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import DialogBox from "../guis/guiDialog";
import HighScoreScreen from "../spaceTruckerHighScores";

const GUI_MASK = 0x2;
const sampleScore = {
    scoreFactors: {
        routeLength: 12450.25,
        cargoCondition: 0.768,
        encounters: 125
    },
    multipliers: {
        transitTime: 1.2, //{ expected: 180, actual: 150, factor: 1.2  },
        delivery: 1.0,
        condition: 0.768,
        encounterTypes: 1.05
    },
    finalScores: {
        'Base Delivery': 1000,
        'Route Score': 14940,
        'Cargo Score': 11474,
        'Delivery Bonus': 10000,
        'Encounters': 1312,
        'Final Total': 38726
    }
};

function* nextColor() {
    while (true) {
        yield "#0d5088";
        yield "#94342c";
        yield "#e2ba77";
        yield "#787b6d";
    }
}
let colorPicker = nextColor();

function createScoringDialog(scoreData, drivingScreen) {
    let opts = {
        bodyText: 'Time to earn payday!',
        titleText: 'The Drayage Report',
        displayOnLoad: true,
        acceptText: 'Next',
        cancelText: 'Retry'
    };
    const { scene, soundManager } = drivingScreen;
    const sound = soundManager.sound('scoring');
    let scoreDialog = new DialogBox(opts, scene);
    scoreDialog.advancedTexture.layer.layerMask = GUI_MASK;
    scoreDialog.userActionSkip = false;
    scoreDialog.dialogContainer.height = "98%";
    scoreDialog.onAcceptedObservable.add(async () => {
        let score = scoreData.finalScores['Final Total'];
        await scoreDialog.hide();
        let scoreScreen = HighScoreScreen(scene, score);
        scoreScreen.onCancelledObservable.add(async () => {
            await scoreDialog.show();
        });
    });
    let scoringCo = scoringAnimationCo();
    scoreDialog.scoreCoInvoke = scene.onBeforeRenderObservable.runCoroutineAsync(scoringCo);
    
    return scoreDialog;

    function* scoringAnimationCo() {
        let { finalScores } = scoreData ?? sampleScore;
        let bodyStack = scoreDialog.bodyContainer.children[0];
        let scrollBar = scoreDialog.bodyContainer.verticalBar;
        bodyStack.height = '100%';

        for (let i in finalScores) {
            yield Tools.DelayAsync(500);
            scoreDialog.bodyText = '';
            let frameCounter = 0
            let label = i;
            let score = Number(finalScores[i]);
            let scoreBlock = createScoringBlock(label);

            bodyStack.addControl(scoreBlock);
            scrollBar.value = scrollBar.maximum;
            yield Tools.DelayAsync(1800);

            let skipCountUp = label.toLowerCase().includes("bonus");
            const MAX_COUNT = (60 / (60 + scene.getEngine().getFps())) * 60;
            while (frameCounter <= MAX_COUNT) {
                sound.play();
                if (scoreDialog.userActionSkip || skipCountUp) {
                    scoreDialog.userActionSkip = false;
                    break;
                }
                let currProgress = frameCounter / MAX_COUNT;
                let speed = Scalar.SmoothStep(0, score, currProgress);
                let formatted = speed.toFixed().toLocaleString();
                scoreBlock.text = getText(label, formatted);
                frameCounter++;
                yield Tools.DelayAsync(10);
            }
            let scoreFixed = score.toFixed().toLocaleString();
            scoreBlock.text = getText(label, scoreFixed);

            yield;
        }
        return;

        function getText(label, text) {
            const maxLength = 23;
            const labelLength = label.length;
            let textLength = text.length;
            let diff = maxLength - (labelLength + textLength);
            return `${label}${'.'.repeat(diff)}${text}`;

        }
        function createScoringBlock(label) {
            let scoreBlock = new TextBlock("scoreLine", `${label}`);
            scoreBlock.width = "100%";
            scoreBlock.resizeToFit = true;
            scoreBlock.color = colorPicker.next().value;
            scoreBlock.textHorizontalAlignment = scoreBlock.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            scoreBlock.paddingLeft = scoreBlock.paddingBottom = "10px";
            let isFinalScore = label.toLowerCase().includes("final");
            if (isFinalScore) {
                scoreBlock.fontSize = "12.5%";
            }
            else {
                scoreBlock.fontSize = "7.55%";
            }
            return scoreBlock;
        }
    }
}

export default createScoringDialog;
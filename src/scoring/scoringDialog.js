import { Tools } from "@babylonjs/core/Misc/tools";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { Scalar } from "@babylonjs/core/Maths/math.scalar";
import DialogBox from "../guis/guiDialog";

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
        acceptText: 'Main Menu',
        cancelText: 'Retry'
    };
    const { scene, soundManager } = drivingScreen;
    const sound = soundManager.sound('scoring');
    let scoreDialog = new DialogBox(opts, scene);
    scoreDialog.userActionSkip = false;
    scoreDialog.dialogContainer.height = "98%";
    let scoringCo = scoringAnimationCo();
    scene.onBeforeRenderObservable.runCoroutineAsync(scoringCo);
    return scoreDialog;

    function* scoringAnimationCo() {
        let { finalScores } = scoreData ?? sampleScore;
        let bodyStack = scoreDialog.bodyContainer.children[0];
        let scrollBar = scoreDialog.bodyContainer.verticalBar;
        bodyStack.height = '100%';
        let computedHeight = 0;

        for (let i in finalScores) {
            yield Tools.DelayAsync(500);
            scoreDialog.bodyText = '';
            let frameCounter = 0
            let label = i;
            let score = Number(finalScores[i]);
            let scoreBlock = createScoringBlock(label);
            computedHeight += scoreBlock.heightInPixels;
            bodyStack.addControl(scoreBlock);
            bodyStack.heightInPixels = computedHeight;
            scrollBar.value = scrollBar.maximum;
            yield Tools.DelayAsync(1800);

            let skipCountUp = label.toLowerCase().includes("bonus");
            if (skipCountUp || scoreDialog.userActionSkip) {
                scoreBlock.text = `${label}.........${score.toFixed().toLocaleString()}`;
                sound.play();
                scoreDialog.userActionSkip = false;
            }
            else {
                const MAX_COUNT = 100;
                while (frameCounter <= MAX_COUNT) {
                    sound.play();
                    if (scoreDialog.userActionSkip) {
                        scoreBlock.text = `${label}.........${score.toFixed().toLocaleString()}`;
                        break;
                    }
                    let currProgress = frameCounter / MAX_COUNT;
                    let speed = Scalar.SmoothStep(0, score, currProgress);
                    scoreBlock.text = `${label}.........${speed.toFixed().toLocaleString()}`;
                    frameCounter++;
                    yield Tools.DelayAsync(10);
                }
            }
            yield;
        }
        return;

        function createScoringBlock(label) {
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
            return scoreBlock;
        }
    }
}

export default createScoringDialog;
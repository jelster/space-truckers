import { Tools } from "@babylonjs/core/Misc/tools";
import { InputText } from "@babylonjs/gui/2D/controls/inputText";
import { VirtualKeyboard } from "@babylonjs/gui/2D/controls/virtualKeyboard";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

import DialogBox from './guis/guiDialog';
import SpaceTruckersDb from './spaceTruckerDatabase';

const dialogOptions = {
    bodyText: 'Body Text',
    titleText: 'Space-Truckers: The High Scores!',
    acceptText: 'Accept',
    cancelText: 'Go Back',
    displayOnLoad: false
};

let ScoreBoard = async function (scene) {

    const dialog = new DialogBox(dialogOptions, scene);
    
    const databaseManager = SpaceTruckersDb();
    let sp = new StackPanel("hs-stack");
    sp.paddingTop = "70px";
    sp.fontFamily = "Courier, Mono";
    dialog.bodyContainer.addControl(sp);
    dialog.dialogContainer.height = "99%";
    dialog.dialogContainer.width = "75%";
    dialog.bodyText = '';
    dialog.accept.isVisible = false;
    return scoreBoardCoro;
    async function* scoreBoardCoro(newScore) {

        yield databaseManager.readyPromise;
        var scores = await databaseManager.retrieveScores();
        
        let isHighScore = scores.some(score => score.score < newScore);
        let scoreToAdd = null;
        let virtualKB = null;
        let nameInput = null;

        yield dialog.show();
        if (isHighScore) {
            scene.editHighScores = true;
            scoreToAdd = { name: " ", score: newScore };
            scores.push(scoreToAdd);

            nameInput = new InputText("newScoreName", scoreToAdd.name);
            nameInput.resizeToFit = true;
            nameInput.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            nameInput.background = "black";
            nameInput.color = "white";
            nameInput.onFocusSelectAll = true;

            nameInput.height = "40px";

            virtualKB = VirtualKeyboard.CreateDefaultLayout();
            virtualKB.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            dialog.advancedTexture.addControl(virtualKB);
            virtualKB.connect(nameInput);
            nameInput.onTextChangedObservable.add((ev, es) => {
                if (ev.text.indexOf('↵') >= 0 || ev.text.length >= 3 || ev.currentKey === "Enter") {
                    scene.editHighScores = false;
                }
            });

        }
        console.log(scores);
        displayScores(scores);
        console.log('created score blocks. is in edit mode? ' + scene.editHighScores);
        yield;
        while (scene.editHighScores) {
            yield Tools.DelayAsync(1000);
        }
        if (newScore) {
            scoreToAdd.name = nameInput.text.substring(0,3);
            await databaseManager.addScore(scoreToAdd);
            console.log('saved newScore', scoreToAdd);
            virtualKB.disconnect();
            virtualKB.dispose();
            newScore = null;
            nameInput.dispose();
            scoreToAdd = null;

            scores = await databaseManager.retrieveScores();
            await displayScores(scores);
        }

        return;

        async function displayScores(scores) {
            scores.sort((a, b) => b.score - a.score);
            sp.clearControls();
            for (let i = 0; i < scores.length; i++) {
                let sc = getScoreTextLine(scores[i]);
                if (scoreToAdd === scores[i]) {
                    sc = "👏👏👏" + sc.trim();
                    sp.addControl(nameInput);
                }

                let tb = new TextBlock("hs-" + i, sc);
                tb.resizeToFit = true;
                tb.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                sp.addControl(tb);
                await Tools.DelayAsync(100);
            }
        }
        function getScoreTextLine(s) {
            if (!s.score) {
                return s.name;
            }
            let scoreText = s.score.toFixed(0);
            let text = `${s.name}${'.'.repeat(20 - scoreText.length)}${s.score}\n`;
            return text;
        }
    }
}

let HighScoreScreen = async function (scene, score) {
    let scoreBo = await ScoreBoard(scene);
    scene.onBeforeRenderObservable.runCoroutineAsync(scoreBo(score));
};

export default HighScoreScreen;
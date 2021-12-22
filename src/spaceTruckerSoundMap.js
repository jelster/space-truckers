import backgroundMusicUrl from "../assets/music/space-truckers-overworld-theme.m4a";
import titleSongUrl from "../assets/music/space-trucker-title-theme.m4a";
import uiWhooshSoundUrl from "../assets/sounds/med_whoosh_00.wav";
import uiSlideUrl from "../assets/sounds/UI_Misc03.wav";
import ambientNoise from "../assets/sounds/City_Amb_03.wav";
import uiClickSoundUrl from "../assets/sounds/UI_Clicks01.wav";
import uiErrorSoundUrl from "../assets/sounds/UIerror2.wav";
import uiEncounterSoundUrl from "../assets/sounds/UI_Misc09.wav";

const soundFileMap = {
    "title": { url: titleSongUrl, channel: 'music', loop: true },
    "overworld": { url: backgroundMusicUrl, channel: 'music', loop: true, level: 0.75 },
    "whoosh": { url: uiWhooshSoundUrl, channel: 'ui', loop: false },
    "menu-slide": { url: uiSlideUrl, channel: 'ui', loop: false },
    "ambient": { url: ambientNoise, channel: 'music', loop: true },
    "click": { url: uiClickSoundUrl, channel: 'ui', loop: false },
    "error": { url: uiErrorSoundUrl, channel: 'ui', loop: false },
    "encounter": { url: uiEncounterSoundUrl, channel: 'ui', loop: false }
};
const soundList = Object.keys(soundFileMap);
soundFileMap.keys = soundList;
export default soundFileMap;

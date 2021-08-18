import backgroundMusicUrl from "../assets/music/space-truckers-overworld-theme.m4a";
import titleSongUrl from "../assets/music/space-trucker-title-theme.m4a";
import uiWhooshSoundUrl from "../assets/sounds/med_whoosh_00.wav";

const soundFileMap = {
    "title": { url: titleSongUrl, channel: 'music', loop: true },
    "overworld": { url: backgroundMusicUrl, channel: 'music', loop: true },
    "whoosh": { url: uiWhooshSoundUrl, channel: 'ui', loop: false }
};

export default soundFileMap;


import { Observable, Observer, Sound, SoundTrack } from "@babylonjs/core";
import backgroundMusicUrl from "../assets/music/space-truckers-overworld-theme.m4a";
import titleSongUrl from "../assets/music/space-trucker-title-theme.m4a";


const soundFileMap = {
    "title": { url: titleSongUrl, channel: 'music' },
    "overworld": { url: backgroundMusicUrl, channel: 'music' }
};

class SpaceTruckerSoundManager {
    onReadyObservable = new Observable();
    channels = {
        music: null,
        sfx: null,
        ui: null
    };
    registeredSounds = {};

    sound(id) {
        return this.registeredSounds[id];
    }
    constructor(scene, ...soundIds) {

        this.channels.music = new SoundTrack(scene, { mainTrack: false, volume: 0.89 });
        this.channels.sfx = new SoundTrack(scene, { mainTrack: true, volume: 1 });
        this.channels.ui = new SoundTrack(scene, { mainTrack: false, volume: 0.94 });
        const onReadyPromises = [];
        soundIds.forEach(soundId => {
            const mapped = soundFileMap[soundId];
            const chan = this.channels[soundId] ?? scene.mainSoundTrack;
            if (!mapped) {
                console.log('Sound not found in mapping file', soundId);
                return;
            }
            const prom = new Promise((resolve, reject) => {
                this.registeredSounds[soundId] = new Sound(soundId, mapped.url, scene, () => {
                    chan.addSound(this.registeredSounds[soundId]);
                    resolve(soundId);
                }, {
                    autoplay: false,
                    loop: mapped.channel === 'music',
                    spatialSound: mapped.channel === 'sfx'
                });
            });
            onReadyPromises.push(prom);


        });
        Promise.all(onReadyPromises).then(readyIds => this.onReadyObservable.notifyObservers(readyIds));
    }

     
}

export default SpaceTruckerSoundManager;
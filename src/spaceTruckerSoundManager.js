

import { Observable, Observer, Sound, SoundTrack } from "@babylonjs/core";
import backgroundMusicUrl from "../assets/music/space-truckers-overworld-theme.m4a";
import titleSongUrl from "../assets/music/space-trucker-title-theme.m4a";


const soundFileMap = {
    "title": { url: titleSongUrl, channel: 'music', loop: true },
    "overworld": { url: backgroundMusicUrl, channel: 'music', loop: true }
};

class SpaceTruckerSoundManager {
    onReadyObservable = new Observable();
    channels = {
        music: null,
        sfx: null,
        ui: null
    };
    registeredSounds = {};

    onSoundPlaybackEnded = new Observable();

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
                const sound = new Sound(soundId, mapped.url, scene, () => {
                    chan.addSound(this.registeredSounds[soundId]);
                    resolve(soundId);
                }, {
                    autoplay: false,
                    loop: mapped.loop,
                    spatialSound: mapped.channel === 'sfx'
                });
                sound.onEndedObservable.add((endedSound, state) => {
                    this.onSoundPlaybackEnded.notifyObservers(endedSound.name);
                });
                this.registeredSounds[soundId] = sound;
            });
            onReadyPromises.push(prom);


        });
        Promise.all(onReadyPromises).then(readyIds => this.onReadyObservable.notifyObservers(readyIds));
    }

     
}

export default SpaceTruckerSoundManager;
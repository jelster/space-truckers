import { Observable } from "@babylonjs/core/Misc/observable";
import { Sound } from "@babylonjs/core/Audio/sound";
import { SoundTrack } from "@babylonjs/core/Audio/soundTrack";

import soundFileMap from "./spaceTruckerSoundMap";
class SpaceTruckerSoundManager {
    onSoundPlaybackEnded = new Observable();
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
        Promise.all(onReadyPromises)
            .then(readyIds => this.onReadyObservable.notifyObservers(readyIds));
    }

     
}

export default SpaceTruckerSoundManager;
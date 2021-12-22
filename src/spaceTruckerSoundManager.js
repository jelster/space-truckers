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
        ui: null,
        ambient: null
    };
    registeredSounds = {};
    sound(id) {
        return this.registeredSounds[id];
    }
    constructor(scene, ...soundIds) {
        if (!scene.soundtracks?.length) {
            this.channels.music = new SoundTrack(scene, { mainTrack: false, volume: 0.95 });
            this.channels.sfx = new SoundTrack(scene, { mainTrack: true, volume: 1 });
            this.channels.ui = new SoundTrack(scene, { mainTrack: false, volume: 0.78 });
            this.channels.ambient = new SoundTrack(scene, { mainTrack: false, volume: 0.65 });
        }
        else {
            this.channels.music = scene.soundtracks[0];
            this.channels.sfx = scene.soundtracks[1];
            this.channels.ui = scene.soundtracks[2];
            this.channels.ambient = scene.soundtracks[3];
        }
        
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
                    spatialSound: mapped.channel === 'sfx',
                    volume: mapped.level ?? 1.0
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

    stopAll() {
        Object.values(this.registeredSounds).forEach(sound => sound.stop());
    }

    dispose() {
        this.stopAll();
        Object.values(this.registeredSounds).forEach(sound => sound.dispose());
    }

     
}

export default SpaceTruckerSoundManager;
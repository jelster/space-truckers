import * as Ammo from "ammo.js";

export let ammoModule;
export const ammoReadyPromise = new Promise((resolve) => {
    new Ammo().then((res) => {
        ammoModule = res;
        resolve(res);
    });
});
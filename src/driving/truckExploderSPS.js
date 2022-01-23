import { SolidParticleSystem } from "@babylonjs/core/Particles/solidParticleSystem";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { setAndStartTimer } from "@babylonjs/core";

import { screenConfig } from './gameData';

const { SCENE_MASK } = screenConfig;

function* blah(truck) {
    while (true) {
        while (truck.state === TRUCK_STATES.ALIVE) {
            yield;
        }

    }
}

function initialize(truck, scene) {
    let truckModel = truck.mesh;
    let sps = new SolidParticleSystem("sps", scene, { useModelMaterial: true });
    let speed = 30;
    let boom = false;
    sps.vars.target = Vector3.Zero();                                               // the target point where to set the explosion center
    sps.vars.tmp = Vector3.Zero();                                                  // tmp vector3
    sps.vars.justClicked = false;                                                           // flag to compute or not the initial velocities
    sps.vars.radius = 0.25;
    sps.vars.minY = -100;
    sps.digest(truckModel, { facetNb: 8, delta: 240 });

    let s = sps.buildMesh();
    s.layerMask = SCENE_MASK;
    sps.setParticles();
    sps.refreshVisibleSize();
    sps.updateParticle = updateParticle;
    let impostors = scene.getPhysicsEngine().getImpostors();
    let collOb = truckModel.physicsImpostor.registerOnPhysicsCollide(impostors, truckOnPhysicsCollide);
    let destroyOb = truck.onDestroyedObservable.add(onTruckDestroyed);
    let renderOb = scene.onBeforeRenderObservable.add(() => sps.setParticles());
    function onTruckDestroyed() {
        console.log('truck destroyed');
        truckModel.isVisible = false;
        sps.mesh.position.copyFrom(truckModel.position);
        sps.mesh.rotationQuaternion = truckModel.rotationQuaternion.clone();
        sps.vars.target.copyFrom(lastCollidePoint);
        sps.vars.target.normalize();
        sps.vars.target.scaleInPlace(sps.vars.radius);
        sps.vars.target.addInPlace(lastCollidePoint);
        sps.vars.justClicked = true;
        sps.setParticles();
        boom = true;
        
    }
    let lastCollidePoint = null;
    function truckOnPhysicsCollide(collider, against, point) {
        if (truck.currentState == 'alive') {
            lastCollidePoint = point;
            let collisionSpeed = collider.getLinearVelocity()
                .addInPlace(against.getLinearVelocity())
                .length();
            console.log('collision speed', collisionSpeed);
            let damageReceived = collisionSpeed / 100;
            truck.health -= damageReceived ?? 0;
        }
    }

    function updateParticle(p) {
        // just after the click, set once the initial velocity
        if (sps.vars.justClicked) {
            // let's give them an initial velocity according to their distance from the explosion center
            p.position.subtractToRef(sps.vars.target, sps.vars.tmp);
            var len = sps.vars.tmp.length();
            var scl = (len < 0.001) ? 1.0 : sps.vars.radius / len;
            sps.vars.tmp.normalize();
            p.velocity.x += sps.vars.tmp.x * scl * speed * (1 + Math.random() * .3);
            p.velocity.y += sps.vars.tmp.y * scl * speed * (1 + Math.random() * .3);
            p.velocity.z += sps.vars.tmp.z * scl * speed * (1 + Math.random() * .3);
            p.rand = Math.random();
            if (p.idx == sps.nbParticles - 1) {
                sps.vars.justClicked = false;  // last particle initialized
            }
        }
        // move the particle
        if (boom && !sps.vars.justClicked) {
            if (p.position.y < sps.vars.minY) {
                p.position.y = sps.vars.minY;
                p.velocity.y = 0;
                p.velocity.x = 0;
                p.velocity.z = 0;
            } else {
                // p.velocity.y += sps.vars.gravity;
                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;
                p.position.z += p.velocity.z;
                // rotate
                p.rotation.x += (p.velocity.z) * p.rand;
                p.rotation.y += (p.velocity.x) * p.rand;
                p.rotation.z += (p.velocity.y) * p.rand;
            }
        }
    }
}
export default initialize;

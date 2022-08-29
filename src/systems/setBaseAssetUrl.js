import { ParticleSystemSet } from "@babylonjs/core/Particles/particleSystemSet";

export default function () {
    // HACK: The ParticleSystemSet doesn't always handle URL paths correctly, adding slashes
    const baseAppUri = document.baseURI.substring(0, document.baseURI.lastIndexOf("/"));
    // Resolves issue #78
    ParticleSystemSet.BaseAssetsUrl = baseAppUri;
}
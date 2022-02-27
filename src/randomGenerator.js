const NUM_SAMPLES = 6;
let getGaussianRandom = function() {
    let sum = 0;
    for (let i = 0; i < NUM_SAMPLES; ++i) {
        sum += Math.random();
    }
    return sum / NUM_SAMPLES;
}

export default getGaussianRandom;
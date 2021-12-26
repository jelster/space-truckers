const DELIVERY_BONUS = 10000;
const BASE_DELIVERY_SCORE = 1000;

let createDefaultScoring = function() {
    return {
        scoreFactors: {
            routeLength: 0.0,
            cargoCondition: 0.0,
            encounters: 0,
            launch: 0.0,
        },
        multipliers: {
            transitTime: { expected: 0, actual: 0, factor: 1.0 },
            delivery: 1.1,
            condition: 1.0,
            encounterTypes: 1.0
        },
        finalScores: {
            'Base Delivery': 0,
            'Route Score': 0,
            'Cargo Score': 0,
            'Delivery Bonus': 0,
            'Encounters': 0,
            'Final Total': 0
        }
    };
}

let calculateEncounterScoreToRef = function(route, score) {
    let s = score ?? createDefaultScoring();
    let { finalScores, multipliers, scoreFactors } = s;
    const { pathPoints } = route;
    const encounters = pathPoints
        .map(p => p.encounter)
        .filter(e => e);
    console.log(encounters);

    scoreFactors.encounters = encounters.length;
    let encounterModifier = encounters
        .reduce((prev, curr, cidx, arr) => {
            if (curr === null) {
                return prev;
            }
            return prev.scoreModifier + curr.scoreModifier;
        });
    multipliers.encounterTypes = encounterModifier;
    let encounterScore = encounters.length * multipliers.encounterTypes;
    finalScores['Encounters'] = encounterScore;    
    
    return s;
}

let calculateRouteScoreToRef = function(route, score){
    let s = score ?? createDefaultScoring();
    let { finalScores, multipliers, scoreFactors } = s;
    let { expected, actual, factor } = multipliers.transitTime;

    let {launchForce, currentTransitTime, transitTime, distanceTraveled} = route.launchForce;

    expected = transitTime;
    actual = currentTransitTime;
    factor = 0.5 + expected / actual;
    scoreFactors.routeLength = distanceTraveled;

    finalScores['Route Score'] = (distanceTraveled * factor) - (launchForce * factor);
    
    return s;
};

let calculateCargoScoreToRef = function(route, score) {
    let s = score ?? createDefaultScoring();
    let { finalScores, multipliers, scoreFactors } = s;
    
    const { cargoCondition } = route;
    scoreFactors.cargoCondition = cargoCondition;
    let cargoScore = cargoCondition * multipliers.condition;
    finalScores['Cargo Score'] = cargoScore;
    
    return s;
}

let calculateBonusScoreToRef = function(route, score) {
    let s = score ?? createDefaultScoring();
    
    if (route.cargoCondition >= 100) {
        s.finalScores['Delivery Bonus'] = DELIVERY_BONUS;
    }
    else {
        s.finalScores['Delivery Bonus'] = 0;
    }
    
    return s;
}

let calculateFinalScoreToRef = function(score) {
    let { finalScores } = score;
    finalScores['Base Delivery'] = BASE_DELIVERY_SCORE;
    let finalScore = Object.values(finalScores)
        .reduce((prev, curr) => prev + Number(curr));
    score.finalScores['Final Total'] = finalScore;
    
    return score;
}

let computeScores = function(route) {
    let score = createDefaultScoring();
    calculateEncounterScoreToRef(route, score);
    calculateRouteScoreToRef(route, score);
    calculateCargoScoreToRef(route, score);
    calculateBonusScoreToRef(route, score);
    calculateFinalScoreToRef(score);

    console.log(score);

    return score;
}

export default computeScores;
export {createDefaultScoring};

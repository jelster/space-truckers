import * as rocks from './asteroid_belt/rock_hazard';
import * as flares from './inner_system/solar_flare';

const asteroid_belt = [
    {
        chance: 0.9, 
        encounter: rocks
    }
];
const inner_system = [
    {
        chance: 0.9,
        encounter: flares
    }
];

export default { asteroid_belt, inner_system };
export { asteroid_belt };
export { inner_system };
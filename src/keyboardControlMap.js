const kbControlMap = {
    w: 'MOVE_UP',
    ArrowUp: 'MOVE_UP',
    38: 'MOVE_UP',
    s: 'MOVE_DOWN',
    40: 'MOVE_DOWN',
    a: 'MOVE_LEFT',
    37: 'MOVE_LEFT',
    d: 'MOVE_RIGHT',
    39: 'MOVE_RIGHT',
    Enter: 'ACTIVATE',
    Return: 'ACTIVATE',
    13: 'ACTIVATE',
    Backspace: 'GO_BACK',
    Delete: 'GO_BACK',
    46: 'GO_BACK'
};

// {  
// MOVE_UP: ['w', 'ArrowUp', 38 ],
//     MOVE_DOWN: ['s', 'ArrowDown', 40],
//     MOVE_LEFT: ['a', 'ArrowLeft', 37],
//     MOVE_RIGHT: ['d', 'ArrowRight', 39],
//     ACTIVATE: ['Enter', 'Return', 13],
//     GO_BACK: ['Backspace', 'Delete', 8, 46]
// };

export default kbControlMap;
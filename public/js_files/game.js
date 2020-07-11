const init = require('./game_init');
const animate = require('./game_init');
const onWindowResize = require('./game_init');

console.log('hello');

init()
window.addEventListener("resize", onWindowResize);
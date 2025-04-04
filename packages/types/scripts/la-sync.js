const tiged = require('tiged');

const emitter = tiged('git@github.com:uib-ub/la-json-validator/schema#local', {
  cache: true,
  force: true,
  verbose: true,
  mode: "git",
});

emitter.on('info', info => {
  console.log(info.message);
});

emitter.clone('src/la/schemas').then(() => {
  console.log('done');
});

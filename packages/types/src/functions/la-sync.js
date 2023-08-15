const tiged = require('tiged');

const emitter = tiged('git@github.com:linked-art/linked.art/docs/api/1.0/schema#master', {
  cache: true,
  force: true,
  verbose: true,
  mode: "git",
});

emitter.on('info', info => {
  console.log(info.message);
});

emitter.clone('src/la-schemas').then(() => {
  console.log('done');
});

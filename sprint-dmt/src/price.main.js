/* eslint-disable no-console */
import {fork} from 'child_process';

const bundles = process.argv[2];
for (let i = 0; i < bundles; i++) {
  const compute = fork('src/price.js', [i]);
  compute.send('start');
  compute.on('message', num => {
    console.log(`Bundle ${num} done`);
  });
}


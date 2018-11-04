import {fork} from 'child_process';
import chalk from 'chalk';

/* eslint-disable no-console */

const importType = process.argv[2];
const bundleStartNumber = Number.parseInt(process.argv[3]);
const bundleEndNumber = Number.parseInt(process.argv[4]);


if (bundleStartNumber >= 0 && bundleEndNumber >= 0) {
  for (let i = bundleStartNumber; i < bundleEndNumber; i++) {
    const runner = fork('src/import-fabric.js', [importType, i]);
    runner.send('start');
    runner.on('message', num => {
      console.log(chalk.yellowBright( `Bundle ${num} done`));
      showUsedResources();
    });
  }

} else if (bundleStartNumber >= 0) {
  const runner = fork('src/import-fabric.js', [importType, bundleStartNumber]);
  runner.send('start');
  runner.on('message', num => {
    console.log(chalk.yellowBright( `Bundle ${num} done`));
    showUsedResources();
  });

} else {
  const runner = fork('src/import-fabric.js', [importType]);
  runner.send('start');
}

function showUsedResources() {
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}


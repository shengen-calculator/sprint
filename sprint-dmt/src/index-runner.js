import {fork} from 'child_process';
import chalk from 'chalk';
import Util from './util';


/* eslint-disable no-console */

class IndexRunner {
  constructor() {
    this.threadLimit = 2;
    this.identityLine = [];
    this.delay = 100;
    this.threadInWork = 0;
    this.taskType = process.argv[2];
    this.currentIndex = 0;
  }

  run() {
    const runner = fork('src/firestore-iterator.js');
    runner.send('start');
    runner.on('message', msg => {
      if (msg) {
        this.identityLine.push(msg);
      }
    });
    this.launchIndexator();
  }

  launchIndexator() {
    setTimeout(() => {
      if (this.threadInWork < this.threadLimit &&
        this.identityLine[this.currentIndex] &&
        this.identityLine[this.currentIndex] !== -1) {

        const runner = fork('src/task-fabric.js',
          [this.taskType, this.identityLine[this.currentIndex]]);
        this.threadInWork++;
        this.currentIndex++;
        runner.send('start');
        runner.on('message', num => {
          console.log(chalk.yellowBright(`Bundle ${num} done`));
          Util.showUsedResources();
          this.threadInWork--;
        });
      }

      if (this.identityLine[this.currentIndex] !== -1) {
        this.launchIndexator();
      }
    }, this.delay);
  }
}

const indexRunner = new IndexRunner();
indexRunner.run();

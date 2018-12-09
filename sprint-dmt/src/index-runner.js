import {fork} from 'child_process';
import chalk from 'chalk';
import Util from './util';
import {logger} from './logger';

/* eslint-disable no-console */

class IndexRunner {
  constructor() {
    this.threadLimit = 1;
    this.identityLine = [];
    this.delay = 100;
    this.threadInWork = 0;
    this.taskType = process.argv[2];
    this.currentIndex = 0;
    this.counter = 1;
  }

  run() {
    this.identityLine.push(1);
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
        const startTime = new Date();
        runner.send('start');
        runner.on('message', () => {
          console.log(chalk.yellowBright(`Bundle ${this.counter} done`));
          const endTime = new Date();
          console.log(chalk.yellow(`Elapsed time: ${(endTime.getTime() -
            startTime.getTime()) / 1000} sec.`));
          Util.showUsedResources();
          this.counter++;
          this.threadInWork--;
          logger.log({
            level: 'info',
            message: `Imported batch #${this.counter}. Elapsed time: ${(endTime.getTime() -
              startTime.getTime()) / 1000} sec.`
          });
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

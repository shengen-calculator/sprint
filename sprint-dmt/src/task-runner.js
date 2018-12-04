import {fork} from 'child_process';
import chalk from 'chalk';

/* eslint-disable no-console */

class TaskRunner {
  constructor() {
    this.threadLimit = 5;
    this.delay = 100;
    this.threadInWork = 0;
    this.taskType = process.argv[2];
    this.bundleStartNumber = Number.parseInt(process.argv[3]);
    this.bundleEndNumber = Number.parseInt(process.argv[4]);
  }

  launchTask() {
    if (this.bundleStartNumber >= 0) {
      if (this.bundleEndNumber > 0) {
        if (this.bundleStartNumber > this.bundleEndNumber) {
          return;
        }
        setTimeout(() => {
          while (this.threadInWork < this.threadLimit &&
          this.bundleStartNumber <= this.bundleEndNumber) {
            const runner = fork('src/task-fabric.js', [this.taskType, this.bundleStartNumber]);
            this.threadInWork++;
            this.bundleStartNumber++;
            runner.send('start');
            runner.on('message', num => {
              console.log(chalk.yellowBright(`Bundle ${num} done`));
              this.showUsedResources();
              this.threadInWork--;
            });
          }

          if (this.bundleStartNumber <= this.bundleEndNumber) {
            this.launchTask();
          }

        }, this.delay);

      } else {
        if (this.threadLimit > 0) {
          const runner = fork('src/task-fabric.js',
            [this.taskType, this.bundleStartNumber]);
          runner.send('start');
          runner.on('message', num => {
            console.log(chalk.yellowBright(`Bundle ${num} done`));
            this.showUsedResources();
          });
        }
      }

    } else {
      const runner = fork('src/task-fabric.js', [this.taskType]);
      runner.send('start');
    }

  }

  showUsedResources() {
    const used = process.memoryUsage();
    for (let key in used) {
      console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
    }
  }

}

const taskRunner = new TaskRunner();
taskRunner.launchTask();

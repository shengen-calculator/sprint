import chalk from 'chalk';
import {auth, user, password, database} from './config/firestore';
import {logger} from './logger';

/* eslint-disable no-console */
class Iterator {
  constructor () {
    this.bundleSize = 1000;
  }
  Run() {
    auth.signInWithEmailAndPassword(user, password)
      .then(() => {
        console.log(chalk.green(`Firestore authentication success`));
        this.readBatch(null);
      })
      .catch(e => {
        console.log(chalk.red(`Firestore connection error: ${e.message}`));
        logger.log({
          level: 'error',
          message: `Firestore connection error: ${e.message}`
        });
      })
  }

  readBatch(lastVisible) {
    let productRef;
    if(lastVisible) {
      productRef = database.collection("products")
        .startAfter(lastVisible)
        .limit(this.bundleSize);
    } else {
      productRef = database.collection("products")
        .limit(this.bundleSize);
    }
    const current = this;
    productRef.get().then(function(documentSnapshots) {
      if(documentSnapshots.docs.length < current.bundleSize) {
        process.send(-1);
        process.exit();
      } else {
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
        process.send(lastVisible.id);
        current.readBatch(lastVisible);
      }
    })
  }
}

const iterator = new Iterator();
iterator.Run();

import chalk from 'chalk';
import {auth, user, password, database} from './config/firestore';
import {logger} from './logger';

/* eslint-disable no-console */
class Iterator {
  constructor () {
    this.limit = 100;
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
      productRef = database.collection("products").where('brand', '==','TESLA')
        .startAfter(lastVisible)
        .limit(this.limit);
    } else {
      productRef = database.collection("products").where('brand', '==','TESLA')
        .limit(this.limit);
    }
    const current = this;
    productRef.get().then(function(documentSnapshots) {
      if(documentSnapshots.docs.length < current.limit) {
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

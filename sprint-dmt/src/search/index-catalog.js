import chalk from 'chalk';
import {auth, user, password, database} from '../config/firestore';

/* eslint-disable no-console */

class IndexCatalog {
  constructor() {
    this.limit = 100;
    this.batchSize = 25;
    this.bundleSize = 4;
    this.currentBatch = 0;
  }

  RunIndexator() {
    if (process.argv[3]) {

      auth.signInWithEmailAndPassword(user, password)
        .then(() => {
          if (process.argv[3] === '1') {
            this.HandleBundle();
          } else {
            database.collection("products").doc(process.argv[3]).get().then((startDoc) => {
              this.HandleBundle(startDoc);
            })
              .catch(e => {
                console.log(chalk.red(`Get start doc error: ${e.message}`));
              })
          }
        })
        .catch(e => {
          console.log(chalk.red(`Firestore connection error: ${e.message}`));
        })
    }
  }

  HandleBundle(startDoc) {
    let productRef;
    if (startDoc) {
      productRef = database.collection("products").where('brand', '==', 'TESLA')
        .startAfter(startDoc)
        .limit(this.batchSize);
    } else {
      productRef = database.collection("products").where('brand', '==', 'TESLA')
        .limit(this.batchSize);
    }
    const current = this;
    productRef.get().then(function (batchSnapshot) {
      current.HandleBatch(batchSnapshot);
      current.currentBatch++;
      if (current.currentBatch < current.bundleSize &&
        current.batchSize === batchSnapshot.docs.length) {
        current.HandleBundle(batchSnapshot.docs[batchSnapshot.docs.length - 1])
      } else {
        process.send(`${process.argv[3]}`);
        process.exit();
      }
    })

  }

  HandleBatch(batchSnapshot) {
    console.log(batchSnapshot.docs[0].id)

  }

  HandlePosition(doc) {

  }


}

export default IndexCatalog;

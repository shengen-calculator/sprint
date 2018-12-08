import chalk from 'chalk';
import {auth, user, password, database} from '../config/firestore';
import Util from '../util';

/* eslint-disable no-console */

class IndexCatalog {
  constructor() {
    this.batchSize = 25;
    this.batchQuantity = 4;
    this.currentBatch = 0;
    this.currentBatchLength = 0;
    this.currentPos = 0;
    this.batchSnapshot = {};
    this.batch = {};
  }

  RunIndexator() {
    if (process.argv[3]) {

      auth.signInWithEmailAndPassword(user, password)
        .then(() => {
          if (process.argv[3] === '1') {
            this.HandleBundle();
          } else {
            database.collection("products").doc(process.argv[3]).get()
              .then((startDoc) => {
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
    this.batch = database.batch();
    const current = this;
    productRef.get()
      .then(function (batchSnapshot) {
        current.currentBatchLength = batchSnapshot.docs.length + current.currentBatchLength;
        if (batchSnapshot.docs.length > 0) {
          current.batchSnapshot = batchSnapshot;
          current.HandleBatch();
        } else {
          process.send(`${process.argv[3]}`);
          process.exit();
        }

      })
  }

  HandleBatch() {
    const index = this.currentPos - this.currentBatch * this.batchSize;

    if (this.currentBatchLength > this.currentPos) {
      this.HandlePosition(this.batchSnapshot.docs[index]);
    }
  }

  HandlePosition(doc) {
    const position = doc.data();
    const analogMap = new Map();
    this.currentPos++;
    console.log(`${this.currentPos}  ${position.brand} - ${position.number}`);

    const analogRef = database.collection("products").where('analogId', '==', position.analogId);
    const current = this;
    analogRef.get()
      .then((analogSnapshot) => {
        analogSnapshot.forEach(function (a) {
          const analog = a.data();
          analogMap.set(Util.hashCode(`${analog.brand.toUpperCase()}+${analog.shortNumber}`), false);

        });

        const ref = database.collection("products").doc(doc.id);
        current.batch.set(ref, {analogs: [...analogMap.keys()]}, { merge: true });

        if (this.currentBatchLength > this.currentPos) {
          this.HandleBatch();
          return;
        }
        if (this.currentBatch < this.batchQuantity) {
          if (this.currentPos === this.currentBatchLength &&
            this.currentBatch !== this.batchQuantity - 1) {
            this.currentBatch++;
            this.batch.commit().then(() => {
              console.log(`batch saved`);
              this.HandleBundle(doc);
            });
          } else if (this.currentPos === this.currentBatchLength &&
            this.currentBatch === this.batchQuantity - 1) {
            process.send(`${process.argv[3]}`);
            process.exit();
          }
        }

      });

  }
}

export default IndexCatalog;


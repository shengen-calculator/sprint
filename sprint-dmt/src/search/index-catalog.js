import chalk from 'chalk';
import {auth, user, password, database} from '../config/firestore';

/* eslint-disable no-console */

class IndexCatalog {
  constructor() {
    this.batchSize = 25;
    this.batchQuantity = 4;
    this.currentBatch = 0;
    this.currentBatchLength = 0;
    this.currentPos = 0;
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
    const current = this;
    productRef.get()
      .then(function (batchSnapshot) {
        current.currentBatchLength = batchSnapshot.docs.length + current.currentBatchLength;
        if(batchSnapshot.docs.length > 0) {
          current.HandleBatch(batchSnapshot);
        } else {
          process.send(`${process.argv[3]}`);
          process.exit();
        }

      })
  }

  HandleBatch(batchSnapshot) {
    const current = this;
    batchSnapshot.forEach(function(doc) {
      current.HandlePosition(doc);
    });
    current.currentBatch++;
  }

  HandlePosition(doc) {
    const position = doc.data();
    this.currentPos++;
    console.log(`${this.currentPos}  ${position.brand} - ${position.number}`);
    if (this.currentBatch < this.batchQuantity) {
      if(this.currentPos  === this.currentBatchLength &&
        this.currentBatch !== this.batchQuantity - 1 ) {
        this.HandleBundle(doc);
      } else if (this.currentPos  === this.currentBatchLength&&
        this.currentBatch === this.batchQuantity - 1) {
        process.send(`${process.argv[3]}`);
        process.exit();
      }
    }

  }
}

export default IndexCatalog;

import chalk from 'chalk';
import {auth, user, password, database} from '../config/firestore';
import Util from '../util';
import {logger} from '../logger';

/* eslint-disable no-console */

class IndexCatalog {
  constructor() {
    this.batchSize = 500;
    this.batchQuantity = 60;
    this.currentBatch = 0;
    this.currentBatchLength = 0;
    this.currentPos = 0;
    this.batchSnapshot = {};
    this.analogSnapshot = {};
    this.analogIndex = 0;
    this.analogMap = new Map();
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
                logger.log({
                  level: 'error',
                  message: `Get start doc error: ${e.message}`
                });
              })
          }
        })
        .catch(e => {
          console.log(chalk.red(`Firestore connection error: ${e.message}`));
          logger.log({
            level: 'error',
            message: `Firestore connection error: ${e.message}`
          });
        })
    }
  }

  HandleBundle(startDoc) {
    let productRef;
    if (startDoc) {
      productRef = database.collection("products")
        .startAfter(startDoc)
        .limit(this.batchSize);
    } else {
      productRef = database.collection("products")
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
          current.batch.commit().then(() => {
            process.send(`${process.argv[3]}`);
            process.exit();
          });
        }
      })
      .catch(e => {
        console.log(chalk.red(`Get products error: ${e.message}`));
        logger.log({
          level: 'error',
          message: `Get products error: ${e.message}`
        });
      })
  }

  HandleBatch() {
    const index = this.currentPos - this.currentBatch * this.batchSize;

    if (this.currentBatchLength > this.currentPos) {
      this.HandlePosition(this.batchSnapshot.docs[index]);
    }
  }

  HandleAnalog(doc) {

    const analog = this.analogSnapshot.docs[this.analogIndex].data();
    this.analogMap.set(Util.hashCode(
      `${analog.brand.toUpperCase()}+${analog.shortNumber}`), false);
    console.log(`   --${analog.brand} - ${analog.number}`);
    this.analogIndex++;

    const bigAnalogRef = database.collection("analogs")
      .where('brand', '==', analog.brand)
      .where('shortNumber', '==', analog.shortNumber);
    const current = this;
    bigAnalogRef.get()
      .then((bigAnalogSnapshot) => {
        bigAnalogSnapshot.forEach(function (ba) {
          const bigAnalog = ba.data();
          current.analogMap.set(Util.hashCode(
            `${bigAnalog.analogBrand.toUpperCase()}+${bigAnalog.analogShortNumber}`), false);
          console.log(`   --**${bigAnalog.analogBrand} - ${bigAnalog.analogShortNumber}`);

        });

        if (current.analogSnapshot.docs.length > current.analogIndex) {
          current.HandleAnalog(doc);
        } else {
          const ref = database.collection("products").doc(doc.id);
          current.batch.set(ref, {analogs: [...current.analogMap.keys()]}, {merge: true});
          if (current.currentBatchLength > current.currentPos) {
            current.HandleBatch();
            return;
          }
          if (current.currentBatch < current.batchQuantity) {
            if (current.currentPos === current.currentBatchLength &&
              current.currentBatch !== current.batchQuantity - 1) {
              current.currentBatch++;
              current.batch.commit().then(() => {
                current.HandleBundle(doc);
              });
            } else if (current.currentPos === current.currentBatchLength &&
              current.currentBatch === current.batchQuantity - 1) {
              current.batch.commit().then(() => {
                process.send(`${process.argv[3]}`);
                process.exit();
              });
            }
          }
        }
      })
      .catch(e => {
        console.log(chalk.red(`Get analogs from analogs collection error: ${e.message}`));
        logger.log({
          level: 'error',
          message: `Get analogs from analogs collection error: ${e.message}`
        });
      })
  }

  HandlePosition(doc) {
    const position = doc.data();
    this.analogMap.clear();
    this.currentPos++;
    console.log(`${this.currentPos}  ${position.brand} - ${position.number}`);

    const analogRef = database.collection("products")
      .where('analogId', '==', position.analogId);
    analogRef.get()
      .then((analogSnapshot) => {
        this.analogSnapshot = analogSnapshot;
        this.analogIndex = 0;
        this.HandleAnalog(doc);
      })
      .catch(e => {
        console.log(chalk.red(`Read products by analogId: ${e.message}`));
        logger.log({
          level: 'error',
          message: `Read products by analogId: ${e.message}`
        });
      });
  }
}

export default IndexCatalog;


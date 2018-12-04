import chalk from 'chalk';
import sql from 'mssql';
import {configSource} from '../config/mssql.connection';
import {auth, user, password, database} from '../config/firestore';
import numeral from 'numeral';
import {logger, infoLogger} from '../logger';

/* eslint-disable no-console */


class Import {
  constructor(maxBatchSize = 500, maxBundleSize = 60, startTime = new Date()) {
    this.startTime = startTime;
    this.maxBatchSize = maxBatchSize;
    this.maxBundleSize = maxBundleSize;
    this.postponeTime = 150000;
    this.errorList = [];
  }

  RunImport() {
    auth.signInWithEmailAndPassword(user, password)
      .then(() => {
        if (!process.argv[3]) {
          console.log(chalk.green(`Firestore authentication success`));
        }

        if (this.getDatabaseName()) {
          configSource.database = this.getDatabaseName();
        }

        sql.connect(configSource, err => {
          // ... error checks
          if (err) {
            console.log(chalk.red(`Source db connection error: ${err.message}`));
            logger.log({
              level: 'error',
              message: `Source db connection error: ${err.message}`
            });
            process.exit();
          } else {
            if (!process.argv[3]) {
              console.log(chalk.green(`Source db authentication success`));
            }

            if (process.argv[3]) {
              // ... start import
              this.handleBundleAsync(sql, process.argv[3], 0);

            } else {
              const request = new sql.Request();
              const countQuery = `select count(1) as Quantity from [${this.getSourceTableName()}]`;
              request.query(countQuery, (err, result) => {
                if (err) {
                  console.log(chalk.red(`Count data in source table error: ${err.message}`));
                  process.exit();
                }
                const rowCount = result.recordset[0]['Quantity'];
                console.log(chalk.green(
                  `There is ${ numeral(rowCount).format('0,0')} records ready to import`));
                const bundleCount = Math.ceil(rowCount / this.maxBatchSize / this.maxBundleSize);

                console.log(chalk.green(
                  `It will be divided to ${numeral(bundleCount).format(0, 0)} bundles`));

                console.log(`Please provide information which ones should be imported`);
                console.log(`Ex: import 0 4`);
                console.log(`Will import 5 bundles, numbers: 0, 1, 2, 3, 4`);
                console.log(`OR`);
                console.log(`Ex: import 3`);
                console.log(`To import only one bundle, #3`);
                process.exit();
              });
            }
          }
        });
      }).catch(e => {
      console.log(chalk.red(`Firestore connection error: ${e.message}`));
      logger.log({
        level: 'error',
        message: `Firestore connection error: ${e.message}`
      });
    });
  }

  handleBundleAsync(sql, bundleNumber, batchIndex) {
    const request = new sql.Request();
    const batch = database.batch();
    request.stream = true; // You can set streaming differently for each request

    const selectItems = this.getSelectQuery(bundleNumber, batchIndex);
    request.query(selectItems); // or request.execute(procedure)


    request.on('row', row => {
      // Emitted for each row in a recordset
      const newItemRef = database.collection(this.getTargetCollectionName()).doc();
      batch.set(newItemRef, this.getItemByRow(row));
    });

    request.on('error', err => {
      // May be emitted multiple times
      this.errorList[batchIndex] = true;
      console.log(chalk.red(`bundle: ${bundleNumber} batchIndex: ${batchIndex} error: ${err}`));
      logger.log({
        level: 'error',
        message: `bundle: ${bundleNumber} batchIndex: ${batchIndex} import error: ${err.message}`
      });
      console.log(`try to run import again in ${this.postponeTime / 1000} sec`);

      setTimeout(() => {
        this.handleBundleAsync(sql, bundleNumber, batchIndex);
      }, this.postponeTime);
    });

    request.on('done', () => {
      console.log(`There are (${bundleNumber} - ${batchIndex}): ${batch._mutations.length} rows`);
      infoLogger.log({
        level: 'info',
        message: `There are (${bundleNumber} - ${batchIndex}): ${batch._mutations.length} rows`
      });
      if (batch._mutations.length > 0) {

        batch.commit()
          .then((err) => {
            if (err) {
              console.log(chalk.red(err));
              logger.log({
                level: 'error',
                message: `Batch commit error: ${err}`
              });
              process.exit();
            }
            this.errorList[batchIndex] = false;

            if (batchIndex === this.maxBundleSize - 1) {
              this.showBundleInfo(bundleNumber);
            } else {
              //console.log(`Batch # ${batchIndex} saved (bundle # ${bundleNumber})`);
              batchIndex++;
              this.handleBundleAsync(sql, bundleNumber, batchIndex);
            }

          })
          .catch(function (error) {
            console.error("Error save batch: ", error);
            logger.log({
              level: 'error',
              message: `Error save batch:  ${error} `
            });
            process.exit();
          });
      } else {
        if (this.errorList[batchIndex] !== true) {
          if (batchIndex === this.maxBundleSize - 1) {
            this.showBundleInfo(bundleNumber);
          } else {
            //console.log(`Batch # ${batchIndex} saved (bundle # ${bundleNumber})`);
            batchIndex++;
            this.handleBundleAsync(sql, bundleNumber, batchIndex);
          }
        }
      }
    });
  }

  showBundleInfo(bundleNumber) {
    const endTime = new Date();
    console.log(chalk.green(`Bundle ${bundleNumber} Elapsed time: ${(endTime.getTime() -
      this.startTime.getTime()) / 1000} sec.`));

    logger.log({
      level: 'info',
      message: `Bundle ${bundleNumber} Elapsed time: ${(endTime.getTime() -
        this.startTime.getTime()) / 1000} sec.`
    });

    process.send(bundleNumber);
    process.exit();
  }

  getSourceTableName() {
  }

  getSelectQuery() {
  }

  getTargetCollectionName() {
  }

  getItemByRow() {

  }

  getDatabaseName() {
  }
}

export default Import;

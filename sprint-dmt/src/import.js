import chalk from 'chalk';
import sql from 'mssql';
import {configSource} from './mssql.connection';
import {auth, user, password, database} from './firestore';
import numeral from 'numeral';

/* eslint-disable no-console */


class Import {
  constructor(startTime = new Date(), maxBatchSize = 500, maxBundleSize = 60) {
    this.startTime = startTime;
    this.maxBatchSize = maxBatchSize;
    this.maxBundleSize = maxBundleSize;
  }

  RunImport() {
    auth.signInWithEmailAndPassword(user, password)
      .then(() => {
        console.log(chalk.green(`Firestore authentication success`));
        sql.connect(configSource, err => {
          // ... error checks
          if (err) {
            console.log(chalk.red(`Source db connection error: ${err.message}`));
            process.exit();
          } else {
            console.log(chalk.green(`Source db authentication success`));

            if (process.argv[3]) {
              // ... start import

              this.PrimitiveOperation2(2);
            } else {
              const request = new sql.Request();
              const countQuery = `select count(1) as Quantity from [${this.getSourceTableName()}]`;
              request.query(countQuery, (err, result) => {
                if (err) {
                  console.log(chalk.red(`Count data in source table error: ${err.message}`));
                  process.exit();
                }
                console.log(chalk.green(`There is ${numeral(result.recordset[0]['Quantity']).format('0,0')} records ready to import`));
                process.exit();
              });
            }
          }
        });
      }).catch(e => {
      console.log(chalk.red(`Firestore connection error: ${e.message}`))
    });
  }

  handleBundleAsync() {

  }

  getSourceTableName() {
  }

  PrimitiveOperation2() {
  }

  static trimString(str) {
    if (str) {
      return str.trim();
    } else {
      return '';
    }
  }
}

export default Import;

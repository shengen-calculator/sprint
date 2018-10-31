import chalk from 'chalk';
import sql from 'mssql';
import {configSource} from './mssql.connection';
import {auth, user, password, database} from './firestore';

/* eslint-disable no-console */

const startTime = new Date();

const maxBatchSize = 500;
const maxBundleSize = 60;
const rowCount = 749253;



process.on('message', (msg) => {
  auth.signInWithEmailAndPassword(user, password)
    .then(() => {

      sql.connect(configSource, err => {
        // ... error checks
        if (err) {
          console.log(chalk.red(err));
          process.exit();
        }
        const bundleAmount = Math.ceil(rowCount / maxBatchSize / maxBundleSize);
        console.log(chalk.green(`Total bundle amount is: # ${bundleAmount}`));
        handleBundleAsync(sql, process.argv[2], 0);
      });

      function handleBundleAsync(sql, bundleNumber, batchIndex) {
        const request = new sql.Request();
        const batch = database.batch();
        request.stream = true; // You can set streaming differently for each request

        const selectCatalogItem = `
        SELECT *
        FROM [Каталоги поставщиков] 
        ORDER BY [ID_Запчасти]                                      
        OFFSET ${ maxBatchSize * maxBundleSize * bundleNumber + batchIndex * maxBatchSize } ROWS
        FETCH NEXT ${ maxBatchSize } ROWS ONLY`;

        request.query(selectCatalogItem); // or request.execute(procedure)

        request.on('row', row => {
          // Emitted for each row in a recordset
          //console.log(`${row['Номер запчасти']}`);
          const newProductRef = database.collection("prices").doc();
          batch.set(newProductRef, {
            brand: row['Брэнд'].trim(),
            number: row['Номер запчасти'].trim(),
            shortNumber: row['Name'].trim().toUpperCase(),
            description: trimString(row['Описание']),
            price: row['Цена']
          });
        });

        request.on('error', err => {
          // May be emitted multiple times
          console.log(chalk.red(err));
          process.exit();
        });

        request.on('done', () => {
          console.log(chalk.green(`There are: ${batch._mutations.length} rows`));
          batch.commit()
            .then((err) => {
              if (err) {
                console.log(err);
                process.exit();
              }

              if (batchIndex === maxBundleSize - 1) {
                const endTime = new Date();
                console.log(chalk.green(`Elapsed time: ${(endTime.getTime() -
                  startTime.getTime()) / 1000} sec.`));
                process.send(bundleNumber);

                const used = process.memoryUsage();
                for (let key in used) {
                  console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                }
                process.exit();
              } else {
                console.log(chalk.green(`Batch # ${batchIndex} saved (bundle # ${bundleNumber})`));
                batchIndex++;
                handleBundleAsync(sql, bundleNumber, batchIndex);
              }
            })
            .catch(function (error) {
              console.error("Error save batch: ", error);
              process.exit();
            });
        });
      }
    });

});



function trimString(str) {
  if (str) {
    return str.trim();
  } else {
    return '';
  }
}

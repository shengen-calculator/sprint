import chalk from 'chalk';
import sql from 'mssql';
import { configSource } from "./mssql.connection";

/* eslint-disable no-console */

const startTime = new Date();
sql.connect(configSource, err => {
  // ... error checks
  if(err) {
    console.log(chalk.red(err));
    process.exit();
  }

  const request = new sql.Request();
  request.stream = true; // You can set streaming differently for each request

  const selectCatalogItem = `
        SELECT [Каталог запчастей].*, Брэнды.*
        FROM [Каталог запчастей] INNER JOIN Брэнды ON 
        [Каталог запчастей].ID_Брэнда = Брэнды.ID_Брэнда
        ORDER BY [Каталог запчастей].[ID_Запчасти]                                      
        OFFSET 0 ROWS
        FETCH NEXT 10 ROWS ONLY`;

  request.query(selectCatalogItem); // or request.execute(procedure)

  request.on('recordset', columns => {
    // Emitted once for each recordset in a query
    console.log(chalk.green(`Table has ${Object.keys(columns).length} columns`));
  });

  request.on('row', row => {
    // Emitted for each row in a recordset
    console.log(`${row['Брэнд']} ${row['Номер запчасти']}`);
  });

  request.on('error', err => {
    // May be emitted multiple times
    console.log(chalk.red(err));
  });

  request.on('done', result => {
    // Always emitted as the last one
    const endTime = new Date();
    console.log(chalk.green(`Done! Retrieved ${result.rowsAffected[0]} records`));
    console.log(chalk.green(`Elapsed time: ${(endTime.getTime() - startTime.getTime()) / 1000} sec.`));
    process.exit();
  })
});

sql.on('error', err => {
  console.log(chalk.red(err));
});

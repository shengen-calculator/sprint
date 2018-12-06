import chalk from 'chalk';

/* eslint-disable no-console */

class IndexCatalog {
  RunIndexator() {
    if (process.argv[3]) {
      setTimeout(()=> {
        process.send(`${process.argv[3]}`);
        process.exit();
      }, 4000);

    }
  }
}
export default IndexCatalog;

import Import from './import';
import Util from '../util';

class PriceImport extends Import {
  constructor(maxBatchSize, maxBundleSize, startTime) {
    super(maxBatchSize, maxBundleSize, startTime);
  }

  getSourceTableName() {
    return "Каталоги поставщиков";
  }

  getTargetCollectionName() {
    return "prices";
  }

  getSelectQuery(bundleNumber, batchIndex) {
    return `
        SELECT *
        FROM [Каталоги поставщиков] 
        ORDER BY [ID_Запчасти]                                      
        OFFSET ${
    this.maxBatchSize * this.maxBundleSize * bundleNumber + batchIndex * this.maxBatchSize
      } ROWS
        FETCH NEXT ${
      this.maxBatchSize
      } ROWS ONLY`;
  }

  getItemByRow(row) {
    return {
      brand: row['Брэнд'].trim(),
      number: row['Номер запчасти'].trim(),
      shortNumber: row['Name'].trim().toUpperCase(),
      description: Util.trimString(row['Описание']),
      price: row['Цена']
    };
  }
}

export default PriceImport;

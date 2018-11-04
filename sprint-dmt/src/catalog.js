import Import from './import';

class CatalogImport extends Import {
  constructor(maxBatchSize, maxBundleSize, startTime) {
    super(maxBatchSize, maxBundleSize, startTime);
  }

  getSourceTableName() {
    return "Каталог запчастей";
  }

  getTargetCollectionName() {
    return "products";
  }

  getSelectQuery(bundleNumber, batchIndex) {
    return `
        SELECT [Каталог запчастей].*, Брэнды.*
        FROM [Каталог запчастей] INNER JOIN Брэнды 
        ON [Каталог запчастей].ID_Брэнда = Брэнды.ID_Брэнда
        ORDER BY [Каталог запчастей].[ID_Запчасти]                                      
        OFFSET ${
    this.maxBatchSize * this.maxBundleSize * bundleNumber + batchIndex * this.maxBatchSize
      } ROWS
        FETCH NEXT ${ this.maxBatchSize } ROWS ONLY`
  }

  getItemByRow(row) {
    return {
      brand: row['Брэнд'].trim(),
      number: row['Номер запчасти'].trim(),
      shortNumber: row['NAME'].trim().toUpperCase(),
      description: Import.trimString(row['Описание']),
      analogId: row['ID_аналога'],
      price: row['Цена']
    };
  }
}

export default CatalogImport;

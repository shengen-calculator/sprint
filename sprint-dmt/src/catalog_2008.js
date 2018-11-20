import Import from './import';

class CatalogImport extends Import {
  constructor(maxBatchSize, maxBundleSize, startTime) {
    super(maxBatchSize, maxBundleSize, startTime);
    this.maxBatchSize = 1;
    this.maxBundleSize = 5;
  }

  getSourceTableName() {
    return "Каталог запчастей";
  }

  getTargetCollectionName() {
    return "products";
  }

  getSelectQuery(bundleNumber, batchIndex) {
    let shift = this.maxBatchSize * this.maxBundleSize * bundleNumber +
      batchIndex * this.maxBatchSize;
    return `
        SELECT *
        FROM (
          SELECT [Каталог запчастей].*, Брэнды.Брэнд, 
            ROW_NUMBER() OVER (ORDER BY [Каталог запчастей].[ID_Запчасти]) AS RowNum
          FROM [Каталог запчастей] INNER JOIN Брэнды 
            ON [Каталог запчастей].ID_Брэнда = Брэнды.ID_Брэнда) AS Catalog
        WHERE Catalog.RowNum BETWEEN ${shift + 1} AND ${shift + this.maxBatchSize}`;

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

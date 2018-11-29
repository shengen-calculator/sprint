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
    let shift = this.maxBatchSize * this.maxBundleSize * bundleNumber +
      batchIndex * this.maxBatchSize;
    return `
        SELECT *
        FROM (
          SELECT [Каталог запчастей].*, Брэнды.Брэнд, Остаток_.Остаток,
            ROW_NUMBER() OVER (ORDER BY [Каталог запчастей].[ID_Запчасти]) AS RowNum
          FROM [Каталог запчастей] INNER JOIN Брэнды 
            ON [Каталог запчастей].ID_Брэнда = Брэнды.ID_Брэнда LEFT JOIN Остаток_
            ON [Каталог запчастей].ID_Запчасти = Остаток_.ID_Запчасти) AS Catalog
        WHERE Catalog.RowNum BETWEEN ${shift + 1} AND ${shift + this.maxBatchSize}`;

  }

  getItemByRow(row) {
    return {
      brand: row['Брэнд'].trim(),
      number: row['Номер запчасти'].trim(),
      shortNumber: row['NAME'].trim().toUpperCase(),
      description: Import.trimString(row['Описание']),
      analogId: row['ID_аналога'],
      price: row['Цена'],
      availability: row['Остаток']
    };
  }
}

export default CatalogImport;

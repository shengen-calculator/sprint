import Import from './import';


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
    let shift = this.maxBatchSize * this.maxBundleSize * bundleNumber +
      batchIndex * this.maxBatchSize;
    return `
        SELECT *
        FROM (
          SELECT [Каталоги поставщиков].*, Поставщики.[Сокращенное название],
            ROW_NUMBER() OVER (ORDER BY [Каталоги поставщиков].ID_Запчасти) AS RowNum
          FROM [Каталоги поставщиков] INNER JOIN Поставщики
             ON [Каталоги поставщиков].[ID_Поставщика] = Поставщики.ID_Поставщика) AS Price
        WHERE Price.RowNum BETWEEN ${shift + 1} AND ${shift + this.maxBatchSize}`;

  }

  getItemByRow(row) {
    return {
      brand: row['Брэнд'].trim(),
      number: row['Номер запчасти'].trim(),
      shortNumber: row['Name'].trim().toUpperCase(),
      description: Import.trimString(row['Описание']),
      vendor: row['Сокращенное название'].trim(),
      price: row['Цена'],
      availability: Import.trimString(row['Наличие']),
      hash: Import.hashCode(`${row['Брэнд'].trim()}+${row['Name'].trim().toUpperCase()}`)
    };
  }
}

export default PriceImport;

import Import from './import';

class AnalogImport extends Import {
  constructor(maxBatchSize, maxBundleSize, startTime) {
    super(maxBatchSize, maxBundleSize, startTime);
    this.maxBatchSize = 10;
    this.maxBundleSize = 3;
  }

  getSourceTableName() {
    return "Spare_Analogs";
  }

  getTargetCollectionName() {
    return "analog";
  }
  getDatabaseName() {
    return "AnalogsDB";
  }

  getSelectQuery(bundleNumber, batchIndex) {
    let shift = this.maxBatchSize * this.maxBundleSize * bundleNumber +
      batchIndex * this.maxBatchSize;

    return `
        SELECT Spare_Suppliers.Supplier_Name AS Supplier, 
                      Spare_Names.Spare_Name AS NumberAnalog, 
                      Spare_Names.Int_Spare_Name AS ShortNumberAnalog,
                      Spare_Brands.Brand_Name AS BrandAnalog, 
                      Spare_Analogs.Analog_ID,                       
                      Spare_Brands_1.Brand_Name AS Brand, 
                      Spare_Names_1.Spare_Name AS Number, 
                      Spare_Names_1.Int_Spare_Name AS ShortNumber
        FROM Spare_Analogs INNER JOIN Spare_Brands ON 
             Spare_Analogs.Analog_Brand_ID = Spare_Brands.Brand_ID INNER JOIN Spare_Names ON 
             Spare_Analogs.Analog_Spare_Name_ID = Spare_Names.Spare_Name_ID INNER JOIN
             Spare_Suppliers ON Spare_Analogs.Supplier_ID = Spare_Suppliers.Supplier_ID 
             INNER JOIN Spare_Brands AS Spare_Brands_1 ON 
             Spare_Analogs.Brand_ID = Spare_Brands_1.Brand_ID INNER JOIN
             Spare_Names AS Spare_Names_1 ON 
             Spare_Analogs.Spare_Name_ID = Spare_Names_1.Spare_Name_ID
             WHERE Spare_Analogs.Analog_ID BETWEEN ${shift + 1} AND ${shift + this.maxBatchSize}`;

  }

  getItemByRow(row) {
    return {
      supplier: row['Supplier'].trim(),
      number: row['Number'].trim(),
      shortNumber: row['ShortNumber'].trim().toUpperCase(),
      brand: row['Brand'].trim(),
      analogNumber: row['NumberAnalog'].trim(),
      analogShortNumber: row['ShortNumberAnalog'].trim().toUpperCase(),
      analogBrand: row['BrandAnalog'].trim()
    };
  }
}

export default AnalogImport;

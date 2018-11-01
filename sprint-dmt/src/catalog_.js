import Import from './import';

class CatalogImport extends Import {
  constructor() {
    super()
    console.log("CatalogImport created")
  }

  PrimitiveOperation1 (val){
    console.log('CatalogImport PrimitiveOperation1' + val)
  }

  PrimitiveOperation2 (val){
    console.log('CatalogImport PrimitiveOperation2'+ val)
  }
}

export default CatalogImport;

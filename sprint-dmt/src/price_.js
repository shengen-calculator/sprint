import Import from './import';

class PriceImport extends Import {
  constructor() {
    super()
    console.log("PriceImport created")
  }

  getSourceTableName (){
    return "Каталоги поставщиков";
  }

  PrimitiveOperation2 (val){
    console.log('PriceImport PrimitiveOperation2'+ val)
  }
}

export default PriceImport;

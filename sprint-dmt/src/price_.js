import Import from './import';

class PriceImport extends Import {
  constructor() {
    super()
    console.log("PriceImport created")
  }

  PrimitiveOperation1 (val){
    console.log('PriceImport PrimitiveOperation1' + val)
  }

  PrimitiveOperation2 (val){
    console.log('PriceImport PrimitiveOperation2'+ val)
  }
}

export default PriceImport;

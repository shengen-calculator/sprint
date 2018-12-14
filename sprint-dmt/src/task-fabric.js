import CatalogImport from './import/catalog_2008';
import PriceImport from './import/price_2008';
import AnalogImport from './import/analog_2008';
import IndexCatalog from './search/index-catalog';
import IndexPrice from './search/index-price';


function init_TemplateMethod() {
  if (process.argv[2] === 'import:catalog') {
    let catalog = new CatalogImport();
    catalog.RunImport()
  }
  if (process.argv[2] === 'import:price') {
    let price = new PriceImport();
    price.RunImport()
  }
  if (process.argv[2] === 'import:analog') {
    let analog = new AnalogImport();
    analog.RunImport()
  }
  if (process.argv[2] === 'index:catalog') {
    let indexCatalog = new IndexCatalog();
    indexCatalog.RunIndexator()
  }
  if (process.argv[2] === 'index:price') {
    let indexPrice = new IndexPrice();
    indexPrice.RunIndexator()
  }
}

init_TemplateMethod();

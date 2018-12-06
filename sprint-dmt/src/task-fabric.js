import CatalogImport from './import/catalog_2008';
import PriceImport from './import/price_2008';
import AnalogImport from './import/analog_2008';
import IndeCatalog from './search/index-catalog';


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
    let indexCatalog = new IndeCatalog();
    indexCatalog.RunIndexator()
  }
}

init_TemplateMethod();

import CatalogImport from './catalog';
import PriceImport from './price';

function init_TemplateMethod() {
  if (process.argv[2] === 'catalog') {
    let catalog = new CatalogImport();
    catalog.RunImport()
  }
  if (process.argv[2] === 'price') {
    let price = new PriceImport();
    price.RunImport()
  }

}

init_TemplateMethod();

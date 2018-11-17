import CatalogImport from './catalog_2008';
import PriceImport from './price_2008';

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

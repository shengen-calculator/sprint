import {functions} from './database';

class ProductApi {
    static searchProducts(condition){
        const fetchProducts = functions.httpsCallable('products');
        return fetchProducts({number: condition.number})
    }
}

export default ProductApi;
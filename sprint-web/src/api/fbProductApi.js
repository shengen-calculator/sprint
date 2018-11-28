import {functions} from './database';

class ProductApi {
    static searchProducts(condition){
        const fetchProducts = functions.httpsCallable('products');
        if(condition.brand) {
            return fetchProducts({
                number: condition.number,
                brand: condition.brand
            })
        }
        return fetchProducts({
            number: condition.number
        })
    }
}

export default ProductApi;
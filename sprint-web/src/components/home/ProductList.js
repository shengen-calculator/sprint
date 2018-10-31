import React from 'react';
import ProductListRow from './ProductListRow';

const ProductList = ({products}) => {
    if(products.length === 0)
        return "";
    return (
        <table className="table table-hover">
            <thead>
            <tr>
                <th scope="col">Brand</th>
                <th scope="col">Number</th>
                <th scope="col">Description</th>
                <th scope="col">Price</th>
            </tr>
            </thead>
            <tbody>
            {products.map(product =>
                <ProductListRow key={product.id} product={product}/>
            )}
            </tbody>
        </table>
    );
};

export default ProductList;
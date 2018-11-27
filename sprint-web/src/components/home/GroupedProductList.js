import React from 'react';
import GroupedProductListRow from './GroupedProductListRow';

const GroupedProductList = ({products}) => {
    if(products.length === 0)
        return "";
    return (
        <table className="table table-hover">
            <thead className="thead-dark">
            <tr>
                <th scope="col">Brand</th>
                <th scope="col">Number</th>
                <th scope="col">Description</th>
            </tr>
            </thead>
            <tbody>
            {products.map(product =>
                <GroupedProductListRow key={product.id} product={product}/>
            )}
            </tbody>
        </table>
    );
};

export default GroupedProductList;
import React from 'react';

const ProductListRow = ({product}) => {
    let trClassName = "table-success";
    if(product.type === 1) {
        trClassName = "table-warning";
    } else if (product.type === 2) {
        trClassName = "table-light";
    }
    return (
        <tr id={product.id} className={trClassName}>
            <td>{product.brand}</td>
            <td>{product.number}</td>
            <td>{product.description}</td>
            <td>{product.price}</td>
        </tr>
    );
};

export default ProductListRow;
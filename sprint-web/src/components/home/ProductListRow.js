import React from 'react';

const ProductListRow = ({product}) => {
    return (
        <tr key={product.id}>
            <td>{product.brand}</td>
            <td>{product.number}</td>
            <td>{product.description}</td>
            <td>{product.price}</td>
        </tr>
    );
};

export default ProductListRow;
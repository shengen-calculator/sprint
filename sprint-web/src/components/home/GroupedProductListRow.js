import React from 'react';

const GroupedProductListRow = ({product}) => {
    return (
        <tr key={product.id} className="grouped">
            <td>{product.brand}</td>
            <td>{product.number}</td>
            <td>{product.description}</td>
        </tr>
    );
};

export default GroupedProductListRow;
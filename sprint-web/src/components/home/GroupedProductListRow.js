import React from 'react';

const GroupedProductListRow = ({product, onSelect}) => {
    return (
        <tr id={product.id} className="grouped" onClick={onSelect}>
            <td>{product.brand}</td>
            <td>{product.number}</td>
            <td>{product.description}</td>
        </tr>
    );
};

export default GroupedProductListRow;
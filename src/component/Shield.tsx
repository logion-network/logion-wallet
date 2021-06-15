import React from 'react';

import MenuItem, { MenuItemData } from './MenuItem';

import './Shield.css';

export interface Props {
    item: MenuItemData,
}

export default function Shield(props: Props) {

    return (
        <div className="Shield">
            <MenuItem item={props.item} />
        </div>
    );
}

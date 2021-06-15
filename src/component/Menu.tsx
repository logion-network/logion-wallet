import React from 'react';

import MenuItemComponent, { MenuItemData } from './MenuItem';
import './Menu.css';

export interface Props {
    items: MenuItemData[]
}

export default function Menu(props: Props) {

    return (
        <div className="Menu">
            {
                props.items.map(item => (
                    <MenuItemComponent item={ item } />
                ))
            }
        </div>
    );
}

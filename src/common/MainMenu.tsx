import React from 'react';

import MenuItem, { MenuItemData } from './MenuItem';

import './MainMenu.css';

export interface Props {
    items: MenuItemData[],
}

export default function MainMenu(props: Props) {

    return (
        <div className="MainMenu">
            {
                props.items.map(item => (
                <MenuItem
                    key={ item.id }
                    item={ item }
                    height={90}
                />
                ))
            }
        </div>
    );
}

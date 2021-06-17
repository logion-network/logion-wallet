import React from 'react';

import MenuItemComponent, { MenuItemData } from './MenuItem';
import { ColorThemeType } from './ColorTheme';

import './Menu.css';

export interface Props {
    items: MenuItemData[],
    colorThemeType: ColorThemeType,
}

export default function Menu(props: Props) {

    return (
        <div className="Menu">
            {
                props.items.map(item => (
                    <MenuItemComponent item={ item } colorThemeType={ props.colorThemeType } />
                ))
            }
        </div>
    );
}

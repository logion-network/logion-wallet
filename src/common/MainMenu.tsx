import React from 'react';

import MenuItem, { MenuItemData } from './MenuItem';
import { ColorThemeType } from './ColorTheme';

import './MainMenu.css';

export interface Props {
    items: MenuItemData[],
    colorThemeType: ColorThemeType,
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
                    colorThemeType={ props.colorThemeType }
                />
                ))
            }
        </div>
    );
}

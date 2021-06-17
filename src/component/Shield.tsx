import React from 'react';

import MenuItem, { MenuItemData } from './MenuItem';
import { ColorThemeType } from './ColorTheme';

import './Shield.css';

export interface Props {
    item: MenuItemData,
    colorThemeType: ColorThemeType,
}

export default function Shield(props: Props) {

    return (
        <div className="Shield">
            <MenuItem
                item={props.item}
                height={65}
                colorThemeType={ props.colorThemeType }
            />
        </div>
    );
}

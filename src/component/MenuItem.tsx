import React, { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

import { ColorThemeType, MenuIcon as ColorThemeMenuIcon } from './ColorTheme';
import MenuIcon from './MenuIcon';

import './MenuItem.css';

export interface MenuItemData {
    id: string,
    text: string,
    to: string,
    exact: boolean,
    icon?: ColorThemeMenuIcon,
}

export interface Props {
    item: MenuItemData,
    height?: number,
    colorThemeType: ColorThemeType,
}

export default function MenuItem(props: Props) {

    let customStyle: CSSProperties = {};
    if(props.height !== undefined) {
        customStyle['height'] = props.height;
    }

    return (
        <NavLink
            to={props.item.to}
            exact={props.item.exact}
            className="MenuItem"
            style={customStyle}
        >
            <span className="text-wrapper">
                {
                    props.item.icon !== undefined &&
                    <MenuIcon
                        { ...props.item.icon }
                        colorThemeType={ props.colorThemeType }
                    />
                }
                <span className="text">{ props.item.text }</span>
            </span>
        </NavLink>
    );
}

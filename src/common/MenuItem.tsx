import React, { CSSProperties } from 'react';
import { NavLink } from 'react-router-dom';

import { MenuIcon as ColorThemeMenuIcon } from './ColorTheme';
import MenuIcon from './MenuIcon';

import './MenuItem.css';

export interface MenuItemData {
    id: string,
    text: string,
    to: string,
    exact: boolean,
    icon?: ColorThemeMenuIcon,
    onClick?: () => void,
    disabled?: boolean,
}

export interface Props {
    item: MenuItemData,
    height?: number,
}

export default function MenuItem(props: Props) {

    let customStyle: CSSProperties = {};
    if(props.height !== undefined) {
        customStyle['height'] = props.height;
    }
    if(props.item.disabled) {
        customStyle['opacity'] = 0.7;
        customStyle['cursor'] = 'default';
        customStyle['pointerEvents'] = 'none';
    }

    return (
        <NavLink
            to={props.item.to}
            end={props.item.exact}
            className="MenuItem"
            style={customStyle}
            onClick={ props.item.onClick }
        >
            <span className="text-wrapper">
                {
                    props.item.icon !== undefined &&
                    <MenuIcon
                        { ...props.item.icon }
                    />
                }
                <span className="text">{ props.item.text }</span>
            </span>
        </NavLink>
    );
}

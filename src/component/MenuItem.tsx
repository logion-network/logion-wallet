import React from 'react';
import { NavLink } from 'react-router-dom';

import './MenuItem.css';

export interface MenuItemData {
    text: string,
    to: string,
    exact: boolean,
}

export interface Props {
    item: MenuItemData,
}

export default function MenuItem(props: Props) {
    return (
        <NavLink to={props.item.to} exact={props.item.exact} className="MenuItem">
            <span className="text-wrapper">
                <span className="text">{ props.item.text }</span>
            </span>
        </NavLink>
    );
}

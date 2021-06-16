import React from 'react';
import { NavLink } from 'react-router-dom';
import { CSSProperties } from 'react';

import { GradientData } from './types/Helpers';

import './MenuItem.css';

export interface MenuItemData {
    text: string,
    to: string,
    exact: boolean,
    iconGradient?: GradientData,
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

    return (
        <NavLink
            to={props.item.to}
            exact={props.item.exact}
            className="MenuItem"
            style={customStyle}
        >
            <span className="text-wrapper">
                {
                    props.item.iconGradient !== undefined &&
                    <span className="icon-wrapper">
                        <div
                            className="icon"
                            style={{
                                background: `linear-gradient(180deg, ${props.item.iconGradient.from} 0%, ${props.item.iconGradient.to} 100%)`
                            }}
                        >
                        </div>
                    </span>
                }
                <span className="text">{ props.item.text }</span>
            </span>
        </NavLink>
    );
}

import React, { CSSProperties } from 'react';

import { MenuIcon as ColorThemeMenuIcon } from './ColorTheme';
import Icon from './Icon';

import './MenuIcon.css';

export interface Props extends ColorThemeMenuIcon {
    
}

export default function MenuIcon(props: Props) {

    if(props.background === undefined && props.icon === undefined) {
        return null;
    }

    let style: CSSProperties = {
        height: props.height === undefined ? '36px' : props.height,
        width: props.width === undefined ? '36px' : props.width,
    };
    if(props.background !== undefined) {
        style['background'] = `linear-gradient(180deg, ${props.background.from} 0%, ${props.background.to} 100%)`
    }

    return (
        <div
            className="MenuIcon"
            style={style}
        >
            {
                props.icon !== undefined &&
                <Icon
                    icon={ props.icon }
                />
            }
        </div>
    );
}

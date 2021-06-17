import React, { CSSProperties } from 'react';

import { ColorThemeType, MenuIcon as ColorThemeMenuIcon } from './ColorTheme';

import './MenuIcon.css';

export interface Props extends ColorThemeMenuIcon {
    colorThemeType: ColorThemeType,
}

export default function MenuIcon(props: Props) {

    if(props.background === undefined && props.icon === undefined) {
        return null;
    }

    let style: CSSProperties = {
        height: props.height === undefined ? '32px' : props.height,
        width: props.width === undefined ? '32px' : props.width,
    };
    if(props.background !== undefined) {
        style['background'] = `linear-gradient(180deg, ${props.background.from} 0%, ${props.background.to} 100%)`
    }

    let iconUrl = undefined;
    if(props.icon !== undefined) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/${props.icon.category}/${props.colorThemeType}/${props.icon.id}.svg`;
    }

    return (
        <div
            className="MenuIcon"
            style={style}
        >
            {
                iconUrl !== undefined &&
                <img
                    src={ iconUrl }
                    alt=''
                />
            }
        </div>
    );
}

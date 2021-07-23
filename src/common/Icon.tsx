import React from 'react';
import { Icon as IconType, ColorThemeType } from './ColorTheme';

export interface Props {
    icon: IconType,
    colorThemeType?: ColorThemeType,
    type?: 'svg' | 'png',
}

export default function Icon(props: Props) {
    
    let ext = 'svg';
    if(props.type !== undefined) {
        ext = props.type;
    }

    let iconUrl = undefined;
    if(props.icon.category !== undefined && (props.icon.hasVariants !== undefined) && props.icon.hasVariants) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/themes/${props.colorThemeType}/${props.icon.id}.${ext}`;
    } else if(props.icon.category !== undefined && ((props.icon.hasVariants === undefined) || !props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/${props.icon.id}.${ext}`;
    } else if(props.icon.category === undefined && ((props.icon.hasVariants !== undefined) && props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/themes/${props.colorThemeType}/${props.icon.id}.${ext}`;
    } else {
        iconUrl = `${process.env.PUBLIC_URL}/assets/${props.icon.id}.${ext}`;
    }

    return (
        <img
            src={ iconUrl }
            alt=''
            height={ 36 }
            width="auto"
        />
    );
}

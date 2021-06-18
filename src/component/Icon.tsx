import React from 'react';
import { Icon as IconType, ColorThemeType } from './ColorTheme';

export interface Props {
    icon: IconType,
    colorThemeType: ColorThemeType,
}

export default function Icon(props: Props) {

    let iconUrl = undefined;
    if(props.icon.category !== undefined && (props.icon.hasVariants !== undefined) && props.icon.hasVariants) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/themes/${props.colorThemeType}/${props.icon.id}.svg`;
    } else if(props.icon.category !== undefined && ((props.icon.hasVariants === undefined) || !props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/categories/${props.icon.category}/${props.icon.id}.svg`;
    } else if(props.icon.category === undefined && ((props.icon.hasVariants !== undefined) && props.icon.hasVariants)) {
        iconUrl = `${process.env.PUBLIC_URL}/assets/themes/${props.colorThemeType}/${props.icon.id}.svg`;
    } else {
        iconUrl = `${process.env.PUBLIC_URL}/assets/${props.icon.id}.svg`;
    }

    return (
        <img
            src={ iconUrl }
            alt=''
        />
    );
}

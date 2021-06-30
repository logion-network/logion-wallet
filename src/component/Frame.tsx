import React from 'react';

import { Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';

import './Frame.css';

export interface Props {
    colors: ColorTheme,
    children: Children,
    disabled?: boolean,
    className?: string,
}

export default function Frame(props: Props) {

    const inlineCss = `
    .Frame a,
    .Frame .btn-link {
        color: ${props.colors.frame.link}
    }
    .Dashboard .Frame .form-control,
    .Dashboard .Frame .form-control[readonly] {
        background-color: ${props.colors.frame.background};
    }
    `;

    let className = "Frame";
    if(props.className !== undefined) {
        className = className + " " + props.className;
    }
    if(props.disabled !== undefined && props.disabled) {
        className = className + " disabled";
    }

    return (
        <div
            className={ className }
            style={{
                backgroundColor: props.colors.frame.background,
                color: props.colors.frame.foreground,
                boxShadow: `0 0 25px ${props.colors.shadowColor}`,
            }}
        >
            <style>
            { inlineCss }
            </style>
            { props.children }
        </div>
    );
}

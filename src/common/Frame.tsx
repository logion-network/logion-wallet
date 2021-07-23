import React from 'react';

import { Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';

import './Frame.css';

export interface Props {
    colors: ColorTheme,
    children: Children,
    disabled?: boolean,
    className?: string,
    fullHeight?: boolean,
    altColors?: boolean,
    title?: string,
    fillHeight?: boolean,
}

export default function Frame(props: Props) {

    const backgroundColor =
        (props.altColors !== undefined && props.altColors) ?
            props.colors.frame.altBackground :
            props.colors.frame.background;
    const inlineCss = `
    .Frame a,
    .Frame .btn-link {
        color: ${props.colors.frame.link}
    }
    `;

    let className = "Frame";
    if(props.className !== undefined) {
        className = className + " " + props.className;
    }
    if(props.disabled !== undefined && props.disabled) {
        className = className + " disabled";
    }
    if(props.fullHeight !== undefined && props.fullHeight) {
        className = className + " full-height";
    }
    if(props.fillHeight !== undefined && props.fillHeight) {
        className = className + " fill-height";
    }

    return (
        <div
            className={ className }
            style={{
                backgroundColor,
                color: props.colors.frame.foreground,
                boxShadow: `0 0 25px ${props.colors.shadowColor}`,
            }}
        >
            <style>
            { inlineCss }
            </style>
            {
                props.title !== undefined &&
                <div className="title">{ props.title }</div>
            }
            { props.children }
        </div>
    );
}

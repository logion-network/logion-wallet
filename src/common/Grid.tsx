import React, { CSSProperties } from "react";

import { Children } from './types/Helpers';

import './Grid.css';

export interface RowProps {
    children: Children,
    className?: string,
    style?: CSSProperties,
    dataTestId?: string,
}

export function Row(props: RowProps) {

    return (
        <div
            className={ "Row" + (props.className !== undefined ? " " + props.className : "") }
            style={ props.style }
            data-testid = { props.dataTestId }
        >
            { props.children }
        </div>
    );
}

export interface ColProps {
    children: Children,
    className?: string,
    style?: CSSProperties,
}

export function Col(props: ColProps) {

    return (
        <div
            className={ "Col" + (props.className !== undefined ? " " + props.className : "") }
            style={ props.style }
        >
            { props.children }
        </div>
    );
}

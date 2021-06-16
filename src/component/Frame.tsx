import React from 'react';

import { Children, BackgroundAndForegroundColors } from './types/Helpers';

import './Frame.css';

export interface Props {
    colors: BackgroundAndForegroundColors,
    children: Children,
}

export default function Frame(props: Props) {
    return (
        <div
            className="Frame"
            style={{
                backgroundColor: props.colors.background,
                color: props.colors.foreground,
            }}
        >
            { props.children }
        </div>
    );
}

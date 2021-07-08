import React from 'react';
import { ColorTheme } from './ColorTheme';

import './Detail.css';

export interface Props {
    label: string,
    value: string,
    colorTheme: ColorTheme,
}

export default function Detail(props: Props) {

    return (
        <div
            className="Detail"
            style={{
                color: props.colorTheme.dashboard.foreground,
            }}
        >
            <div className="label">{ props.label }</div>
            <div className="value">{ props.value }</div>
        </div>
    );
}

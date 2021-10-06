import React from 'react';
import * as Css from 'csstype';

import { Icon as IconType } from './ColorTheme';
import Icon from "./Icon";

import './StatusCell.css';

export interface Props {
    color: string;
    text: string;
    icon?: IconType;
    textTransform?: Css.Property.TextTransform;
}

export default function StatusCell(props: Props) {

    let icon;
    if(props.icon !== undefined) {
        icon = <Icon icon={ props.icon } />;
    } else {
        icon = null;
    }
    let status = <span style={{color: props.color, textTransform: props.textTransform}}>{ props.text }</span>;
    return (
        <span
            className="StatusCell"
            style={{
                borderColor: props.color
            }}
        >
            { icon } { status }
        </span>
    );
}

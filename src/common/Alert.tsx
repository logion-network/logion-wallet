import React from 'react';
import { Variant } from 'react-bootstrap/types';

import { Children } from './types/Helpers';
import { GREEN, POLKADOT, RED, YELLOW } from './ColorTheme';

import './Alert.css';

export interface Props {
    variant: Variant,
    children: Children;
}

export default function Alert(props: Props) {

    let color = undefined;
    let backgroundColor = undefined;
    if(props.variant === 'success') {
        color = GREEN;
    } else if(props.variant === 'accepted' || (props.variant === 'warning_color')) {
        color = YELLOW;
    } else if(props.variant === 'danger') {
        color = RED;
    } else if(props.variant === 'polkadot') {
        color = "white";
        backgroundColor = POLKADOT;
    }

    return (
        <div
            className={ `Alert ${props.variant}` }
            style={{
                color,
                backgroundColor
            }}
        >
            { props.children }
        </div>
    );
}

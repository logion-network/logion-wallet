import React from 'react';
import { Variant } from 'react-bootstrap/types';

import { Children, customClassName } from './types/Helpers';
import { GREEN, POLKADOT, RED, YELLOW } from './ColorTheme';

import './Alert.css';

export interface Props {
    variant: Variant,
    children: Children;
    slim?: boolean;
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

    const className = customClassName("Alert", props.variant, slimClassName(props.slim))

    return (
        <div
            className={ className }
            style={{
                color,
                backgroundColor
            }}
        >
            { props.children }
        </div>
    );
}

function slimClassName(slim?: boolean): string | undefined {
    if(slim !== undefined && slim) {
        return "slim";
    } else {
        return undefined;
    }
}

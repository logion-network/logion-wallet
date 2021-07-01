import React from 'react';
import { Variant } from 'react-bootstrap/types';

import { Children } from './types/Helpers';
import { GREEN } from './ColorTheme';

import './Alert.css';

export interface Props {
    variant: Variant,
    children: Children;
}

export default function Alert(props: Props) {

    let color = undefined;
    if(props.variant === 'success') {
        color = GREEN;
    }

    return (
        <div
            className={ `Alert ${props.variant}` }
            style={{
                color
            }}
        >
            { props.children }
        </div>
    );
}

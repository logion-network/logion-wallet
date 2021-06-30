import React from 'react';
import { Variant } from 'react-bootstrap/types';

import { Children } from './types/Helpers';

import './Alert.css';

export interface Props {
    variant: Variant,
    children: Children;
}

export default function Alert(props: Props) {
    return (
        <div className={ `Alert ${props.variant}` }>
            { props.children }
        </div>
    );
}

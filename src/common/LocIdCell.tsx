import React from 'react';
import { UUID } from '../logion-chain/UUID';
import { Cell } from './Table';

export interface Props {
    id: string
}

export default function LocIdCell(props: Props) {

    return (
        <Cell
            content={ new UUID(props.id).toDecimalString() }
        />
    );
}

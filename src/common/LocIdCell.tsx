import React from 'react';

import { UUID } from '../logion-chain/UUID';

import { Cell } from './Table';
import { LocRequestStatus } from './types/ModelTypes';

export interface Props {
    status: LocRequestStatus;
    id: string;
}

export default function LocIdCell(props: Props) {

    let content: string;
    if(props.status === 'OPEN' || props.status === 'CLOSED') {
        content = new UUID(props.id).toDecimalString();
    } else {
        content = "-";
    }

    return (
        <Cell
            overflowing
            tooltipId={ `locId-${ props.id }` }
            content={ content }
        />
    );
}

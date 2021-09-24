import React from 'react';

import { Cell } from './Table';
import UserIdentity from './types/Identity';

export interface Props {
    userIdentity?: UserIdentity;
}

export default function UserIdentityNameCell(props: Props) {

    return (
        <Cell
            content={ `${props.userIdentity?.firstName} ${props.userIdentity?.lastName}` }
        />
    );
}

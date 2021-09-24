import React from 'react';

import { Cell } from './Table';
import { getOfficer } from './types/LegalOfficer';

export interface Props {
    address: string;
}

export default function LegalOfficerName(props: Props) {

    const legalOfficer = getOfficer(props.address);
    let content: string;
    if(legalOfficer === null) {
        content = "!! UNKNOWN LEGAL OFFICER !!";
    } else {
        content = legalOfficer.name;
    }

    return (
        <Cell
            content={ content }
        />
    );
}

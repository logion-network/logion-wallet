import React from 'react';
import { useDirectoryContext } from '../directory/DirectoryContext';

import { Cell } from './Table';

export interface Props {
    address: string;
}

export default function LegalOfficerName(props: Props) {
    const { getOfficer } = useDirectoryContext();

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

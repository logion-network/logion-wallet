import React from 'react';
import Button from 'react-bootstrap/Button';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function RefreshRequestsButton() {
    const { refreshRequests } = useLegalOfficerContext();
    if(refreshRequests === null) {
        return null;
    } else {
        return <Button onClick={refreshRequests}>Refresh requests</Button>;
    }
}

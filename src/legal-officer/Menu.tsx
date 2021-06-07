import React from 'react';
import { Link } from 'react-router-dom';

import { TOKENIZATION_REQUESTS_PATH } from './LegalOfficerPaths';

export default function Menu() {

    return (
        <ul>
            <li><Link to={ TOKENIZATION_REQUESTS_PATH }>Tokenization Requests</Link></li>
        </ul>
    );
}

import React from 'react';

import CommonSettings from '../Settings';

import { useLegalOfficerContext } from './LegalOfficerContext';

export default function Settings() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <CommonSettings colors={ colorTheme }/>
    );
}

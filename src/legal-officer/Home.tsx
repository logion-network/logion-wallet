import React from 'react';

import { FullWidthPane } from '../common/Dashboard';

import { useLegalOfficerContext } from "./LegalOfficerContext";

export default function Account() {
    const { colorTheme } = useLegalOfficerContext();

    return (
        <FullWidthPane
            mainTitle="Home"
            titleIcon={{
                icon: {
                    id: 'tokens'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            colors={ colorTheme }
        >
        </FullWidthPane>
    );
}

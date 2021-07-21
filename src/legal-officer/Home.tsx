import React from 'react';

import { FullWidthPane } from '../common/Dashboard';
import { useRootContext } from '../RootContext';

import { useLegalOfficerContext } from "./LegalOfficerContext";

export default function Account() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useLegalOfficerContext();

    if(addresses === null || selectAddress === null) {
        return null;
    }

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
            addresses={ addresses }
            selectAddress={ selectAddress }
        >
        </FullWidthPane>
    );
}

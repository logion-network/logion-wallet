import React from 'react';

import { FullWidthPane } from '../common/Dashboard';
import { useRootContext } from '../RootContext';

import { useUserContext } from "./UserContext";

export default function Account() {
    const { selectAddress, addresses } = useRootContext();
    const { colorTheme } = useUserContext();

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

import React from 'react';

import { FullWidthPane } from '../common/Dashboard';

import { useUserContext } from "./UserContext";

export default function Account() {
    const { colorTheme } = useUserContext();

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

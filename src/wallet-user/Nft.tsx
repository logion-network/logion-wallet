import React from 'react';

import { FullWidthPane } from '../common/Dashboard';

import { useUserContext } from "./UserContext";

export default function Account() {
    const { colorTheme } = useUserContext();

    return (
        <FullWidthPane
            mainTitle="NFT"
            titleIcon={{
                icon: {
                    id: 'nft'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
            colors={ colorTheme }
        >
        </FullWidthPane>
    );
}

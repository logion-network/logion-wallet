import React from 'react';

import { FullWidthPane } from '../common/Dashboard';

import { useCommonContext } from "../common/CommonContext";

export default function Account() {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            mainTitle="NFT"
            titleIcon={{
                icon: {
                    id: 'nft'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
        </FullWidthPane>
    );
}

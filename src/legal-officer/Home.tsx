import React from 'react';

import { FullWidthPane } from '../common/Dashboard';

import { useCommonContext } from "../common/CommonContext";

export default function Account() {
    const { colorTheme } = useCommonContext();

    return (
        <FullWidthPane
            mainTitle="Home"
            titleIcon={{
                icon: {
                    id: 'tokens'
                },
                background: colorTheme.topMenuItems.iconGradient,
            }}
        >
        </FullWidthPane>
    );
}

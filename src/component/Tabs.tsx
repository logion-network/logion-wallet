import React from 'react';
import ReactTabs from 'react-bootstrap/Tabs';
import ReactTab from 'react-bootstrap/Tab';

import { Children } from './types/Helpers';

export interface Tab {
    key: string,
    title: string,
    render: () => Children
}

export interface Props {
    activeKey: string,
    onSelect: (key: string) => void,
    tabs: Tab[],
}

export default function Tabs(props: Props) {
    return (
        <ReactTabs
            activeKey={ props.activeKey }
            onSelect={ key => props.onSelect(key || "") }
        >
            {
                props.tabs.map(tab => (
                    <ReactTab
                        key={ tab.key }
                        eventKey={ tab.key }
                        title={ tab.title }
                    >
                        { tab.render() }
                    </ReactTab>
                ))
            }
        </ReactTabs>
    );
}

import React from 'react';
import ReactTabs from 'react-bootstrap/Tabs';
import ReactTab from 'react-bootstrap/Tab';

import { TabsColors } from './ColorTheme';
import { Children } from './types/Helpers';
import './Tabs.css';

export interface Tab {
    key: string,
    title: Children,
    render: () => Children,
}

export interface Props {
    activeKey: string,
    onSelect: (key: string) => void,
    tabs: Tab[],
    colors: TabsColors,
}

export default function Tabs(props: Props) {

    const customCss = `
    .Tabs .nav-tabs .nav-link {
        border-color: ${props.colors.borderColor};
        color: ${props.colors.inactiveTab.foreground};
        background-color: ${props.colors.inactiveTab.background};
    }
    .Tabs .nav-tabs .nav-link.active {
        color: ${props.colors.foreground};
        background-color: ${props.colors.background};
        border-bottom-color: ${props.colors.background};
    }
    .Tabs .tab-content {
        color: ${props.colors.foreground};
        background-color: ${props.colors.background};
        border: 1px solid ${props.colors.borderColor};
    }
    `;

    return (
        <div className="Tabs">
            <style>
            { customCss }
            </style>
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
        </div>
    );
}

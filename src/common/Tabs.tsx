import React from 'react';
import ReactTabs from 'react-bootstrap/Tabs';
import ReactTab from 'react-bootstrap/Tab';

import { useCommonContext } from './CommonContext';
import { Children, customClassName } from './types/Helpers';
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
    borderColor?: string,
    className?: string;
}

export default function Tabs(props: Props) {
    const { colorTheme } = useCommonContext();

    let borderColor = props.borderColor;
    if(borderColor === undefined) {
        borderColor = colorTheme.tabs.borderColor;
    }

    const customCss = `
    .Tabs .nav-tabs .nav-link {
        border-color: ${borderColor};
        color: ${colorTheme.tabs.inactiveTab.foreground};
        background-color: ${colorTheme.tabs.inactiveTab.background};
    }
    .Tabs .nav-tabs .nav-link.active {
        color: ${colorTheme.tabs.foreground};
        background-color: ${colorTheme.tabs.background};
        border-bottom-color: ${colorTheme.tabs.background};
    }
    .Tabs .tab-content {
        color: ${colorTheme.tabs.foreground};
        background-color: ${colorTheme.tabs.background};
        border: 1px solid ${borderColor};
    }
    `;

    let className = customClassName("Tabs", props.className);

    return (
        <div className={ className }>
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

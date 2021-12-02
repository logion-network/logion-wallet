import React from 'react';
import ReactTabs from 'react-bootstrap/Tabs';
import ReactTab from 'react-bootstrap/Tab';

import { useCommonContext } from './CommonContext';
import { Children, customClassName } from './types/Helpers';
import './Tabs.css';
import { BackgroundAndForegroundColors } from './ColorTheme';

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
    borderWidth?: string,
    tabColors?: BackgroundAndForegroundColors,
    inactiveTabColors?: BackgroundAndForegroundColors,
    flatBottom?: boolean,
}

export default function Tabs(props: Props) {
    const { colorTheme } = useCommonContext();

    let borderColor = props.borderColor;
    if(borderColor === undefined) {
        borderColor = colorTheme.tabs.borderColor;
    }

    let borderWidth = "1px";
    if(props.borderWidth !== undefined) {
        borderWidth = props.borderWidth;
    }

    let inactiveTabColors = colorTheme.tabs.inactiveTab;
    if(props.inactiveTabColors !== undefined) {
        inactiveTabColors = props.inactiveTabColors;
    }

    let tabColors: BackgroundAndForegroundColors = colorTheme.tabs;
    if(props.tabColors !== undefined) {
        tabColors = props.tabColors;
    }

    const customCss = `
    .Tabs .nav-tabs .nav-link {
        border-color: ${borderColor};
        color: ${inactiveTabColors.foreground};
        background-color: ${inactiveTabColors.background};
    }
    .Tabs .nav-tabs .nav-link.active {
        color: ${tabColors.foreground};
        background-color: ${tabColors.background};
        border-bottom-color: ${tabColors.background};
    }
    .Tabs .tab-content {
        color: ${colorTheme.tabs.foreground};
        background-color: ${colorTheme.tabs.background};
        border: ${borderWidth} solid ${borderColor};
    }
    `;

    let className = customClassName("Tabs", props.className, props.flatBottom ? "flat-bottom" : undefined);

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

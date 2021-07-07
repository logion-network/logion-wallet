import React, { useRef, useEffect, useState } from 'react';
import ReactTabs from 'react-bootstrap/Tabs';
import ReactTab from 'react-bootstrap/Tab';

import { TabsColors } from './ColorTheme';
import { Children } from './types/Helpers';
import './Tabs.css';

export interface Tab {
    key: string,
    title: string,
    render: () => Children
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
                    props.tabs.map((tab, index) => (
                        <ReactTab
                            key={ tab.key }
                            eventKey={ tab.key }
                            title={(
                                <span>
                                    { tab.title }
                                    <TabCanvas
                                        colors={ props.colors }
                                        trigger={ tab.key }
                                        active={ props.activeKey }
                                        first={ index === 0 }
                                        last={ index === props.tabs.length - 1 }
                                    />
                                </span>
                            )}
                        >
                            { tab.render() }
                        </ReactTab>
                    ))
                }
            </ReactTabs>
        </div>
    );
}

interface TabCanvasProps {
    colors: TabsColors,
    trigger: string,
    active: string,
    last: boolean,
    first: boolean,
}

function TabCanvas(props: TabCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ translated, setTranslated ] = useState<boolean>(false);

    useEffect(() => {
        if(canvasRef.current !== null && !translated) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if(context !== null) {
                context.translate(0.5, 0.5);
                setTranslated(true);
            }
        }
    }, [ translated, setTranslated ]);

    useEffect(() => {
        if(canvasRef.current !== null && props.trigger === props.active && translated) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if(context !== null) {
                console.log("Redrawing canvas " + props.trigger);

                context.clearRect(0, 0, canvas.width, canvas.height);
                context.strokeStyle = props.colors.borderColor;

                // Left border
                context.beginPath();
                context.moveTo(0, 43);
                context.lineTo(0, 10);
                context.stroke();

                // Top-left corner
                context.beginPath();
                context.arc(10, 10, 10, Math.PI, 1.5 * Math.PI);
                context.stroke();

                // Top border
                context.beginPath();
                if(props.first) {
                    context.moveTo(10, 0);
                } else {
                    context.moveTo(0, 0);
                }
                if(props.last) {
                    context.lineTo(125, 0);
                } else {
                    context.lineTo(149, 0);
                }
                context.stroke();

                // Top-right corner
                context.beginPath();
                context.arc(125, 10, 10, 1.5 * Math.PI, 1.75 * Math.PI);
                context.stroke();

                // Right border
                context.beginPath();
                context.moveTo(132, 3);
                context.lineTo(147.5, 39);
                context.stroke();

                // Bottom-right corner
                context.beginPath();
                context.arc(152, 37, 5, 0 * Math.PI, 0.85 * Math.PI);
                context.stroke();

                context.strokeStyle = props.colors.background;

                // Bottom border
                context.beginPath();
                context.moveTo(1, 42);
                context.lineTo(149, 42);
                context.stroke();

                // Fill below Right border
                for(let i = 0; i < 10; ++i) {
                    context.beginPath();
                    context.moveTo(139, 22 + i);
                    context.lineTo(148 - i, 44);
                    context.stroke();
                }

                // Fill above Right border
                context.strokeStyle = props.colors.inactiveTab.background;
                for(let i = 0; i < 10; ++i) {
                    context.beginPath();
                    context.moveTo(132 + i, 1);
                    context.lineTo(142 + i, 22);
                    context.stroke();
                }
            }
        }
    }, [ canvasRef, props, translated ]);

    return <canvas ref={ canvasRef } width="150" height="44"></canvas>;
}

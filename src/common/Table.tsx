import React, { CSSProperties, useState, useCallback, useEffect } from 'react';
import * as Css from 'csstype';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { format } from 'logion-api/dist/datetime';
import Spinner from "react-bootstrap/Spinner";

import { Row, Col } from './Grid';
import { Child, Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';
import './Table.css';
import Icon from './Icon';
import CopyPasteButton from "./CopyPasteButton";
import { TableColors } from './ColorTheme';


export interface CellProps {
    content: Children,
    smallText?: boolean,
    wordBreak?: Css.Property.WordBreak,
    overflowing?: boolean,
    tooltipId?: string,
    align?: Css.Property.TextAlign,
}

export function Cell(props: CellProps) {

    let className = "regular-cell";
    if(props.smallText !== undefined && props.smallText) {
        className = className + " small-text";
    }

    let style: CSSProperties = {};
    if(props.wordBreak !== undefined) {
        style.wordBreak = props.wordBreak;
        className = className + " two-lines";
    }

    if(props.overflowing !== undefined && props.overflowing) {
        className = className + " overflowing";
    }

    if(props.align !== undefined) {
        style.textAlign = props.align;
    }

    if(props.tooltipId !== undefined) {
        return (
            <div
                className={ className }
                style={ style }
            >
                <OverlayTrigger
                      placement="bottom-start"
                      delay={ 500 }
                      overlay={
                        <Tooltip id={ props.tooltipId }>
                          { props.content }
                        </Tooltip>
                      }
                    >
                      <span>{ props.content }</span>
                </OverlayTrigger>
            </div>
        );
    } else {
        return (
            <div className={ className } style={ style }>{ props.content }</div>
        );
    }
}

export interface EmptyTableMessageProps {
    children: Children,
}

export function EmptyTableMessage(props: EmptyTableMessageProps) {

    return (
        <div className="empty-message">{ props.children }</div>
    );
}

export interface Column<T> {
    header: Children,
    render: (element: T) => Child,
    width?: string,
    smallerText?: boolean,
    splitAfter?: boolean,
    renderDetails?: (element: T) => Child,
    align?: Css.Property.TextAlign,
    detailsExpanded?: (element: T) => boolean,
}

function fontSize<T>(column: Column<T>): (string | undefined) {
    if(column.smallerText !== undefined && column.smallerText) {
        return '10px';
    } else {
        return undefined;
    }
}

export interface Props<T> {
    data: T[],
    columns: Column<T>[],
    renderEmpty: () => Children,
    rowStyle?: (item: T, index?: number) => string;
    color?: TableColors;
}

function columnClassName<T>(column: Column<T>): (string | undefined) {
    const classes: string[] = [];
    if(column.splitAfter !== undefined && column.splitAfter) {
        classes.push("split-after");
    }
    if(column.renderDetails) {
        classes.push("has-details");
    }
    if(classes.length > 0) {
        return classes.join(" ");
    } else {
        return undefined;
    }
}

function initialDetailsExpanded<T>(data: T[], columns: Column<T>[]): boolean[] {
    let detailsExpandedFunction: ((element: T) => boolean) | undefined = undefined;
    for(let i = 0; i < columns.length; ++i) {
        const column = columns[i];
        if(column.detailsExpanded !== undefined) {
            detailsExpandedFunction = column.detailsExpanded;
            break;
        }
    }

    const detailsExpanded = new Array<boolean>(data.length);
    for(let i = 0; i < data.length; ++i) {
        if(detailsExpandedFunction) {
            detailsExpanded[i] = detailsExpandedFunction(data[i]);
        } else {
            detailsExpanded[i] = false;
        }
    }
    return detailsExpanded;
}

function computeColumnWidths<T>(columns: Column<T>[], header: boolean): string[] {
    //let reservedPixelWidth = header ? 0 : 20;
    let reservedPixelWidth = 0;
    let reservedPercentageWidth = 0;
    let undefinedWidths = 0;
    columns.forEach(column => {
        const width = column.width;
        if(width !== undefined) {
            if(width.endsWith("px")) {
                reservedPixelWidth += Number(width.substring(0, width.length - 2));
            } else if(width.endsWith("%")) {
                reservedPercentageWidth += Number(width.substring(0, width.length - 1));
            } else {
                reservedPixelWidth += Number(width);
            }
        } else {
            ++undefinedWidths;
        }
    });
    const remainingPercentageWidth = 100 - reservedPercentageWidth;
    if(remainingPercentageWidth < 0) {
        throw new Error("No more space left");
    }
    const computedWidthForUndefined = `calc(( ${remainingPercentageWidth}% - ${reservedPixelWidth}px ) / ${undefinedWidths})`;
    const computedWidths = new Array<string>(columns.length);
    for(let i = 0; i < columns.length; ++i) {
        const column = columns[i];
        if(column.width === undefined) {
            computedWidths[i] = computedWidthForUndefined;
        } else {
            computedWidths[i] = column.width;
        }
    }
    return computedWidths;
}

export default function Table<T>(props: Props<T>) {
    const { colorTheme } = useCommonContext();
    const [ detailsExpanded, setDetailsExpanded ] = useState<boolean[]>(initialDetailsExpanded(props.data, props.columns));
    const [ data, setData ] = useState<T[]>(props.data);

    let color = colorTheme.table;
    if(props.color !== undefined) {
        color = props.color;
    }

    let renderDetails: ((element: T) => Children) | undefined = undefined;
    for(let i = 0; i < props.columns.length; ++i) {
        const column = props.columns[i];
        if(column.renderDetails !== undefined) {
            renderDetails = column.renderDetails;
            break;
        }
    }

    const headerComputedWidths: string[] = computeColumnWidths(props.columns, true);
    const rowComputedWidths: string[] = computeColumnWidths(props.columns, false);

    const toggle = useCallback((itemIndex: number) => {
        const newDetailsExpanded = [ ...detailsExpanded ];
        newDetailsExpanded[itemIndex] = !newDetailsExpanded[itemIndex];
        setDetailsExpanded(newDetailsExpanded);
    }, [ detailsExpanded, setDetailsExpanded ]);

    useEffect(() => {
        if(data !== props.data) {
            setDetailsExpanded(initialDetailsExpanded(props.data, props.columns));
            setData(props.data);
        }
    }, [ props, data, setDetailsExpanded, setData ]);

    return (
        <div className="Table">
            <style>
            {
            `
            .Table .body .Row .Col.split-after::before {
                background-color: ${color.row.background};
            }
            `
            }
            </style>
            <div
                className="header"
                style={{
                    color: color.header.foreground,
                    backgroundColor: color.header.background,
                }}
            >
                <Row>
                    {
                        props.columns.map((column, index) => (
                            <Col
                                key={ index }
                                style={{
                                    width: headerComputedWidths[index],
                                    textAlign: column.align === undefined ? 'center' : column.align,
                                }}>
                                { column.header }
                            </Col>
                        ))
                    }
                </Row>
            </div>
            <div className="body">
                {
                    props.data.length > 0 &&
                    props.data.map((item, itemIndex) => (
                        <div key={itemIndex}>
                        <Row
                            className={ (renderDetails !== undefined ? "has-details" : "") + (props.rowStyle !== undefined ? " " + props.rowStyle(item, itemIndex) : "") }
                            key={ itemIndex }
                            style={{
                                color: color.row.foreground,
                            }}
                        >
                            {
                                props.columns.map((col, colIndex) => {
                                    const className = colIndex < props.columns.length -1 ? columnClassName(col) : undefined;
                                    return(
                                        <Col
                                            className={ className }
                                            key={ colIndex }
                                            style={{
                                                width: rowComputedWidths[colIndex],
                                                fontSize: fontSize(col),
                                                backgroundColor: !className || !className.includes("split-after") ? color.row.background : undefined,
                                                textAlign: col.align === undefined ? 'center' : col.align,
                                            }}
                                        >
                                            { col.render(item) }
                                            {
                                                col.renderDetails !== undefined &&
                                                <ShowDetailsButton
                                                    expanded={ detailsExpanded[itemIndex] }
                                                    onClick={ () => toggle(itemIndex) }
                                                />
                                            }
                                        </Col>
                                    );
                                })
                            }
                        </Row>
                        {
                            renderDetails !== undefined &&
                            <Row
                                className={ "details" + (detailsExpanded[itemIndex] ? " expanded" : "") }
                                key={ itemIndex + "-details" }
                                style={{
                                    color: color.row.foreground,
                                    backgroundColor: color.row.background,
                                }}
                            >
                                { renderDetails(item) }
                            </Row>
                        }
                        </div>
                    ))
                }
                {
                    props.data.length === 0 &&
                    <Row
                        className="empty-data"
                        style={{
                            color: color.row.foreground,
                            backgroundColor: color.row.background,
                        }}
                    >
                        { props.renderEmpty() }
                    </Row>
                }
            </div>
        </div>
    );
}

interface ShowDetailsButtonProps {
    expanded: boolean,
    onClick: () => void,
}

function ShowDetailsButton(props: ShowDetailsButtonProps) {

    return (
        <div className={"ShowDetailsButton" + (props.expanded ? " expanded" : "")} onClick={ props.onClick }>
            <Icon icon={ { id: "arrow-down", hasVariants: true } } />
        </div>
    );
}

export interface DateTimeCellProps {
    dateTime: string | null,
    spinner?: boolean,
}

export function DateTimeCell(props: DateTimeCellProps) {

    if (!props.dateTime) {
        if (props.spinner) {
            return <Spinner animation="border" />
        } else {
            return <Cell content="-" align="center" />;
        }
    }

    const { date, time } = format(props.dateTime)

    return (
        <div className="date-cell">
            { date }<br />
            { time }
        </div>
    );
}

export function DateCell(props: DateTimeCellProps) {

    if(props.dateTime === null) {
        return <Cell content="-" align="center" />;
    }

    const { date } = format(props.dateTime)

    return (
        <Cell content={ date }/>
    );
}

export interface ActionCellProps {
    children: Children,
}

export function ActionCell(props: ActionCellProps) {

    return (
        <div className="action-cell">
            { props.children }
        </div>
    );
}

export function CopyPasteCell(props: CellProps) {
    return <Row>
        <Cell { ...props } />
        { props.content !== null && <CopyPasteButton value={ props.content.toString() } className="medium" /> }
    </Row>
}

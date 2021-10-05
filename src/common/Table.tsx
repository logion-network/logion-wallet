import React, { CSSProperties, useState, useCallback } from 'react';
import * as Css from 'csstype';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import { format } from '../logion-chain/datetime';

import { Row, Col } from './Grid';
import { Child, Children } from './types/Helpers';
import { useCommonContext } from './CommonContext';
import './Table.css';
import Icon from './Icon';


export interface CellProps {
    content: string | number | null,
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
                      placement="bottom"
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
}

function columnClassName<T>(column: Column<T>): (string | undefined) {
    if(column.splitAfter !== undefined && column.splitAfter) {
        return "split-after";
    } else {
        return undefined;
    }
}

function initialDetailsExpanded<T>(data: T[]): boolean[] {
    const detailsExpanded = new Array<boolean>(data.length);
    for(let i = 0; i < detailsExpanded.length; ++i) {
        detailsExpanded[i] = false;
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
    const [ detailsExpanded, setDetailsExpanded ] = useState<boolean[]>(initialDetailsExpanded(props.data));

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

    return (
        <div className="Table">
            <style>
            {
            `
            .Table .body .Row .Col.split-after::before {
                background-color: ${colorTheme.table.row.background};
            }
            `
            }
            </style>
            <div
                className="header"
                style={{
                    color: colorTheme.table.header.foreground,
                    backgroundColor: colorTheme.table.header.background,
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
                        <>
                        <Row
                            className={ renderDetails !== undefined ? "has-details" : "" }
                            key={ itemIndex }
                            style={{
                                color: colorTheme.table.row.foreground,
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
                                                backgroundColor: className === undefined ? colorTheme.table.row.background : undefined,
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
                                    color: colorTheme.table.row.foreground,
                                    backgroundColor: colorTheme.table.row.background,
                                }}
                            >
                                { renderDetails(item) }
                            </Row>
                        }
                        </>
                    ))
                }
                {
                    props.data.length === 0 &&
                    <Row
                        className="empty-data"
                        style={{
                            color: colorTheme.table.row.foreground,
                            backgroundColor: colorTheme.table.row.background,
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
            <Icon icon={{id: "arrow-down"}} />
        </div>
    );
}

export interface DateTimeCellProps {
    dateTime: string | null,
}

export function DateTimeCell(props: DateTimeCellProps) {

    if(props.dateTime === null) {
        return <Cell content="-" align="center" />;
    }

    const { date, time } = format(props.dateTime)

    return (
        <div className="date-cell">
            { date }<br/>
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

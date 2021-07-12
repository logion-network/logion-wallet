import React, { CSSProperties, useState, useCallback } from 'react';
import * as Css from 'csstype';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import moment from 'moment';

import { Row, Col } from './Grid';
import { Child, Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';
import './Table.css';
import Icon from './Icon';


export interface CellProps {
    content: string | number | null,
    smallText?: boolean,
    wordBreak?: Css.Property.WordBreak,
    overflowing?: boolean,
    tooltipId?: string,
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
    colorTheme: ColorTheme,
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

function computeColumnWidths<T>(columns: Column<T>[]): string[] {
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
    const [ detailsExpanded, setDetailsExpanded ] = useState<boolean[]>(initialDetailsExpanded(props.data));

    let renderDetails: ((element: T) => Children) | undefined = undefined;
    for(let i = 0; i < props.columns.length; ++i) {
        const column = props.columns[i];
        if(column.renderDetails !== undefined) {
            renderDetails = column.renderDetails;
            break;
        }
    }

    const computedWidths: string[] = computeColumnWidths(props.columns);

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
                background-color: ${props.colorTheme.table.row.background};
            }
            `
            }
            </style>
            <div
                className="header"
                style={{
                    color: props.colorTheme.table.header.foreground,
                    backgroundColor: props.colorTheme.table.header.background,
                }}
            >
                <Row>
                    {
                        props.columns.map((column, index) => (
                            <Col key={ index } style={{width: computedWidths[index]}}>{ column.header }</Col>
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
                                color: props.colorTheme.table.row.foreground,
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
                                                width: computedWidths[colIndex],
                                                fontSize: fontSize(col),
                                                backgroundColor: className === undefined ? props.colorTheme.table.row.background : undefined,
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
                                    color: props.colorTheme.table.row.foreground,
                                    backgroundColor: props.colorTheme.table.row.background,
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
                            color: props.colorTheme.table.row.foreground,
                            backgroundColor: props.colorTheme.table.row.background,
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

export interface DateCellProps {
    dateTime: string,
}

export function DateCell(props: DateCellProps) {

    const momentObject = moment(props.dateTime);
    const date = momentObject.format('L');
    const time = momentObject.format('LT');

    return (
        <div className="date-cell">
            { date }<br/>
            { time }
        </div>
    );
}

import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Children } from './types/Helpers';
import { ColorTheme } from './ColorTheme';
import './Table.css';


export interface CellProps {
    content: string | number | null,
    smallText?: boolean,
}

export function Cell(props: CellProps) {

    let className = "regular-cell";
    if(props.smallText !== undefined && props.smallText) {
        className = className + " small-text";
    }

    return (
        <div className={ className }>{ props.content }</div>
    );
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
    render: (element: T) => Children,
    width: number,
    smallerText?: boolean,
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

export default function Table<T>(props: Props<T>) {

    return (
        <div className="Table">
            <div
                className="header"
                style={{
                    color: props.colorTheme.table.header.foreground,
                    backgroundColor: props.colorTheme.table.header.background,
                }}
            >
                <Row noGutters>
                    {
                        props.columns.map((column, index) => (
                            <Col key={ index } md={ column.width }>{ column.header }</Col>
                        ))
                    }
                </Row>
            </div>
            <div className="body">
                {
                    props.data.length > 0 &&
                    props.data.map((item, itemIndex) => (
                        <Row
                            key={ itemIndex }
                            style={{
                                color: props.colorTheme.table.row.foreground,
                                backgroundColor: props.colorTheme.table.row.background,
                            }}
                            noGutters
                        >
                            {
                                props.columns.map((col, colIndex) => (
                                    <Col
                                        key={ colIndex }
                                        md={ col.width }
                                        style={{
                                            fontSize: fontSize(col)
                                        }}
                                    >
                                        { col.render(item) }
                                    </Col>
                                ))
                            }
                        </Row>
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
                        noGutters
                    >
                        { props.renderEmpty() }
                    </Row>
                }
            </div>
        </div>
    );
}

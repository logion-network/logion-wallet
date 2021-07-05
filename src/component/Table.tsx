import React from 'react';
import ReactTable from 'react-bootstrap/Table';

import { Child } from './types/Helpers';

export interface Column<T> {
    header: Child,
    render: (element: T) => Child,
}

export interface Props<T> {
    data: T[],
    columns: Column<T>[]
}

export default function Table<T>(props: Props<T>) {

    return (
        <ReactTable striped bordered responsive>
            <thead>
                <tr>
                    {
                        props.columns.map((column, index) => (
                            <th key={ index }>{ column.header }</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {
                    props.data.map((item, itemIndex) => (
                        <tr key={ itemIndex }>
                            {
                                props.columns.map((col, colIndex) => (
                                    <td key={ colIndex }>
                                        { col.render(item) }
                                    </td>
                                ))
                            }
                        </tr>
                    ))
                }
            </tbody>
        </ReactTable>
    );
}

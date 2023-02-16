import { useCallback } from "react";
import { useCommonContext } from "src/common/CommonContext";
import Icon from "src/common/Icon";
import Table, { Column, EmptyTableMessage } from "src/common/Table";
import { Children } from "src/common/types/Helpers";

import "./PagedTable.css";

export interface Page<T> {
    pageNumber: number;
    offset: number;
    isFirst: boolean;
    isLast: boolean;
    data: T[];
}

export function emptyPage<T>(): Page<T> {
    return {
        pageNumber: 1,
        offset: 0,
        isFirst: true,
        isLast: true,
        data: [],
    };
};

export function getPage<T>(allData: T[], page: number, maxPageSize: number): Page<T> {
    const offset = page * maxPageSize;
    if(offset >= allData.length) {
        return emptyPage();
    }

    const pageSize = Math.min(maxPageSize, allData.length - offset);
    const data = allData.slice(offset, offset + pageSize);
    return {
        pageNumber: page,
        offset,
        isFirst: offset === 0,
        isLast: offset + pageSize >= allData.length,
        data,
    };
}

export interface Props<T> {
    fullSize: number;
    currentPage: Page<T>,
    goToPage: (page: number) => void,
    columns: Column<T>[],
    constrainedRowHeight?: boolean,
    renderEmpty?: () => Children,
}

export default function PagedTable<T>(props: Props<T>) {

    return (
        <div className="PagedTable">
            <Controls page={ props.currentPage } fullSize={ props.fullSize } goToPage={ props.goToPage } />
            <Table
                columns={ props.columns }
                data={ props.currentPage.data }
                renderEmpty={ props.renderEmpty !== undefined ? props.renderEmpty : () => <EmptyTableMessage>No page to display</EmptyTableMessage> }
                constrainedRowHeight={ props.constrainedRowHeight }
            />
            <Controls page={ props.currentPage } fullSize={ props.fullSize } goToPage={ props.goToPage } />
        </div>
    );
}

function Controls<T>(props: { page: Page<T>, fullSize: number, goToPage: (page: number) => void, }) {
    return (
        <div className="controls">
            <span className="numbers">{props.page.offset + 1}-{props.page.offset + props.page.data.length} of {props.fullSize}</span>
            <Control iconId="left" onClick={ () => props.goToPage(props.page.pageNumber - 1) } side="left" disabled={ props.page.isFirst } />
            <Control iconId="right" onClick={ () => props.goToPage(props.page.pageNumber + 1) } side="right" disabled={ props.page.isLast } />
        </div>
    );
}

function Control(props: { iconId: string, onClick: () => void, side: "left" | "right", disabled: boolean }) {
    const { colorTheme } = useCommonContext();

    const onClick = useCallback(() => {
        if(!props.disabled) {
            props.onClick();
        }
    }, [ props ]);

    return (
        <span className={`control ${props.side} ${colorTheme.type}${ props.disabled ? " disabled" : "" }`} onClick={ onClick }><Icon icon={{ id: props.iconId, hasVariants: true }} height="10px" /></span>
    );
}

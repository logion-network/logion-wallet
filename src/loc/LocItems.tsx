import { Hash } from "@logion/node-api";
import Table, { EmptyTableMessage, Column } from "../common/Table";
import { useResponsiveContext } from "../common/Responsive";
import { useLogionChain } from "../logion-chain";

import { ContributionMode } from "./types";

import './LocItems.css';
import { Viewer } from "src/common/CommonContext";
import { useLocContext } from "./LocContext";
import {
    buildItemTableColumns,
    LocItem,
    FileData,
} from "./LocItem";
import CustomItemActions from "./CustomItemActions";

export interface LocItemsProps {
    matchedHash?: Hash;
    viewer: Viewer;
    contributionMode?: ContributionMode;
    locItems: LocItem[];
    isEmpty: boolean;
    hideHeader?: boolean;
}

export function LocItems(props: LocItemsProps) {
    const { locItems } = props;
    const { loc, locState } = useLocContext();
    const { accounts } = useLogionChain();
    const { width } = useResponsiveContext();

    if(!loc || !locState) {
        return null;
    }

    function renderActions(locItem: LocItem) {
        return (
            <CustomItemActions
                locItem={ locItem }
                contributionMode={ props.contributionMode }
            />
        );
    }

    if (props.isEmpty && loc.status !== "CLOSED") {
        return (
            <div className="LocItems empty-loc">
                <img alt="empty loc" src={ process.env.PUBLIC_URL + "/assets/empty-loc.svg" } />
                <p className="primary">This LOC is empty.</p>
                <p className="secondary">You can add public data and/or confidential documents.</p>
            </div>
        );
    } else {
        let columns: Column<LocItem>[] = buildItemTableColumns({
            contributionMode: props.contributionMode,
            currentAccount: accounts?.current?.accountId,
            viewer: props.viewer,
            loc,
            locState,
            renderActions,
            width,
        });
        return (
            <div className="LocItems">
                <Table
                    data={ locItems }
                    columns={ columns }
                    renderEmpty={ () => <EmptyTableMessage>No custom public data nor private documents</EmptyTableMessage> }
                    rowStyle={ item => (item.type === "Document" && item.hasData() && props.matchedHash && item.as<FileData>().hash.equalTo(props.matchedHash)) ? "matched" : "" }
                    hideHeader={ props.hideHeader }
                />
            </div>
        );
    }
}

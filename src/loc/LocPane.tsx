import { LocData } from "@logion/client";
import { useNavigate } from "react-router";

import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from "../common/Dashboard";
import { ActiveLoc } from "./LocContext";
import { Children } from "src/common/types/Helpers";

import "./LocPane.css";

export interface Props {
    loc: LocData | null;
    locState: ActiveLoc | null;
    backPath: string;
    children: Children;
}

export default function LocPane(props: Props) {
    const { loc, locState, backPath, children } = props;
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();

    if (loc === null || locState === null) {
        return null;
    }

    let paneTitle: string = "";
    let paneIcon: string = "";
    if (loc.locType === 'Transaction') {
        paneTitle = "Transaction Protection Case";
        paneIcon = 'loc';
    } else if (loc.locType === 'Identity') {
        paneTitle = "Identity Case";
        paneIcon = 'identity';
    } else if (loc.locType === 'Collection') {
        paneTitle = "Collection Protection Case";
        paneIcon = 'collection';
    }

    return (
        <FullWidthPane
            mainTitle={ paneTitle }
            titleIcon={ {
                icon: {
                    id: paneIcon
                },
                background: colorTheme.topMenuItems.iconGradient,
            } }
            onBack={ () => navigate(backPath) }
            className="LocPane"
        >
            { children }
        </FullWidthPane>
    );
}

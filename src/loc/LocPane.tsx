import { LocData } from "@logion/client";
import { useNavigate } from "react-router";

import { useCommonContext } from "../common/CommonContext";
import { FullWidthPane } from "../common/Dashboard";
import { Children, customClassName } from "src/common/types/Helpers";

import "./LocPane.css";
import { ContributionMode } from "./types";

export interface Props {
    loc: LocData | null;
    backPath: string;
    children: Children;
    className?: string;
    contributionMode?: ContributionMode;
}

export default function LocPane(props: Props) {
    const { loc, backPath, children, contributionMode } = props;
    const { colorTheme } = useCommonContext();
    const navigate = useNavigate();

    if (loc === null) {
        return null;
    }

    let paneTitle: string = "";
    let paneIcon: string = "";
    if (contributionMode === 'VerifiedIssuer') {
        paneTitle = "Verified Issuer LOC Management";
        paneIcon = 'issuer-icon';
    } else if (loc.locType === 'Transaction') {
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
            className={ customClassName("LocPane", props.className) }
        >
            { children }
        </FullWidthPane>
    );
}

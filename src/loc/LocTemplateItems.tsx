import { useCommonContext } from "src/common/CommonContext";
import { useResponsiveContext } from "src/common/Responsive";
import Table from "src/common/Table";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import {
    buildItemTableColumns,
    LocItem,
} from "./LocItem";
import { ContributionMode } from "./types";
import TemplateItemActions from "./TemplateItemActions";

export interface Props {
    contributionMode?: ContributionMode;
    templateItems: LocItem[];
}

export default function LocTemplateItems(props: Props) {
    const { viewer } = useCommonContext();
    const { loc, locState } = useLocContext();
    const { accounts } = useLogionChain();
    const { width } = useResponsiveContext();

    if(!loc || !locState) {
        return null;
    }

    const currentAddress = accounts?.current?.accountId.address;
    const columns = buildItemTableColumns({
        contributionMode: props.contributionMode,
        currentAddress,
        renderActions,
        viewer,
        loc,
        locState,
        width,
    });
    return (
        <div className="LocTemplateItems">
            <Table
                data={ props.templateItems }
                columns={ columns }
                renderEmpty={ () => null }
                doubleSpaceRows={ viewer !== "LegalOfficer" }
            />
        </div>
    );

    function renderActions(item: LocItem) {
        return <TemplateItemActions item={ item } />;
    }
}

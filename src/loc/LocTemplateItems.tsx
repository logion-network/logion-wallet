import Button from "src/common/Button";
import ButtonGroup from "src/common/ButtonGroup";
import { useCommonContext } from "src/common/CommonContext";
import InlineIconText from "src/common/InlineIconText";
import { useResponsiveContext } from "src/common/Responsive";
import Table from "src/common/Table";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import { buildItemTableColumns, canAdd, canDelete, canPublish, LocItem, useDeleteFileCallback, useDeleteMetadataCallback } from "./LocItem";
import LocLinkButton from "./LocLinkButton";
import { LocPrivateFileButton } from "./LocPrivateFileButton";
import { LocPublicDataButton } from "./LocPublicDataButton";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { ContributionMode } from "./types";

export interface Props {
    contributionMode?: ContributionMode;
    templateItems: LocItem[];
}

export default function LocTemplateItems(props: Props) {
    const { viewer } = useCommonContext();
    const { loc, mutateLocState } = useLocContext();
    const { accounts } = useLogionChain();
    const { width } = useResponsiveContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);

    if(!loc) {
        return null;
    }

    const currentAddress = accounts?.current?.address;
    const columns = buildItemTableColumns({
        contributionMode: props.contributionMode,
        currentAddress,
        renderActions,
        viewer,
        loc,
        width,
    });
    return (
        <div className="LocTemplateItems">
            <Table
                data={ props.templateItems }
                columns={ columns }
                renderEmpty={ () => null }
            />
        </div>
    );

    function renderActions(item: LocItem) {
        if(loc && item.isSet && canDelete(currentAddress, item, viewer, loc) && canPublish(viewer, loc)) {
            return (
                <ButtonGroup
                    className="actions"
                >
                    {
                        item.type === "Data" &&
                        <LocPublishPublicDataButton locItem={ item } />
                    }
                    {
                        item.type === "Document" &&
                        <LocPublishPrivateFileButton locItem={ item } />
                    }
                    <Button
                        onClick={() => item.type === "Data" ? deleteMetadata(item) : deleteFile(item)}
                    >
                        <InlineIconText icon={ { id: "clear", hasVariants: true } } height="19px" colorThemeType="dark" text="Clear"/>
                    </Button>
                </ButtonGroup>
            );
        } else if(loc && canAdd(viewer, loc)) {
            return (
                <ButtonGroup
                    className="actions"
                >
                    {
                        item.type === "Document" &&
                        <LocPrivateFileButton
                            text="Set document"
                            nature={ item.nature }
                        />
                    }
                    {
                        item.type === "Data" &&
                        <LocPublicDataButton
                            text="Set public data"
                            dataName={ item.name }
                        />
                    }
                    {
                        item.type === "Linked LOC" && viewer === "LegalOfficer" &&
                        <LocLinkButton
                            text="Set link"
                            nature={ item.nature }
                        />
                    }
                </ButtonGroup>
            );
        } else {
            return null;
        }
    }
}

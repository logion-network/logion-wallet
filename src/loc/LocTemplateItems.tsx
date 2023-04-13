import { UUID } from "@logion/node-api";
import { ReactNode, useCallback } from "react";
import Button from "src/common/Button";
import ButtonGroup from "src/common/ButtonGroup";
import { useCommonContext } from "src/common/CommonContext";
import InlineIconText from "src/common/InlineIconText";
import { useResponsiveContext } from "src/common/Responsive";
import Table from "src/common/Table";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";
import { buildItemTableColumns, canAdd, canDelete, canPublish, LocItem, useDeleteFileCallback, useDeleteLinkCallback, useDeleteMetadataCallback } from "./LocItem";
import LocLinkButton from "./LocLinkButton";
import { LocPrivateFileButton } from "./LocPrivateFileButton";
import { LocPublicDataButton } from "./LocPublicDataButton";
import LocPublishLinkButton from "./LocPublishLinkButton";
import LocPublishPrivateFileButton from "./LocPublishPrivateFileButton";
import LocPublishPublicDataButton from "./LocPublishPublicDataButton";
import { ContributionMode } from "./types";

export interface Props {
    contributionMode?: ContributionMode;
    templateItems: LocItem[];
}

export default function LocTemplateItems(props: Props) {
    const { viewer } = useCommonContext();
    const { loc, locState, mutateLocState } = useLocContext();
    const { accounts } = useLogionChain();
    const { width } = useResponsiveContext();
    const deleteMetadata = useDeleteMetadataCallback(mutateLocState);
    const deleteFile = useDeleteFileCallback(mutateLocState);
    const deleteLink = useDeleteLinkCallback(mutateLocState);

    const deleteItem = useCallback((item: LocItem) => {
        if(item.type === "Data") {
            deleteMetadata(item);
        } else if(item.type === "Document") {
            deleteFile(item);
        } else if(item.type === "Linked LOC") {
            deleteLink(item);
        }
    }, [ deleteMetadata, deleteFile, deleteLink ]);

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

    function renderActions(item: LocItem, locId: UUID) {
        const buttons: ReactNode[] = [];
        let key = 0;
        if(!loc) {
            return null;
        }

        if(item.isSet) {
            if(canPublish(viewer, loc)) {
                if(item.type === "Data") {
                    buttons.push(<LocPublishPublicDataButton key={++key} locItem={ item } locId={ locId } />);
                } else if(item.type === "Document") {
                    buttons.push(<LocPublishPrivateFileButton key={++key} locItem={ item } locId={ locId } />);
                } else if(item.type === "Linked LOC") {
                    buttons.push(<LocPublishLinkButton key={++key} locItem={ item } locId={ locId } />);
                }
            }

            if(canDelete(currentAddress, item, viewer, loc)) {
                buttons.push(
                    <Button
                        key={++key}
                        onClick={() => deleteItem(item)}
                    >
                        <InlineIconText icon={ { id: "clear", hasVariants: true } } height="19px" colorThemeType="dark" text="Clear"/>
                    </Button>
                );
            }
        } else if(canAdd(viewer, loc)) {
            if(item.type === "Data") {
                buttons.push(<LocPublicDataButton
                    key={++key}
                    text="Set"
                    dataName={ item.name }
                />);
            } else if(item.type === "Document") {
                buttons.push(<LocPrivateFileButton
                    key={++key}
                    text="Set"
                    nature={ item.nature }
                />);
            } else if(item.type === "Linked LOC" && viewer === "LegalOfficer") {
                buttons.push(<LocLinkButton
                    key={++key}
                    text="Set"
                    nature={ item.nature }
                />);
            }
        }

        return (
            <ButtonGroup
                className="actions"
            >
                { buttons }
            </ButtonGroup>
        );
    }
}

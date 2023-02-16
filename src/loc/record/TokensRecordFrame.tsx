import { TokensRecord, ClosedCollectionLoc } from "@logion/client";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import ButtonGroup from "src/common/ButtonGroup";
import { POLKADOT } from "src/common/ColorTheme";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import { useLocContext } from "../LocContext";
import { ContributionMode } from "../types";
import VTPSelectionButton from "../vtp/VTPSelectionButton";
import AddTokensRecordButton from "./AddTokensRecordButton";
import TokensRecordTable from "./TokensRecordTable";

export default function TokensRecordFrame(props: { contributionMode?: ContributionMode }) {
    const { viewer } = useCommonContext();
    const { locState } = useLocContext();
    const [ records, setRecords ] = useState<TokensRecord[]>();

    useEffect(() => {
        if(locState instanceof ClosedCollectionLoc) {
            (async function() {
                const records = await locState.getTokensRecords();
                setRecords(records);
            })();
        }
    }, [ locState ]);

    return (
        <Frame
            titleIcon={{
                icon: {
                    id: "records_polka"
                },
                width: "64px",
            }}
            title="Tokens records"
            border={`2px solid ${POLKADOT}`}
        >
            <IconTextRow
                icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                text={
                    <p>The entire Tokens record list below will be visible on each token public certificate for all the owners of tokens declared in this LOC.
                        If the restricted delivery option is activated, token owners will be able to get a copy of the related file.
                    </p>
                }
            />
            {
                records === undefined &&
                <Spinner animation="border" />
            }
            {
                records !== undefined &&
                <>
                    <TokensRecordTable records={records} contributionMode={props.contributionMode}/>
                    <ButtonGroup
                        align="left"
                    >
                        <AddTokensRecordButton records={records}/>
                        { viewer === "LegalOfficer" && <VTPSelectionButton/> }
                    </ButtonGroup>
                </>
            }
        </Frame>
    );
}

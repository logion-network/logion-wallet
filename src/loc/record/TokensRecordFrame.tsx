import { TokensRecord, ClosedCollectionLoc } from "@logion/client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Spinner, Form } from "react-bootstrap";
import ButtonGroup from "src/common/ButtonGroup";
import { POLKADOT } from "src/common/ColorTheme";
import { useCommonContext } from "src/common/CommonContext";
import Frame from "src/common/Frame";
import Icon from "src/common/Icon";
import IconTextRow from "src/common/IconTextRow";
import { useLocContext } from "../LocContext";
import { ContributionMode, toItemId } from "../types";
import IssuerSelectionButton from "../issuer/IssuerSelectionButton";
import AddTokensRecordButton from "./AddTokensRecordButton";
import TokensRecordTable from "./TokensRecordTable";
import FormGroup from "../../common/FormGroup";
import { Row, Col } from "../../common/Grid";
import Button from "../../common/Button";
import { Hash } from "@logion/node-api";
import "./TokensRecordFrame.css";

export type CheckResult = 'NONE' | 'POSITIVE' | 'NEGATIVE';

export default function TokensRecordFrame(props: { contributionMode?: ContributionMode }) {
    const { viewer, colorTheme } = useCommonContext();
    const { locState } = useLocContext();
    const [ records, setRecords ] = useState<TokensRecord[]>();
    const [ state, setState ] = useState<CheckResult>('NONE');
    const [ recordId, setRecordId ] = useState<string>("");
    const [ record, setRecord ] = useState<TokensRecord>();
    const [ managedCheck, setManagedCheck ] = useState<{ recordId: Hash, active: boolean }>();

    useEffect(() => {
        if(locState instanceof ClosedCollectionLoc) {
            (async function() {
                const records = await locState.getTokensRecords();
                setRecords(records);
            })();
        }
    }, [ locState ]);

    const checkData = useCallback(async () => {
        if (recordId && locState instanceof ClosedCollectionLoc) {
            const actualId = toItemId(recordId);
            if (actualId === undefined) {
                setState('NEGATIVE');
            } else {
                try {
                    const record = await locState.getTokensRecord({
                        recordId: actualId
                    })
                    setRecord(record);
                    if (record) {
                        setState('POSITIVE');
                    } else {
                        setState('NEGATIVE');
                    }
                } catch (e) {
                    console.log(e)
                    setState('NEGATIVE');
                }
            }
        }
    }, [ recordId, locState ]);

    const resetCheck = useCallback(() => {
        setManagedCheck(undefined);
        setRecordId("");
        setState('NONE');
        setRecord(undefined);
    }, []);

    const title = useMemo(() => {
        if (records === undefined || records.length === 0) {
            return "Tokens records";
        } else {
            return `Tokens records (${ records.length })`;
        }
    }, [ records ]);

    return (
        <Frame
            className="TokensRecordFrame"
            titleIcon={{
                icon: {
                    id: "records_polka"
                },
                width: "64px",
            }}
            title={ title }
            border={`2px solid ${POLKADOT}`}
        >
            <IconTextRow
                icon={ <Icon icon={ { id: "tip" } } width="45px" /> }
                text={ <>
                    <p>The entire Tokens record list below will be visible on each token public certificate for all the owners of tokens declared in this LOC.
                        If the restricted delivery option is activated, token owners will be able to get a copy of the related file.
                    </p>
                    <FormGroup
                        id="tokenRecordId"
                        noFeedback={ true }
                        control={
                            <Row>
                                <Col className={ managedCheck?.active ? "matched" : undefined }>
                                    <Form.Control
                                        className="tokens-record-id-input"
                                        type="text"
                                        value={ recordId }
                                        onChange={ value => {
                                            setState('NONE');
                                            if (managedCheck) {
                                                setManagedCheck({
                                                    recordId: managedCheck.recordId,
                                                    active: false
                                                });
                                            }
                                            setRecordId(value.target.value);
                                        } }
                                        data-testid="tokens-record-id"
                                    />
                                    {
                                        state !== "NONE" &&
                                        <span className="clear-button" onClick={ resetCheck }><Icon
                                            icon={ { id: "clear", hasVariants: true } } height="24px" /></span>
                                    }
                                </Col>
                                <Col className="buttons">
                                    <Button onClick={ checkData } disabled={ !recordId }>
                                        <Icon icon={ { id: "search" } } /> Check Tokens Record ID
                                    </Button>
                                </Col>
                            </Row>
                        }
                        colors={ colorTheme.frame }
                    />
                    <CheckResultFeedback state = { state }/>
                </>}
            />
            {
                records === undefined &&
                <Spinner animation="border" />
            }
            {
                records !== undefined &&
                <>
                    <TokensRecordTable records={ records } record={ record }
                                       contributionMode={ props.contributionMode } />
                    <ButtonGroup
                        align="left"
                    >
                        <AddTokensRecordButton records={records}/>
                        { viewer === "LegalOfficer" && <IssuerSelectionButton/> }
                    </ButtonGroup>
                </>
            }
        </Frame>
    );
}

interface CheckResultProps {
    state: CheckResult,
}

function CheckResultFeedback(props: CheckResultProps) {
    const { state } = props;

    switch (state) {
        case "POSITIVE":
            return (
                <>
                    <Row className="CheckResultFeedback result-positive" id={ `feedback-${ state }` }>
                        <Col>
                            <p>
                                Check result: <span className="label-positive">positive</span><br />
                                The Tokens Record - defined by the ID you submitted - is part of the current Collection
                                LOC.
                            </p>
                        </Col>
                        <Col>
                            <Icon icon={ { id: "ok" } } height='45px' />
                        </Col>
                    </Row>
                </>
            )
        case "NEGATIVE":
            return (
                <Row className="CheckResultFeedback result-negative" id={ `feedback-${ state }` }>
                    <Col>
                        <p>
                            Check result: <span className="label-negative">negative</span><br />
                            The Tokens Record - defined by the ID you submitted - has no match and is NOT part of
                            the current<br />
                            Collection LOC. Please be careful and execute a deeper due diligence.
                        </p>
                    </Col>
                    <Col>
                        <Icon icon={ { id: "ko" } } height='45px' />
                    </Col>
                </Row>
            )
        case "NONE":
            return (
                <Row className="CheckResultFeedback result-none" children="" id={ `feedback-${ state }` } />
            )
    }
}


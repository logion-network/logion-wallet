import { LocData, PendingRequest } from "@logion/client";
import { useCallback, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Button from "src/common/Button";
import ButtonGroup from "src/common/ButtonGroup";
import Icon from "src/common/Icon";
import PolkadotFrame from "src/common/PolkadotFrame";
import ProcessStep from "../common/ProcessStep";
import LocRequestAcceptance from "src/legal-officer/transaction-protection/LocRequestAcceptance";
import { useLocContext } from "./LocContext";

import "./AcceptRejectLocRequest.css";
import LocRequestAcceptanceAndCreation from "src/legal-officer/transaction-protection/LocRequestAcceptanceAndCreation";

export interface Props {
    loc: LocData;
    noLocCreationPath: string;
}

export default function AcceptRejectLocRequest(props: Props) {
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<LocData | null>(null);
    const { mutateLocState } = useLocContext();
    const navigate = useNavigate();

    const clearRequestToAccept = useCallback((onlyAccepted: boolean) => {
        setRequestToAccept(null);
        if (onlyAccepted) {
            navigate(props.noLocCreationPath);
        }
    }, [ navigate, props.noLocCreationPath ]);

    const handleClose = () => setRequestToReject(null);

    const rejectAndCloseModal = async () => {
        await mutateLocState(async current => {
            if(current instanceof PendingRequest) {
                const newState = current.legalOfficer.reject(reason);
                navigate(props.noLocCreationPath);
                return newState;
            } else {
                return current;
            }
        });
    };

    const isAccept = useMemo(() =>
        props.loc.requesterAddress?.type === "Polkadot"
    , [ props.loc ]);

    const question = useMemo(() =>
        isAccept ?
        `Do you accept this request ?` :
        `Do you accept this request and create the related ${ props.loc.locType } LOC?`
    , [ isAccept, props.loc ]);

    const cannotAccept = useMemo(() => {
        return props.loc.metadata.find(item => item.status !== "REVIEW_ACCEPTED") !== undefined
            || props.loc.files.find(item => item.status !== "REVIEW_ACCEPTED") !== undefined
            || props.loc.links.find(item => item.status !== "REVIEW_ACCEPTED") !== undefined;
    }, [ props.loc ]);

    return (
        <PolkadotFrame
            className="AcceptRejectLocRequest"
        >
            <div className="text-action-container">
                <div className="question">{ question }</div>
                <div>
                    <ButtonGroup>
                        <Button
                            onClick={() => setRequestToReject(props.loc.id.toString())}
                            data-testid={`reject-${props.loc.id}`}
                            variant="none"
                        >
                            <Icon icon={{id: "ko"}} height='40px' />
                        </Button>
                        <Button
                            onClick={() => setRequestToAccept(props.loc)}
                            data-testid={`accept-${props.loc.id}`}
                            variant="none"
                            disabled={ cannotAccept }
                        >
                            <Icon icon={{id: "ok"}} height='40px' />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {
                requestToReject !== null &&
                <ProcessStep
                    active={ true }
                    title={`Reject LOC request`}
                    nextSteps={[
                        {
                            id: 'cancel',
                            buttonText: 'Cancel',
                            buttonVariant: 'secondary',
                            mayProceed: true,
                            callback: handleClose,
                        },
                        {
                            id: 'reject',
                            buttonText: 'Proceed',
                            buttonVariant: 'primary',
                            mayProceed: true,
                            callback: rejectAndCloseModal,
                        }
                    ]}
                >
                    <Form.Group>
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={e => setReason(e.target.value)}
                            value={reason}
                            data-testid="reason"
                        />
                    </Form.Group>
                </ProcessStep>
            }

            {
                isAccept &&
                <LocRequestAcceptance
                    requestToAccept={ requestToAccept }
                    clearRequestToAccept={ () => clearRequestToAccept(true) }
                />
            }
            {
                !isAccept &&
                <LocRequestAcceptanceAndCreation
                    requestToAccept={ requestToAccept }
                    clearRequestToAccept={ () => clearRequestToAccept(false) }
                />
            }
        </PolkadotFrame>
    );
}

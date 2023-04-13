import { LocData } from "@logion/client";
import { useCallback, useState } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import Button from "src/common/Button";
import ButtonGroup from "src/common/ButtonGroup";
import Icon from "src/common/Icon";
import PolkadotFrame from "src/common/PolkadotFrame";
import ProcessStep from "src/legal-officer/ProcessStep";
import LocRequestAcceptance from "src/legal-officer/transaction-protection/LocRequestAcceptance";
import { rejectLocRequest } from "src/loc/Model";
import { useLogionChain } from "src/logion-chain";
import { useLocContext } from "./LocContext";

import "./AcceptRejectLocRequest.css";

export interface Props {
    loc: LocData;
    rejectPath: string;
}

export default function AcceptRejectLocRequest(props: Props) {
    const { axiosFactory, accounts } = useLogionChain();
    const [ requestToReject, setRequestToReject ] = useState<string | null>(null);
    const [ reason, setReason ] = useState<string>("");
    const [ requestToAccept, setRequestToAccept ] = useState<LocData | null>(null);
    const { refresh: refreshLoc } = useLocContext();
    const navigate = useNavigate();

    const clearRequestToAccept = useCallback(() => {
        refreshLoc();
        setRequestToAccept(null);
    }, [ refreshLoc ]);

    if (axiosFactory === undefined) {
        return null;
    }

    const handleClose = () => setRequestToReject(null);

    const rejectAndCloseModal = async () => {
        await rejectLocRequest(axiosFactory(accounts!.current!.accountId.address)!, {
            requestId: requestToReject!,
            rejectReason: reason!,
        });
        await refreshLoc();
        navigate(props.rejectPath);
    };

    return (
        <PolkadotFrame
            className="AcceptRejectLocRequest"
        >
            <div className="text-action-container">
                <div className="question">
                    Do you accept this request and create the related { props.loc.locType } LOC?
                </div>
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

            <LocRequestAcceptance
                requestToAccept={ requestToAccept }
                clearRequestToAccept={ clearRequestToAccept }
            />
        </PolkadotFrame>
    );
}

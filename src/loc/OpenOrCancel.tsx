import { LocData } from "@logion/client";
import PolkadotFrame from "../common/PolkadotFrame";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useState, useCallback } from "react";
import "./OpenOrCancel.css";
import { useLocContext } from "./LocContext";
import ProcessStep from "../common/ProcessStep";
import { AcceptedRequest } from "@logion/client/dist/Loc";
import { useNavigate } from "react-router-dom";
import OpenLoc from "./OpenLoc";

export interface Props {
    loc: LocData;
    noLocCreationPath: string;
}

export default function OpenOrCancel(props: Props) {

    const [ requestToCancel, setRequestToCancel ] = useState<string | null>(null);
    const [ requestToOpen, setRequestToOpen ] = useState<LocData | null>(null);
    const { mutateLocState } = useLocContext();
    const navigate = useNavigate();

    const clearRequestToOpen = useCallback(() => {
        setRequestToOpen(null);
        navigate(props.noLocCreationPath);
    }, [ navigate, props.noLocCreationPath ]);

    const handleClose = () => setRequestToCancel(null);

    const cancelAndCloseModal = async () => {
        await mutateLocState(async current => {
            if (current instanceof AcceptedRequest) {
                // TODO uncomment when available
                // const newState = current.cancel();
                const newState = current;
                navigate(props.noLocCreationPath);
                return newState;
            } else {
                return current;
            }
        });
    };

    return (
        <PolkadotFrame className="OpenOrCancel">
            <div className="text-action-container">
                <div className="question">Do you want to create this LOC ?</div>
                <div>
                    <ButtonGroup>
                        <Button
                            onClick={ () => setRequestToCancel(props.loc.id.toString()) }
                            data-testid={ `reject-${ props.loc.id }` }
                            variant="none"
                        >
                            <Icon icon={ { id: "ko" } } height='40px' />
                        </Button>
                        <Button
                            onClick={ () => setRequestToOpen(props.loc) }
                            data-testid={ `accept-${ props.loc.id }` }
                            variant="none"
                        >
                            <Icon icon={ { id: "ok" } } height='40px' />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>

            {
                requestToCancel !== null &&
                <ProcessStep
                    active={ true }
                    title={ `Delete LOC request` }
                    nextSteps={ [
                        {
                            id: 'cancel',
                            buttonText: 'Cancel',
                            buttonVariant: 'secondary',
                            mayProceed: true,
                            callback: handleClose,
                        },
                        {
                            id: 'delete',
                            buttonText: 'Proceed',
                            buttonVariant: 'primary',
                            mayProceed: true,
                            callback: cancelAndCloseModal,
                        }
                    ] }
                >
                    <p>Are you sure you want to delete this LOC request ?</p>
                </ProcessStep>

            }
            <OpenLoc
                requestToOpen={ requestToOpen }
                clearRequestToOpen={ clearRequestToOpen }
            />
        </PolkadotFrame>
    )
}

import { LocData } from "@logion/client";
import PolkadotFrame from "../common/PolkadotFrame";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { useState, useCallback } from "react";
import "./OpenOrCancel.css";
import { useNavigate } from "react-router-dom";
import OpenLoc from "./OpenLoc";

export interface Props {
    loc: LocData;
    noLocCreationPath: string;
}

export default function OpenOrCancel(props: Props) {

    const [ requestToOpen, setRequestToOpen ] = useState<LocData | null>(null);
    const navigate = useNavigate();

    const clearRequestToOpen = useCallback(() => {
        setRequestToOpen(null);
        navigate(props.noLocCreationPath);
    }, [ navigate, props.noLocCreationPath ]);

    return (
        <PolkadotFrame className="OpenOrCancel">
            <div className="text-action-container">
                <div className="question">Do you want to create this LOC ?</div>
                <div>
                    <ButtonGroup>
                        <Button
                            onClick={ () => navigate(props.noLocCreationPath) }
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

            <OpenLoc
                requestToOpen={ requestToOpen }
                clearRequestToOpen={ clearRequestToOpen }
            />
        </PolkadotFrame>
    )
}

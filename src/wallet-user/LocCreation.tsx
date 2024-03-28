import { useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { requestLocPath } from "./UserRouter";
import Button from '../common/Button';
import { LocType } from "@logion/node-api";

export interface Props {
    onSelect?: () => void;
    renderButton?: (onClick: () => void) => React.ReactNode;
    locType: LocType;
}

export default function LocCreation(props: Props) {
    const { locType } = props;
    const navigate = useNavigate();

    const onSelect = useCallback(() => {
        if(props.onSelect) {
            props.onSelect();
        }
        navigate(requestLocPath(props.locType));
    }, [ props, navigate ]);

    const aProtection = locType === "Identity" ?
        `an Identity Protection` :
        `a ${ locType } Protection`;

    return (
        <>
            {
                props.renderButton === undefined &&
                <Button onClick={ onSelect }>Request { aProtection }</Button>
            }
            {
                props.renderButton !== undefined &&
                props.renderButton( onSelect )
            }
        </>
    );
}

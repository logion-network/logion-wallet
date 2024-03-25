import { useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { IDENTITY_REQUEST_PATH } from "./UserRouter";
import Button from '../common/Button';

export interface Props {
    onSelect?: () => void;
    renderButton?: (onClick: () => void) => React.ReactNode;
}

export default function IdentityLocCreation(props: Props) {
    const navigate = useNavigate();

    const onSelect = useCallback(() => {
        if(props.onSelect) {
            props.onSelect();
        }
        navigate(IDENTITY_REQUEST_PATH);
    }, [ props, navigate ]);

    return (
        <>
            {
                props.renderButton === undefined &&
                <Button onClick={ onSelect }>Request an Identity Protection</Button>
            }
            {
                props.renderButton !== undefined &&
                props.renderButton( onSelect )
            }
        </>
    );
}

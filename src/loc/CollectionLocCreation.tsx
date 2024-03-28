import { useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { COLLECTION_REQUEST_PATH } from "../wallet-user/UserRouter";
import Button from '../common/Button';

export interface Props {
    renderButton?: (onClick: () => void) => React.ReactNode;
}

export default function CollectionLocCreation(props: Props) {
    const navigate = useNavigate();

    const onSelect = useCallback(() => {
        navigate(COLLECTION_REQUEST_PATH);
    }, [ navigate ]);

    return (
        <>
            {
                props.renderButton === undefined &&
                <Button onClick={ onSelect }>Request a Collection Protection</Button>
            }
            {
                props.renderButton !== undefined &&
                props.renderButton( onSelect )
            }
        </>
    );
}

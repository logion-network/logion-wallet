import { useNavigate } from "react-router-dom";
import { IDENTITY_REQUEST_PATH } from "./UserRouter";
import Button from '../common/Button';

export interface Props {
    onSelect?: () => void;
    renderButton?: (onClick: () => void) => React.ReactNode;
}

export default function IdentityLocCreation(props: Props) {
    const navigate = useNavigate();

    return (
        <>
            {
                props.renderButton === undefined &&
                <Button onClick={ () => navigate(IDENTITY_REQUEST_PATH) }>Request an Identity Protection</Button>
            }
            {
                props.renderButton !== undefined &&
                props.renderButton( () => navigate(IDENTITY_REQUEST_PATH) )
            }
        </>
    );
}

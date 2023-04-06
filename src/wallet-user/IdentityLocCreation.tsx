import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { autoSelectTemplate } from 'src/loc/Template';
import LocTemplateChooser from 'src/loc/LocTemplateChooser';
import { IDENTITY_REQUEST_PATH } from "./UserRouter";
import Button from '../common/Button';

export interface Props {
    onSelect?: () => void;
    renderButton?: (onClick: () => void) => React.ReactNode;
}

export default function IdentityLocCreation(props: Props) {
    const [ requestLoc, setRequestLoc ] = useState(false);
    const navigate = useNavigate();
    const [ autoSelected, setAutoselected ] = useState(false);
    const [ selectedTemplateId, setSelectedTemplateId ] = useState<string | undefined>();

    const clear = useCallback(() => {
        setRequestLoc(false);
        setAutoselected(false);
        setSelectedTemplateId(autoSelectTemplate("Identity"));
    }, []);

    const onSelect = useCallback((templateId: string | undefined) => {
        if(props.onSelect) {
            props.onSelect();
        }
        if(templateId) {
            navigate(IDENTITY_REQUEST_PATH + "?templateId=" + templateId);
        } else {
            navigate(IDENTITY_REQUEST_PATH);
        }
    }, [ props, navigate ]);

    useEffect(() => {
        if(requestLoc && !autoSelected) {
            setAutoselected(true);
            const templateId = autoSelectTemplate("Identity");
            setSelectedTemplateId(templateId);
            if(templateId) {
                onSelect(templateId);
            }
        }
    }, [ requestLoc, autoSelected, onSelect ]);

    return (
        <>
            {
                props.renderButton === undefined &&
                <Button onClick={ () => setRequestLoc(true) }>Request an Identity Case</Button>
            }
            {
                props.renderButton !== undefined &&
                props.renderButton(() => setRequestLoc(true))
            }
            { requestLoc && selectedTemplateId === undefined &&
                <LocTemplateChooser
                    show={ requestLoc && selectedTemplateId === undefined }
                    locType={ "Identity" }
                    onCancel={ clear }
                    onSelect={ onSelect }
                    selected={ selectedTemplateId }
                />
            }
        </>
    );
}

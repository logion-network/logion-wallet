import { useCallback, useState } from 'react';
import { Form } from 'react-bootstrap';
import { getLegalOfficerCase, LocType, UUID } from '@logion/node-api';

import Alert from '../common/Alert';
import { BackgroundAndForegroundColors } from '../common/ColorTheme';
import FormGroup from '../common/FormGroup';

import { useLogionChain } from '../logion-chain';

export interface Props {
    colors: BackgroundAndForegroundColors;
    onChange: (locId: UUID) => void;
    expect: {
        closed: boolean,
        type: LocType,
        requester: string,
    };
}

export default function LocIdFormGroup(props: Props) {
    const { api } = useLogionChain();
    const [ locId, setLocId ] = useState<string>("");
    const [ invalidLocIdFeedback, setInvalidLocIdFeedback ] = useState<string | undefined>("Given string is not a valid LOC ID");

    const onChange = useCallback((locId: string) => {
        setLocId(locId);
        const uuid = UUID.fromAnyString(locId);
        if(uuid === undefined) {
            setInvalidLocIdFeedback("Given string is not a valid LOC ID");
        } else {
            getLegalOfficerCase({
                api: api!,
                locId: uuid
            })
            .then(loc => {
                if(loc === undefined) {
                    setInvalidLocIdFeedback("No LOC with given ID");
                } else if(loc.locType !== props.expect.type) {
                    setInvalidLocIdFeedback("Given LOC has not expected type");
                } else if(loc.closed !== props.expect.closed) {
                    setInvalidLocIdFeedback("Given LOC is not in expected state");
                } else if(loc.requesterAddress !== props.expect.requester) {
                    setInvalidLocIdFeedback("Given LOC has not expected requester");
                } else {
                    setInvalidLocIdFeedback(undefined);
                    props.onChange(uuid);
                }
            });
        }
    }, [ api, props ]);

    let label;
    if(props.expect.closed && props.expect.type === 'Transaction') {
        label = "Closed Transaction LOC ID";
    } else if(!props.expect.closed && props.expect.type === 'Transaction') {
        label = "Open Transaction LOC ID";
    } else if(props.expect.closed && props.expect.type === 'Identity') {
        label = "Closed Identity LOC ID";
    } else if(!props.expect.closed && props.expect.type === 'Identity') {
        label = "Open Identity LOC ID";
    } else {
        label = "??? Unsupported expect ???";
    }

    return (
        <>
            <Alert
                variant="info"
            >
                In order to accept the request, you need to link it to a closed Identity LOC having the
                protection requester as subject.
            </Alert>
            <FormGroup
                id="locId"
                label={ label }
                colors={ props.colors }
                control={ <Form.Control
                    type="text"
                    onChange={ e => onChange(e.target.value) }
                    value={ locId }
                    isInvalid={ invalidLocIdFeedback !== undefined }
                /> }
                feedback={ invalidLocIdFeedback }
            />
        </>
    );
}

import { OpenLocParams } from "@logion/client";
import { UUID, LocType } from "@logion/node-api";
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCommonContext } from '../common/CommonContext';
import Dialog from '../common/Dialog';
import LocCreationForm, { FormValues } from "./LocCreationForm";
import { isLogionIdentityLoc, LocRequestFragment } from "../common/types/ModelTypes";
import LocCreationSteps from "./LocCreationSteps";
import Alert from '../common/Alert';
import { autoSelectTemplate, backendTemplate } from "./Template";
import LocTemplateChooser from "./LocTemplateChooser";

export interface LinkTarget {
    id: UUID;
    description: string;
    locType: LocType;
}

export interface Props {
    show: boolean,
    exit: () => void,
    onSuccess: (newLocData: LinkTarget, nature?: string) => void,
    locRequest: LocRequestFragment;
    hasLinkNature: boolean;
    defaultDescription?: string;
}

export default function LocCreationDialog(props: Props) {
    const { colorTheme } = useCommonContext();
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            description: props.defaultDescription || ""
        }
    });
    const [ newLocRequest, setNewLocRequest ] = useState<OpenLocParams | null>(null);
    const [ linkNature, setLinkNature ] = useState<string | undefined>();
    const [ selectedTemplateId, setSelectedTemplateId ] = useState<string | undefined>();

    const submit = useCallback((formValues: FormValues) => {
        let userIdentity = props.locRequest.userIdentity;
        if(!userIdentity) {
            userIdentity = {
                firstName: formValues.firstName!,
                lastName: formValues.lastName!,
                email: formValues.email!,
                phoneNumber: formValues.phone!,
            }
        }
        (async function () {
            const locType = props.locRequest.locType === "Identity" ?
                "Identity" :
                "Transaction";
            const request: OpenLocParams = {
                requesterLocId: props.locRequest.requesterLocId || undefined,
                locType,
                description: formValues.description,
                userIdentity: userIdentity,
                template: backendTemplate(selectedTemplateId),
            }
            setNewLocRequest(request);
            if(props.hasLinkNature) {
                setLinkNature(formValues.linkNature);
            }
        })();
    }, [ props.locRequest, props.hasLinkNature, selectedTemplateId ]);

    const clear = useCallback(() => {
        reset();
        setNewLocRequest(null);
        setLinkNature(undefined);
        setSelectedTemplateId(autoSelectTemplate(props.locRequest.locType));
    }, [ reset, setNewLocRequest, setLinkNature, props.locRequest.locType ]);

    const onSuccess = useCallback(async (locId: UUID) => {
        if(newLocRequest) {
            props.onSuccess({
                ...newLocRequest,
                id: locId,
            }, linkNature);
            clear();
        }
    }, [ clear, props, newLocRequest, linkNature ]);

    const onCancel = useCallback(() => {
        clear();
        props.exit();
    }, [ clear, props ]);

    return (
        <>
            <LocTemplateChooser
                show={ props.show && selectedTemplateId === undefined }
                locType={ props.locRequest.locType }
                onCancel={ onCancel }
                onSelect={ value => setSelectedTemplateId(value) }
                selected={ selectedTemplateId }
            />
            <Dialog
                show={ props.show && selectedTemplateId !== undefined }
                contentVisible={ newLocRequest === null }
                size="lg"
                actions={ [
                    {
                        id: "cancel",
                        callback: () => {
                            clear();
                            props.exit();
                        },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary-polkadot',
                    },
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'polkadot',
                        type: 'submit',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <h3>Create a new {props.locRequest.requesterAddress !== undefined ? 'Polkadot' : 'Logion'} {props.locRequest.locType} LOC</h3>
                {
                    props.locRequest.locType === 'Identity' && !isLogionIdentityLoc(props.locRequest) &&
                    <Alert
                        variant="info"
                    >
                        Important: use this specific type of LOC to authenticate the identity of a given person.
                        This authentication must follow a proper due diligence using tools and processes defined by
                        and under the responsibility of the Logion Officer.
                    </Alert>
                }
                {
                    isLogionIdentityLoc(props.locRequest) &&
                    <Alert
                        variant="info"
                    >
                        A logion Identity LOC must be used when your client cannot have a Polkadot account to request your services. Once closed after a proper identity check, you are able to initiate legal services requests ON BEHALF of this Logion Identity LOC, representing - on the blockchain-, by extension, the client it refers.
                    </Alert>
                }
                { newLocRequest === null &&
                <LocCreationForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    hasLinkNature={ props.hasLinkNature }
                    showIdentityFields={ !props.locRequest.userIdentity }
                />
                }
                { newLocRequest !== null &&
                <LocCreationSteps
                    requestToCreate={ newLocRequest }
                    exit={ () => { clear() ; props.exit() } }
                    onSuccess={ onSuccess }
                />
                }
            </Dialog>
        </>
    );
}

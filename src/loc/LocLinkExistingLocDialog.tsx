import { UUID } from "@logion/node-api";
import { EditableRequest } from "@logion/client";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { useLogionChain } from "../logion-chain";
import Dialog from "../common/Dialog";
import LocLinkExistingForm, { FormValues } from "./LocLinkExistingForm";
import { useLocContext } from "./LocContext";

export interface Props {
    show: boolean;
    exit: () => void;
    text: string;
    nature?: string;
}

export default function LocLinkExistingDialog(props: Props) {
    const { api, client } = useLogionChain();
    const { mutateLocState, locItems } = useLocContext();
    const { control, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm<FormValues>({
        defaultValues: {
            locId: ""
        }
    });

    const submit = useCallback(async (formValues: FormValues) => {
        clearErrors()
        const locId = UUID.fromAnyString(formValues.locId);
        if (!locId) {
            setError("locId", { type: "value", message: "Invalid LOC ID" })
            return
        }
        const loc = await api!.queries.getLegalOfficerCase(locId);
        if (!loc) {
            setError("locId", { type: "value", message: "LOC not found on chain" })
            return
        }
        const alreadyLinked = locItems.find(item => item.type === 'Linked LOC' && item.linkData().linkedLoc.id.toString() === locId.toString())
        if (alreadyLinked) {
            setError("locId", { type: "value", message: "LOC already linked" })
            return
        }

        await mutateLocState(async current => {
            if(client && current instanceof EditableRequest) {
                // TODO: use current.addLink(...)
                return current.legalOfficer.addLink({
                    target: locId,
                    nature: props.nature ? props.nature : formValues.linkNature,
                });
            } else {
                return current;
            }
        });
        reset();
        props.exit();
    }, [ props, locItems, api, setError, clearErrors, reset, client, mutateLocState ])

    return (
        <>
            <Dialog
                show={ props.show }
                size={ "lg" }
                actions={ [
                    {
                        id: "cancel",
                        callback: () => {
                            reset();
                            props.exit();
                        },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    },
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <LocLinkExistingForm
                    control={ control }
                    errors={ errors }
                    nature={ props.nature }
                />
            </Dialog>
        </>
    )

}

import { UUID } from "@logion/node-api";
import { EditableRequest } from "@logion/client";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

import { useLogionChain } from "../logion-chain";
import Dialog from "../common/Dialog";
import LocLinkExistingForm, { FormValues } from "./LocLinkExistingForm";
import { useLocContext } from "./LocContext";
import { LinkData } from "./LocItem";

export interface Props {
    show: boolean;
    exit: () => void;
    text: string;
    nature?: string;
}

export default function LocLinkExistingDialog(props: Props) {
    const { client } = useLogionChain();
    const { mutateLocState, locItems, locState } = useLocContext();
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
        const loc = locState?.locsState().findByIdOrUndefined(locId);
        if (!loc) {
            setError("locId", { type: "value", message: "LOC not found" })
            return
        }
        const alreadyLinked = locItems.find(item => item.type === 'Linked LOC' && item.as<LinkData>().linkedLoc.id.toString() === locId.toString())
        if (alreadyLinked) {
            setError("locId", { type: "value", message: "LOC already linked" })
            return
        }

        await mutateLocState(async current => {
            if(client && current instanceof EditableRequest) {
                return current.addLink({
                    target: locId,
                    nature: props.nature ? props.nature : formValues.linkNature,
                });
            } else {
                return current;
            }
        });
        reset();
        props.exit();
    }, [ props, locItems, locState, setError, clearErrors, reset, client, mutateLocState ])

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

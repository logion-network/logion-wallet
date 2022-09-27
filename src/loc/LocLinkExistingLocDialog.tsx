import { useForm } from "react-hook-form";
import { UUID, getLegalOfficerCase } from "@logion/node-api";

import { useLogionChain } from "../logion-chain";
import Dialog from "../common/Dialog";
import LocLinkExistingForm, { FormValues } from "./LocLinkExistingForm";
import { useCallback } from "react";
import { useLocContext } from "./LocContext";

export interface Props {
    show: boolean,
    exit: () => void
}

export default function LocLinkExistingDialog(props: Props) {
    const { api, client } = useLogionChain();
    const { addLink, locItems } = useLocContext();
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
        const loc = await getLegalOfficerCase({ locId, api: api! })
        if (!loc) {
            setError("locId", { type: "value", message: "LOC not found on chain" })
            return
        }
        const alreadyLinked = locItems.find(item => item.type === 'Linked LOC' && item.target?.toString() === locId.toString())
        if (alreadyLinked) {
            setError("locId", { type: "value", message: "LOC already linked" })
            return
        }
        const locState = await (await client!.locsState()).findById({ locId });
        const locData = locState!.data();
        addLink!(locData, formValues.linkNature)
        reset();
        props.exit();
    }, [ props, addLink, locItems, api, setError, clearErrors, reset, client ])

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
                />
            </Dialog>
        </>
    )

}

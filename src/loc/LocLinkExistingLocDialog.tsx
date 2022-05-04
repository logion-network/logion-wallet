import { useForm } from "react-hook-form";
import { UUID } from "logion-api/dist/UUID";
import { getLegalOfficerCase } from "logion-api/dist/LogionLoc";

import { useLogionChain } from "../logion-chain";
import Dialog from "../common/Dialog";
import LocLinkExistingForm, { FormValues } from "./LocLinkExistingForm";
import { useCallback } from "react";
import { useLocContext } from "./LocContext";
import { fetchLocRequest } from "../common/Model";
import { useCommonContext } from "../common/CommonContext";

export interface Props {
    show: boolean,
    exit: () => void
}

export default function LocLinkExistingDialog(props: Props) {
    const { api } = useLogionChain();
    const { addLink, locItems } = useLocContext();
    const { axiosFactory } = useCommonContext();
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
        const locRequest = await fetchLocRequest(axiosFactory!(loc.owner)!, locId.toString())
        addLink!(locRequest, formValues.linkNature)
        reset();
        props.exit();
    }, [ props, addLink, locItems, api, setError, clearErrors, reset, axiosFactory ])

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

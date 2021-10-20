import Dialog from "../../common/Dialog";
import LocLinkExistingForm, { FormValues } from "./LocLinkExistingForm";
import { useForm } from "react-hook-form";
import { useCallback } from "react";
import { useLocContext } from "./LocContext";
import { UUID } from "../../logion-chain/UUID";
import { getLegalOfficerCase } from "../../logion-chain/LogionLoc";
import { useLogionChain } from "../../logion-chain";
import { fetchLocRequest } from "../../common/Model";
import { useCommonContext } from "../../common/CommonContext";

export interface Props {
    show: boolean,
    exit: () => void
}

export default function LocLinkExistingDialog(props: Props) {
    const { api } = useLogionChain();
    const { linkLoc } = useLocContext();
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
        } else {
            const loc = await getLegalOfficerCase({ locId, api: api! })
            if (!loc) {
                setError("locId", { type: "value", message: "LOC not found on chain" })
            } else {
                const locRequest = await fetchLocRequest(axiosFactory!(loc.owner)!, locId.toString())
                linkLoc!(locId, locRequest.description)
                reset();
                props.exit();
            }
        }
    }, [ props, linkLoc, api, setError, clearErrors, reset, axiosFactory ])

    return (
        <>
            <Dialog
                show={ props.show }
                size={ "lg" }
                actions={ [
                    {
                        id: "submit",
                        buttonText: 'Submit',
                        buttonVariant: 'primary',
                        type: 'submit',
                    },
                    {
                        id: "cancel",
                        callback: () => {
                            reset();
                            props.exit();
                        },
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
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

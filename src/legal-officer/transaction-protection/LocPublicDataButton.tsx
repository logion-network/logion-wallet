import Button from "../../common/Button";
import Dialog from "../../common/Dialog";
import LocPublicDataForm, { FormValues } from "./LocPublicDataForm";
import { useCommonContext } from "../../common/CommonContext";
import { useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import { useLocContext } from "./LocContext";
import Icon from "../../common/Icon";

export default function LocPublicDataButton() {

    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const { addMetadata } = useLocContext();

    const submit = useCallback((formValues: FormValues) => {
        addMetadata!(formValues.dataName, formValues.dataValue)
        setVisible(false)
    }, [ addMetadata ]);

    return (
        <>
            <Button onClick={ () => {
                reset();
                setVisible(true)
            } }><Icon icon={{id: "add"}} height="19px" /><span className="text">Add a public data</span></Button>
            <Dialog
                show={ visible }
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
                        callback: () => setVisible(false),
                        buttonText: 'Cancel',
                        buttonVariant: 'secondary',
                    }
                ] }
                onSubmit={ handleSubmit(submit) }
            >
                <LocPublicDataForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                />
            </Dialog>
        </>
    )
}

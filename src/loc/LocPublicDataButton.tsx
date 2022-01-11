import Button from "../common/Button";
import Dialog from "../common/Dialog";
import LocPublicDataForm, { FormValues } from "./LocPublicDataForm";
import { useCommonContext } from "../common/CommonContext";
import { useForm } from "react-hook-form";
import React, { useCallback, useState } from "react";
import { useLocContext } from "./LocContext";
import Icon from "../common/Icon";
import { LocItem } from "./types";

export default function LocPublicDataButton() {

    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const { addMetadata, locItems } = useLocContext();
    const [ existingItem, setExistingItem ] = useState<LocItem | undefined>(undefined);

    const submit = useCallback((formValues: FormValues) => {
        const existingItem = locItems.find(item => item.type === "Data" && item.name === formValues.dataName);
        if (existingItem) {
            setVisible(false)
            setExistingItem(existingItem)
        } else {
            addMetadata!(formValues.dataName, formValues.dataValue)
            setVisible(false)
        }
    }, [ addMetadata, locItems, setVisible ]);

    return (
        <>
            <Button onClick={ () => {
                reset();
                setVisible(true)
            } }><Icon icon={ { id: "add" } } height="19px" /><span className="text">Add a public data</span></Button>
            <Dialog
                show={ visible }
                size={ "lg" }
                actions={ [
                    {
                        id: "cancel",
                        callback: () => setVisible(false),
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
                <LocPublicDataForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                />
            </Dialog>
            <Dialog
                show={ existingItem !== undefined }
                size={ "lg" }
                actions={ [
                    {
                        id: "ok",
                        callback: () => setExistingItem(undefined),
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                    }
                ] }
            >
                <p>A data with name</p>
                <p>{ existingItem?.name }</p>
                <p>already exists in this LOC.</p>
            </Dialog>

        </>
    )
}

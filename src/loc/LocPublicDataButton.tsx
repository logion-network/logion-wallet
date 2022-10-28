import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Dialog from "../common/Dialog";
import LocPublicDataForm, { FormValues } from "./LocPublicDataForm";
import { useCommonContext } from "../common/CommonContext";
import Icon from "../common/Icon";
import { LocItem } from "./types";
import { useLocContext } from "./LocContext";
import { EditableRequest } from "@logion/client";

export function LocPublicDataButton() {
    const { mutateLocState, locItems } = useLocContext();
    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const [ existingItem, setExistingItem ] = useState<LocItem | undefined>(undefined);

    const submit = useCallback(async (formValues: FormValues) => {
        const existingItem = locItems.find(item => item.type === "Data" && item.name === formValues.dataName);
        if (existingItem) {
            setVisible(false)
            setExistingItem(existingItem)
        } else {
            await mutateLocState(async current => {
                if(current instanceof EditableRequest) {
                    return current.addMetadata({
                        name: formValues.dataName,
                        value: formValues.dataValue,
                    });
                } else {
                    return current;
                }
            })
            setVisible(false)
        }
    }, [ mutateLocState, locItems, setVisible ]);

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

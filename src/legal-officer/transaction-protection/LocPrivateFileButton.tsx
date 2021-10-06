import Button from "../../common/Button";
import React, { useState, useCallback } from "react";
import Dialog from "../../common/Dialog";
import LocPrivateFileForm, { FormValues } from "./LocPrivateFileForm";
import { useForm } from "react-hook-form";
import { useCommonContext } from "../../common/CommonContext";
import { useLocContext } from "./LocContext";
import { addFile as modelAddFile } from "../Model";

export default function LocPrivateFileButton() {

    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const [ file, setFile ] = useState<File | null>(null);
    const { axios } = useCommonContext()
    const { locId, addFile } = useLocContext();

    const submit = useCallback(async (formValues: FormValues) => {
        if (file) {
            const response = await modelAddFile(axios!, {
                file,
                locId: locId.toString(),
                fileName: formValues.fileName
            })
            addFile!(formValues.fileName, response.hash);
            setVisible(false)
        }
    }, [ axios, file, locId, addFile ])

    return (
        <>
            <Button onClick={ () => {
                reset()
                setVisible(true)
            } }>
                Add a confidential document
            </Button>
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
                <LocPrivateFileForm
                    control={ control }
                    errors={ errors }
                    colors={ colorTheme.dialog }
                    onFileSelected={ setFile }
                />
            </Dialog>
        </>
    )
}

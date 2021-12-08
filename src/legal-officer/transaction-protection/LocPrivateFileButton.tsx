import Button from "../../common/Button";
import React, { useState, useCallback } from "react";
import Dialog from "../../common/Dialog";
import LocPrivateFileForm, { FormValues } from "./LocPrivateFileForm";
import { useForm } from "react-hook-form";
import { useCommonContext } from "../../common/CommonContext";
import { sha256Hex } from "../../common/hash";
import { useLocContext } from "./LocContext";
import { addFile as modelAddFile } from "../Model";
import { LocItem } from "./types";
import Icon from "../../common/Icon";

export default function LocPrivateFileButton() {

    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const [ file, setFile ] = useState<File | null>(null);
    const { axiosFactory } = useCommonContext();
    const { loc, locId, addFile, locItems } = useLocContext();
    const [ existingItem, setExistingItem ] = useState<LocItem | null>(null);
    const [ duplicateHash, setDuplicateHash ] = useState<string | null>(null);

    const submit = useCallback(async (formValues: FormValues) => {
        if (file) {
            const hash = "0x" + await sha256Hex(file);
            const existingItem = locItems.find(item => item.type === "Document" && item.value === hash);
            if(existingItem !== undefined) {
                setVisible(false);
                setExistingItem(existingItem);
                setDuplicateHash(hash);
            } else {
                const response = await modelAddFile(axiosFactory!(loc!.owner)!, {
                    file,
                    locId: locId.toString(),
                    fileName: formValues.fileName,
                    nature: formValues.nature
                })
                addFile!(formValues.fileName, response.hash, formValues.nature);
                setVisible(false);
            }
        }
    }, [ axiosFactory, loc, file, locId, addFile, locItems, setExistingItem ])

    return (
        <>
            <Button onClick={ () => {
                reset()
                setVisible(true)
            } }>
                <Icon icon={{id: "add"}} height="19px" /><span className="text">Add a confidential document</span>
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
            <Dialog
                show={ duplicateHash !== null }
                size={ "lg" }
                actions={ [
                    {
                        id: "ok",
                        callback: () => setDuplicateHash(null),
                        buttonText: 'OK',
                        buttonVariant: 'primary',
                    }
                ] }
            >
                <p>A document with hash</p>
                <p>{duplicateHash}</p>
                <p>already exists in this LOC:</p>
                <p>{existingItem?.name}</p>
            </Dialog>
        </>
    )
}

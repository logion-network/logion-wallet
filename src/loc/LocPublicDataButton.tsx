import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import Button from "../common/Button";
import Dialog from "../common/Dialog";
import LocPublicDataForm, { FormValues } from "./LocPublicDataForm";
import { useCommonContext } from "../common/CommonContext";
import Icon from "../common/Icon";
import { MetadataItem, MetadataData } from "./LocItem";
import { useLocContext } from "./LocContext";
import { EditableRequest } from "@logion/client";
import { Hash } from "@logion/node-api";
import InlineHashString from "src/components/inlinehashstring/InlineHashString";

export interface Props {
    text: string;
    dataName?: string | null;
}

export function LocPublicDataButton(props: Props) {
    const { mutateLocState, locItems } = useLocContext();
    const { colorTheme } = useCommonContext();
    const [ visible, setVisible ] = useState(false);
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
    const [ existingItem, setExistingItem ] = useState<MetadataItem | undefined>(undefined);

    const submit = useCallback(async (formValues: FormValues) => {
        const nameHash = Hash.of(formValues.dataName);
        const existingItem = locItems.find(item => item.type === "Data" && item.as<MetadataData>().name.hash.equalTo(nameHash));
        if (existingItem) {
            setVisible(false)
            setExistingItem(existingItem as MetadataItem)
        } else {
            await mutateLocState(async current => {
                if(current instanceof EditableRequest) {
                    return current.addMetadata({
                        name: props.dataName ? props.dataName : formValues.dataName,
                        value: formValues.dataValue,
                    });
                } else {
                    return current;
                }
            })
            setVisible(false)
        }
    }, [ mutateLocState, locItems, setVisible, props.dataName ]);

    return (
        <>
            <Button onClick={ () => {
                reset();
                setVisible(true)
            } }><Icon icon={ { id: "add" } } height="19px" /><span className="text">{ props.text }</span></Button>
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
                    dataName={ props.dataName || undefined }
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
                <p>{ existingItem ? <InlineHashString value={existingItem.data().name}/> : "-" }</p>
                <p>already exists in this LOC.</p>
            </Dialog>

        </>
    )
}

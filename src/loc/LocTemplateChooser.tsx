import { LocType } from "@logion/node-api";
import { useEffect, useMemo, useState } from "react";
import Dialog from "src/common/Dialog";
import Select from "src/common/Select";
import { TEMPLATES } from "./Template";

export interface Props {
    locType: LocType;
    show: boolean;
    onCancel: () => void;
    onSelect: (templateId: string | undefined) => void;
    selected: string | undefined;
}

export default function LocTemplateChooser(props: Props) {
    const [ template, setTemplate ] = useState<string | null>(null);

    const selected = useMemo(() => props.selected, [ props.selected ]);

    useEffect(() => {
        if(props.selected !== selected) {
            setTemplate(props.selected || null);
        }
    }, [ props.selected, selected ]);

    return (
        <Dialog
            show={ props.show }
            size="lg"
            actions={[
                {
                    id: "cancel",
                    callback: props.onCancel,
                    buttonText: 'Cancel',
                    buttonVariant: 'secondary',
                },
                {
                    id: "submit",
                    buttonText: 'Submit',
                    buttonVariant: 'primary',
                    callback: () => props.onSelect(template || undefined),
                }
            ]}
        >
            <h3>Project type selection</h3>
            <Select
                options={TEMPLATES[props.locType].map(template => ({
                    label: template.name,
                    value: template.id,
                }))}
                value={template || null}
                onChange={value => setTemplate(value)}
                placeholder="Please select your project type"
            />
        </Dialog>
    );
}

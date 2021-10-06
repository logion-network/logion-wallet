import Button from "./Button";
import { ChangeEvent, useRef, useState } from "react";
import { Form } from "react-bootstrap";

export interface Props {
    onFileSelected: (file: File) => void
}

export default function FileSelectorButton(props: Props) {

    const [ fileName, setFileName ] = useState<string>("")
    const fileSelector = useRef<HTMLInputElement>(null)

    const handleSelection = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files === null) {
            return
        }
        const file: File = e.target.files[0]
        setFileName(file.name)
        e.target.value = ''
        props.onFileSelected(file);
    }

    return (
        <div>
            <Form.Control value={ fileName } readOnly />
            <Button onClick={ () => fileSelector.current?.click() }>
                Upload
            </Button>
            <Form.File.Input
                ref={ fileSelector }
                onChange={ handleSelection }
                style={ { display: 'none' } }
            />
        </div>
    )
}

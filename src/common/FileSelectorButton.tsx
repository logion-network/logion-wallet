import Button from "./Button";
import { ChangeEvent, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { Children } from "./types/Helpers";

import './FileSelectorButton.css';

export interface Props {
    onFileSelected: (file: File) => void;
    disabled?: boolean;
    buttonText?: Children;
    onlyButton?: boolean;
    accept?: string;
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

    let className = "FileSelectorButton";
    if(props.onlyButton) {
        className = className + " only-button";
    }

    return (
        <div className={ className }>
            <Form.Control value={ fileName } readOnly />
            <Button onClick={ () => fileSelector.current?.click() } disabled={ props.disabled }>
                { props.buttonText ? props.buttonText : "Upload"}
            </Button>
            <Form.Control
                type="file"
                ref={ fileSelector }
                onChange={ handleSelection }
                style={ { display: 'none' } }
                disabled={ props.disabled }
                data-testid="FileSelectorButtonHiddenInput"
                accept={ props.accept }
            />
        </div>
    )
}

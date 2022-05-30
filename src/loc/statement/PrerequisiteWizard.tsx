import { Language, Prerequisite } from "./SofParams";
import { useState, useCallback, useEffect } from "react";
import Dialog from "../../common/Dialog";
import FormGroup from "../../common/FormGroup";
import Form from "react-bootstrap/Form";
import { useCommonContext } from "../../common/CommonContext";
import FileSelectorButton from "../../common/FileSelectorButton";
import { WizardStep } from "./WizardSteps";

import './PrerequisiteWizard.css';

export interface Props {
    show: boolean,
    language: Language,
    steps: WizardStep[],
    onDone: (prerequisites: Prerequisite[]) => void,
    onCancel: () => void,
}

function buildPrerequisite(step: WizardStep, language: Language): Prerequisite {
    const text = step.text ? step.text[language] : "";
    return {
        label: step.label[language],
        text,
        imageSrc: "",
    }
}

export function PrerequisiteWizard(props: Props) {

    const { show, steps, onDone, onCancel } = props;
    const [ currentStep, setCurrentStep ] = useState<number>(1);
    const [ prerequisites, setPrerequisites ] = useState<Prerequisite[]>([])
    const [ language, setLanguage ] = useState<Language>();

    const clear = useCallback((language?: Language) => {
        setPrerequisites(steps.map(step => buildPrerequisite(step, language || 'en')));
        setCurrentStep(1);
    }, [ steps, setPrerequisites, setCurrentStep ])

    useEffect(() => {
        if (props.language && props.language !== language) {
            setLanguage(props.language);
            clear(props.language)
        }
    }, [ props.language, language, setLanguage, clear ])

    const cancelCallback = useCallback(() => {
        clear(language);
        onCancel();
    }, [ clear, onCancel, language ])

    const updateStep = useCallback((updaterFn: (_: Prerequisite) => void) => {
        const current = prerequisites.concat();
        updaterFn(current[currentStep - 1]);
        setPrerequisites(current);
    }, [ currentStep, prerequisites, setPrerequisites ])

    const previous = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }, [ currentStep, setCurrentStep ])

    const next = useCallback(() => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1)
        } else {
            const data = prerequisites.concat()
            onDone(data);
        }
    }, [ currentStep, setCurrentStep, steps, prerequisites, onDone ])

    const fileSelectedCallback = useCallback((file: File) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', () => {
            const base64ImageUrl = reader.result;
            if (base64ImageUrl) {
                updateStep(step => step.imageSrc = base64ImageUrl as string)
            }
        })
        reader.readAsDataURL(file)
    }, [ updateStep ])

    const textChangedCallback = useCallback((text: string) => {
        updateStep(step => step.text = text)
    }, [ updateStep ])

    return (
        <Dialog
            className="PrerequisiteWizard"
            show={ show }
            size={ "lg" }
            actions={ [
                {
                    id: "cancel",
                    callback: cancelCallback,
                    buttonText: 'Cancel',
                    buttonVariant: 'secondary',
                },
                {
                    id: "previous",
                    callback: previous,
                    buttonText: 'Previous',
                    buttonVariant: 'primary',
                    disabled: currentStep <= 1,
                },
                {
                    id: "next",
                    callback: next,
                    buttonText: 'Next',
                    buttonVariant: 'primary',
                },
            ] }
        >
            <div>
                <h3>Statement of Facts generator - Pre-requisites - step { currentStep } of { steps.length }</h3>
                <WizardStepForm
                    step={ steps[currentStep - 1] }
                    value={ prerequisites[currentStep - 1] }
                    onTextChange={ textChangedCallback }
                    onFileSelected={ fileSelectedCallback }
                />
            </div>
        </Dialog>
    )
}

interface StepProps {
    step: WizardStep,
    value: Prerequisite,
    onFileSelected: (file: File) => void,
    onTextChange: (text: string) => void,
}

function WizardStepForm(props: StepProps) {

    const { step, value, onTextChange, onFileSelected } = props
    const { colorTheme } = useCommonContext();

    return (

        <>
            { step.wizardIntroduction }

            { step.text !== undefined &&
                <FormGroup
                    id="text"
                    control={
                        <Form.Control
                            as="textarea"
                            aria-describedby="text"
                            style={ { height: '160px' } }
                            value={ value.text }
                            onChange={ e => onTextChange(e.target.value) }
                        />
                    }
                    colors={ colorTheme.dialog }
                />
            }

            { step.addImage &&

                <>
                    { value.imageSrc.length > 1 &&
                        <img src={ value.imageSrc } alt="Snapshot preview" style={ { maxHeight: "200px" } } />
                    }

                    <FormGroup
                        id="imageSrc"
                        control={
                            <FileSelectorButton
                                accept="image/*"
                                buttonText="Choose an image"
                                onFileSelected={ onFileSelected }
                                onlyButton
                            />
                        }
                        colors={ colorTheme.dialog }
                    />
                </>
            }

            <p>This element will appear in the Statement of Facts under the section<br />«{ value.label }»</p>
        </>
    )
}

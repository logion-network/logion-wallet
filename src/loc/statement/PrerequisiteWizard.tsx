import { Language, Prerequisite } from "./SofParams";
import { useState, useCallback, useEffect } from "react";
import Dialog from "../../common/Dialog";
import { Control, Controller, useForm } from "react-hook-form";
import FormGroup from "../../common/FormGroup";
import Form from "react-bootstrap/Form";
import { useCommonContext } from "../../common/CommonContext";
import FileSelectorButton from "../../common/FileSelectorButton";
import { WizardStep } from "./WizardSteps";

export interface Props {
    show: boolean,
    language: Language,
    steps: WizardStep[],
    onDone: (prerequisites: Prerequisite[]) => void,
    onCancel: () => void,
}

interface FormValues {
    text: string,
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
    const { control, handleSubmit, reset } = useForm<FormValues>()
    const [ prerequisites, setPrerequisites ] = useState<Prerequisite[]>([])
    const [ language, setLanguage ] = useState<Language>();

    const clear = useCallback((language?: Language) => {
        reset();
        setPrerequisites(steps.map(step => buildPrerequisite(step, language || 'en')));
        setCurrentStep(1);
    }, [ reset, steps ])

    useEffect(() => {
        if (props.language && props.language !== language) {
            setLanguage(props.language);
            clear(props.language)
        }
    }, [ props.language, language, clear ])

    const cancelCallback = useCallback(() => {
        clear(language);
        onCancel();
    }, [ clear, onCancel, language ])

    const updateStep = useCallback((updaterFn: (_: Prerequisite) => void) => {
        const current = prerequisites.concat();
        updaterFn(current[currentStep - 1]);
        setPrerequisites(current);
    }, [ currentStep, prerequisites ])

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
            clear(language);
            onDone(data);
        }
    }, [ currentStep, setCurrentStep, steps, prerequisites, onDone, clear, language ])

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

    const submit = useCallback((formValues: FormValues) => {
        updateStep(step => step.text = formValues.text || "")
        reset()
        next();
    }, [ updateStep, reset, next ])

    return (
        <Dialog
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
                    buttonText: 'Next',
                    buttonVariant: 'primary',
                    type: 'submit',
                },
            ] }
            onSubmit={ handleSubmit(submit) }
        >
            <div>
                <h3>Statement of Facts generator - Pre-requisites - step { currentStep } of { steps.length }</h3>
                <WizardStepForm
                    step={ steps[currentStep - 1] }
                    value={ prerequisites[currentStep - 1] }
                    control={ control }
                    onFileSelected={ fileSelectedCallback }
                />
            </div>
        </Dialog>
    )
}

interface StepProps {
    step: WizardStep,
    value: Prerequisite,
    control: Control<FormValues>,
    onFileSelected: (file: File) => void,
}

function WizardStepForm(props: StepProps) {

    const { control, step, value } = props
    const { colorTheme } = useCommonContext();

    return (

        <>
            { step.wizardIntroduction }

            { step.text !== undefined &&
                <FormGroup
                    id="text"
                    control={
                        <Controller
                            name="text"
                            control={ control }
                            render={ ({ field }) => (
                                <Form.Control
                                    as="textarea"
                                    aria-describedby="text"
                                    style={ { height: '80px' } }
                                    defaultValue={ value.text }
                                    { ...field }
                                />
                            ) }
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
                                onFileSelected={ props.onFileSelected }
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

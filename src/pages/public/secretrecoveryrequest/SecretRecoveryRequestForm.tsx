import { UUID } from "@logion/node-api";
import { useCallback } from "react";
import { Form } from "react-bootstrap";
import { Control, Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import Button from "src/common/Button";
import { BackgroundAndForegroundColors } from "src/common/ColorTheme";
import FormGroup from "src/common/FormGroup";
import { useLogionChain } from "src/logion-chain";

export interface FormValues {
    locId: string;
    secretName: string;
    challenge: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    setValue: UseFormSetValue<FormValues>;
}

export default function SecretRecoveryRequestForm(props: Props) {
    const { control, errors, colors, setValue } = props;
    const { client } = useLogionChain();

    const validateLocId = useCallback(async (locIdString: string) => {
        const locId = UUID.fromAnyString(locIdString);
        if(locId === undefined) {
            return "Invalid LOC ID";
        }
        if(client) {
            const loc = await client?.public.findLocById({ locId });
            if(loc === undefined) {
                return "LOC not found";
            }
            if(loc.data.locType !== "Identity") {
                return "LOC is not an Identity LOC";
            }
            if(loc.data.status !== "CLOSED") {
                return "LOC is not closed";
            }
        }
    }, [ client ]);

    return (
        <div className="SecretRecoveryRequestForm">
            <FormGroup
                id="locId"
                label="Identity LOC ID"
                control={
                    <Controller
                        name="locId"
                        control={ control }
                        defaultValue=""
                        rules={ { validate: validateLocId } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.locId?.message }
                                type="text"
                                { ...field }
                            />
                        ) }
                    />
                }
                feedback={ errors.locId?.message }
                colors={ colors }
            />
            <FormGroup
                id="secretName"
                label="Secret name"
                control={
                    <Controller
                        name="secretName"
                        control={ control }
                        defaultValue=""
                        rules={ { required: "Secret name is required" } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.secretName?.message }
                                type="text"
                                { ...field }
                            />
                        ) }
                    />
                }
                feedback={ errors.secretName?.message }
                colors={ colors }
            />
            <FormGroup
                id="challenge"
                label="Challenge"
                control={
                    <Controller
                        name="challenge"
                        control={ control }
                        defaultValue=""
                        rules={ { required: "A challenge is required" } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.challenge?.message }
                                type="text"
                                { ...field }
                            />
                        ) }
                    />
                }
                feedback={ errors.challenge?.message }
                colors={ colors }
            />

            <p>The challenge is a random value that is attached to your request. <strong>You will have to provide it again
                upon actual secret retrieval. Make sure to keep it in a safe place until the procedure is over.</strong></p>

            <Button onClick={ () => setValue("challenge", window.crypto.randomUUID()) }>Generate random challenge</Button>
        </div>
    );
}

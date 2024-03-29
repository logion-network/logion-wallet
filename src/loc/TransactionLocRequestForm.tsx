import { Controller, useForm } from 'react-hook-form';
import Form from "react-bootstrap/Form";
import { Lgnt, Numbers } from "@logion/node-api";
import FormGroup from '../common/FormGroup';
import AmountControl, { Amount, validateAmount } from 'src/common/AmountControl';
import CollapsePane from 'src/components/collapsepane/CollapsePane';
import { BackgroundAndForegroundColors } from "../common/ColorTheme";
import { useCallback } from "react";
import { DraftRequest, LocsState } from "@logion/client";
import { useUserContext } from "../wallet-user/UserContext";
import ButtonGroup from "../common/ButtonGroup";
import Button from "../common/Button";
import { locDetailsPath } from "../wallet-user/UserPaths";
import { useNavigate } from "react-router";

export interface FormValues {
    description: string;
    legalFee: Amount | undefined;
}

export interface Props {
    colors: BackgroundAndForegroundColors;
    legalOfficer: string | undefined;
}

export default function TransactionLocRequestForm(props: Props) {
    const { mutateLocsState } = useUserContext();
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            description: "",
            legalFee: undefined,
        }
    });

    const submit = useCallback(async (formValues: FormValues) => {

        let draftRequest: DraftRequest;
        await mutateLocsState(async (locsState: LocsState) => {
            draftRequest = await locsState!.requestTransactionLoc({
                legalOfficerAddress: props.legalOfficer!,
                description: formValues.description,
                draft: true,
                template: undefined,
                legalFee: formValues.legalFee ? Lgnt.fromPrefixedNumber(new Numbers.PrefixedNumber(formValues.legalFee.value, formValues.legalFee.unit)) : undefined,
            }) as DraftRequest;
            return draftRequest.locsState();
        })
        navigate(locDetailsPath(draftRequest!.data().id, "Transaction"));

    }, [ mutateLocsState, props.legalOfficer, navigate ]);

    return (
        <>
            <FormGroup
                id="locDescription"
                label="Description"
                control={
                    <Controller
                        name="description"
                        control={ control }
                        defaultValue=""
                        rules={ {
                            required: 'The description is required',
                            minLength: {
                                value: 3,
                                message: 'The description must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The description must contain at most 40 characters'
                            }
                        } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.description?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="description"
                                aria-describedby="locDescription"
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ props.colors }
                feedback={ errors.description?.message }
            />

            <CollapsePane
                title="Advanced creation parameters"
            >
                <FormGroup
                    id="legalFee"
                    label="Legal fee"
                    control={
                        <Controller
                            name="legalFee"
                            control={ control }
                            rules={ {
                                validate: validateAmount
                            } }
                            render={ ({ field }) => (
                                <AmountControl
                                    isInvalid={ !!errors.legalFee?.message }
                                    value={ field.value }
                                    onChange={ field.onChange }
                                    placeholder="A custom legal fee"
                                />
                            ) }
                        />
                    }
                    feedback={ errors.legalFee?.message }
                    colors={ props.colors }
                    help={
                        `If you leave the field empty, the default legal fee (2000 ${ Lgnt.CODE }) is charged on LOC opening.
    If you negotiated another rate with the selected Legal Officer, you may enter it here.`
                    }
                />
            </CollapsePane>

            <ButtonGroup>
                <Button disabled={ props.legalOfficer === undefined } type="submit"
                        onClick={ handleSubmit(submit) }>Create Draft</Button>
            </ButtonGroup>

        </>
    )
}

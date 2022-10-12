import { Controller, Control, FieldErrors } from 'react-hook-form';
import Form from "react-bootstrap/Form";

import { BackgroundAndForegroundColors } from '../../common/ColorTheme';
import FormGroup from '../../common/FormGroup';
import Select from '../../common/Select';

import { buildOptions } from '../trust-protection/SelectLegalOfficer';
import { useUserContext } from "../UserContext";

export interface FormValues {
    description: string;
    legalOfficer: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
    legalOfficer: string | null;
}

export default function LocCreationForm(props: Props) {
    const { locsState } = useUserContext();

    if(locsState === undefined) {
        return null;
    }

    return (
        <>
            <FormGroup
                id="locDescription"
                label="Description"
                control={
                    <Controller
                        name="description"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'The description is required',
                            minLength: {
                                value: 3,
                                message: 'The description must contain at least 3 characters'
                            },
                            maxLength: {
                                value: 40,
                                message: 'The description must contain at most 40 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.description?.message}
                                type="text" placeholder="e.g. XYZ"
                                data-testid="description"
                                aria-describedby="locDescription"
                                { ...field }
                            />
                        )}
                      />
                }
                colors={ props.colors }
                feedback={ props.errors.description?.message }
            />

            <FormGroup
                id={ `locOwner` }
                label="Please select a Logion Legal Officer who already executed an Identity LOC linked to your Polkadot address:"
                control={
                    <Controller
                        name="legalOfficer"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            required: 'You must select a Legal Officer',
                            minLength: {
                                value: 1,
                                message: 'You must select a Legal Officer'
                            },
                            
                        }}
                        render={({ field }) => (
                            <Select
                                isInvalid={ !!props.errors.legalOfficer?.message }
                                options={ buildOptions(locsState?.legalOfficersWithValidIdentityLoc) }
                                value={ field.value }
                                onChange={ field.onChange }
                            />
                        )}
                      />
                }
                feedback={ props.errors.legalOfficer?.message }
                colors={ props.colors }
            />
        </>
    )
}

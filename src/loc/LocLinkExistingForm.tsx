import FormGroup from "../common/FormGroup";
import { Controller, Control, FieldErrors } from "react-hook-form";
import Form from "react-bootstrap/Form";
import { useCommonContext } from "../common/CommonContext";

export interface FormValues {
    locId: string;
    linkNature: string;
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
}

export default function LocLinkExistingForm(props: Props) {
    const { colorTheme } = useCommonContext();

    return (
        <>
            <h3>Link this LOC to an existing LOC</h3>
            <p>Important: after publication, these data will be publicly available on the blockchain.</p>
            <FormGroup
                id="locLinkExistingLoc"
                label="Please set the LOC ID you would like to link with this LOC:"
                control={
                    <Controller
                        name="locId"
                        control={ props.control }
                        rules={ {
                            required: 'The LOC ID is required',
                            maxLength: {
                                value: 39,
                                message: 'The LOC ID has at most 39 digits'
                            }
                        } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!props.errors.locId?.message }
                                type="string" placeholder="e.g. 68489425225845052414260252647469422777 / 3386955f-b527-4bd7-a362-9f43ed7d18b9"
                                data-testid="locId"
                                aria-describedby="locId"
                                { ...field }
                            />
                        ) }
                    />
                }
                colors={ colorTheme.dialog }
                feedback={ props.errors.locId?.message }
            />
            <FormGroup
                id="linkNature"
                label="Link Public Description"
                control={
                    <Controller
                        name="linkNature"
                        control={ props.control }
                        defaultValue=""
                        rules={{
                            maxLength: {
                                value: 255,
                                message: 'The description must contain at most 255 characters'
                            }
                        }}
                        render={({ field }) => (
                            <Form.Control
                                isInvalid={!!props.errors.linkNature?.message}
                                type="text" placeholder="e.g. XYZ"
                                aria-describedby="linkNature"
                                { ...field }
                            />
                        )}
                      />
                }
                colors={ colorTheme.dialog }
                feedback={ props.errors.linkNature?.message }
            />
        </>
    )
}

import Form from "react-bootstrap/Form";
import { Row, Col } from "react-bootstrap";
import FormGroup from "../../common/FormGroup";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { BackgroundAndForegroundColors } from "../../common/ColorTheme";

export interface FormValues {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    line1: string,
    line2: string,
    postalCode: string,
    city: string,
    country: string,
}

export interface Props {
    control: Control<FormValues>;
    errors: FieldErrors<FormValues>;
    colors: BackgroundAndForegroundColors;
}

export default function IdentityForm(props: Props) {

    const { control, errors, colors } = props;

    return (
        <>
            <Row>
                <Col md={ 6 }>
                    <FormGroup
                        id="firstName"
                        label="First Name"
                        control={
                            <Controller
                                name="firstName"
                                control={ control }
                                defaultValue=""
                                rules={ { required: 'The first name is required' } }
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.firstName?.message }
                                        type="text" placeholder="e.g. XYZ"
                                        data-testid="firstName" { ...field }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.firstName?.message }
                        colors={ colors }
                    />
                </Col>
                <Col md={ 6 }>
                    <FormGroup
                        id="lastName"
                        label="Last Name"
                        control={
                            <Controller
                                name="lastName"
                                control={ control }
                                defaultValue=""
                                rules={ { required: 'The last name is required' } }
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.lastName?.message }
                                        type="text" placeholder="e.g. XYZ"
                                        data-testid="lastName" { ...field }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.lastName?.message }
                        colors={ colors }
                    />
                </Col>
            </Row>

            <Row>
                <Col md={ 6 }>
                    <FormGroup
                        id="email"
                        label="Email"
                        control={
                            <Controller
                                name="email"
                                control={ control }
                                defaultValue=""
                                rules={ { required: 'The email is required' } }
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.email?.message }
                                        type="text" placeholder="e.g. XYZ"
                                        data-testid="email" { ...field }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.email?.message }
                        colors={ colors }
                    />
                </Col>
                <Col md={ 6 }>
                    <FormGroup
                        id="phoneNumber"
                        label="Phone Number"
                        control={
                            <Controller
                                name="phoneNumber"
                                control={ control }
                                defaultValue=""
                                rules={ { required: 'The phone number is required' } }
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.phoneNumber?.message }
                                        type="text" placeholder="e.g. XYZ"
                                        data-testid="phoneNumber" { ...field }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.phoneNumber?.message }
                        colors={ colors }
                    />
                </Col>
            </Row>

            <FormGroup
                id="line1"
                label="Line1"
                control={
                    <Controller
                        name="line1"
                        control={ control }
                        defaultValue=""
                        rules={ { required: 'The line1 is required' } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.line1?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="line1" { ...field }
                            />
                        ) }
                    />
                }
                feedback={ errors.line1?.message }
                colors={ colors }
            />
            <FormGroup
                id="line2"
                label="Line2"
                control={
                    <Controller
                        name="line2"
                        control={ control }
                        defaultValue=""
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.line2?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="line2" { ...field }
                            />
                        ) }
                    />
                }
                feedback={ errors.line2?.message }
                colors={ colors }
            />

            <Row>
                <Col md={ 4 }>
                    <FormGroup
                        id="postalCode"
                        label="Postal Code"
                        control={
                            <Controller
                                name="postalCode"
                                control={ control }
                                defaultValue=""
                                rules={ { required: 'The postal code is required' } }
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.postalCode?.message }
                                        type="text" placeholder="e.g. XYZ"
                                        data-testid="postalCode" { ...field }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.postalCode?.message }
                        colors={ colors }
                    />
                </Col>
                <Col md={ 8 }>
                    <FormGroup
                        id="city"
                        label="City"
                        control={
                            <Controller
                                name="city"
                                control={ control }
                                defaultValue=""
                                rules={ { required: 'The city is required' } }
                                render={ ({ field }) => (
                                    <Form.Control
                                        isInvalid={ !!errors.city?.message }
                                        type="text" placeholder="e.g. XYZ"
                                        data-testid="city" { ...field }
                                    />
                                ) }
                            />
                        }
                        feedback={ errors.city?.message }
                        colors={ colors }
                    />
                </Col>
            </Row>
            <FormGroup
                id="country"
                label="Country"
                control={
                    <Controller
                        name="country"
                        control={ control }
                        defaultValue=""
                        rules={ { required: 'The country is required' } }
                        render={ ({ field }) => (
                            <Form.Control
                                isInvalid={ !!errors.city?.message }
                                type="text" placeholder="e.g. XYZ"
                                data-testid="country" { ...field }
                            />
                        ) }
                    />
                }
                feedback={ errors.country?.message }
                colors={ colors }
            />
        </>
    )
}

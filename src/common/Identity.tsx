import { Row, Col } from "react-bootstrap";
import { UserIdentity as IdentityType } from "@logion/client";

import { BackgroundAndForegroundColors } from "./ColorTheme";
import ComparableField from "./ComparableField";

import "./Identity.css";

export interface Props {
    identity?: IdentityType
    otherIdentity?: IdentityType
    colors: BackgroundAndForegroundColors
    squeeze: boolean
    noComparison: boolean
}

export default function Identity(props: Props) {

    interface FieldProps {
        id: string
        label: string
        field: (identity: IdentityType) => string
        noComparison: boolean
    }

    function ComparableIdentityField(fieldProps: FieldProps) {
        return (
            <ComparableField
                id={ fieldProps.id }
                label={ fieldProps.label }
                data={ props.identity }
                otherData={ props.otherIdentity }
                field={ fieldProps.field }
                colors={ props.colors }
                squeeze={ props.squeeze }
                noComparison={ props.noComparison }
            />
        );
    }

    return (
        <div className="Identity">
            <Row>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="firstName"
                        label="First Name"
                        field={ identity => identity.firstName }
                        noComparison={ props.noComparison }
                    />
                </Col>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="lastName"
                        label="Last Name"
                        field={ identity => identity.lastName }
                        noComparison={ props.noComparison }
                    />
                </Col>
            </Row>
            <Row>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="email"
                        label="Email"
                        field={ identity => identity.email }
                        noComparison={ props.noComparison }
                    />
                </Col>
                <Col className="IdentityCol" md={ 6 }>
                    <ComparableIdentityField
                        id="phoneNumber"
                        label="Phone Number"
                        field={ identity => identity.phoneNumber }
                        noComparison={ props.noComparison }
                    />
                </Col>
            </Row>
        </div>
    );
}

import { Row, Col } from "react-bootstrap";
import { PostalAddress as PostalAddressType } from "@logion/client";

import { BackgroundAndForegroundColors } from "./ColorTheme";
import ComparableField from "./ComparableField";
import "./PostalAddress.css";

export interface Props {
    postalAddress?: PostalAddressType
    otherPostalAddress?: PostalAddressType
    colors: BackgroundAndForegroundColors
    squeeze: boolean
    noComparison: boolean
}

export default function PostalAddress(props: Props) {

    interface FieldProps {
        id: string
        label: string
        field: (postalAddress: PostalAddressType) => string
        noComparison: boolean
    }

    function ComparablePostalAddressField(fieldProps: FieldProps) {

        return (
            <ComparableField
                id={ fieldProps.id }
                label={ fieldProps.label }
                data={ props.postalAddress }
                otherData={ props.otherPostalAddress }
                field={ fieldProps.field }
                colors={ props.colors }
                squeeze={ props.squeeze }
                noComparison={ props.noComparison }
            />
        );
    }

    return (
        <div className="PostalAddress">
            <h3>Address</h3>
            <Row>
                <Col className="PostalAddressCol" md={ 12 }>
                    <ComparablePostalAddressField
                        id="line1"
                        label="Line1"
                        field={ address => address.line1 }
                        noComparison={ props.noComparison }
                    />
                </Col>
            </Row>
            <Row>
                <Col className="PostalAddressCol" md={ 12 }>
                    <ComparablePostalAddressField
                        id="line2"
                        label="Line2"
                        field={ address => address.line2 }
                        noComparison={ props.noComparison }
                    />
                </Col>
            </Row>
            <Row>
                <Col className="PostalAddressCol" md={ 4 }>
                    <ComparablePostalAddressField
                        id="postalCode"
                        label="Postal Code"
                        field={ address => address.postalCode }
                        noComparison={ props.noComparison }
                    />
                </Col>
                <Col className="PostalAddressCol" md={ 8 }>
                    <ComparablePostalAddressField
                        id="city"
                        label="City"
                        field={ address => address.city }
                        noComparison={ props.noComparison }
                    />
                </Col>
            </Row>
            <Row>
                <Col className="PostalAddressCol" md={ 12 }>
                    <ComparablePostalAddressField
                        id="country"
                        label="Country"
                        field={ address => address.country }
                        noComparison={ props.noComparison }
                    />
                </Col>
            </Row>
        </div>
    )
}

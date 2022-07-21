import { useCallback, useState } from "react";
import { Col, Row, Spinner } from "react-bootstrap";

import Alert from "../common/Alert";
import Button from "../common/Button";
import { useLogionChain } from "../logion-chain";

export default function KiltData() {
    const { accounts, kilt } = useLogionChain();
    const [ creatingCType, setCreatingCType ] = useState(false);
    const [ error, setError ] = useState("");

    const createCType = useCallback(async () => {
        setCreatingCType(true);
        setError("");
        try {
            await kilt!.createCType();
        } catch(e: any) {
            setError(e.name);
        } finally {
            setCreatingCType(false);
        }
    }, [ kilt ]);

    if(!accounts || !kilt) {
        return null;
    }

    return (
        <>
            <Row>
                <Col>
                    <Button onClick={ createCType }>
                        {
                            !creatingCType &&
                            "Create CType"
                        }
                        {
                            creatingCType &&
                            <Spinner animation="border" />
                        }
                    </Button>
                </Col>
            </Row>
            <Row>
                {
                    error &&
                    <Alert variant="danger">{ error }</Alert>
                }
            </Row>
        </>
    );
}

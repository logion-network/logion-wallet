import { Form } from "react-bootstrap";
import { BackgroundAndForegroundColors } from "src/common/ColorTheme";
import FormGroup from "src/common/FormGroup";

export interface Props {
    requestId: string | undefined;
    locId: string | undefined;
    challenge: string | undefined;
    colors: BackgroundAndForegroundColors;
}

export default function SecretDownloadForm(props: Props) {
    const { requestId, locId, challenge, colors } = props;

    return (
        <div className="SecretDownloadForm">
            <FormGroup
                id="locId"
                label="Identity LOC ID"
                control={
                    <Form.Control
                        type="text"
                        value={ locId }
                        disabled
                    />
                }
                colors={ colors }
            />
            <FormGroup
                id="challenge"
                label="Challenge"
                control={
                    <Form.Control
                        type="text"
                        value={ challenge }
                        disabled
                    />
                }
                colors={ colors }
            />
            <FormGroup
                id="requestId"
                label="Request ID"
                control={
                    <Form.Control
                        type="text"
                        value={ requestId }
                        disabled
                    />
                }
                colors={ colors }
            />
        </div>
    );
}

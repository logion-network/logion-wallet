import Button from "src/common/Button";
import { LocItem, useReviewCallback } from "./LocItem";
import { useLocContext } from "./LocContext";
import Icon from "src/common/Icon";
import { useState } from "react";
import Dialog from "src/common/Dialog";
import Alert from "src/common/Alert";
import FormGroup from "src/common/FormGroup";
import { useCommonContext } from "src/common/CommonContext";
import { Form } from "react-bootstrap";

export interface Props {
    locItem: LocItem;
}

export default function ReviewItemButtons(props: Props) {
    const { colorTheme } = useCommonContext();
    const { mutateLocState } = useLocContext();
    const review = useReviewCallback(mutateLocState);
    const [ showAcceptDialog, setShowAcceptDialog ] = useState(false);
    const [ showRejectDialog, setShowRejectDialog ] = useState(false);
    const [ rejectReason, setRejectReason ] = useState("");

    return (
        <div className="ReviewItemButtons">
            <Button variant="link" slim={true} onClick={ () => setShowAcceptDialog(true) }><Icon icon={{ id: "ok" }} height="40px" /></Button>
            <Button variant="link" slim={true} onClick={ () => setShowRejectDialog(true) }><Icon icon={{ id: "ko" }} height="40px" /></Button>
            <Dialog
                show={ showAcceptDialog }
                size="lg"
                actions={[
                    {
                        id: "cancel-accept",
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        callback: () => setShowAcceptDialog(false),
                    },
                    {
                        id: "accept",
                        buttonText: "Confirm",
                        buttonVariant: "primary",
                        callback: () => review(props.locItem, "ACCEPT"),
                    }
                ]}
            >
                <Alert variant="info">
                    You confirm that the content is good to be recorded by the logion infrastructure
                    by the requester with regard to the LOC context and to the specific content that
                    will be publicly available after the recording (eg: GDPR).
                </Alert>
            </Dialog>
            <Dialog
                show={ showRejectDialog }
                size="lg"
                actions={[
                    {
                        id: "cancel-reject",
                        buttonText: "Cancel",
                        buttonVariant: "secondary",
                        callback: () => setShowRejectDialog(false),
                    },
                    {
                        id: "reject",
                        buttonText: "Reject",
                        buttonVariant: "primary",
                        callback: () => review(props.locItem, "REJECT", rejectReason),
                    }
                ]}
            >
                <FormGroup
                    id="reject-reason"
                    label="Reason"
                    control={ <Form.Control
                        isInvalid={ rejectReason.trim() === "" }
                        type="text"
                        as="textarea"
                        value={ rejectReason }
                        onChange={ event => setRejectReason(event.target.value) }
                    /> }
                    colors={ colorTheme.dialog }
                />
            </Dialog>
        </div>
    );
}

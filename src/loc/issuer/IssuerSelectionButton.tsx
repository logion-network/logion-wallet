import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { useNavigate } from "react-router-dom";

export default function IssuerSelectionButton() {

    const navigate = useNavigate();
    return (
        <Button id="NominateButton" onClick={ () => { navigate("./verified-issuer")} }>
            <Icon icon={ { id: "issuer" } } height="25px"/>
            Verified Issuer
        </Button>
    )
}

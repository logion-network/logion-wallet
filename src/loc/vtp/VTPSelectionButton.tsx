import Button from "../../common/Button";
import Icon from "../../common/Icon";
import { useNavigate } from "react-router-dom";

export default function VTPSelectionButton() {

    const navigate = useNavigate();
    return (
        <Button id="NominateButton" onClick={ () => { navigate("./vtp")} }>
            <Icon icon={ { id: "vtp" } } height="25px"/>
            Verified Issuer
        </Button>
    )
}

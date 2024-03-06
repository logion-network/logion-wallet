import { Routes, Route } from "react-router-dom";
import Certificate from "./certificate/Certificate";
import {
    CERTIFICATE_RELATIVE_PATH,
    COLLECTION_ITEM_CERTIFICATE_RELATIVE_PATH,
    TOKENS_RECORD_CERTIFICATE_RELATIVE_PATH
} from "./PublicPaths";

export default function PublicRouter() {
    return (
        <Routes>
            <Route path={ CERTIFICATE_RELATIVE_PATH } >
                <Route path="" element={ <Certificate /> } />
                <Route path={ COLLECTION_ITEM_CERTIFICATE_RELATIVE_PATH } element={ <Certificate /> } />
                <Route path={ TOKENS_RECORD_CERTIFICATE_RELATIVE_PATH } element={ <Certificate /> } />
            </Route>
        </Routes>
    )
}

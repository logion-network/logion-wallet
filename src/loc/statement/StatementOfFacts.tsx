import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SOF_PARAMS } from './SofParams';
import StatementOfFactsTemplateEN from './StatementOfFactsTemplateEN';
import StatementOfFactsTemplateFR from './StatementOfFactsTemplateFR';
import { UUID } from "@logion/node-api/dist/UUID";
import { loadSofParams } from "../../common/Storage";

const { Previewer } = require('pagedjs');

export default function StatementOfFacts() {
    const location = useLocation();

    const [ sofParams, setSofParams ] = useState(DEFAULT_SOF_PARAMS);

    useEffect(() => {
        const sofId = new UUID(location.pathname.substring(location.pathname.lastIndexOf("/") + 1));
        const pathModel = loadSofParams(sofId);
        document.title = `logion - ${ pathModel.locId }`;
        setSofParams(pathModel);
    }, [ location ]);

    useEffect(() => {
        let paged = new Previewer();
        paged.preview(null, [ process.env.PUBLIC_URL + "/statement.css" ], document.body).then((flow: any) => {
            console.log("Rendered", flow.total, "pages.");
        });
    }, []);

    if(sofParams.language === 'fr') {
        return <StatementOfFactsTemplateFR pathModel={ sofParams } />;
    } else {
        return <StatementOfFactsTemplateEN pathModel={ sofParams } />;
    }
}

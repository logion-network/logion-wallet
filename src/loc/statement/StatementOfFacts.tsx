import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_PATH_MODEL, parseSearchString } from './PathModel';
import StatementOfFactsTemplateEN from './StatementOfFactsTemplateEN';
import StatementOfFactsTemplateFR from './StatementOfFactsTemplateFR';

const { Previewer } = require('pagedjs');

export default function StatementOfFacts() {
    const location = useLocation();

    const [ pathModel, setPathModel ] = useState(DEFAULT_PATH_MODEL);

    useEffect(() => {
        setPathModel(parseSearchString(location.search));
    }, [ location ]);

    useEffect(() => {
        let paged = new Previewer();
        paged.preview(null, [ process.env.PUBLIC_URL + "/statement.css" ], document.body).then((flow: any) => {
            console.log("Rendered", flow.total, "pages.");
        });
    }, []);

    if(pathModel.language === 'fr') {
        return <StatementOfFactsTemplateFR pathModel={ pathModel } />;
    } else {
        return <StatementOfFactsTemplateEN pathModel={ pathModel } />;
    }
}

const { Previewer } = require('pagedjs');

export function loadPagedJs() {
    let paged = new Previewer();
    paged.preview(null, [ process.env.PUBLIC_URL + "/statement.css" ], document.body).then((flow: any) => {
        console.log("Rendered", flow.total, "pages.");
    });
}

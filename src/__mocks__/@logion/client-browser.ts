export class BrowserFile {

    constructor(blob: Blob) {
        this.blob = blob;
    }

    private blob: Blob;

    getBlob() {
        return this.blob;
    }
}

export class BrowserAxiosFileUploader {

    async upload() {

    }
}

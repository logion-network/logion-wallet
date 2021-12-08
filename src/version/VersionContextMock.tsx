const context = {
    currentVersion: 0,
    latestVersion: {
        version: 0,
        releaseNotes: ""
    }
}

export function useVersionContext() {
    return context;
}

module.exports = async function (context, req) {
    const status = {
        hasReq = !!req,
        hasQuery = !!(req && req.query),
        weekId = req && req.query ? req.query.weekId : null,
        hasAuth = !!(req && req.headers && req.headers["x-ms-client-principal"]),
        user = req && req.headers && req.headers["x-ms-client-principal"] ? JSON.parse(Buffer.from(req.headers["x-ms-client-principal"], "base64").toString("ascii")) : null,
        storageLen = typeof process.env.AzureWebJobsStorage === 'string' ? process.env.AzureWebJobsStorage.length : -1
    };

    context.res = {
        status: 200,
        body: JSON.stringify(status)
    };
}
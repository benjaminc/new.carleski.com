module.exports = async function (context, req) {
    const hasReq = req ? true : false;
    const hasQuery = (req && req.query) ? true : false;
    const weekId = req && req.query ? req.query.weekId : null;
    const hasAuth = (req && req.headers && req.headers["x-ms-client-principal"]) ? true : false;
    const user = req && req.headers && req.headers["x-ms-client-principal"] ? JSON.parse(Buffer.from(req.headers["x-ms-client-principal"], "base64").toString("ascii")) : null;
    const storageLen = typeof process.env.RANDOM_STRING_NAME === 'string' ? process.env.RANDOM_STRING_NAME.length : -1;
    const choresIn = context.bindings.choresIn;

    context.res = {
        status: 200,
        body: JSON.stringify({hasReq, hasQuery, weekId, hasAuth, user, storageLen, choresIn})
    };
}
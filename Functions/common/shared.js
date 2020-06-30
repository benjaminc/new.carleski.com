const KNOWN_USERS = JSON.parse(process.env.KNOWN_USERS);
const DEFAULT_PRINCIPAL = typeof process.env.DEFAULT_PRINCIPAL === 'string' && process.env.DEFAULT_PRINCIPAL.length > 0 ? process.env.DEFAULT_PRINCIPAL : null;
const CHORES_JSON_DATA = process.env.CHORES_JSON_DATA;
const axios = require('axios');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

async function verify(req, chores, baseChores, viewOnly) {
    if (!req || typeof req.query !== 'object') return "No valid request information";

    const weekId = parseInt(req.query.weekId);
    if (!Number.isInteger(weekId) || weekId <= 2634 || weekId >= 20000) return "Missing week";
    if (typeof chores === 'string') chores = JSON.parse(chores);
    if (typeof chores !== 'object' && baseChores !== false) chores = await generateNewWeek(req, weekId, baseChores, viewOnly);

    const header = req.headers["x-ms-client-principal"] || DEFAULT_PRINCIPAL;
    if (typeof header !== 'string' || !header || header.length === 0) return "Missing authentication header";
    const encoded = Buffer.from(header, "base64");
    const auth = JSON.parse(encoded.toString("ascii"));
    if (!auth || !KNOWN_USERS[auth.userDetails]) return "Unknown user";

    auth.user = KNOWN_USERS[auth.userDetails];
    auth.user.isParent = auth.userRoles.indexOf('parent') >= 0;
    let result = { auth, chores, weekId };

    const choreId = typeof req.body === 'object' && typeof req.body.choreId === 'string' ? req.body.choreId : req.query.choreId;
    const chore = typeof chores === 'object' ? getChore(chores.chores, choreId) : null;
    if (chore) {
        result.choreId = choreId;
        result.chore = chore;
    }

    return result;
}

function getChore(chores, choreId) {
    if (typeof(choreId) === 'string' && choreId.length > 0 && typeof chores === 'object' && chores && chores.length) {
        for (let i = 0; i < chores.length; i++) {
            if (chores[i].choreId !== choreId) continue;
            return chores[i];
        }
    }

    return null;
}

async function generateNewWeek(req, weekId, baseChores, viewOnly) {
    const currentWeekId = Math.round(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const inFuture = Number.isInteger(weekId) && weekId > currentWeekId
    var lastWeekChores = null;

    if (weekId > 2635 && (!viewOnly || !inFuture)) {
        let headers = {
            'Cache-Control': 'no-cache'
        };
        if (req.headers['x-ms-client-principal']) headers['x-ms-client-principal'] = req.headers['x-ms-client-principal'];

        const resp = await axios.get(new URL('GetChores?weekId=' + (weekId - 1), req.url).href, {headers});
        if (resp.status === 200) {
            const payload = resp.data;
            if (payload && payload.weekId && payload.chores) lastWeekChores = payload.chores;
        }
    }

    if (typeof baseChores === 'string') baseChores = JSON.parse(baseChores);
    let chores = typeof baseChores === 'object' ? {...baseChores} : {chores:[]};
    chores.weekId = weekId;

    let users = [];
    for (var key in KNOWN_USERS) {
        const user = KNOWN_USERS[key];
        if (!user.name || user.rotates !== true) continue;
        users.push(user.name);
    }

    for (var i = 0; i < chores.chores.length; i++) {
        let chore = chores.chores[i];
        const lastWeek = getChore(lastWeekChores, chore.choreId) || {};

        if (!chore.defaultAssignee) chore.defaultAssignee = users[(weekId + i + 3) % users.length];
        if (!chore.assignedTo) chore.assignedTo = lastWeek.assignedTo || chore.defaultAssignee;
        if (!chore.nextAssignee) chore.nextAssignee = users[(weekId + i + 4) % users.length];
    }

    return chores;
}

async function uploadImage(weekId, dataBuffer) {
    const client = BlobServiceClient.fromConnectionString(CHORES_JSON_DATA);
    const container = client.getContainerClient('chores');
    const name = weekId + '/' + uuidv4() + '.jpg';
    const blob = container.getBlockBlobClient(name);

    const resp = await blob.upload(dataBuffer, dataBuffer.length);

    return resp.status === 200 ? blob.url : null;
}

module.exports = {
    verify,
    getChore,
    uploadImage
};

const KNOWN_USERS = JSON.parse(process.env.KNOWN_USERS);
const DEFAULT_PRINCIPAL = typeof process.env.DEFAULT_PRINCIPAL === 'string' && process.env.DEFAULT_PRINCIPAL.length > 0 ? process.env.DEFAULT_PRINCIPAL : null;

async function verify(req, chores, baseChores) {
    if (!req || typeof req.query !== 'object') return "No valid request information";

    const weekId = parseInt(req.query.weekId);
    if (!Number.isInteger(weekId) || weekId <= 2634 || weekId >= 20000) return "Missing week";
    if (typeof chores === 'string') chores = JSON.parse(chores);
    if (typeof chores !== 'object') chores = await generateNewWeek(req.url, weekId, baseChores);

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
        for (let i = 0; i < chores.length && !result.chore; i++) {
            if (chores[i].choreId !== choreId) continue;
            return chores[i];
        }
    }

    return null;
}

async function generateNewWeek(url, weekId, baseChores) {
    if (weekId > 2635) {
        const resp = await fetch(new URL('GetChores?weekId=' + (weekId - 1), url));
        if (resp.status === 200) {
            const payload = await resp.json();
            if (payload && payload.weekId) return payload;
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
        if (!chore.defaultAssignee) chore.defaultAssignee = users[(weekId + i + 3) % users.length];
        if (!chore.assignedTo) chore.assignedTo = chore.defaultAssignee;
        if (!chore.nextAssignee) chore.nextAssignee = users[(weekId + i + 4) % users.length];
    }

    return chores;
}

module.exports = {
    verify,
    getChore
};

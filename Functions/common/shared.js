const KNOWN_USERS = JSON.parse(process.env.KNOWN_USERS);
const DEFAULT_PRINCIPAL = typeof process.env.DEFAULT_PRINCIPAL === 'string' && process.env.DEFAULT_PRINCIPAL.length > 0 ? process.env.DEFAULT_PRINCIPAL : null;

function verify(req, chores, baseChores) {
    if (!req || typeof req.query !== 'object') return null;

    const weekId = parseInt(req.query.weekId);
    if (!Number.isInteger(weekId) || weekId <= 2634 || weekId >= 20000) return null;
    if (typeof chores === 'string') chores = JSON.parse(chores);
    if (typeof chores !== 'object') chores = generateNewWeek(weekId, baseChores);

    const header = req.headers["x-ms-client-principal"] || DEFAULT_PRINCIPAL;
    if (typeof header !== 'string' || !header || header.length === 0) return null;
    const encoded = Buffer.from(header, "base64");
    const auth = JSON.parse(encoded.toString("ascii"));
    if (!auth || !KNOWN_USERS[auth.userDetails]) return null;

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

function generateNewWeek(weekId, baseChores) {
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

const LOOKUP_HEADER = process.env.LOOKUP_HEADER;
const shared = require('../common/shared');
const axios = require('axios');

function parseWeekId(whenName) {
    const currentWeekId = shared.getCurrentWeekId();
    const resolved = whenName && whenName.resolved;
    if (typeof resolved !== 'string' || !resolved.length) return currentWeekId;

    const when = resolved.toLocaleLowerCase();

    if (when === 'this week') return currentWeekId;
    if (when === 'next week') return currentWeekId + 1;
    if (when === 'the week after next') return currentWeekId + 2;
    if (when === 'last week') return currentWeekId - 1;
    if (when === 'two weeks ago') return currentWeekId - 2;

    return null;
}

async function getChores(req, weekId) {
    let headers = {
        'Cache-Control': 'no-cache'
    };
    if (typeof LOOKUP_HEADER === 'string' && LOOKUP_HEADER.length) headers['x-carleski-chores'] = LOOKUP_HEADER;

    const resp = await axios.get(new URL('GetChores?weekId=' + weekId, req.url).href, {headers});
    if (resp.status === 200) {
        const payload = resp.data;
        if (payload && payload.weekId && payload.chores) return payload.chores;
    }

    return null;
}

function choreText(chore) {
    return chore.assignedTo + ' has ' + chore.name + '.';    
}

function lookupByAssignee(req, chores, whoName) {
    const who = whoName && typeof whoName.resolved === 'string' ? whoName.resolved : null;

    for (var chore of chores) {
        if (chore.assignedTo === who) return makeResponse(req, choreText(chore));
    }

    return makeResponse(req, "I don't know who that is.");
}

function lookupByChore(req, chores, choreName) {
    const choreId = (choreName && choreName.resolved) || '';
    const chore = shared.getChore(chores, choreId);

    if (chore) return makeResponse(req, choreText(chore));

    return makeResponse(req, "I don't know what chore that is.");
}

function getAllChores(req, chores) {
    const phrases = [];

    for (var chore of chores) {
        phrases.push(choreText(chore));
    }

    return makeResponse(req, phrases.join(' '));
}

function makeResponse(req, message) {
    const result = {
        "session": req && req.body && req.body.session,
        "prompt": {
          "override": false,
          "firstSimple": {
            "speech": message,
            "text": message
          }
        },
        "scene": req && req.body && req.body.scene
      };

    return {
        res: {
            headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result)
        }
    }
}

module.exports = async function (context, req) {
    context.log('Got Lookup request');

    const handler = req && req.body && req.body.handler && req.body.handler.name;
    if (typeof handler !== 'string' || !handler.length) return {res:{status:500}};

    if (handler === 'all' || handler === 'chore' || handler === 'person') {
        const intentParams = (req.body.intent && req.body.intent.params) || {};
        const whenName = intentParams['when'];
        const weekId = parseWeekId(whenName);

        if (!weekId) return makeResponse(req, "I couldn't tell when you wanted to lookup chores for.  Try saying last week, this week, or next week.");

        const chores = await getChores(req, weekId);
        if (handler === 'all') return getAllChores(req, chores);
        if (handler === 'chore') {
            const choreName = intentParams['chore'];
            if (choreName) return lookupByChore(req, chores, choreName);
            else return makeResponse(req, "I couldn't tell which chore you are referring to.  Please try again.");
        }
        if (handler === 'person') {
            const whoName = intentParams['person'];
            if (whoName) return lookupByAssignee(req, chores, whoName);
            else return makeResponse(req, "I couldn't tell who you are referring to.  Please try again.");
        }
    }

    return makeResponse(req, "Could not identify the proper handler");
};
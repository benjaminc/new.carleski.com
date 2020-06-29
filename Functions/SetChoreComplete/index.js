// Set Chore Complete (idToken, weekId, choreId, complete) - Must be parent
//     Verify choreId is valid, if not return 500
//     Reads current chore list from /chores/{weekId}/chores.json
//     If complete matches current complete, return 200
//     Update chores.json to show who is marking it complete and when
//     Save chores.json to Azure storage
//     Returns chores.json
// WeekId = Math.round(Date.now() / (7 * 24 * 60 * 60 * 1000))
// This rolls over around 5 AM Sunday morning on GMT-8, or 6 AM Sunday morning on GMT-7
const shared = require('../common/shared');
const https = require('https');

function validateRequest(context, req, chores) {
    let result = shared.verify(req, chores);
    if (!result || !result.chore || typeof req.body.complete !== 'boolean') {
        context.log('Invalid request - ' + JSON.stringify(req));
        context.res = { status: 500 };
        return false;
    }

    if (!result.auth.user.isParent) {
        context.log('Not a parent making the request');
        context.res = { status: 403 };
        return false;
    }

    result.complete = (req.query.complete === "true" || req.query.complete === true);
    if (result.chore.complete === result.complete) {
        context.log('Complete status already set to requested status');
        context.res = { status: 200 };
        return false;
    }

    return result;
}

async function updateNextWeek(req, nextWeekId, chore) {
    const url = new URL('AssignChore?weekId=' + nextWeekId
        + '&choreId=' + encodeURIComponent(chore.choreId)
        + '&assignedTo=' + encodeURIComponent(chore.assignedTo),
        req.url);

    await fetch(url, {
        cache: 'no-cache',
        headers: {
            'x-ms-client-principal': req.headers['x-ms-client-principal']
        }
    });
}

module.exports = async function (context, req) {
    context.log('Got SetChoreComplete request');

    var result = validateRequest(context, req, context.bindings.choresIn);
    if (!result) return;

    var chore = result.chore;
    var complete = result.complete;
    var reviewer = result.auth.user.name;
    context.log('Setting complete status of ' + chore.name + ' to ' + complete + ' by ' + result.auth.user.name);

    chore.history.push({complete,by:reviewer,at:new Date().toString()});
    if (complete && chore.assignedTo === chore.defaultAssignedTo) {
        chore.complete = true;
        chore.assignedTo = chore.nextAssignedTo;
    } else {
        chore.complete = false;
        chore.assignedTo = chore.defaultAssignedTo;
    }
    context.bindings.choresOut = result.chores;

    await updateNextWeek(req, result.weekId + 1, result.chore);

    context.res = {status:200};
};
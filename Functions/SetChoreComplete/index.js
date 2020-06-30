const shared = require('../common/shared');
const https = require('https');

async function validateRequest(context, req, chores) {
    let result = await shared.verify(req, chores);
    if (typeof result !== 'object' || !result.chore || typeof req.body.complete !== 'boolean') {
        context.log('Invalid request - ' + JSON.stringify(req));
        context.res = { status: 500 };

        if (typeof result === 'string') context.res.body = result;
        else if (result && !result.chore) context.res.body = 'Unknown chore';
        else if (result && typeof req.body.complete !== 'boolean') context.res.body = 'Missing complete specification';
        else context.res.body = 'An unknown error has occurred';

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

    var result = await validateRequest(context, req, context.bindings.choresIn);
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
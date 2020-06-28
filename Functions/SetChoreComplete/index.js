// Set Chore Complete (idToken, weekId, choreId, complete) - Must be parent
//     Verify choreId is valid, if not return 500
//     Reads current chore list from /chores/{weekId}/chores.json
//     If complete matches current complete, return 200
//     Update chores.json to show who is marking it complete and when
//     Save chores.json to Azure storage
//     Returns chores.json
const shared = require('../common/shared');

function validateRequest(context, body, chores) {
    if (!body || typeof body.token !== 'string' || !body.token) {
        context.log('No valid ID token present in the request body');
        context.res = { statusCode: 500 };
        return false;
    }

    if (typeof body.choreId !== 'number' || body.choreId <= 0 || !chores[body.choreId]) {
        context.log('No valid chore ID present in the request body');
        context.res = { statusCode: 500 };
        return false;
    }

    if (typeof body.complete !== 'boolean') {
        context.log('No valid complete field present in the request body');
        context.res = { statusCode: 500 };
        return false;
    }

    var auth = await shared.verify(body.token);
    if (!auth || !auth.user || !auth.user.isParent) {
        context.log('Not a parent making the request');
        context.res = { statusCode: 403 };
        return false;
    }

    var chore = chores[body.choreId];
    if (chore.complete === body.complete) {
        context.log('Complete status already set to requested status');
        context.res = { statusCode: 200 };
        return false;
    }

    return {auth, chore};
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var chores = context.bindings.choresIn;
    var result = validateRequest(context, req.body, chores);
    if (!result) return;

    context.log('Setting complete status of ' + result.chore.name + ' to ' + req.body.complete + ' by ' + result.auth.user.name);
    chore.complete = req.body.complete;
    context.bindings.choresOut = chores;

    context.res = {statusCode:200};
};
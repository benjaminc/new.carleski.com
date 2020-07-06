const shared = require("../common/shared");

async function validateRequest(context, req, chores, baseChores) {
    let result = await shared.verify(req, chores, baseChores);

    if (typeof result !== 'object' || typeof req.query.assignedTo !== 'string' || req.query.assignedTo.length === 0) {
        context.log('Invalid request - ' + JSON.stringify(req));
        context.res = { status: 500 };

        if (typeof result === 'string') context.res.body = result;
        else if (typeof req.query.assignedTo !== 'string') context.res.body = 'Missing assignedTo';
        else if (req.query.assignedTo.length === 0) context.res.body = 'Empty assignedTo';
        else context.res.body = 'An unknown error has occurred';

        return false;
    }

    if (!result.auth.user.isParent) {
        context.log('Not a parent making the request');
        context.res = { status: 403 };
        return false;
    }

    result.assignedTo = req.query.assignedTo;

    return result;
}

module.exports = async function (context, req) {
    context.log('Got AssignChore request');

    const result = await validateRequest(context, req, context.bindings.choresIn, context.bindings.baseChores);
    if (!result) return;

    result.chore.assignedTo = result.assignedTo;

    context.bindings.choresOut = result.chores;
};
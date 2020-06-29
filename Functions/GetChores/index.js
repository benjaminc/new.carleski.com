const shared = require('../common/shared');

function validateRequest(context, req, chores, baseChores) {
    let result = shared.verify(req, chores, baseChores);

    if (typeof result !== 'object') {
        context.log('Invalid request - ' + JSON.stringify(req));
        context.res = { status: 500 };

        if (typeof result === 'string') context.res.body = result;
        else context.res.body = 'An unknown error has occurred';

        return false;
    }

    return result;
}

module.exports = async function (context, req) {
    context.log('Got GetChores request');

    const result = validateRequest(context, req, context.bindings.choresIn, context.bindings.baseChores);
    if (!result) return;

    context.res = {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(result.chores)
    }
};
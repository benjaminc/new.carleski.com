/*
input example:
{
    "Kitchen": "George",
    "Bathrooms": "Calvin"
}
chores.json example:
{
    weekId: 2645,
    chores: [
        {
            "choreId": "kitchen",
            "complete": true,
            "history": [
                {complete:true,by:'Dad',at:'Saturday June 27, 2020 11:21:01 AM'}
            ]
            "defaultAssignee": 'Robert',
            "nextAssignee": 'George',
            "assignedTo": 'George',
            "name": "Kitchen",
            "images": [
                {"at":"Saturday June 27, 2020 2:41:52 AM", by:"Robert", url:"https://blob.azure.net/image/path"}
            ]
            "schedules": [
                {
                    "name": "Daily",
                    "tasks": [
                        { "name": "Empty the dishwasher in the morning", "exampleUrl": "https://blob.azure.net/image/path" }
                    ]
                }
            ]
        }
    ]
}
*/

const shared = require("../common/shared");

function validateRequest(context, req, chores, baseChores) {
    let result = shared.verify(req, chores, baseChores);

    if (!result || typeof req.query.assignedTo !== 'string' || req.query.assignedTo.length === 0) {
        context.log('Invalid request - ' + JSON.stringify(req));
        context.res = { status: 500 };
        return false;
    }

    result.assignedTo = req.query.assignedTo;

    return result;
}

module.exports = async function (context, req) {
    context.log('Got UpdateChores request');

    const result = validateRequest(context, req, context.bindings.choresIn, context.bindings.baseChores);
    if (!result) return;

    result.chore.assignedTo = result.assignedTo;

    context.bindings.choresOut = result.chores;
};
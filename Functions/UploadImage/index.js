const shared = require('../common/shared');
const multipart = require("parse-multipart");

async function validateRequest(context, req, chores, baseChores) {
    let result = await shared.verify(req, chores, baseChores);
    const scheduleAlias = req.query.scheduleAlias;
    const taskName = req.query.taskName;
    const isExample = typeof req.query.isExample === 'string' ? (req.query.isExample === 'true') : req.query.isExample;

    if (result && result.chore && scheduleAlias && taskName) {
        for (let i = 0; i < result.chore.schedules.length && !result.task; i++) {
            var schedule = result.chore.schedules[i];
            if (schedule.alias !== scheduleAlias) continue;

            for (let j = 0; j < schedule.tasks.length && !result.task; j++) {
                var task = schedule.tasks[j];
                if (task.name !== taskName) continue;

                result.task = task;
                result.schedule = schedule;
            }
        }
    }

    const bodyBuffer = req.body ? Buffer.from(req.body) : null;
    const boundary = bodyBuffer ? multipart.getBoundary(req.headers['content-type']) : null;
    const parts = boundary ? multipart.Parse(bodyBuffer, boundary) : null;
    const upload = parts && parts.length > 0 ? parts[0] : null;

    if (typeof result !== 'object' || typeof result.task !== 'object' || !upload) {
        context.log('Invalid request - ' + JSON.stringify(req));
        context.res = { status: 500 };

        if (typeof result === 'string') context.res.body = result;
        else if (typeof scheduleAlias !== 'string') context.res.body = 'Missing scheduleAlias';
        else if (typeof taskName !== 'string') context.res.body = 'Missing taskName';
        else if (typeof result.chore !== 'object') context.res.body = 'Missing or invalid chore';
        else if (typeof result.schedule !== 'object') context.res.body = 'Missing or invalid schedule';
        else if (typeof result.task !== 'object') context.res.body = 'Missing or invalid task';
        else if (!bodyBuffer) context.res.body = 'Missing body';
        else if (!boundary) context.res.body = 'Missing boundary';
        else if (!parts) context.res.body = 'Missing parts';
        else if (!upload) context.res.body = 'Missing upload';
        else context.res.body = 'An unknown error has occurred';

        return false;
    }

    if (isExample && !result.auth.user.isParent) {
        context.log('Not a parent making the request');
        context.res = { status: 403 };
        return false;
    }

    result.upload = upload;
    result.isExample = isExample;

    return result;
}

module.exports = async function (context, req) {  
    context.log('Got UploadImage request'); 

    const result = await validateRequest(context, req, context.bindings.choresIn, context.bindings.baseChores);
    if (!result) return;

    const imageUrl = await shared.uploadImage(result.weekId, result.upload.data);
    if (result.isExample) result.task.exampleUrl = imageUrl;
    else result.task.imageUrls.push({ by: result.auth.user.name, at: new Date().toString(), url: imageUrl });

    context.bindings.choresOut = result.chores;
};
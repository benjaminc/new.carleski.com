const CLIENT_ID = '';
const KNOWN_USERS = {
    'admin@carleski.com': {name:'Dad',isParent:true},
    'katiecarleski@gmail.com': {name:'Mom',isParent:true},
    'robert@carleski.com': {name:'Robert'},
    'george.carleski@student.csd509j.net': {name:'George'},
    'calvin.carleski@gmail.com': {name:'Calvin'},
    'ben.carleski@gmail.com': {name:'Ben'},
    'kristopher@carleski.com': {name:'Kristopher'},
    'phineas@carleski.com': {name:'Phineas'},
    'caroline@carleski.com': {name:'Caroline'}
};

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
  });
  const payload = ticket.getPayload();
  const userId = payload['sub'];
  const email = payload['email'];
  const user = KNOWN_USERS[email.toLowerCase()];

  return {userId, email, user};
}

module.exports = {
    verify
};

const { post } = require('axios');
const { repository } = require('./package.json');
const commit = process.env.TRAVIS_COMMIT;

post(`https://api.github.com/repos/${repository}/statuses/${commit}?access_token=${process.env.GH_TOKEN}`, {
    state: 'success',
    target_url: `https://storage.googleapis.com/featherico-examples/${commit}.html`,
    description: 'View generated icons',
    context: 'Icons',
});

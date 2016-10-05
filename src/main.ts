require('./sass/main.sass');
require('bootstrap/dist/css/bootstrap.css');
require('../src/index.html'); // todo: remove this line on prod; use only for webpack watch

jQuery('.test').text('jQuery is live:)');
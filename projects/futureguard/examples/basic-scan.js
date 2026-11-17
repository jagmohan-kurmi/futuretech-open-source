const { scanPath, formatReport } = require('../dist/src');

const result = scanPath('./tests/fixtures');
console.log(formatReport(result, 'json'));

const path = require('path');

// Always resolve paths relative to this file (most reliable way)
const fixturesDir = path.join(__dirname, '../fixtures');

const cover = [
  path.join(fixturesDir, 'cover1.jpg'),
  path.join(fixturesDir, 'cover2.jpg'),
  path.join(fixturesDir, 'cover3.jpg'),
  path.join(fixturesDir, 'cover4.jpg'),
  path.join(fixturesDir, 'cover5.jpg'),
  path.join(fixturesDir, 'cover6.jpg'),
  path.join(fixturesDir, 'cover7.jpg'),
  path.join(fixturesDir, 'cover8.jpg'),
  path.join(fixturesDir, 'cover9.jpg'),
];

const logo = [
  path.join(fixturesDir, 'logo1.jpg'),
  path.join(fixturesDir, 'logo2.jpg'),
  path.join(fixturesDir, 'logo3.jpg'),
  path.join(fixturesDir, 'logo4.png'),
  path.join(fixturesDir, 'logo5.png'),
  path.join(fixturesDir, 'logo6.jpg'),
  path.join(fixturesDir, 'logo7.jpg'),
  path.join(fixturesDir, 'logo8.jpg'),
  path.join(fixturesDir, 'logo9.jpg'),   
];

const docs = [
  path.join(fixturesDir, 'docs1.png'),
];

module.exports = { cover, logo, docs };
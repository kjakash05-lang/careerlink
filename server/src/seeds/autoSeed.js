const User = require('../models/User');
const { seedDatabase } = require('./seedData');

const checkAndSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`[AutoSeed] Database already populated with ${userCount} users.`);
      return;
    }

    console.log('[AutoSeed] Empty database detected. Auto-populating comprehensive demo data & posts...');
    await seedDatabase();
  } catch (err) {
    console.warn('[AutoSeed Warning]:', err.message);
  }
};

module.exports = { checkAndSeed };

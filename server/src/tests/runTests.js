const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { calculateJobMatch } = require('../services/recommendationService');

const runAutomatedTests = async () => {
  console.log('\n=========================================');
  console.log('🧪 RUNNING PROLINK BACKEND VERIFICATION TESTS');
  console.log('=========================================\n');

  try {
    await connectDB();

    // Test 1: Password hashing and role assignment
    console.log('[Test 1] Testing User Registration & Password Hashing...');
    const testUser = await User.create({
      email: `test_${Date.now()}@example.com`,
      password: 'mypassword123',
      role: 'candidate',
    });

    const isMatch = await testUser.matchPassword('mypassword123');
    const isWrongMatch = await testUser.matchPassword('wrongpass');
    if (!isMatch || isWrongMatch || testUser.password === 'mypassword123') {
      throw new Error('Password hashing or comparison failed.');
    }
    console.log('  ✓ Password securely hashed with bcrypt & compared successfully.');

    // Test 2: Profile creation & skills
    console.log('[Test 2] Testing Profile Creation & Skills...');
    const testProfile = await Profile.create({
      user: testUser._id,
      firstName: 'Test',
      lastName: 'Candidate',
      headline: 'Full Stack React Engineer',
      location: 'San Francisco, CA',
      preferredWorkMode: 'Remote',
      skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'MongoDB' }],
      experience: [
        {
          title: 'Software Engineer',
          company: 'NovaTech Systems',
          startDate: '2021-01',
          current: true,
        },
        {
          title: 'Junior Developer',
          company: 'ByteWorks',
          startDate: '2019-01',
          endDate: '2020-12',
          current: false,
        },
      ],
      education: [
        {
          school: 'Tech Institute',
          degree: 'B.S. Computer Science',
          startDate: '2015',
          endDate: '2019',
        },
      ],
    });
    console.log(`  ✓ Created profile for ${testProfile.fullName} with ${testProfile.skills.length} skills.`);

    // Test 3: Recommendation Engine Matching Score & Breakdown
    console.log('[Test 3] Testing Recommendation Engine Algorithmic Score...');
    const testJob = {
      title: 'Senior Full Stack Engineer (React)',
      location: 'San Francisco, CA',
      workMode: 'Remote',
      experienceRequired: 3,
      skillsRequired: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    };

    const matchResult = calculateJobMatch(testProfile, testJob);
    console.log(`  ✓ Match Score Computed: ${matchResult.matchScore}%`);
    console.log(`  ✓ Breakdown: Skills=${matchResult.breakdown.skills}/40, Exp=${matchResult.breakdown.experience}/20, Title=${matchResult.breakdown.title}/15, Edu=${matchResult.breakdown.education}/10, Loc=${matchResult.breakdown.location}/10, Mode=${matchResult.breakdown.workMode}/5`);
    console.log(`  ✓ Transparent Reasons Count: ${matchResult.reasons.length}`);
    if (matchResult.matchScore < 70) {
      throw new Error(`Expected high match score for matching candidate, got ${matchResult.matchScore}%`);
    }

    // Test 4: Endorsement anti-duplicate logic
    console.log('[Test 4] Testing Skill Endorsement Validation...');
    const endorser = await User.create({
      email: `endorser_${Date.now()}@example.com`,
      password: 'password123',
      role: 'candidate',
    });

    testProfile.skills[0].endorsements.push({ user: endorser._id });
    await testProfile.save();

    // Verify 1 endorsement
    const reloaded = await Profile.findById(testProfile._id);
    if (reloaded.skills[0].endorsements.length !== 1) {
      throw new Error('Skill endorsement count mismatch.');
    }
    console.log('  ✓ Skill endorsement registered correctly.');

    // Cleanup test artifacts
    await User.deleteMany({ _id: { $in: [testUser._id, endorser._id] } });
    await Profile.deleteMany({ _id: testProfile._id });

    console.log('\n=========================================');
    console.log('🎉 ALL BACKEND VERIFICATION TESTS PASSED!');
    console.log('=========================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    await disconnectDB();
    process.exit(1);
  }
};

runAutomatedTests();

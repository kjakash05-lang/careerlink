/**
 * Job Recommendation Engine - Deterministic Algorithmic Scoring
 * 
 * Weights (Total 100%):
 * 1. Skills Match: 40%
 * 2. Experience Match: 20%
 * 3. Title / Role Similarity: 15%
 * 4. Education Match: 10%
 * 5. Location Match: 10%
 * 6. Work Mode Preference: 5%
 */

const calculateJobMatch = (profile, job) => {
  if (!profile || !job) {
    return {
      matchScore: 0,
      reasons: [],
      breakdown: { skills: 0, experience: 0, title: 0, education: 0, location: 0, workMode: 0 },
    };
  }

  const reasons = [];
  let score = 0;

  // 1. Skills Matching (Weight: 40%)
  const profileSkills = (profile.skills || []).map((s) => (typeof s === 'string' ? s : s.name).toLowerCase().trim());
  const requiredSkills = (job.skillsRequired || []).map((s) => s.toLowerCase().trim());
  
  let skillsScore = 0;
  if (requiredSkills.length > 0) {
    const matchedSkills = requiredSkills.filter((reqSkill) =>
      profileSkills.some((pSkill) => pSkill.includes(reqSkill) || reqSkill.includes(pSkill))
    );
    const skillRatio = matchedSkills.length / requiredSkills.length;
    skillsScore = Math.round(skillRatio * 40);

    matchedSkills.forEach((skill) => {
      reasons.push({
        type: 'skill',
        matched: true,
        text: `Matched skill: ${skill.charAt(0).toUpperCase() + skill.slice(1)}`,
      });
    });

    const missingSkills = requiredSkills.filter((s) => !matchedSkills.includes(s));
    if (missingSkills.length > 0 && missingSkills.length <= 2) {
      missingSkills.forEach((skill) => {
        reasons.push({
          type: 'missing_skill',
          matched: false,
          text: `Desired skill: ${skill.charAt(0).toUpperCase() + skill.slice(1)}`,
        });
      });
    }
  } else {
    // If no specific skills listed, award default base skill points
    skillsScore = 30;
    reasons.push({
      type: 'skill',
      matched: true,
      text: 'General skill requirements fit',
    });
  }
  score += skillsScore;

  // 2. Experience Matching (Weight: 20%)
  let candidateYears = 0;
  if (profile.experience && profile.experience.length > 0) {
    candidateYears = profile.experience.length * 1.5; // Average length estimate
  }
  const requiredYears = job.experienceRequired || 0;
  let experienceScore = 0;

  if (requiredYears === 0) {
    experienceScore = 20;
    reasons.push({
      type: 'experience',
      matched: true,
      text: 'Entry/flexible experience level',
    });
  } else if (candidateYears >= requiredYears) {
    experienceScore = 20;
    reasons.push({
      type: 'experience',
      matched: true,
      text: `${Math.round(candidateYears)}+ years experience matches required ${requiredYears} years`,
    });
  } else {
    const ratio = Math.max(0.3, candidateYears / requiredYears);
    experienceScore = Math.round(ratio * 20);
    reasons.push({
      type: 'experience',
      matched: candidateYears >= requiredYears * 0.7,
      text: `Has ${Math.round(candidateYears)} years experience (Target: ${requiredYears} yrs)`,
    });
  }
  score += experienceScore;

  // 3. Job Title & Role Similarity (Weight: 15%)
  const jobTitle = (job.title || '').toLowerCase();
  const headline = (profile.headline || '').toLowerCase();
  const targetRoles = (profile.targetRoles || []).map((r) => r.toLowerCase());
  const pastTitles = (profile.experience || []).map((e) => (e.title || '').toLowerCase());

  let titleScore = 0;
  const titleWords = jobTitle.split(/[\s,/-]+/).filter((w) => w.length > 2);
  const matchesTitle = titleWords.some(
    (w) =>
      headline.includes(w) ||
      targetRoles.some((tr) => tr.includes(w)) ||
      pastTitles.some((pt) => pt.includes(w))
  );

  if (matchesTitle) {
    titleScore = 15;
    reasons.push({
      type: 'title',
      matched: true,
      text: `Role alignment with your profile and title background`,
    });
  } else {
    titleScore = 5;
  }
  score += titleScore;

  // 4. Education Matching (Weight: 10%)
  let educationScore = 0;
  if (profile.education && profile.education.length > 0) {
    educationScore = 10;
    const highestDegree = profile.education[0].degree || 'Degree';
    reasons.push({
      type: 'education',
      matched: true,
      text: `Relevant education background (${highestDegree})`,
    });
  } else {
    educationScore = 4;
  }
  score += educationScore;

  // 5. Location Matching (Weight: 10%)
  let locationScore = 0;
  const jobLocation = (job.location || '').toLowerCase();
  const candidateLocation = (profile.location || '').toLowerCase();

  if (
    job.workMode === 'Remote' ||
    (candidateLocation && jobLocation.includes(candidateLocation)) ||
    (jobLocation && candidateLocation.includes(jobLocation))
  ) {
    locationScore = 10;
    reasons.push({
      type: 'location',
      matched: true,
      text: job.workMode === 'Remote' ? 'Remote location flexibility' : `Location matches: ${job.location}`,
    });
  } else if (!candidateLocation) {
    locationScore = 6;
  } else {
    locationScore = 2;
  }
  score += locationScore;

  // 6. Work Mode Preference (Weight: 5%)
  let workModeScore = 0;
  const preferredMode = profile.preferredWorkMode || 'Any';
  if (preferredMode === 'Any' || preferredMode === job.workMode) {
    workModeScore = 5;
    reasons.push({
      type: 'workMode',
      matched: true,
      text: `Matches preferred work mode (${job.workMode})`,
    });
  } else {
    workModeScore = 2;
  }
  score += workModeScore;

  // Cap final score strictly between 15% and 99%
  const finalScore = Math.min(99, Math.max(15, Math.round(score)));

  return {
    matchScore: finalScore,
    reasons,
    breakdown: {
      skills: skillsScore,
      experience: experienceScore,
      title: titleScore,
      education: educationScore,
      location: locationScore,
      workMode: workModeScore,
    },
  };
};

module.exports = { calculateJobMatch };

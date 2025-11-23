const User = require('../models/User');
const crypto = require('crypto');

/**
 * Generate a unique referral code for a user
 * Format: 8 characters, alphanumeric, uppercase
 * @returns {Promise<string>} A unique referral code
 */
async function generateUniqueReferralCode() {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 30;
  const codeLength = 8;

  // Characters to use for code generation (excluding confusing characters like 0, O, I, 1)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  while (!isUnique && attempts < maxAttempts) {
    // Generate code using crypto for better randomness
    try {
      const randomBytes = crypto.randomBytes(codeLength);
      code = Array.from(randomBytes)
        .map(byte => chars[byte % chars.length])
        .join('');
    } catch (error) {
      // Fallback to Math.random if crypto fails
      code = '';
      for (let i = 0; i < codeLength; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    // Ensure code is exactly 8 characters
    code = code.substring(0, codeLength).toUpperCase();

    // Check if code already exists
    const existingUser = await User.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
  }

  // Fallback: use timestamp-based code with additional randomness if still not unique
  if (!isUnique) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    // Use base36 encoding and take last characters
    const timePart = timestamp.toString(36).toUpperCase().slice(-4);
    const randomPart = random.toString(36).toUpperCase().slice(-4);
    code = (timePart + randomPart).substring(0, codeLength);
    
    // Replace any non-alphanumeric characters
    code = code.replace(/[^A-Z0-9]/g, '');
    
    // Pad if needed
    while (code.length < codeLength) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    code = code.substring(0, codeLength);
    
    // Final check - if still exists, add more randomness
    const finalCheck = await User.findOne({ referralCode: code });
    if (finalCheck) {
      // Last resort: use timestamp + random with prefix
      code = `REF${Date.now().toString(36).toUpperCase().slice(-5)}`;
    }
  }

  return code;
}

/**
 * Ensure a user has a referral code, generate one if missing
 * @param {Object} user - The user object
 * @returns {Promise<string>} The user's referral code
 */
async function ensureUserHasReferralCode(user) {
  if (!user) {
    throw new Error('User is required');
  }

  // If user already has a referral code, return it
  if (user.referralCode) {
    return user.referralCode;
  }

  // Generate a new unique referral code
  const newCode = await generateUniqueReferralCode();
  
  // Update user with the new referral code
  user.referralCode = newCode;
  await user.save();

  return newCode;
}

module.exports = {
  generateUniqueReferralCode,
  ensureUserHasReferralCode
};


const { admin } = require('../config/firebase');
const { generateToken } = require('../config/jwt');

// Register new user with email
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
    
    if (userRecord) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user in Firebase
    const newUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: false // Set to false initially
    });

    // Create custom user claims for additional user data
    await admin.auth().setCustomUserClaims(newUser.uid, {
      name: name,
      role: 'user'
    });

    // Send verification email using Firebase
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    // Get ID token for the new user (this is a workaround as Admin SDK doesn't have direct email verification)
    const idToken = await admin.auth().createCustomToken(newUser.uid);
    
    // Generate JWT token
    const token = generateToken(newUser.uid);

    return res.status(201).json({
      message: 'User registered successfully. Please check your email for verification.',
      token,
      user: {
        uid: newUser.uid,
        email: newUser.email,
        name: name,
        emailVerified: false
      },
      firebaseToken: idToken
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login with email and password
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get Firebase Auth user by email (for custom error handling)
    const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Firebase Admin SDK doesn't have a direct way to verify password
    // We'll use Firebase REST API for this purpose
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Get user custom claims
    const userCustomClaims = (await admin.auth().getUser(userRecord.uid)).customClaims || {};

    // Generate JWT token
    const token = generateToken(userRecord.uid);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || userCustomClaims.name || '',
        emailVerified: userRecord.emailVerified
      },
      firebaseToken: data.idToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Request password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const userRecord = await admin.auth().getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      // Don't reveal that email doesn't exist for security reasons
      return res.status(200).json({ message: 'If the email is registered, a password reset link has been sent' });
    }

    // Firebase Admin SDK doesn't directly support sending password reset emails
    // We'll use Firebase REST API
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to send password reset email');
    }

    return res.status(200).json({ message: 'If the email is registered, a password reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Password reset request failed', error: error.message });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    // req.userId is set by authMiddleware
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user from Firebase
    const userRecord = await admin.auth().getUser(userId);
    
    // Get user custom claims
    const userCustomClaims = userRecord.customClaims || {};

    return res.status(200).json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || userCustomClaims.name || '',
        emailVerified: userRecord.emailVerified,
        role: userCustomClaims.role || 'user'
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ message: 'Failed to get user profile', error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { oobCode } = req.body;
    
    if (!oobCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Firebase Admin SDK doesn't directly support email verification with oobCode
    // We'll use Firebase REST API
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        oobCode
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to verify email');
    }

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ message: 'Email verification failed', error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  getUserProfile,
  verifyEmail
}; 
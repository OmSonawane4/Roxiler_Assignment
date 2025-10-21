import { connectToDatabase } from '../../../utils/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get credentials from request body
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find user by email - use exact match instead of regex for troubleshooting
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim()
    });

    console.log("Verification attempt for:", email);
    console.log("User found:", user ? "Yes" : "No");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        message: 'User verification failed', 
        reason: 'User not found',
        exists: false
      });
    }

    // Log password details for debugging (remove in production)
    console.log("Stored hashed password:", user.password);
    console.log("Password from request:", password);

    // Check if password matches
    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isValid);

    if (!isValid) {
      return res.status(401).json({ 
        message: 'User verification failed', 
        reason: 'Password incorrect',
        exists: true,
        passwordMatch: false
      });
    }

    // Return success
    return res.status(200).json({ 
      message: 'User verification successful',
      exists: true,
      passwordMatch: true
    });
  } catch (error) {
    console.error('User verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
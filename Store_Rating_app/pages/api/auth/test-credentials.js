import { connectToDatabase } from '../../../utils/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const { db } = await connectToDatabase();
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find user
    const user = await db.collection('users').findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        email: normalizedEmail,
        exists: false
      });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    return res.status(200).json({
      exists: true,
      passwordValid: isPasswordValid,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Test credentials error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
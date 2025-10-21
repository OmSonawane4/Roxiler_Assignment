import { connectToDatabase } from '../../../utils/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user data from request body
    const { name, email, password, role = 'user' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: normalizedEmail
    });
    
    if (existingUser) {
      return res.status(422).json({ message: 'User already exists' });
    }

    // Hash password with appropriate salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Log for debugging (remove in production)
    console.log("Registering user:", normalizedEmail);
    console.log("Original password (for debugging):", password);
    console.log("Hashed password:", hashedPassword);

    // Create user
    const result = await db.collection('users').insertOne({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      createdAt: new Date()
    });

    // Return success
    res.status(201).json({ message: 'User created', userId: result.insertedId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
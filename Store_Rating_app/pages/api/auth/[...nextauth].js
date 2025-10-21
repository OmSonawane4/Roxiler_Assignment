import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../../utils/db';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Connect to the database
          const { db } = await connectToDatabase();
          
          // Normalize email (lowercase and trim) - same as in registration
          const normalizedEmail = credentials.email.toLowerCase().trim();
          
          // Find user by exact email match
          const user = await db.collection('users').findOne({ 
            email: normalizedEmail
          });
          
          // Debug logs
          console.log("Login attempt for email:", normalizedEmail);
          console.log("User found:", user ? "Yes" : "No");
          
          // If no user found, return null
          if (!user) {
            console.log("No user found with this email");
            return null;
          }
          
          // Check if password matches
          console.log("Comparing passwords...");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password match:", isValid ? "Yes" : "No");
          
          if (!isValid) {
            console.log("Password doesn't match");
            return null;
          }
          
          // Return user object without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'user'
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // Add user info to the token when first created
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Add user info from token to the session
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-for-development',
  debug: true, // Enable debug mode to see more logs
});
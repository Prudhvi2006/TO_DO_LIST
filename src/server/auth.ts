import { Request, Response, NextFunction } from 'express';
import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.ts';
import { users, userSettings, otpRecords } from '../db/schema.ts';
import { eq, and, desc, gt } from 'drizzle-orm';
import { sendOtpEmail, sendWelcomeCoverLetterEmail, sendPasswordResetEmail } from './email.ts';
import { emitToUser } from './socket.ts';

const JWT_SECRET = process.env.JWT_SECRET?.trim();
if (!JWT_SECRET) throw new Error('JWT_SECRET is required. Set it in the environment before starting OrbitFlow.');

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    timezone: string;
  };
}

export function generateToken(user: { id: number; email: string; name: string; timezone: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      timezone: user.timezone,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = '';

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1].trim();
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      name: string;
      timezone: string;
    };

    // Verify user still exists in database
    const [userRecord] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        timezone: users.timezone,
      })
      .from(users)
      .where(eq(users.id, decoded.id));

    if (!userRecord) {
      return res.status(401).json({ error: 'Unauthorized: User account no longer exists' });
    }

    req.user = userRecord;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Unauthorized: Session token invalid or expired' });
  }
};

// Route handlers for authentication
export async function handleSendOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check resend cooldown (20 seconds cooldown)
    const [latestOtp] = await db
      .select()
      .from(otpRecords)
      .where(eq(otpRecords.email, normalizedEmail))
      .orderBy(desc(otpRecords.createdAt))
      .limit(1);

    if (latestOtp && latestOtp.lastSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(latestOtp.lastSentAt).getTime()) / 1000);
      if (elapsedSeconds < 20) {
        return res.status(429).json({
          error: `Please wait ${20 - elapsedSeconds}s before requesting a new code.`,
          retryAfter: 20 - elapsedSeconds,
        });
      }
    }

    // Generate real cryptographically random 6-digit OTP
    const rawOtp = randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(otpRecords).values({
      email: normalizedEmail,
      codeHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: new Date(),
      verified: false,
    });

    console.log(`[ASTRONAUT OTP] Dispatched code ${rawOtp} to ${normalizedEmail}`);

    // Check if email already belongs to an existing user
    const [existingUser] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, normalizedEmail));
    const isNewUser = !existingUser;

    // Send real OTP email using SMTP
    const emailResult = await sendOtpEmail(normalizedEmail, rawOtp, isNewUser);

    return res.json({
      success: true,
      message: 'Verification code has been sent to your email address.',
      emailDelivery: emailResult.success ? 'delivered' : 'pending_or_failed',
      emailDeliveryError: emailResult.error || null,
      resendCooldown: 20,
    });
  } catch (err: any) {
    console.error('Error in send-otp:', err);
    return res.status(500).json({ error: 'Failed to generate and dispatch verification code.' });
  }
}

export async function handleVerifyOtp(req: Request, res: Response) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Find latest active unverified OTP for this email
    const [latestOtp] = await db
      .select()
      .from(otpRecords)
      .where(eq(otpRecords.email, normalizedEmail))
      .orderBy(desc(otpRecords.createdAt))
      .limit(1);

    if (!latestOtp) {
      return res.status(400).json({ error: 'No active verification code found for this email. Please request a new code.' });
    }

    if (new Date() > new Date(latestOtp.expiresAt)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (latestOtp.attempts >= latestOtp.maxAttempts) {
      return res.status(400).json({ error: 'Maximum verification attempts exceeded. Please request a new code.' });
    }

    // Check code with bcrypt
    const isMatch = await bcrypt.compare(cleanCode, latestOtp.codeHash);
    if (!isMatch) {
      // Increment attempt counter
      await db
        .update(otpRecords)
        .set({ attempts: latestOtp.attempts + 1 })
        .where(eq(otpRecords.id, latestOtp.id));

      const remaining = latestOtp.maxAttempts - (latestOtp.attempts + 1);
      return res.status(400).json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      });
    }

    // Mark as verified
    await db
      .update(otpRecords)
      .set({ verified: true })
      .where(eq(otpRecords.id, latestOtp.id));

    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id, email: users.email, name: users.name, timezone: users.timezone })
      .from(users)
      .where(eq(users.email, normalizedEmail));

    let token: string | null = null;
    if (existingUser) {
      token = generateToken(existingUser);
    }

    return res.json({
      success: true,
      verified: true,
      email: normalizedEmail,
      isExistingUser: !!existingUser,
      token,
      user: existingUser || null,
      message: existingUser ? 'Welcome back! Astronaut authentication successful.' : 'Email verified successfully.',
    });
  } catch (err: any) {
    console.error('Error verifying OTP:', err);
    return res.status(500).json({ error: 'Failed to verify code due to server error.' });
  }
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const { email, name, password, confirmPassword, timezone } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Registration is allowed only after this email has completed OTP verification.
    const [verifiedOtp] = await db
      .select({ id: otpRecords.id })
      .from(otpRecords)
      .where(and(eq(otpRecords.email, normalizedEmail), eq(otpRecords.verified, true)))
      .orderBy(desc(otpRecords.createdAt))
      .limit(1);
    if (!verifiedOtp) {
      return res.status(400).json({ error: 'Please verify your email with the OTP before creating your account.' });
    }

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userTz = timezone || 'Asia/Kolkata';

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        emailVerified: true,
        timezone: userTz,
        welcomeEmailSent: true,
        welcomeEmailSeen: true,
        welcomeEmailSeenAt: new Date(),
        welcomeNotificationCount: 1,
      })
      .returning();

    // Initialize user settings
    await db.insert(userSettings).values({
      userId: newUser.id,
      timezone: userTz,
      emailNotificationsEnabled: true,
      taskCompletionEmail: true,
      scheduledRemindersEmail: true,
      morningDigestEmail: true,
      morningDigestTime: '08:00',
      missedTaskEmail: true,
    });

    // Dispatch Animated Welcome On Board Cover Letter Email immediately
    try {
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
      const appUrl = process.env.APP_URL || `${proto}://${host}`;
      sendWelcomeCoverLetterEmail(
        normalizedEmail,
        name.trim(),
        newUser.id,
        appUrl,
        false,
        1
      ).catch((err) => {
        console.error('[Auth] Failed to dispatch welcome cover letter email:', err);
      });
    } catch (e) {
      console.error('[Auth] Error initiating welcome email:', e);
    }

    const token = generateToken(newUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        timezone: newUser.timezone,
        welcomeEmailSent: newUser.welcomeEmailSent,
        welcomeEmailSeen: newUser.welcomeEmailSeen,
        welcomeEmailSeenAt: newUser.welcomeEmailSeenAt ? newUser.welcomeEmailSeenAt.toISOString() : null,
        welcomeNotificationCount: newUser.welcomeNotificationCount,
      },
    });
  } catch (err: any) {
    console.error('Error during registration:', err);
    return res.status(500).json({ error: 'Registration failed due to a server error.' });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    if (!user.welcomeEmailSeen) {
      await db
        .update(users)
        .set({ welcomeEmailSeen: true, welcomeEmailSeenAt: new Date() })
        .where(eq(users.id, user.id));
    }

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        welcomeEmailSeen: true,
      },
    });
  } catch (err: any) {
    console.error('Error in login:', err);
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
}

export async function handleForgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify user exists in database
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address. Please check your spelling or sign up.' });
    }

    // Check resend cooldown (15 seconds)
    const [latestOtp] = await db
      .select()
      .from(otpRecords)
      .where(eq(otpRecords.email, normalizedEmail))
      .orderBy(desc(otpRecords.createdAt))
      .limit(1);

    if (latestOtp && latestOtp.lastSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(latestOtp.lastSentAt).getTime()) / 1000);
      if (elapsedSeconds < 15) {
        return res.status(429).json({
          error: `Please wait ${15 - elapsedSeconds}s before requesting a new code.`,
          retryAfter: 15 - elapsedSeconds,
        });
      }
    }

    // Generate real cryptographically random 6-digit OTP
    const rawOtp = randomInt(100000, 1000000).toString();
    const codeHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(otpRecords).values({
      email: normalizedEmail,
      codeHash,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      lastSentAt: new Date(),
      verified: false,
    });

    console.log(`[PASSWORD RESET OTP] Dispatched code ${rawOtp} to ${normalizedEmail}`);

    // Send real Password Reset email using SMTP
    const emailResult = await sendPasswordResetEmail(normalizedEmail, rawOtp);

    return res.json({
      success: true,
      message: `Password reset code sent to ${normalizedEmail}. Please check your inbox.`,
      emailDelivery: emailResult.success ? 'delivered' : 'pending_or_failed',
      resendCooldown: 15,
    });
  } catch (err: any) {
    console.error('Error in forgot-password:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
}

export async function handleResetPassword(req: Request, res: Response) {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // Check user exists
    const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Check latest active OTP
    const [latestOtp] = await db
      .select()
      .from(otpRecords)
      .where(eq(otpRecords.email, normalizedEmail))
      .orderBy(desc(otpRecords.createdAt))
      .limit(1);

    if (!latestOtp) {
      return res.status(400).json({ error: 'No active reset code found. Please request a new code.' });
    }

    if (new Date() > new Date(latestOtp.expiresAt)) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    if (latestOtp.attempts >= latestOtp.maxAttempts) {
      return res.status(400).json({ error: 'Maximum attempts exceeded. Please request a new reset code.' });
    }

    // Compare code
    const isMatch = await bcrypt.compare(cleanCode, latestOtp.codeHash);
    if (!isMatch) {
      await db
        .update(otpRecords)
        .set({ attempts: latestOtp.attempts + 1 })
        .where(eq(otpRecords.id, latestOtp.id));

      const remaining = latestOtp.maxAttempts - (latestOtp.attempts + 1);
      return res.status(400).json({
        error: `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      });
    }

    // Mark OTP as verified
    await db
      .update(otpRecords)
      .set({ verified: true })
      .where(eq(otpRecords.id, latestOtp.id));

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const [updatedUser] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id))
      .returning();

    const token = generateToken(updatedUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        timezone: updatedUser.timezone,
        welcomeEmailSeen: updatedUser.welcomeEmailSeen,
      },
      message: 'Password has been successfully reset! You are now signed in.',
    });
  } catch (err: any) {
    console.error('Error in reset-password:', err);
    return res.status(500).json({ error: 'Failed to reset password due to a server error.' });
  }
}

export async function handleGetMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, req.user.id));

    return res.json({
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        timezone: userRecord.timezone,
        welcomeEmailSent: userRecord.welcomeEmailSent,
        welcomeEmailSeen: userRecord.welcomeEmailSeen,
        welcomeEmailSeenAt: userRecord.welcomeEmailSeenAt ? userRecord.welcomeEmailSeenAt.toISOString() : null,
        welcomeNotificationCount: userRecord.welcomeNotificationCount,
        createdAt: userRecord.createdAt,
      },
      settings: settings || null,
    });
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

export async function handleConfirmWelcomeEmail(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const now = new Date();
    const [updated] = await db
      .update(users)
      .set({
        welcomeEmailSeen: true,
        welcomeEmailSeenAt: now,
      })
      .where(eq(users.id, req.user.id))
      .returning();

    emitToUser(req.user.id, 'welcome_email_seen_confirmed', {
      seen: true,
      seenAt: now.toISOString(),
    });

    return res.json({
      success: true,
      message: 'Welcome email receipt confirmed successfully.',
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        timezone: updated.timezone,
        welcomeEmailSent: updated.welcomeEmailSent,
        welcomeEmailSeen: updated.welcomeEmailSeen,
        welcomeEmailSeenAt: updated.welcomeEmailSeenAt ? updated.welcomeEmailSeenAt.toISOString() : null,
        welcomeNotificationCount: updated.welcomeNotificationCount,
      },
    });
  } catch (err: any) {
    console.error('Error confirming welcome email:', err);
    return res.status(500).json({ error: 'Failed to confirm welcome email.' });
  }
}

export async function handleResendWelcomeEmail(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, req.user.id));
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nextCount = (userRecord.welcomeNotificationCount || 0) + 1;
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const appUrl = `${protocol}://${host}`;

    const emailRes = await sendWelcomeCoverLetterEmail(
      userRecord.email,
      userRecord.name,
      userRecord.id,
      appUrl,
      true,
      nextCount
    );

    await db
      .update(users)
      .set({
        welcomeEmailLastNotifiedAt: new Date(),
        welcomeNotificationCount: nextCount,
      })
      .where(eq(users.id, userRecord.id));

    return res.json({
      success: true,
      message: emailRes.success
        ? `Welcome cover letter re-dispatched to ${userRecord.email}.`
        : `Notification logged (${emailRes.error || 'SMTP delivery pending'}).`,
      notificationCount: nextCount,
    });
  } catch (err: any) {
    console.error('Error resending welcome email:', err);
    return res.status(500).json({ error: 'Failed to resend welcome email.' });
  }
}

export async function handleFirebaseLogin(req: Request, res: Response) {
  try {
    const { email, name, timezone, uid } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = name ? name.trim() : normalizedEmail.split('@')[0];
    const userTimezone = timezone || 'Asia/Kolkata';

    // Check if user exists
    let [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail));

    let isNewUser = false;
    if (!existingUser) {
      isNewUser = true;
      const dummyHash = await bcrypt.hash(`firebase-auth-oauth-${uid || Date.now()}`, 10);
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          passwordHash: dummyHash,
          name: displayName,
          timezone: userTimezone,
          welcomeEmailSent: false,
          welcomeEmailSeen: false,
          welcomeEmailSeenAt: null,
          welcomeNotificationCount: 0,
        })
        .returning();

      existingUser = newUser;

      // Create default settings
      await db.insert(userSettings).values({
        userId: existingUser.id,
        timezone: userTimezone,
        emailNotificationsEnabled: true,
        taskCompletionEmail: true,
        scheduledRemindersEmail: true,
        morningDigestEmail: true,
        morningDigestTime: '08:00',
        missedTaskEmail: true,
      });

      // Send welcome cover letter email
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
      const appUrl = process.env.APP_URL || `${protocol}://${host}`;

      sendWelcomeCoverLetterEmail(
        existingUser.email,
        existingUser.name,
        existingUser.id,
        appUrl,
        false,
        1
      ).then(async (welcomeRes) => {
        if (welcomeRes.success) {
          await db
            .update(users)
            .set({
              welcomeEmailSent: true,
              welcomeEmailLastNotifiedAt: new Date(),
              welcomeNotificationCount: 1,
            })
            .where(eq(users.id, existingUser.id));
        }
      }).catch((e) => console.error('Error sending welcome email on Google sign-in:', e));
    }

    const token = generateToken({
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      timezone: existingUser.timezone,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    });

    return res.json({
      success: true,
      token,
      isNewUser,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        timezone: existingUser.timezone,
        welcomeEmailSent: existingUser.welcomeEmailSent,
        welcomeEmailSeen: existingUser.welcomeEmailSeen,
        welcomeEmailSeenAt: existingUser.welcomeEmailSeenAt,
        welcomeNotificationCount: existingUser.welcomeNotificationCount,
        createdAt: existingUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Firebase login error:', err);
    return res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
}

export async function handleLogout(req: Request, res: Response) {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully.' });
}

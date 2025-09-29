import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    email = String(email).trim().toLowerCase();
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ message: 'User already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (e) {
    res.status(500).json({ message: 'Signup failed', error: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const identifier = req.body.email ?? req.body.name ?? req.body.username;
    if (!identifier || !password) return res.status(400).json({ message: 'Missing fields' });

    // Try lookups by common fields
    let user = null;
    console.log('[LOGIN] Attempt with identifier=', identifier);
    // 1) email field (case-insensitive)
    const looksEmail = /.+@.+\..+/.test(identifier);
    if (looksEmail) {
      user = await User.findOne({ email: identifier.toLowerCase() });
      if (!user) user = await User.findOne({ email: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, 'i') });
    }
    // 2) username field
    if (!user) user = await User.findOne({ username: identifier });
    // 3) name field (handles swapped or UI sending name)
    if (!user) user = await User.findOne({ name: identifier });
    if (!user) {
      console.log('[LOGIN] User not found for identifier');
      return res.status(401).json({ message: 'User not found' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log('[LOGIN] Incorrect password for user', user._id.toString());
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // If email and name appear swapped in DB, fix them now
    const emailLooksWrong = !(typeof user.email === 'string' && /.+@.+\..+/.test(user.email));
    const nameLooksEmail = typeof user.name === 'string' && /.+@.+\..+/.test(user.name);
    if (emailLooksWrong && nameLooksEmail) {
      const oldEmail = user.email;
      user.email = user.name;
      user.name = oldEmail || '';
      try { await user.save(); } catch (e) { /* ignore save error to not break login */ }
    }
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: 'Login failed', error: e.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch user', error: e.message });
  }
};

// Update current user's profile (username/email)
export const updateMe = async (req, res) => {
  try {
    const { username, email, name, phone, profilePic } = req.body || {};
    if (!username && !email && !name && !phone && !profilePic) return res.status(400).json({ message: 'Nothing to update' });

    // Ensure unique constraints for username and email if changed
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof phone !== 'undefined') updates.phone = phone;
    if (typeof profilePic !== 'undefined') updates.profilePic = profilePic;

    if (username) {
      const existsU = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existsU) return res.status(409).json({ message: 'Username already taken' });
    }
    if (email) {
      const existsE = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existsE) return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update user', error: e.message });
  }
};

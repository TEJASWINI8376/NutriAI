const {
  createHash,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} = require('node:crypto');

const DEFAULT_SESSION_TTL_MS = 60 * 60 * 1000;
const SCRYPT_COST = 14;

function hashPassword(password) {
  const salt = randomBytes(16);
  const digest = scryptSync(password, salt, 64, { N: 2 ** SCRYPT_COST });
  return `${salt.toString('hex')}:${digest.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  const [saltHex, digestHex] = storedHash.split(':');
  if (!saltHex || !digestHex) {
    return false;
  }

  const expectedDigest = Buffer.from(digestHex, 'hex');
  const actualDigest = scryptSync(password, Buffer.from(saltHex, 'hex'), expectedDigest.length, {
    N: 2 ** SCRYPT_COST,
  });

  return expectedDigest.length === actualDigest.length && timingSafeEqual(expectedDigest, actualDigest);
}

class AuthService {
  constructor({ sessionTtlMs = DEFAULT_SESSION_TTL_MS, now = () => Date.now() } = {}) {
    this.sessionTtlMs = sessionTtlMs;
    this.now = now;
    this.users = new Map();
    this.sessions = new Map();
  }

  register(email, password) {
    const normalizedEmail = this.normalizeEmail(email);
    this.validatePassword(password);

    if (this.users.has(normalizedEmail)) {
      throw new Error('An account with this email already exists');
    }

    const user = { id: randomUUID(), email: normalizedEmail, passwordHash: hashPassword(password) };
    this.users.set(normalizedEmail, user);
    return this.publicUser(user);
  }

  login(email, password) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = this.users.get(normalizedEmail);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid email or password');
    }

    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, { userId: user.id, expiresAt: this.now() + this.sessionTtlMs });
    return { token, user: this.publicUser(user) };
  }

  authenticate(token) {
    const session = this.sessions.get(token);
    if (!session || session.expiresAt <= this.now()) {
      this.sessions.delete(token);
      return null;
    }

    for (const user of this.users.values()) {
      if (user.id === session.userId) {
        return this.publicUser(user);
      }
    }

    return null;
  }

  logout(token) {
    this.sessions.delete(token);
  }

  normalizeEmail(email) {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('A valid email is required');
    }

    return email.trim().toLowerCase();
  }

  validatePassword(password) {
    if (typeof password !== 'string' || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  }

  publicUser(user) {
    return { id: user.id, email: user.email };
  }
}

module.exports = { AuthService };
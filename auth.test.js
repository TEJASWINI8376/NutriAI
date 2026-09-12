const assert = require('node:assert/strict');
const test = require('node:test');
const { AuthService } = require('./auth');

test('registers users without exposing password hashes', () => {
  const auth = new AuthService();
  const user = auth.register('Patient@Example.com', 'correct horse battery staple');

  assert.equal(user.email, 'patient@example.com');
  assert.equal('passwordHash' in user, false);
});

test('logs in with a valid password and authenticates the session', () => {
  const auth = new AuthService();
  const registered = auth.register('patient@example.com', 'correct horse battery staple');
  const session = auth.login('PATIENT@example.com', 'correct horse battery staple');

  assert.deepEqual(auth.authenticate(session.token), registered);
  auth.logout(session.token);
  assert.equal(auth.authenticate(session.token), null);
});

test('rejects an invalid password', () => {
  const auth = new AuthService();
  auth.register('patient@example.com', 'correct horse battery staple');

  assert.throws(
    () => auth.login('patient@example.com', 'wrong password'),
    /Invalid email or password/,
  );
});

test('expires sessions', () => {
  let currentTime = 1000;
  const auth = new AuthService({ sessionTtlMs: 100, now: () => currentTime });
  auth.register('patient@example.com', 'correct horse battery staple');
  const session = auth.login('patient@example.com', 'correct horse battery staple');

  currentTime += 101;
  assert.equal(auth.authenticate(session.token), null);
});

test('rejects duplicate email addresses', () => {
  const auth = new AuthService();
  auth.register('patient@example.com', 'correct horse battery staple');

  assert.throws(
    () => auth.register('PATIENT@example.com', 'another secure password'),
    /already exists/,
  );
});
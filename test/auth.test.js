const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, createBrowserEnv } = require('./helpers/context');

describe('Authentication & Password Protection Unit Tests', () => {
  let env;
  let auth;

  beforeEach(() => {
    env = createBrowserEnv();
    auth = loadScript('js/auth.js', env, ';window.DantewadaAuth');
  });

  test('Initial state requires authentication when no token is saved', () => {
    assert.equal(auth.isAuthenticated(), false);
  });

  test('verifyPassword accepts default administrative passwords and rejects invalid passwords', () => {
    assert.equal(auth.verifyPassword('admin123'), true);
    assert.equal(auth.verifyPassword('dantewada@2026'), true);
    assert.equal(auth.verifyPassword('admin@2026'), true);
    assert.equal(auth.verifyPassword('dantewada'), true);
    assert.equal(auth.verifyPassword('admin'), true);

    // Rejections
    assert.equal(auth.verifyPassword('wrongpass'), false);
    assert.equal(auth.verifyPassword(''), false);
    assert.equal(auth.verifyPassword(null), false);
  });

  test('authenticateWithPassword grants access and creates session on valid password', () => {
    const res = auth.authenticateWithPassword('usr_super', 'admin123', true);
    assert.equal(res.success, true);
    assert.ok(res.token);
    assert.equal(res.user.role, 'super_admin');
    assert.equal(auth.isAuthenticated(), true);
  });

  test('authenticateWithPassword rejects invalid password with clear error message', () => {
    const res = auth.authenticateWithPassword('usr_super', 'incorrect_password');
    assert.equal(res.success, false);
    assert.match(res.message, /अमान्य पासवर्ड|Incorrect Password/);
    assert.equal(auth.isAuthenticated(), false);
  });

  test('logout removes active session token and locks portal', () => {
    auth.authenticateWithPassword('usr_super', 'admin123', true);
    assert.equal(auth.isAuthenticated(), true);

    auth.logout();
    assert.equal(auth.isAuthenticated(), false);
  });

  test('setAdminPassword allows updating custom password and authenticates with new password', () => {
    const updateRes = auth.setAdminPassword('admin123', 'newSecret@2026');
    assert.equal(updateRes.success, true);

    assert.equal(auth.verifyPassword('newSecret@2026'), true);

    const loginRes = auth.authenticateWithPassword('usr_super', 'newSecret@2026');
    assert.equal(loginRes.success, true);
    assert.equal(auth.isAuthenticated(), true);
  });

  test('Employment Officer is configured as Super Admin with full administrative privileges', () => {
    const res = auth.authenticateWithPassword('usr_dist', 'admin123', true);
    assert.equal(res.success, true);
    assert.equal(res.user.role, 'super_admin');
    assert.match(res.user.name, /Employment Officer|रोजगार अधिकारी/i);
    assert.equal(auth.can('all'), true);
    assert.equal(auth.can('audit_logs'), true);
    assert.equal(auth.can('settings'), true);
    assert.equal(auth.can('youth_delete'), true);
  });

  test('Preset users list only contains Employment Officer as Super Admin and removed other users', () => {
    const users = auth.getAllPresetUsers();
    assert.equal(users.length, 1);
    assert.equal(users[0].role, 'super_admin');
    assert.match(users[0].name, /Employment Officer|रोजगार अधिकारी/i);
  });
});

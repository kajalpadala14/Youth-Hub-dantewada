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

  test('User & Role Management: creates custom user, authenticates with ID/pass, updates pass, and deletes', () => {
    // 1. Create a new custom user with username, role, and password
    const createRes = auth.addUser({
      name: 'Ramesh Patel',
      username: 'geedam_coord',
      password: 'coord@Password2026',
      role: 'block_officer',
      block: 'Geedam'
    });
    assert.equal(createRes.success, true);
    assert.ok(createRes.user.id);
    assert.equal(createRes.user.username, 'geedam_coord');

    // 2. Reject duplicate username
    const dupRes = auth.addUser({
      name: 'Duplicate Ramesh',
      username: 'geedam_coord',
      password: 'somepassword'
    });
    assert.equal(dupRes.success, false);
    assert.match(dupRes.message, /पहले से उपयोग में है/);

    // 3. User appears in getAllUsers()
    const allUsers = auth.getAllUsers();
    assert.ok(allUsers.some(u => u.username === 'geedam_coord'));

    // 4. Authenticate with custom username and custom password
    const loginRes = auth.authenticateWithPassword('geedam_coord', 'coord@Password2026');
    assert.equal(loginRes.success, true);
    assert.equal(loginRes.user.username, 'geedam_coord');
    assert.equal(loginRes.user.role, 'block_officer');
    assert.equal(auth.isAuthenticated(), true);

    // 5. Reject wrong password for custom user
    const wrongPassRes = auth.authenticateWithPassword('geedam_coord', 'wrongpass');
    assert.equal(wrongPassRes.success, false);

    // 6. Update user's password
    const passUpdateRes = auth.updateUserPassword(createRes.user.id, 'newCoordPass456');
    assert.equal(passUpdateRes.success, true);
    const newLoginRes = auth.authenticateWithPassword('geedam_coord', 'newCoordPass456');
    assert.equal(newLoginRes.success, true);

    // 7. Create a custom role
    const roleRes = auth.addCustomRole({
      id: 'skill_mitra',
      name: 'Skill Mitra',
      nameHi: 'कौशल मित्र',
      permissions: ['youth_read', 'youth_write']
    });
    assert.equal(roleRes.success, true);
    const roleDetails = auth.getRoleDetails('skill_mitra');
    assert.equal(roleDetails.name, 'Skill Mitra');
    assert.equal(JSON.stringify(roleDetails.permissions), JSON.stringify(['youth_read', 'youth_write']));

    // 8. Delete user
    const delRes = auth.deleteUser(createRes.user.id);
    assert.equal(delRes.success, true);
    const usersAfterDel = auth.getAllUsers();
    assert.equal(usersAfterDel.some(u => u.username === 'geedam_coord'), false);

    // 9. Protect Super Admin from being deleted
    const delSuperRes = auth.deleteUser('usr_super');
    assert.equal(delSuperRes.success, false);
  });
});

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, createBrowserEnv } = require('./helpers/context');

describe('API Module Unit Tests', () => {
  let env;
  let API;

  beforeEach(() => {
    env = createBrowserEnv();
    API = loadScript('js/api.js', env, ';API');
  });

  test('Session handling stores and retrieves token and user profile', () => {
    assert.equal(API.getToken(), '');
    assert.equal(API.getCurrentUser(), null);

    const mockUser = {
      id: 'USR-001',
      name: 'Test Admin',
      email: 'admin@dantewada.gov.in',
      role: 'ADMIN',
    };
    API.setSession('test-token-12345', mockUser);

    assert.equal(API.getToken(), 'test-token-12345');
    assert.deepEqual({ ...API.getCurrentUser() }, mockUser);
  });

  test('clearSession removes stored token and user profile', () => {
    API.setSession('token-to-clear', { name: 'Operator' });
    assert.equal(API.getToken(), 'token-to-clear');

    API.clearSession();
    assert.equal(API.getToken(), '');
    assert.equal(API.getCurrentUser(), null);
  });

  test('API URL configuration gets and sets correctly with whitespace trimming', () => {
    assert.equal(API.getApiUrl(), '');

    API.setApiUrl('  https://script.google.com/macros/s/SAMPLE/exec   ');
    assert.equal(API.getApiUrl(), 'https://script.google.com/macros/s/SAMPLE/exec');
  });

  test('call() fails gracefully when API URL is not set', async () => {
    API.clearSession();
    const result = await API.call('getDashboardKpis');
    assert.equal(result.success, false);
    assert.match(result.message, /URL is not configured/i);
  });
});

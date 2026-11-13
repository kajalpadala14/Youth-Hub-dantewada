const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, createBrowserEnv } = require('./helpers/context');

describe('Photo & Drive Module Unit Tests (photo.js)', () => {
  let env;
  let PhotoModule;

  beforeEach(() => {
    env = createBrowserEnv();
    env.window.API = {
      call: async (action, payload) => {
        if (action === 'uploadModulePhoto') {
          return {
            success: true,
            fileId: 'DRIVE_FILE_999',
            fileUrl: 'https://drive.google.com/file/d/DRIVE_FILE_999/view',
            fileName: payload.fileName || 'photo.jpg',
            mimeType: payload.mimeType || 'image/jpeg'
          };
        }
        if (action === 'saveFieldVisit') {
          return { success: true, sheet: 'Field_Visits', rowNumber: 5 };
        }
        if (action === 'saveSuccessStory') {
          return { success: true, sheet: 'Success_Stories', rowNumber: 2 };
        }
        return { success: true };
      }
    };
    env.window.DantewadaDB = {
      saveFieldVisit: (v) => v,
      saveSuccessStory: (s) => s
    };

    PhotoModule = loadScript('js/photo.js', env, ';window.PhotoModule');
  });

  test('formatDriveUrl converts various Google Drive links to direct high-res CDN URLs', () => {
    const driveViewUrl = 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing';
    const directUrl = PhotoModule.formatDriveUrl(driveViewUrl);
    assert.equal(directUrl, 'https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9I0J');

    const driveOpenUrl = 'https://drive.google.com/open?id=FILE_ABC_XYZ';
    assert.equal(PhotoModule.formatDriveUrl(driveOpenUrl), 'https://lh3.googleusercontent.com/d/FILE_ABC_XYZ');

    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ';
    assert.equal(PhotoModule.formatDriveUrl(dataUrl), dataUrl);
  });

  test('saveFieldVisit processes photos and saves to Field_Visits sheet', async () => {
    const visitData = {
      id: 'VIS-TEST-001',
      date: '2026-11-13',
      officerName: 'Anita Mandavi',
      block: 'Geedam',
      purpose: 'Field Inspection',
      status: 'Verified'
    };

    const photos = [
      { url: 'data:image/jpeg;base64,abc12345', caption: 'Front Proof', type: 'Inspection' },
      { url: 'https://drive.google.com/file/d/EXISTING_PHOTO/view', caption: 'Existing Proof' }
    ];

    const result = await PhotoModule.saveFieldVisit(visitData, photos);
    assert.equal(result.success, true);
    assert.equal(result.visitId, 'VIS-TEST-001');
    assert.equal(result.photosCount, 2);
    assert.equal(result.record.photos[0].url, 'https://drive.google.com/file/d/DRIVE_FILE_999/view');
  });

  test('saveSuccessStory processes media and saves to Success_Stories sheet', async () => {
    const storyData = {
      id: 'STR-TEST-001',
      youthName: 'Sunita Kashyap',
      village: 'Barsoor',
      block: 'Geedam',
      title: 'Success Story in Mushroom Farming',
      summary: 'Trained and established enterprise'
    };

    const result = await PhotoModule.saveSuccessStory(storyData, 'data:image/jpeg;base64,photoData');
    assert.equal(result.success, true);
    assert.equal(result.storyId, 'STR-TEST-001');
    assert.equal(result.mediaUrl, 'https://drive.google.com/file/d/DRIVE_FILE_999/view');
  });
});

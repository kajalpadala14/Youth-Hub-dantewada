const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { loadScript, createBrowserEnv } = require('./helpers/context');

describe('Photo & Drive Module Unit Tests (photo.js)', () => {
  let env;
  let PhotoModule;
  let apiCallLog = [];

  beforeEach(() => {
    env = createBrowserEnv();
    apiCallLog = [];

    env.window.API = {
      call: async (action, payload) => {
        apiCallLog.push({ action, payload });

        if (action === 'uploadModulePhoto') {
          return {
            success: true,
            fileId: 'DRIVE_FILE_' + Math.floor(Math.random() * 10000),
            fileUrl: 'https://drive.google.com/file/d/DRIVE_FILE_999/view?usp=sharing',
            directUrl: 'https://lh3.googleusercontent.com/d/DRIVE_FILE_999',
            originalFileName: payload.originalFileName || payload.fileName || 'photo.jpg',
            fileName: payload.fileName || 'photo_unique.jpg',
            mimeType: payload.mimeType || 'image/jpeg',
            folderId: payload.folderId || '1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO',
            uploadedAt: new Date().toISOString()
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

  test('Configured destination Google Drive Folder ID is 1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO', () => {
    assert.equal(PhotoModule.TARGET_DRIVE_FOLDER_ID, '1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO');
    assert.ok(PhotoModule.TARGET_DRIVE_FOLDER_URL.includes('1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO'));
  });

  test('formatDriveUrl converts various Google Drive links to direct high-res CDN URLs', () => {
    const driveViewUrl = 'https://drive.google.com/file/d/1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO/view?usp=sharing';
    const directUrl = PhotoModule.formatDriveUrl(driveViewUrl);
    assert.equal(directUrl, 'https://lh3.googleusercontent.com/d/1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO');

    const driveOpenUrl = 'https://drive.google.com/open?id=FILE_ABC_XYZ';
    assert.equal(PhotoModule.formatDriveUrl(driveOpenUrl), 'https://lh3.googleusercontent.com/d/FILE_ABC_XYZ');

    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ';
    assert.equal(PhotoModule.formatDriveUrl(dataUrl), dataUrl);
  });

  test('validateFile permits JPG, JPEG, PNG, WEBP and PDF under 15MB, rejects others', () => {
    const validJpg = { name: 'inspection.jpg', type: 'image/jpeg', size: 1024 * 500 };
    assert.equal(PhotoModule.validateFile(validJpg).valid, true);

    const validPng = { name: 'youth_proof.png', type: 'image/png', size: 1024 * 800 };
    assert.equal(PhotoModule.validateFile(validPng).valid, true);

    const validWebp = { name: 'photo.webp', type: 'image/webp', size: 1024 * 200 };
    assert.equal(PhotoModule.validateFile(validWebp).valid, true);

    const validPdf = { name: 'case_study.pdf', type: 'application/pdf', size: 1024 * 1024 * 2 };
    assert.equal(PhotoModule.validateFile(validPdf).valid, true);

    const oversized = { name: 'heavy.jpg', type: 'image/jpeg', size: 16 * 1024 * 1024 };
    assert.equal(PhotoModule.validateFile(oversized).valid, false);

    const invalidType = { name: 'script.exe', type: 'application/x-msdownload', size: 1024 };
    assert.equal(PhotoModule.validateFile(invalidType).valid, false);
  });

  test('uploadToDrive sends request to target Google Drive folder with retry handling', async () => {
    const res = await PhotoModule.uploadToDrive('data:image/jpeg;base64,mockdata', 'Field_Visits', 'village_inspection.jpg');
    assert.equal(res.success, true);
    assert.ok(res.fileId);
    assert.ok(res.directUrl.startsWith('https://lh3.googleusercontent.com/d/'));
    assert.equal(res.folderId, '1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO');

    const lastApiCall = apiCallLog.find(c => c.action === 'uploadModulePhoto');
    assert.ok(lastApiCall);
    assert.equal(lastApiCall.payload.folderId, '1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO');
    assert.equal(lastApiCall.payload.module, 'Field_Visits');
  });

  test('uploadMultiplePhotos uploads batch and triggers progress callback', async () => {
    const photos = [
      { url: 'data:image/jpeg;base64,photo1', fileName: 'proof1.jpg', caption: 'Before' },
      { url: 'data:image/jpeg;base64,photo2', fileName: 'proof2.jpg', caption: 'After' }
    ];

    const progressReports = [];
    const results = await PhotoModule.uploadMultiplePhotos(photos, {
      moduleName: 'Field_Visits',
      onProgress: (p) => progressReports.push(p)
    });

    assert.equal(results.length, 2);
    assert.ok(progressReports.length >= 2);
    assert.equal(progressReports[progressReports.length - 1].percent, 100);
  });

  test('saveFieldVisit handles submissions with photos and populates All_Photos_JSON', async () => {
    const visitData = {
      id: 'VIS-TEST-001',
      date: '2026-11-16',
      officerName: 'Anita Mandavi',
      block: 'Geedam',
      purpose: 'Field Inspection',
      status: 'Verified'
    };

    const photos = [
      { url: 'data:image/jpeg;base64,abc12345', fileName: 'site_survey.jpg', caption: 'Front Proof', type: 'Inspection' },
      { url: 'https://drive.google.com/file/d/EXISTING_PHOTO/view', caption: 'Existing Proof' }
    ];

    const progressLogs = [];
    const result = await PhotoModule.saveFieldVisit(visitData, photos, (p) => progressLogs.push(p));

    assert.equal(result.success, true);
    assert.equal(result.visitId, 'VIS-TEST-001');
    assert.equal(result.photosCount, 2);
    assert.ok(result.record.photos[0].url);

    const saveCall = apiCallLog.find(c => c.action === 'saveFieldVisit');
    assert.ok(saveCall);
    const rec = saveCall.payload.record;
    assert.ok(rec.Photo_1_Link);
    assert.ok(rec.All_Photos_JSON);
    const parsedJson = JSON.parse(rec.All_Photos_JSON);
    assert.equal(parsedJson.length, 2);
    assert.ok(parsedJson[0].fileId);
  });

  test('saveFieldVisit allows submissions without photos gracefully', async () => {
    const visitData = {
      id: 'VIS-NO-PHOTO',
      date: '2026-11-16',
      officerName: 'Dinesh Kumar',
      block: 'Katekalyan',
      status: 'Verified'
    };

    const result = await PhotoModule.saveFieldVisit(visitData, []);
    assert.equal(result.success, true);
    assert.equal(result.photosCount, 0);

    const saveCall = apiCallLog.find(c => c.action === 'saveFieldVisit');
    assert.ok(saveCall);
    assert.equal(saveCall.payload.record.Photo_1_Link, '');
    assert.equal(saveCall.payload.record.All_Photos_JSON, '[]');
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
    assert.ok(result.mediaUrl);

    const saveCall = apiCallLog.find(c => c.action === 'saveSuccessStory');
    assert.ok(saveCall);
    assert.equal(saveCall.payload.record.Photo_Link, result.mediaUrl);
  });

  test('extractDriveFileId extracts file IDs from various link formats', () => {
    assert.equal(PhotoModule.extractDriveFileId('https://drive.google.com/file/d/1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO/view?usp=sharing'), '1FsudcSoQWifOd4gyKrRoTHfe2elzLRzO');
    assert.equal(PhotoModule.extractDriveFileId('https://drive.google.com/open?id=ABC_XYZ_123'), 'ABC_XYZ_123');
    assert.equal(PhotoModule.extractDriveFileId('https://lh3.googleusercontent.com/d/FILE_TEST_999'), 'FILE_TEST_999');
    assert.equal(PhotoModule.extractDriveFileId('data:image/jpeg;base64,data'), '');
    assert.equal(PhotoModule.extractDriveFileId(''), '');
  });

  test('formatDriveThumbnail generates valid Google Drive thumbnail links', () => {
    const thumb = PhotoModule.formatDriveThumbnail('https://drive.google.com/file/d/TEST_FILE_ID/view?usp=sharing', 'w800');
    assert.equal(thumb, 'https://drive.google.com/thumbnail?id=TEST_FILE_ID&sz=w800');

    const regularImg = 'https://example.com/photo.jpg';
    assert.equal(PhotoModule.formatDriveThumbnail(regularImg), regularImg);
  });

  test('deleteDriveFile and deleteSuccessStory trigger backend deletion calls', async () => {
    const driveRes = await PhotoModule.deleteDriveFile('https://drive.google.com/file/d/DRIVE_DEL_123/view');
    assert.equal(driveRes.success, true);
    const delCall = apiCallLog.find(c => c.action === 'deleteDriveFile');
    assert.ok(delCall);
    assert.equal(delCall.payload.fileId, 'DRIVE_DEL_123');

    const storyRes = await PhotoModule.deleteSuccessStory('STR-TEST-001', 'https://drive.google.com/file/d/PHOTO_DEL_456/view');
    assert.equal(storyRes.success, true);
    const storyCall = apiCallLog.find(c => c.action === 'deleteSuccessStory');
    assert.ok(storyCall);
    assert.equal(storyCall.payload.storyId, 'STR-TEST-001');
    assert.equal(storyCall.payload.fileId, 'PHOTO_DEL_456');

    const visitRes = await PhotoModule.deleteFieldVisit('VIS-TEST-001', ['https://drive.google.com/file/d/VISIT_PHOTO_789/view']);
    assert.equal(visitRes.success, true);
    const visitCall = apiCallLog.find(c => c.action === 'deleteFieldVisit');
    assert.ok(visitCall);
    assert.equal(visitCall.payload.visitId, 'VIS-TEST-001');
    assert.equal(visitCall.payload.fileIds.length, 1);
    assert.equal(visitCall.payload.fileIds[0], 'VISIT_PHOTO_789');
  });
});

/**
 * =========================================================================
 * YOUTH HUB DANTEWADA - PHOTO & DRIVE MODULE (photo.js)
 * =========================================================================
 * Comprehensive Media, Google Drive Upload & Sheet Integration for:
 * 1. Field Visits (Photo 1-5, Inspection Proofs, Captions)
 * 2. Success Stories (Featured Candidate Photos & PDF Dossiers)
 *
 * Capabilities:
 * - HTML5 Canvas client-side compression (reduces 10MB camera shots to ~80KB)
 * - Google Drive Web App upload with public shareable link creation
 * - Google Drive URL normalization for direct high-speed thumbnail display
 * - Automatic mapping into Google Sheet columns (Photo_1_Link..Photo_5_Link, Photo_Link)
 * - Offline/local fallback if Drive authorization is pending
 * =========================================================================
 */

(function (window) {
  'use strict';

  // -------------------------------------------------------------
  // 1. Google Drive URL Normalization
  // -------------------------------------------------------------
  /**
   * Converts Google Drive share links into direct-embed image URLs
   * that display inside <img> tags without Google login redirects.
   */
  function formatDriveUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();

    // Already a data-URI or standard image
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }

    // Extract Google Drive File ID
    let fileId = null;
    const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) fileId = match1[1];

    if (!fileId) {
      const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match2 && match2[1]) fileId = match2[1];
    }

    if (!fileId) {
      const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match3 && match3[1]) fileId = match3[1];
    }

    if (fileId) {
      // Google User Content CDN delivers high-res direct image
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    return trimmed;
  }

  // -------------------------------------------------------------
  // 2. Client-Side Image Compression (Canvas)
  // -------------------------------------------------------------
  /**
   * Compresses image using HTML5 Canvas to ensure fast upload (<150KB)
   *
   * @param {File|Blob} file Image file from input
   * @param {number} [maxWidth=1280] Max width in pixels
   * @param {number} [maxHeight=960] Max height in pixels
   * @param {number} [quality=0.78] JPEG compression quality
   * @return {Promise<{base64Data: string, mimeType: string, fileName: string}>}
   */
  function compressImage(file, maxWidth = 1280, maxHeight = 960, quality = 0.78) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error('No file provided for compression.'));
      }

      // If it's a PDF, do not compress via canvas
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            base64Data: e.target.result,
            mimeType: 'application/pdf',
            fileName: file.name
          });
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file.'));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({
            base64Data: compressedDataUrl,
            mimeType: 'image/jpeg',
            fileName: (file.name ? file.name.replace(/\.[^/.]+$/, '') : 'photo') + '.jpg'
          });
        };
        img.onerror = () => reject(new Error('Image failed to decode in browser.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsDataURL(file);
    });
  }

  // -------------------------------------------------------------
  // 3. Drive Upload Core
  // -------------------------------------------------------------
  /**
   * Uploads photo or document to Google Drive via backend Apps Script
   */
  async function uploadToDrive(fileOrData, moduleName = 'Field_Visits', optionalName = '') {
    if (!window.API || typeof window.API.call !== 'function') {
      throw new Error('API communication layer is unavailable.');
    }

    let payload = {};

    const isFileOrBlob = (typeof File !== 'undefined' && fileOrData instanceof File) ||
                         (typeof Blob !== 'undefined' && fileOrData instanceof Blob);
    if (isFileOrBlob) {
      const compressed = await compressImage(fileOrData);
      payload = {
        module: moduleName,
        fileName: optionalName || compressed.fileName,
        mimeType: compressed.mimeType,
        base64Data: compressed.base64Data
      };
    } else if (typeof fileOrData === 'object' && fileOrData.base64Data) {
      payload = {
        module: moduleName,
        fileName: optionalName || fileOrData.fileName || `upload_${Date.now()}.jpg`,
        mimeType: fileOrData.mimeType || 'image/jpeg',
        base64Data: fileOrData.base64Data || fileOrData.url
      };
    } else if (typeof fileOrData === 'string') {
      payload = {
        module: moduleName,
        fileName: optionalName || `photo_${Date.now()}.jpg`,
        mimeType: fileOrData.match(/^data:([^;]+);/)?.[1] || 'image/jpeg',
        base64Data: fileOrData
      };
    } else {
      throw new Error('Unsupported photo format.');
    }

    const res = await window.API.call('uploadModulePhoto', payload);
    if (!res || !res.success) {
      // If Drive permissions are pending, we still return a valid usable object
      // so form saving continues without halting operations.
      if (res && res.isLocalFallback && res.fileUrl) {
        return {
          success: true,
          fileId: res.fileId || ('LOCAL_' + Date.now()),
          fileUrl: res.fileUrl,
          isLocalFallback: true,
          warning: res.warning || 'Drive permission pending'
        };
      }
      throw new Error((res && res.message) || 'Drive photo upload failed.');
    }

    return {
      success: true,
      fileId: res.fileId,
      fileUrl: res.fileUrl,
      fileName: res.fileName || payload.fileName,
      mimeType: res.mimeType || payload.mimeType
    };
  }

  // -------------------------------------------------------------
  // 4. Field Visits Submission & Drive Sheet Linker
  // -------------------------------------------------------------
  /**
   * Complete lifecycle handler for Field Visits:
   * 1. Compresses and uploads up to 5 inspection photos to Google Drive
   * 2. Formats Photo_1_Link through Photo_5_Link
   * 3. Calls 'saveFieldVisit' to append row to Field_Visits Google Sheet
   * 4. Updates window.DantewadaDB and triggers UI refresh
   */
  async function saveFieldVisit(visitData, photosList = []) {
    visitData = visitData || {};
    const photos = Array.isArray(photosList) ? [...photosList] : [];

    if (photos.length > 5) {
      throw new Error('अधिकतम 5 तस्वीरें ही अपलोड की जा सकती हैं।');
    }

    const uploadedPhotos = [];

    // Process & upload each photo to Google Drive
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i];
      let photoUrl = p.url || p.base64Data || p;
      let driveLink = photoUrl;
      let fileId = p.fileId || '';

      // If it's a new local data URL or File, upload to Drive
      if (typeof photoUrl === 'string' && photoUrl.startsWith('data:')) {
        try {
          const uploadRes = await uploadToDrive(photoUrl, 'Field_Visits', p.fileName || `visit_photo_${i + 1}.jpg`);
          if (uploadRes && uploadRes.fileUrl) {
            driveLink = uploadRes.fileUrl;
            fileId = uploadRes.fileId;
          }
        } catch (uploadErr) {
          console.warn(`Drive upload for photo ${i + 1} warning:`, uploadErr.message);
          // Fallback to data URL so the visit is not lost
          driveLink = photoUrl;
        }
      }

      uploadedPhotos.push({
        url: driveLink,
        fileId: fileId,
        caption: p.caption || `निरीक्षण प्रमाण #${i + 1}`,
        type: p.type || 'निरीक्षण साक्ष्य'
      });
    }

    const visitId = visitData.id || `VIS-2026-${String(Date.now()).slice(-4)}`;

    const cloudRecord = {
      Visit_ID: visitId,
      Date: visitData.date || new Date().toISOString().split('T')[0],
      Officer_Name: visitData.officerName || 'Field Officer',
      Officer_Role: visitData.officerRole || 'Officer',
      Block: visitData.block || 'Dantewada',
      Gram_Panchayat: visitData.gramPanchayat || '',
      Location_Name: visitData.locationName || visitData.village || '',
      Purpose: visitData.purpose || 'युवा संवाद एवं योजना सत्यापन',
      Scheme: visitData.scheme || 'Youth Hub Initiative',
      Linked_Youth_Name: visitData.linkedYouthName || '',
      Description: visitData.description || '',
      Findings: visitData.findings || '',
      Issues_Faced: visitData.issuesFaced || '',
      Action_Required: visitData.actionRequired || '',
      Follow_Up_Date: visitData.followUpDate || '',
      Status: visitData.status || 'Verified',
      Photo_1_Link: uploadedPhotos[0]?.url || '',
      Photo_2_Link: uploadedPhotos[1]?.url || '',
      Photo_3_Link: uploadedPhotos[2]?.url || '',
      Photo_4_Link: uploadedPhotos[3]?.url || '',
      Photo_5_Link: uploadedPhotos[4]?.url || '',
      Photo_1_Caption: uploadedPhotos[0]?.caption || '',
      Photo_1_Type: uploadedPhotos[0]?.type || '',
      All_Photos_JSON: JSON.stringify(uploadedPhotos),
      Submitted_At: new Date().toISOString()
    };

    // 1. Save to Google Sheets backend
    let sheetSaved = false;
    if (window.API && typeof window.API.call === 'function') {
      try {
        const res = await window.API.call('saveFieldVisit', { record: cloudRecord });
        if (res && res.success) {
          sheetSaved = true;
        } else {
          console.warn('Backend saveFieldVisit warning:', res ? res.message : 'Unknown response');
        }
      } catch (err) {
        console.warn('Backend saveFieldVisit network call error:', err.message);
      }
    }

    // 2. Save to local database
    const localVisit = {
      ...visitData,
      id: visitId,
      photos: uploadedPhotos,
      status: visitData.status || 'Verified',
      isPublic: true,
      sheetSynced: sheetSaved
    };

    if (window.DantewadaDB && typeof window.DantewadaDB.saveFieldVisit === 'function') {
      window.DantewadaDB.saveFieldVisit(localVisit);
    }

    return {
      success: true,
      visitId: visitId,
      photosCount: uploadedPhotos.length,
      sheetSynced: sheetSaved,
      record: localVisit
    };
  }

  // -------------------------------------------------------------
  // 5. Success Stories Submission & Drive Linker
  // -------------------------------------------------------------
  /**
   * Complete lifecycle handler for Success Stories:
   * 1. Compresses photo or reads PDF and uploads to Google Drive
   * 2. Obtains public Drive URL and assigns to Photo_Link
   * 3. Calls 'saveSuccessStory' to append row to Success_Stories Google Sheet
   * 4. Updates window.DantewadaDB and triggers UI refresh
   */
  async function saveSuccessStory(storyData, fileOrUrl = null) {
    storyData = storyData || {};
    let finalPhotoUrl = storyData.photoUrl || '';
    let isPdf = Boolean(storyData.isPdf);

    // If a new File or data URL is passed, upload to Google Drive
    const isFile = (typeof File !== 'undefined' && fileOrUrl instanceof File);
    if (isFile) {
      isPdf = fileOrUrl.type === 'application/pdf' || fileOrUrl.name.toLowerCase().endsWith('.pdf');
      try {
        const uploadRes = await uploadToDrive(fileOrUrl, 'Success_Stories', fileOrUrl.name);
        if (uploadRes && uploadRes.fileUrl) {
          finalPhotoUrl = uploadRes.fileUrl;
        }
      } catch (err) {
        console.warn('Drive upload for success story media warning:', err.message);
        // Fallback to local reading so record is not lost
        const base = await compressImage(fileOrUrl);
        finalPhotoUrl = base.base64Data;
      }
    } else if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:')) {
      try {
        const uploadRes = await uploadToDrive(fileOrUrl, 'Success_Stories', `story_media_${Date.now()}.jpg`);
        if (uploadRes && uploadRes.fileUrl) {
          finalPhotoUrl = uploadRes.fileUrl;
        }
      } catch (err) {
        finalPhotoUrl = fileOrUrl;
      }
    }

    const storyId = storyData.id || `STR-2026-${String(Date.now()).slice(-4)}`;

    const cloudRecord = {
      Story_ID: storyId,
      Youth_Name: storyData.youthName || storyData.name || 'सफल युवा',
      Village: storyData.village || '',
      Block: storyData.block || 'Dantewada',
      Title: storyData.title || `${storyData.youthName || 'युवा'} की सफलता की कहानी`,
      Category: storyData.category || 'Employment',
      Scheme: storyData.scheme || 'Youth Hub Dantewada',
      Photo_Link: finalPhotoUrl,
      Is_PDF: isPdf,
      Summary: storyData.summary || '',
      Full_Story: storyData.fullStory || storyData.description || '',
      Quote: storyData.quote || '',
      Achievement_Date: storyData.achievementDate || new Date().toISOString().split('T')[0],
      Featured: Boolean(storyData.featured),
      Status: storyData.status || 'Published',
      Author: storyData.author || 'District Administration',
      Submitted_At: new Date().toISOString()
    };

    // 1. Save to Google Sheets backend
    let sheetSaved = false;
    if (window.API && typeof window.API.call === 'function') {
      try {
        const res = await window.API.call('saveSuccessStory', { record: cloudRecord });
        if (res && res.success) {
          sheetSaved = true;
        } else {
          console.warn('Backend saveSuccessStory warning:', res ? res.message : 'Unknown response');
        }
      } catch (err) {
        console.warn('Backend saveSuccessStory network error:', err.message);
      }
    }

    // 2. Save to local database
    const localStory = {
      ...storyData,
      id: storyId,
      photoUrl: finalPhotoUrl,
      isPdf: isPdf,
      status: storyData.status || 'Published',
      sheetSynced: sheetSaved
    };

    if (window.DantewadaDB && typeof window.DantewadaDB.saveSuccessStory === 'function') {
      window.DantewadaDB.saveSuccessStory(localStory);
    }

    return {
      success: true,
      storyId: storyId,
      mediaUrl: finalPhotoUrl,
      sheetSynced: sheetSaved,
      record: localStory
    };
  }

  // -------------------------------------------------------------
  // Public Module API
  // -------------------------------------------------------------
  const PhotoModule = {
    formatDriveUrl,
    compressImage,
    uploadToDrive,
    saveFieldVisit,
    saveSuccessStory
  };

  window.PhotoModule = PhotoModule;
  window.DantewadaPhoto = PhotoModule;

})(typeof window !== 'undefined' ? window : globalThis);

/**
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Upload.gs - Google Drive Document & Photo Storage
 */

const DRIVE_CONFIG = {
  ROOT_FOLDER_NAME: "YouthHub_Dantewada_Uploads"
};

/**
 * Gets or creates dedicated upload folder in Google Drive
 */
function getUploadFolder(subFolder) {
  var rootFolders = DriveApp.getFoldersByName(DRIVE_CONFIG.ROOT_FOLDER_NAME);
  var rootFolder;
  if (rootFolders.hasNext()) {
    rootFolder = rootFolders.next();
  } else {
    rootFolder = DriveApp.createFolder(DRIVE_CONFIG.ROOT_FOLDER_NAME);
    rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  
  if (subFolder) {
    var subFolders = rootFolder.getFoldersByName(subFolder);
    if (subFolders.hasNext()) {
      return subFolders.next();
    } else {
      var newSub = rootFolder.createFolder(subFolder);
      newSub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return newSub;
    }
  }
  
  return rootFolder;
}

/**
 * Uploads a base64 encoded file to Google Drive and returns shareable URL
 * payload: { base64Data, fileName, mimeType, subFolder, userToken }
 */
function uploadFileToDrive(payload) {
  try {
    var user = verifySessionToken(payload.userToken);
    var base64Data = payload.base64Data;
    var fileName = payload.fileName || ("upload_" + new Date().getTime() + ".jpg");
    var mimeType = payload.mimeType || "image/jpeg";
    var subFolder = payload.subFolder || "General";
    
    // Strip header if present e.g. "data:image/jpeg;base64,..."
    if (base64Data.indexOf(",") > -1) {
      base64Data = base64Data.split(",")[1];
    }
    
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    
    var targetFolder = getUploadFolder(subFolder);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileUrl = file.getUrl();
    var fileId = file.getId();
    
    if (user) {
      writeAuditLogDirect(user.email, user.role, "CREATE", "DriveUpload", fileId, "Uploaded: " + fileName);
    }
    
    return {
      success: true,
      fileId: fileId,
      fileUrl: fileUrl,
      fileName: fileName
    };
  } catch (error) {
    return {
      success: false,
      message: "Drive upload failed: " + error.toString()
    };
  }
}

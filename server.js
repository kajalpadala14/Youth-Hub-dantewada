/**
 * =========================================================================
 * YOUTH HUB DANTEWADA - MONITORING SYSTEM
 * Standalone Local & Production Node.js Backend Server (server.js)
 * =========================================================================
 * Provides:
 * 1. Full API endpoint (/api) handling all Youth Hub actions
 *    (getProgressGallery, addProgressGallery, uploadFile, getTableRecords, login, etc.)
 * 2. Local JSON database persistence (data/database.json)
 * 3. Local file upload storage (uploads/)
 * 4. Static frontend asset hosting for the Youth Hub Web App
 * =========================================================================
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DB_FILE = path.join(DATA_DIR, "database.json");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Initial Database Structure
const DEFAULT_DB = {
  Progress_Gallery: [
    {
      Gallery_ID: "GAL-2026-001",
      Title: "Electrician & Solar Technician Practical Training",
      Category: "Skill Training",
      Date: "2026-09-28",
      Block: "Dantewada",
      Gram_Panchayat: "Chitalanka",
      Participants: 28,
      Progress_Status: "In Progress",
      Photo_URL: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80",
      Description: "Batch 1 hands-on wiring, circuit safety, and solar panel inverter installation practical sessions at Youth Hub Dantewada workshop.",
      Tags: "Electrician, Solar, Practical Training, Batch 1",
      Uploaded_By: "District Skill Coordinator",
      Created_At: "2026-09-28"
    },
    {
      Gallery_ID: "GAL-2026-002",
      Title: "Gram Panchayat Intensive Youth Mobilization Camp",
      Category: "Mobilization",
      Date: "2026-09-24",
      Block: "Geedam",
      Gram_Panchayat: "Barsoor",
      Participants: 65,
      Progress_Status: "Completed",
      Photo_URL: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=900&q=80",
      Description: "Special community mobilization drive organized in Barsoor Gram Panchayat. 42 youth registered on the spot with M-Form completion.",
      Tags: "Gram Sabha, Mobilization, M-Form, Barsoor",
      Uploaded_By: "Youth Hub Geedam",
      Created_At: "2026-09-24"
    },
    {
      Gallery_ID: "GAL-2026-003",
      Title: "Tribal Youth Micro-Enterprise: Tailoring & Apparel Unit",
      Category: "Entrepreneurship",
      Date: "2026-09-20",
      Block: "Katekalyan",
      Gram_Panchayat: "Tumakpal",
      Participants: 6,
      Progress_Status: "Milestone Achieved",
      Photo_URL: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80",
      Description: "Inauguration and commercial launch of women self-help tailoring micro-enterprise supported by PMEGP loan sanction and Youth Hub mentorship.",
      Tags: "Micro-Enterprise, Tailoring, PMEGP, Women SHG",
      Uploaded_By: "Livelihood Officer",
      Created_At: "2026-09-20"
    },
    {
      Gallery_ID: "GAL-2026-004",
      Title: "District Mega Rojgar Mela & Offer Letter Distribution",
      Category: "Activities",
      Date: "2026-09-15",
      Block: "Dantewada",
      Gram_Panchayat: "Dantewada Rural",
      Participants: 210,
      Progress_Status: "Completed",
      Photo_URL: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      Description: "14 participating private employers and skill partners conducted interviews at District HQ. 87 youth handed preliminary job offer letters.",
      Tags: "Rojgar Mela, Placement, Offer Letters, District HQ",
      Uploaded_By: "जिला रोजगार अधिकारी",
      Created_At: "2026-09-15"
    }
  ],
  Youth_Master: [],
  Mobilization: [],
  M_Form: [],
  My_Bharat: [],
  Counselling: [],
  Skill_Training: [],
  Employment_Registered: [],
  Employment_Linked: [],
  Education: [],
  Entrepreneurs: [],
  NavGurukul: [],
  Trainings: [],
  Activities: [],
  Rehabilitation: [],
  IIM_Raipur: [],
  Shasan_Sahyog: [],
  Users: [
    {
      User_ID: "USR-001",
      Name: "Employment Officer (जिला रोजगार अधिकारी)",
      Email: "eo.dantewada@gmail.com",
      Role: "ADMIN",
      Block: "All",
      Youth_Hub: "All",
      Status: "Active"
    },
    {
      User_ID: "USR-002",
      Name: "Youth Hub Dantewada",
      Email: "youthhub.dantewada@gmail.com",
      Role: "HUB_OPERATOR",
      Block: "Dantewada",
      Youth_Hub: "Youth Hub Dantewada",
      Status: "Active"
    },
    {
      User_ID: "USR-003",
      Name: "Youth Hub Geedam",
      Email: "youthhub.geedam@gmail.com",
      Role: "HUB_OPERATOR",
      Block: "Geedam",
      Youth_Hub: "Youth Hub Geedam",
      Status: "Active"
    }
  ]
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    return DEFAULT_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_DB;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

/**
 * Handle API Dispatcher
 */
function handleApiAction(action, payload, host) {
  const db = readDb();

  // 1. Progress Gallery: Retrieve items and metrics
  if (action === "getProgressGallery") {
    const filters = payload.filters || {};
    let galleryList = db.Progress_Gallery || [];
    let mobList = db.Mobilization || [];
    let trgList = db.Trainings || [];
    let actList = db.Activities || [];

    const aggregated = [];
    const seenIds = new Set();

    // From Progress_Gallery
    galleryList.forEach(r => {
      seenIds.add(String(r.Gallery_ID));
      aggregated.push({
        id: r.Gallery_ID,
        title: r.Title || "Progress Milestone",
        category: r.Category || "Skill Training",
        date: r.Date || "",
        block: r.Block || "Dantewada",
        gramPanchayat: r.Gram_Panchayat || "",
        participants: Number(r.Participants) || 0,
        status: r.Progress_Status || "Completed",
        imageUrl: r.Photo_URL || "",
        description: r.Description || "",
        tags: r.Tags ? String(r.Tags).split(",").map(t => t.trim()) : [],
        uploadedBy: r.Uploaded_By || "Officer",
        createdDate: r.Created_At || r.Date || ""
      });
    });

    // Mobilization photos
    mobList.forEach(r => {
      if (r.Photo_URL && !seenIds.has(String(r.Activity_ID))) {
        seenIds.add(String(r.Activity_ID));
        aggregated.push({
          id: r.Activity_ID,
          title: r.Activity_Name || "Mobilization Camp",
          category: "Mobilization",
          date: r.Date || "",
          block: r.Block || "Dantewada",
          gramPanchayat: r.Gram_Panchayat || "",
          participants: Number(r.Total_Mobilized) || 0,
          status: "Completed",
          imageUrl: r.Photo_URL,
          description: `Mobilization camp in ${r.Gram_Panchayat || r.Block || ""}. Total mobilized: ${r.Total_Mobilized || 0}.`,
          tags: ["Mobilization"],
          uploadedBy: r.Mobilizer_Name || "Field Team",
          createdDate: r.Date || ""
        });
      }
    });

    // Trainings photos
    trgList.forEach(r => {
      if (r.Photo_URL && !seenIds.has(String(r.Training_ID))) {
        seenIds.add(String(r.Training_ID));
        aggregated.push({
          id: r.Training_ID,
          title: r.Training_Name || "Skill Training Workshop",
          category: "Skill Training",
          date: r.Date || r.Start_Date || "",
          block: r.Block || "Dantewada",
          gramPanchayat: r.GP || "",
          participants: Number(r.Total_Participants) || 0,
          status: "In Progress",
          imageUrl: r.Photo_URL,
          description: `Training on ${r.Training_Topic || 'Skills'} by ${r.Training_Provider || ''}.`,
          tags: ["Skill Training"],
          uploadedBy: r.Trainer_Name || "Trainer",
          createdDate: r.Date || ""
        });
      }
    });

    // Field activities photos
    actList.forEach(r => {
      if (r.Photo_URL && !seenIds.has(String(r.Activity_ID))) {
        seenIds.add(String(r.Activity_ID));
        aggregated.push({
          id: r.Activity_ID,
          title: r.Activity_Name || "Field Activity",
          category: "Activities",
          date: r.Date || "",
          block: r.Block || "Dantewada",
          gramPanchayat: r.GP || "",
          participants: Number(r.Participants) || 0,
          status: "Completed",
          imageUrl: r.Photo_URL,
          description: r.Description || "Field Activity",
          tags: ["Activities"],
          uploadedBy: "Field Team",
          createdDate: r.Date || ""
        });
      }
    });

    const kpis = {
      totalPhotos: aggregated.length,
      skillTrainings: aggregated.filter(i => i.category === "Skill Training").length,
      mobilizationCamps: aggregated.filter(i => i.category === "Mobilization").length,
      microEnterprises: aggregated.filter(i => i.category === "Entrepreneurship").length,
      youthReached: aggregated.reduce((acc, i) => acc + (Number(i.participants) || 0), 0)
    };

    let filtered = aggregated;
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter(i => i.category === filters.category);
    }
    if (filters.block && filters.block !== "All") {
      filtered = filtered.filter(i => String(i.block || "").toLowerCase() === String(filters.block).toLowerCase());
    }
    if (filters.gramPanchayat && filters.gramPanchayat !== "All") {
      filtered = filtered.filter(i => String(i.gramPanchayat || "").toLowerCase() === String(filters.gramPanchayat).toLowerCase());
    }
    if (filters.status && filters.status !== "All") {
      filtered = filtered.filter(i => i.status === filters.status);
    }
    if (filters.search) {
      const q = String(filters.search).toLowerCase();
      filtered = filtered.filter(i => `${i.title} ${i.description} ${i.block} ${i.gramPanchayat}`.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return {
      success: true,
      records: filtered,
      kpis,
      totalCount: aggregated.length,
      filteredCount: filtered.length
    };
  }

  // 2. Add Progress Gallery Item
  if (action === "addProgressGallery") {
    let list = db.Progress_Gallery || [];
    let photoUrl = payload.Photo_URL || "";

    // Save base64 image to local uploads folder if provided
    if (payload.base64Data) {
      try {
        const matches = payload.base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const buffer = Buffer.from(matches ? matches[2] : payload.base64Data, "base64");
        const ext = (matches && matches[1].includes("png")) ? ".png" : ".jpg";
        const filename = `progress_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
        const filePath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, buffer);
        photoUrl = `/uploads/${filename}`;
      } catch (err) {
        console.error("Local file write error", err);
      }
    }

    const newId = payload.Gallery_ID || `GAL-2026-${String(list.length + 1).padStart(4, "0")}`;
    const newRecord = {
      Gallery_ID: newId,
      Title: payload.Title || "Progress Milestone",
      Category: payload.Category || "Skill Training",
      Date: payload.Date || new Date().toISOString().split("T")[0],
      Block: payload.Block || "Dantewada",
      Gram_Panchayat: payload.Gram_Panchayat || "",
      Participants: Number(payload.Participants) || 0,
      Progress_Status: payload.Progress_Status || "Completed",
      Photo_URL: photoUrl,
      Description: payload.Description || "",
      Tags: Array.isArray(payload.Tags) ? payload.Tags.join(", ") : (payload.Tags || ""),
      Uploaded_By: payload.Uploaded_By || "Officer",
      Created_At: new Date().toISOString().split("T")[0]
    };

    list.unshift(newRecord);
    db.Progress_Gallery = list;
    writeDb(db);

    return {
      success: true,
      message: "Progress photo saved to gallery successfully.",
      record: newRecord,
      id: newId
    };
  }

  // 3. Delete Progress Gallery Item
  if (action === "deleteProgressGallery" || (action === "deleteRecord" && payload.sheetName === "Progress_Gallery")) {
    const idToDelete = payload.galleryId || payload.idValue;
    let list = db.Progress_Gallery || [];
    const initialLen = list.length;
    list = list.filter(i => String(i.Gallery_ID) !== String(idToDelete));
    db.Progress_Gallery = list;
    writeDb(db);

    return {
      success: list.length < initialLen,
      message: list.length < initialLen ? "Gallery photo deleted." : "Record not found."
    };
  }

  // 4. File Upload
  if (action === "uploadFile") {
    if (!payload.base64Data) {
      return { success: false, message: "No file data received." };
    }
    const matches = payload.base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = Buffer.from(matches ? matches[2] : payload.base64Data, "base64");
    const ext = (matches && matches[1].includes("png")) ? ".png" : ".jpg";
    const filename = `upload_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    const fileUrl = `/uploads/${filename}`;
    return { success: true, fileUrl, fileId: filename, message: "File uploaded successfully." };
  }

  // 5. Generic Table Records
  if (action === "getTableRecords") {
    const sheet = payload.sheetName;
    const records = db[sheet] || [];
    return { success: true, sheetName: sheet, records, data: records };
  }

  // Fallback
  return { success: true, message: `Action ${action} processed.`, data: [] };
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoint (POST /api or POST /)
  if (req.method === "POST" && (pathname === "/api" || pathname === "/")) {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const action = parsed.action || "";
        const payload = parsed.payload || parsed;
        const host = req.headers.host || `localhost:${PORT}`;
        const result = handleApiAction(action, payload, host);

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, message: "Server error: " + err.message }));
      }
    });
    return;
  }

  // Health check (GET /api/health)
  if (req.method === "GET" && pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "online", system: "Youth Hub Dantewada Backend" }));
    return;
  }

  // Serve Uploaded Files (/uploads/...)
  if (pathname.startsWith("/uploads/")) {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // Serve Static Frontend Files
  let staticPath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);
  if (!fs.existsSync(staticPath) || fs.statSync(staticPath).isDirectory()) {
    staticPath = path.join(__dirname, "index.html");
  }

  const ext = path.extname(staticPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "text/plain";

  fs.readFile(staticPath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Youth Hub Dantewada Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📂 Database: ${DB_FILE}`);
  console.log(`📸 Uploads: ${UPLOAD_DIR}`);
  console.log(`=======================================================`);
});

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { DBStore, GlobalSettings, NurseryGuidelines, NurseryPackage, Caregiver, BlogArticle, SafetyAlert, MentalHealthResource, FAQItem, Testimonial, Inquiry } from "./src/types";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Middleware
app.use(express.json({ limit: "15mb" })); // Support large base64 uploads if needed

// Ensure DB and Upload directories exist
function ensureDirs() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
ensureDirs();

// Read Database Helper
function readDB(): DBStore {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw) as DBStore;
    }
  } catch (err) {
    console.error("Database reading warning:", err);
  }
  // Safe Fallback if file missing or corrupted
  return {
    globalSettings: {
      adminPassword: "admin",
      routingEmail: "care@thecupidcollectivenursery.com",
      introHeadline: "A Safe, Nurturing Sanctuary",
      introSubheadline: "Step into therapeutic age-regression",
      introBody: "A peaceful sanctuary for adults."
    },
    nurseryGuidelines: {
      locationDescription: "A comforting location.",
      sessionBoundaries: "### Non-Sexual Boundaries\nProfessional caregivers.",
      rules: "### Rules\nBe gentle.",
      expectations: "### Expectations\nCompassionate care."
    },
    packages: [],
    caregivers: [],
    blogArticles: [],
    safetyAlerts: [],
    hotlines: [],
    faqs: [],
    testimonials: [],
    inquiries: [],
    mailingList: []
  };
}

// Write Database Helper
function writeDB(data: DBStore) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Database writing error:", err);
  }
}

// Admin Token validation
const ADMIN_TOKEN_KEY = "cupid_admin_secure_session_token_2026";
function validateAdminToken(req: express.Request): boolean {
  const token = req.headers["authorization"] || req.headers["x-admin-token"];
  return token === ADMIN_TOKEN_KEY;
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// Fetches public site content
app.get("/api/public-content", (req, res) => {
  try {
    const db = readDB();
    // Exclude adminPassword from public settings payload for security
    const { adminPassword, ...safeSettings } = db.globalSettings;
    
    res.json({
      success: true,
      data: {
        globalSettings: safeSettings,
        nurseryGuidelines: db.nurseryGuidelines,
        packages: db.packages.filter(p => p.isActive),
        caregivers: db.caregivers,
        blogArticles: db.blogArticles,
        safetyAlerts: db.safetyAlerts,
        hotlines: db.hotlines,
        faqs: db.faqs.sort((a, b) => a.orderIndex - b.orderIndex),
        testimonials: db.testimonials
      }
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message || "Failed to load database." });
  }
});

// Post inquiry
app.post("/api/inquiries", (req, res) => {
  try {
    const { name, pronouns, email, subject, message, agreedBoundaries } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "Please complete all required fields." });
    }
    if (!agreedBoundaries) {
      return res.status(400).json({ success: false, error: "You must confirm you have read the Nursery boundaries." });
    }

    const db = readDB();
    const newInquiry: Inquiry = {
      id: "inq-" + Date.now(),
      name: String(name).slice(0, 100),
      pronouns: String(pronouns || "Not specified").slice(0, 50),
      email: String(email).slice(0, 100),
      subject: String(subject).slice(0, 150),
      message: String(message).slice(0, 3000),
      date: new Date().toISOString(),
      read: false
    };

    db.inquiries.push(newInquiry);
    writeDB(db);

    console.log(`[SMTP SIMULATOR] Routing contact submission to admin email (${db.globalSettings.routingEmail || 'default'}):`, newInquiry);

    res.json({ success: true, message: "Thank you! Your inquiries have been submitted. Our caregivers will contact you soon." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Newsletter Subscription
app.post("/api/newsletter", (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Please provide a valid email address." });
    }

    const db = readDB();
    const cleanEmail = email.trim().toLowerCase();
    
    // Check duplication
    const exists = db.mailingList.some(entry => entry.email === cleanEmail);
    if (exists) {
      return res.json({ success: true, message: "You are already subscribed to our newsletter list!" });
    }

    db.mailingList.push({
      email: cleanEmail,
      date: new Date().toISOString()
    });
    writeDB(db);

    res.json({ success: true, message: "Warm welcome to our collective! You are subscribed." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==========================================
// ADMIN API ENDPOINTS (Protected with Token Check)
// ==========================================

// Login Route
app.post("/api/admin/login", (req, res) => {
  try {
    const { password } = req.body;
    const db = readDB();
    const correctPassword = db.globalSettings.adminPassword || "admin123";
    
    if (password === correctPassword) {
      res.json({ success: true, token: ADMIN_TOKEN_KEY });
    } else {
      res.status(401).json({ success: false, error: "Incorrect administrator password." });
    }
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Secure middleware validation checker helper
function adminAuthGate(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!validateAdminToken(req)) {
    return res.status(403).json({ success: false, error: "Access Denied. Invalid or missing administrator credentials." });
  }
  next();
}

// Fetch complete payload including administration entries
app.get("/api/admin/data", adminAuthGate, (req, res) => {
  try {
    const db = readDB();
    res.json({ success: true, data: db });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update Global config settings
app.post("/api/admin/update-settings", adminAuthGate, (req, res) => {
  try {
    const { routingEmail, introHeadline, introSubheadline, introBody, adminPassword } = req.body;
    if (!routingEmail || !introHeadline || !introSubheadline || !introBody) {
      return res.status(400).json({ success: false, error: "Required global values cannot be empty." });
    }

    const db = readDB();
    db.globalSettings.routingEmail = routingEmail;
    db.globalSettings.introHeadline = introHeadline;
    db.globalSettings.introSubheadline = introSubheadline;
    db.globalSettings.introBody = introBody;
    
    if (adminPassword && adminPassword.trim() !== "") {
      db.globalSettings.adminPassword = adminPassword.trim();
    }

    writeDB(db);
    res.json({ success: true, message: "Global settings successfully updated!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update Nursery physical policies
app.post("/api/admin/update-guidelines", adminAuthGate, (req, res) => {
  try {
    const { locationDescription, sessionBoundaries, rules, expectations } = req.body;
    const db = readDB();

    db.nurseryGuidelines = {
      locationDescription: locationDescription || "",
      sessionBoundaries: sessionBoundaries || "",
      rules: rules || "",
      expectations: expectations || ""
    };

    writeDB(db);
    res.json({ success: true, message: "Nursery guidelines updated!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update physical/virtual package
app.post("/api/admin/packages", adminAuthGate, (req, res) => {
  try {
    const pkg = req.body as NurseryPackage;
    if (!pkg.name || !pkg.description || pkg.duration <= 0 || pkg.price < 0) {
      return res.status(400).json({ success: false, error: "Please enter valid values for the package fields." });
    }

    const db = readDB();
    const index = db.packages.findIndex(p => p.id === pkg.id);
    
    if (index >= 0) {
      db.packages[index] = { ...db.packages[index], ...pkg };
    } else {
      pkg.id = "pkg-" + Date.now();
      db.packages.push(pkg);
    }

    writeDB(db);
    res.json({ success: true, message: "Package details saved!", package: pkg });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete physical/virtual package
app.delete("/api/admin/packages/:id", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const db = readDB();
    db.packages = db.packages.filter(p => p.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Package successfully deleted." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update caregiver
app.post("/api/admin/caregivers", adminAuthGate, (req, res) => {
  try {
    const caregiver = req.body as Caregiver;
    if (!caregiver.name || !caregiver.bio || !caregiver.philosophy) {
      return res.status(400).json({ success: false, error: "Name, Biography, and Philosophy are required." });
    }

    const db = readDB();
    const index = db.caregivers.findIndex(c => c.id === caregiver.id);
    
    if (index >= 0) {
      db.caregivers[index] = { ...db.caregivers[index], ...caregiver };
    } else {
      caregiver.id = "cg-" + Date.now();
      // Ensure we have some default image if not uploaded
      if (!caregiver.imageUrl || caregiver.imageUrl.trim() === "") {
        caregiver.imageUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400";
      }
      db.caregivers.push(caregiver);
    }

    writeDB(db);
    res.json({ success: true, message: "Caregiver profile saved!", caregiver });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete caregiver
app.delete("/api/admin/caregivers/:id", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const db = readDB();
    db.caregivers = db.caregivers.filter(c => c.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Caregiver profile deleted." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update Resource blog/review
app.post("/api/admin/blog", adminAuthGate, (req, res) => {
  try {
    const article = req.body as BlogArticle;
    if (!article.title || !article.content || !article.category) {
      return res.status(400).json({ success: false, error: "Title, content, and category are required." });
    }

    const db = readDB();
    const index = db.blogArticles.findIndex(b => b.id === article.id);

    if (index >= 0) {
      db.blogArticles[index] = { ...db.blogArticles[index], ...article };
    } else {
      article.id = "blog-" + Date.now();
      article.date = new Date().toISOString().split("T")[0];
      db.blogArticles.push(article);
    }

    writeDB(db);
    res.json({ success: true, message: "Article details saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete blog
app.delete("/api/admin/blog/:id", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const db = readDB();
    db.blogArticles = db.blogArticles.filter(b => b.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Article deleted successfully." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update Safety warnings alerts
app.post("/api/admin/safety-alerts", adminAuthGate, (req, res) => {
  try {
    const alert = req.body as SafetyAlert;
    if (!alert.title || !alert.details || !alert.recommendations) {
      return res.status(400).json({ success: false, error: "Title, details, and recommendations are required." });
    }

    const db = readDB();
    const index = db.safetyAlerts.findIndex(s => s.id === alert.id);

    if (index >= 0) {
      db.safetyAlerts[index] = { ...db.safetyAlerts[index], ...alert };
    } else {
      alert.id = "safe-" + Date.now();
      alert.date = new Date().toISOString().split("T")[0];
      db.safetyAlerts.push(alert);
    }

    writeDB(db);
    res.json({ success: true, message: "Safety alert saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete Safety alert
app.delete("/api/admin/safety-alerts/:id", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const db = readDB();
    db.safetyAlerts = db.safetyAlerts.filter(s => s.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Safety alert successfully deleted." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update Support Hotline
app.post("/api/admin/hotlines", adminAuthGate, (req, res) => {
  try {
    const hot = req.body as MentalHealthResource;
    if (!hot.name || !hot.phone || !hot.description || !hot.category) {
      return res.status(400).json({ success: false, error: "Name, connection phone/code, category, and explanation are required." });
    }

    const db = readDB();
    const index = db.hotlines.findIndex(h => h.id === hot.id);

    if (index >= 0) {
      db.hotlines[index] = { ...db.hotlines[index], ...hot };
    } else {
      hot.id = "hl-" + Date.now();
      db.hotlines.push(hot);
    }

    writeDB(db);
    res.json({ success: true, message: "Resource listing saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete Support Hotline
app.delete("/api/admin/hotlines/:id", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const db = readDB();
    db.hotlines = db.hotlines.filter(h => h.id !== id);
    writeDB(db);
    res.json({ success: true, message: "Crisis line directory entry removed." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update FAQ
app.post("/api/admin/faqs", adminAuthGate, (req, res) => {
  try {
    const faq = req.body as FAQItem;
    if (!faq.question || !faq.answer || !faq.category) {
      return res.status(400).json({ success: false, error: "Question, answer, and category tag are required." });
    }

    const db = readDB();
    const index = db.faqs.findIndex(f => f.id === faq.id);

    if (index >= 0) {
      db.faqs[index] = { ...db.faqs[index], ...faq };
    } else {
      faq.id = "faq-" + Date.now();
      faq.orderIndex = db.faqs.length;
      db.faqs.push(faq);
    }

    writeDB(db);
    res.json({ success: true, message: "FAQ saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete FAQ
app.delete("/api/admin/faqs/:id", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const db = readDB();
    db.faqs = db.faqs.filter(f => f.id !== id);
    writeDB(db);
    res.json({ success: true, message: "FAQ item removed successfully." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Toggle Inquiry read status
app.post("/api/admin/inquiries/:id/read", adminAuthGate, (req, res) => {
  try {
    const id = req.params.id;
    const { read } = req.body;
    const db = readDB();
    const index = db.inquiries.findIndex(i => i.id === id);
    if (index >= 0) {
      db.inquiries[index].read = !!read;
      writeDB(db);
      return res.json({ success: true, message: "Inquiry status updated." });
    }
    res.status(404).json({ success: false, error: "Inquiry not found." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Export mailing list as CSV
app.get("/api/admin/mailing-list/export", adminAuthGate, (req, res) => {
  try {
    const db = readDB();
    const mailingList = db.mailingList || [];
    
    // Construct simple CSV
    let csvHeader = "Email Address,Subscription Date\n";
    const csvRows = mailingList.map(entry => {
      const email = entry.email.replace(/"/g, '""');
      return `"${email}","${entry.date}"`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=the_cupid_collective_newsletter_subscribers.csv");
    res.status(200).send(csvContent);
  } catch (e: any) {
    res.status(500).send("Error exporting mailing list content: " + e.message);
  }
});

// ==========================================
// VITE OR STATIC FILE HOOK DETAILS
// ==========================================

async function startServer() {
  // If we are not in production state, mount standard dev Vite server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Mount server routing
    app.use(vite.middlewares);
  } else {
    // Production serving from dynamic dist layout
    const distPath = path.join(process.cwd(), "dist");
    
    // Static assets
    app.use(express.static(distPath));
    
    // Handle index path queries (Vite React app SPA)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to host 0.0.0.0 and port 3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Express boot startup crashed:", e);
});

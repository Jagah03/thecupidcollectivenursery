import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
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

let supabaseClient: any = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_KEY || "";
    if (url && key && url !== "MY_SUPABASE_URL" && key !== "MY_SUPABASE_KEY" && url.trim() !== "" && key.trim() !== "") {
      supabaseClient = createClient(url, key);
    }
  }
  return supabaseClient;
}

function readLocalDB(): DBStore {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw) as DBStore;
    }
  } catch (err) {
    console.error("Local database reading warning:", err);
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

function writeLocalDB(data: DBStore) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local database writing error:", err);
  }
}

async function writeDBToSupabaseOnly(data: DBStore) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("nursery_store")
    .upsert({ key: "cupid_db_store", data: data, updated_at: new Date().toISOString() });

  if (error) {
    console.error("Failed to upsert database store to Supabase 'nursery_store':", error.message);
    if (error.code === '42P01') {
      console.error("\n[SUPABASE HELP] The table 'nursery_store' does not exist in your database.");
      console.error("Please run the following query in your Supabase SQL Editor to initialize it:\n");
      console.error(`
        CREATE TABLE IF NOT EXISTS nursery_store (
          key TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      \n`);
    }
  } else {
    console.log("Successfully synchronized Cupid Collective Nursery data with Supabase 'nursery_store' table.");
  }
}

// Lazy-initialized asynchronous global readDB helper
async function readDB(): Promise<DBStore> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("nursery_store")
        .select("data")
        .eq("key", "cupid_db_store")
        .maybeSingle();

      if (error) {
        console.warn("Supabase query warning (falling back to local file storage):", error.message);
      } else if (data && data.data) {
        return data.data as DBStore;
      } else {
        console.log("Supabase row 'cupid_db_store' not found. Initializing with local db configuration...");
        const localData = readLocalDB();
        await writeDBToSupabaseOnly(localData);
        return localData;
      }
    } catch (err: any) {
      console.error("Supabase failover read exception:", err.message || err);
    }
  }
  return readLocalDB();
}

// Lazy-initialized asynchronous global writeDB helper
async function writeDB(data: DBStore) {
  writeLocalDB(data);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await writeDBToSupabaseOnly(data);
    } catch (err: any) {
      console.error("Supabase failover write exception:", err.message || err);
    }
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
app.get("/api/public-content", async (req, res) => {
  try {
    const db = await readDB();
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
app.post("/api/inquiries", async (req, res) => {
  try {
    const { name, pronouns, email, subject, message, agreedBoundaries } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: "Please complete all required fields." });
    }
    if (!agreedBoundaries) {
      return res.status(400).json({ success: false, error: "You must confirm you have read the Nursery boundaries." });
    }

    const db = await readDB();
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
    await writeDB(db);

    console.log(`[SMTP SIMULATOR] Routing contact submission to admin email (${db.globalSettings.routingEmail || 'default'}):`, newInquiry);

    res.json({ success: true, message: "Thank you! Your inquiries have been submitted. Our caregivers will contact you soon." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Newsletter Subscription
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, error: "Please provide a valid email address." });
    }

    const db = await readDB();
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
    await writeDB(db);

    res.json({ success: true, message: "Warm welcome to our collective! You are subscribed." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ==========================================
// ADMIN API ENDPOINTS (Protected with Token Check)
// ==========================================

// Login Route
app.post("/api/admin/login", async (req, res) => {
  try {
    const { password } = req.body;
    const db = await readDB();
    const correctPassword = db.globalSettings.adminPassword || "admin123";
    
    // Support case-insensitive match for the default sandbox key 'admin' (e.g. if user types 'Admin' or 'admin')
    const isDefaultAdmin = correctPassword.trim().toLowerCase() === "admin";
    const isInputAdmin = password && password.trim().toLowerCase() === "admin";
    
    if (password === correctPassword || (isDefaultAdmin && isInputAdmin)) {
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
app.get("/api/admin/data", adminAuthGate, async (req, res) => {
  try {
    const db = await readDB();
    res.json({ success: true, data: db });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Test Supabase credentials connection and schema health status
app.get("/api/admin/supabase-status", adminAuthGate, async (req, res) => {
  try {
    const url = process.env.SUPABASE_URL || "";
    const key = process.env.SUPABASE_KEY || "";
    
    if (!url || !key || url === "MY_SUPABASE_URL" || key === "MY_SUPABASE_KEY" || url.trim() === "" || key.trim() === "") {
      return res.json({
        success: false,
        step: "config",
        error: "Supabase environment variables are missing or default in your workspace environments.",
        envExample: {
          SUPABASE_URL: url || "(undefined)",
          SUPABASE_KEY: key ? "••••••••••••" : "(undefined)"
        }
      });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return res.json({
        success: false,
        step: "client_init",
        error: "Failed to initialize Supabase client. Please check your Supabase credentials format."
      });
    }

    // Step 1: Query table
    let readResponse;
    try {
      readResponse = await supabase
        .from("nursery_store")
        .select("key")
        .eq("key", "cupid_db_store")
        .maybeSingle();
    } catch (e: any) {
      return res.json({
        success: false,
        step: "read_query_fail",
        error: `Query execution exception: ${e.message || e}`,
        sqlFix: `CREATE TABLE IF NOT EXISTS nursery_store (\n  key TEXT PRIMARY KEY,\n  data JSONB NOT NULL,\n  updated_at TIMESTAMPTZ DEFAULT now()\n);`
      });
    }

    if (readResponse.error) {
      const err = readResponse.error;
      if (err.code === "42P01") {
        return res.json({
          success: false,
          step: "table_missing",
          error: "The table 'nursery_store' does not exist in your Supabase database schema.",
          sqlFix: `CREATE TABLE IF NOT EXISTS nursery_store (\n  key TEXT PRIMARY KEY,\n  data JSONB NOT NULL,\n  updated_at TIMESTAMPTZ DEFAULT now()\n);`
        });
      }
      return res.json({
        success: false,
        step: "read_error",
        error: `Supabase API error: ${err.message} (Code: ${err.code})`
      });
    }

    // Step 2: Try inserting / upserting connection check record
    const testKey = "cupid_supabase_conn_test";
    const testData = { success: true, tested_at: new Date().toISOString(), message: "Supabase connection check completed successfully!" };
    
    const upsertResponse = await supabase
      .from("nursery_store")
      .upsert({ key: testKey, data: testData, updated_at: new Date().toISOString() });

    if (upsertResponse.error) {
      return res.json({
        success: false,
        step: "write_error",
        error: `Failed to insert test record: ${upsertResponse.error.message} (Code: ${upsertResponse.error.code})`
      });
    }

    // Step 3: Verify read
    const verifyResponse = await supabase
      .from("nursery_store")
      .select("data")
      .eq("key", testKey)
      .maybeSingle();

    const verifiedRecord = verifyResponse.data?.data;

    // Clean up
    await supabase
      .from("nursery_store")
      .delete()
      .eq("key", testKey);

    return res.json({
      success: true,
      step: "complete",
      message: "Connected to Supabase and verified read/write logs successfully!",
      configuration: {
        host: new URL(url).host,
        table: "nursery_store"
      },
      testRecordInfo: verifiedRecord
    });
  } catch (e: any) {
    res.status(500).json({ success: false, step: "exception", error: e.message || String(e) });
  }
});

// Update Global config settings
app.post("/api/admin/update-settings", adminAuthGate, async (req, res) => {
  try {
    const { routingEmail, introHeadline, introSubheadline, introBody, adminPassword } = req.body;
    if (!routingEmail || !introHeadline || !introSubheadline || !introBody) {
      return res.status(400).json({ success: false, error: "Required global values cannot be empty." });
    }

    const db = await readDB();
    db.globalSettings.routingEmail = routingEmail;
    db.globalSettings.introHeadline = introHeadline;
    db.globalSettings.introSubheadline = introSubheadline;
    db.globalSettings.introBody = introBody;
    
    if (adminPassword && adminPassword.trim() !== "") {
      db.globalSettings.adminPassword = adminPassword.trim();
    }

    await writeDB(db);
    res.json({ success: true, message: "Global settings successfully updated!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update Nursery physical policies
app.post("/api/admin/update-guidelines", adminAuthGate, async (req, res) => {
  try {
    const { locationDescription, sessionBoundaries, rules, expectations } = req.body;
    const db = await readDB();

    db.nurseryGuidelines = {
      locationDescription: locationDescription || "",
      sessionBoundaries: sessionBoundaries || "",
      rules: rules || "",
      expectations: expectations || ""
    };

    await writeDB(db);
    res.json({ success: true, message: "Nursery guidelines updated!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update physical/virtual package
app.post("/api/admin/packages", adminAuthGate, async (req, res) => {
  try {
    const pkg = req.body as NurseryPackage;
    if (!pkg.name || !pkg.description || pkg.duration <= 0 || pkg.price < 0) {
      return res.status(400).json({ success: false, error: "Please enter valid values for the package fields." });
    }

    const db = await readDB();
    const index = db.packages.findIndex(p => p.id === pkg.id);
    
    if (index >= 0) {
      db.packages[index] = { ...db.packages[index], ...pkg };
    } else {
      pkg.id = "pkg-" + Date.now();
      db.packages.push(pkg);
    }

    await writeDB(db);
    res.json({ success: true, message: "Package details saved!", package: pkg });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete physical/virtual package
app.delete("/api/admin/packages/:id", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const db = await readDB();
    db.packages = db.packages.filter(p => p.id !== id);
    await writeDB(db);
    res.json({ success: true, message: "Package successfully deleted." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update caregiver
app.post("/api/admin/caregivers", adminAuthGate, async (req, res) => {
  try {
    const caregiver = req.body as Caregiver;
    if (!caregiver.name || !caregiver.bio || !caregiver.philosophy) {
      return res.status(400).json({ success: false, error: "Name, Biography, and Philosophy are required." });
    }

    const db = await readDB();
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

    await writeDB(db);
    res.json({ success: true, message: "Caregiver profile saved!", caregiver });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete caregiver
app.delete("/api/admin/caregivers/:id", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const db = await readDB();
    db.caregivers = db.caregivers.filter(c => c.id !== id);
    await writeDB(db);
    res.json({ success: true, message: "Caregiver profile deleted." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update Resource blog/review
app.post("/api/admin/blog", adminAuthGate, async (req, res) => {
  try {
    const article = req.body as BlogArticle;
    if (!article.title || !article.content || !article.category) {
      return res.status(400).json({ success: false, error: "Title, content, and category are required." });
    }

    const db = await readDB();
    const index = db.blogArticles.findIndex(b => b.id === article.id);

    if (index >= 0) {
      db.blogArticles[index] = { ...db.blogArticles[index], ...article };
    } else {
      article.id = "blog-" + Date.now();
      article.date = new Date().toISOString().split("T")[0];
      db.blogArticles.push(article);
    }

    await writeDB(db);
    res.json({ success: true, message: "Article details saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete blog
app.delete("/api/admin/blog/:id", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const db = await readDB();
    db.blogArticles = db.blogArticles.filter(b => b.id !== id);
    await writeDB(db);
    res.json({ success: true, message: "Article deleted successfully." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update Safety warnings alerts
app.post("/api/admin/safety-alerts", adminAuthGate, async (req, res) => {
  try {
    const alert = req.body as SafetyAlert;
    if (!alert.title || !alert.details || !alert.recommendations) {
      return res.status(400).json({ success: false, error: "Title, details, and recommendations are required." });
    }

    const db = await readDB();
    const index = db.safetyAlerts.findIndex(s => s.id === alert.id);

    if (index >= 0) {
      db.safetyAlerts[index] = { ...db.safetyAlerts[index], ...alert };
    } else {
      alert.id = "safe-" + Date.now();
      alert.date = new Date().toISOString().split("T")[0];
      db.safetyAlerts.push(alert);
    }

    await writeDB(db);
    res.json({ success: true, message: "Safety alert saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete Safety alert
app.delete("/api/admin/safety-alerts/:id", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const db = await readDB();
    db.safetyAlerts = db.safetyAlerts.filter(s => s.id !== id);
    await writeDB(db);
    res.json({ success: true, message: "Safety alert successfully deleted." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update Support Hotline
app.post("/api/admin/hotlines", adminAuthGate, async (req, res) => {
  try {
    const hot = req.body as MentalHealthResource;
    if (!hot.name || !hot.phone || !hot.description || !hot.category) {
      return res.status(400).json({ success: false, error: "Name, connection phone/code, category, and explanation are required." });
    }

    const db = await readDB();
    const index = db.hotlines.findIndex(h => h.id === hot.id);

    if (index >= 0) {
      db.hotlines[index] = { ...db.hotlines[index], ...hot };
    } else {
      hot.id = "hl-" + Date.now();
      db.hotlines.push(hot);
    }

    await writeDB(db);
    res.json({ success: true, message: "Resource listing saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete Support Hotline
app.delete("/api/admin/hotlines/:id", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const db = await readDB();
    db.hotlines = db.hotlines.filter(h => h.id !== id);
    await writeDB(db);
    res.json({ success: true, message: "Crisis line directory entry removed." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Create or update FAQ
app.post("/api/admin/faqs", adminAuthGate, async (req, res) => {
  try {
    const faq = req.body as FAQItem;
    if (!faq.question || !faq.answer || !faq.category) {
      return res.status(400).json({ success: false, error: "Question, answer, and category tag are required." });
    }

    const db = await readDB();
    const index = db.faqs.findIndex(f => f.id === faq.id);

    if (index >= 0) {
      db.faqs[index] = { ...db.faqs[index], ...faq };
    } else {
      faq.id = "faq-" + Date.now();
      faq.orderIndex = db.faqs.length;
      db.faqs.push(faq);
    }

    await writeDB(db);
    res.json({ success: true, message: "FAQ saved!" });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete FAQ
app.delete("/api/admin/faqs/:id", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const db = await readDB();
    db.faqs = db.faqs.filter(f => f.id !== id);
    await writeDB(db);
    res.json({ success: true, message: "FAQ item removed successfully." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Toggle Inquiry read status
app.post("/api/admin/inquiries/:id/read", adminAuthGate, async (req, res) => {
  try {
    const id = req.params.id;
    const { read } = req.body;
    const db = await readDB();
    const index = db.inquiries.findIndex(i => i.id === id);
    if (index >= 0) {
      db.inquiries[index].read = !!read;
      await writeDB(db);
      return res.json({ success: true, message: "Inquiry status updated." });
    }
    res.status(404).json({ success: false, error: "Inquiry not found." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Export mailing list as CSV
app.get("/api/admin/mailing-list/export", adminAuthGate, async (req, res) => {
  try {
    const db = await readDB();
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

if (!process.env.VERCEL) {
  startServer().catch((e) => {
    console.error("Express boot startup crashed:", e);
  });
}

export default app;

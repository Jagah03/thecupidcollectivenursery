import express from "express";
import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({ limit: "15mb" }));

// ---- Types (inlined to avoid cross-file imports) ----
interface GlobalSettings {
    adminPassword: string;
    routingEmail: string;
    introHeadline: string;
    introSubheadline: string;
    introBody: string;
}
interface NurseryGuidelines {
    locationDescription: string;
    sessionBoundaries: string;
    rules: string;
    expectations: string;
}
interface NurseryPackage {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    isActive: boolean;
    isVirtual: boolean;
}
interface Caregiver {
    id: string;
    name: string;
    imageUrl: string;
    bio: string;
    philosophy: string;
}
interface BlogArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    date: string;
}
interface SafetyAlert {
    id: string;
    title: string;
    details: string;
    recommendations: string;
    date: string;
}
interface MentalHealthResource {
    id: string;
    name: string;
    phone: string;
    description: string;
    category: string;
}
interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
    orderIndex: number;
}
interface Testimonial {
    id: string;
    author: string;
    content: string;
}
interface Inquiry {
    id: string;
    name: string;
    pronouns: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    read: boolean;
}
interface DBStore {
    globalSettings: GlobalSettings;
    nurseryGuidelines: NurseryGuidelines;
    packages: NurseryPackage[];
    caregivers: Caregiver[];
    blogArticles: BlogArticle[];
    safetyAlerts: SafetyAlert[];
    hotlines: MentalHealthResource[];
    faqs: FAQItem[];
    testimonials: Testimonial[];
    inquiries: Inquiry[];
    mailingList: Array<{ email: string; date: string }>;
}

// ---- DB Path ----
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// ---- Supabase ----
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

// ---- Local DB helpers ----
function getDefaultDB(): DBStore {
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

function readLocalDB(): DBStore {
    try {
        if (fs.existsSync(DB_PATH)) {
            const raw = fs.readFileSync(DB_PATH, "utf-8");
            return JSON.parse(raw) as DBStore;
        }
    } catch (err) {
        console.error("Local database reading warning:", err);
    }
    return getDefaultDB();
}

function writeLocalDB(data: DBStore) {
    try {
        // In serverless, /tmp is the only writable directory
        const writePath = process.env.VERCEL ? "/tmp/db.json" : DB_PATH;
        fs.writeFileSync(writePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
        console.error("Local database writing error:", err);
    }
}

async function writeDBToSupabase(data: DBStore) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase
        .from("nursery_store")
        .upsert({ key: "cupid_db_store", data: data, updated_at: new Date().toISOString() });
    if (error) console.error("Supabase upsert error:", error.message);
}

async function readDB(): Promise<DBStore> {
    const supabase = getSupabase();
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from("nursery_store")
                .select("data")
                .eq("key", "cupid_db_store")
                .maybeSingle();
            if (!error && data && data.data) return data.data as DBStore;
            if (!error) {
                const localData = readLocalDB();
                await writeDBToSupabase(localData);
                return localData;
            }
        } catch (err: any) {
            console.error("Supabase read exception:", err.message || err);
        }
    }
    return readLocalDB();
}

async function writeDB(data: DBStore) {
    writeLocalDB(data);
    const supabase = getSupabase();
    if (supabase) {
        try { await writeDBToSupabase(data); } catch (err: any) { console.error("Supabase write exception:", err.message); }
    }
}

// ---- Admin Token ----
const ADMIN_TOKEN_KEY = "cupid_admin_secure_session_token_2026";
function adminAuthGate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.headers["authorization"] || req.headers["x-admin-token"];
    if (token !== ADMIN_TOKEN_KEY) {
        return res.status(403).json({ success: false, error: "Access Denied. Invalid or missing administrator credentials." });
    }
    next();
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

app.get("/api/public-content", async (req, res) => {
    try {
        const db = await readDB();
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
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/inquiries", async (req, res) => {
    try {
        const { name, pronouns, email, subject, message, agreedBoundaries } = req.body;
        if (!name || !email || !subject || !message)
            return res.status(400).json({ success: false, error: "Please complete all required fields." });
        if (!agreedBoundaries)
            return res.status(400).json({ success: false, error: "You must confirm you have read the Nursery boundaries." });
        const db = await readDB();
        db.inquiries.push({
            id: "inq-" + Date.now(),
            name: String(name).slice(0, 100),
            pronouns: String(pronouns || "Not specified").slice(0, 50),
            email: String(email).slice(0, 100),
            subject: String(subject).slice(0, 150),
            message: String(message).slice(0, 3000),
            date: new Date().toISOString(),
            read: false
        });
        await writeDB(db);
        res.json({ success: true, message: "Thank you! Your inquiries have been submitted. Our caregivers will contact you soon." });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/newsletter", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.includes("@"))
            return res.status(400).json({ success: false, error: "Please provide a valid email address." });
        const db = await readDB();
        const cleanEmail = email.trim().toLowerCase();
        if (db.mailingList.some(entry => entry.email === cleanEmail))
            return res.json({ success: true, message: "You are already subscribed to our newsletter list!" });
        db.mailingList.push({ email: cleanEmail, date: new Date().toISOString() });
        await writeDB(db);
        res.json({ success: true, message: "Warm welcome to our collective! You are subscribed." });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ==========================================
// ADMIN API ENDPOINTS
// ==========================================

app.post("/api/admin/login", async (req, res) => {
    try {
        const { password } = req.body;
        const db = await readDB();
        const correctPassword = db.globalSettings.adminPassword || "admin";
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

app.get("/api/admin/data", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        res.json({ success: true, data: db });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get("/api/admin/supabase-status", adminAuthGate, async (req, res) => {
    try {
        const url = process.env.SUPABASE_URL || "";
        const key = process.env.SUPABASE_KEY || "";
        if (!url || !key || url === "MY_SUPABASE_URL" || key === "MY_SUPABASE_KEY") {
            return res.json({ success: false, step: "config", error: "Supabase environment variables are missing.", envExample: { SUPABASE_URL: url || "(undefined)", SUPABASE_KEY: key ? "••••••••" : "(undefined)" } });
        }
        const supabase = getSupabase();
        if (!supabase) return res.json({ success: false, step: "client_init", error: "Failed to initialize Supabase client." });
        const { data, error } = await supabase.from("nursery_store").select("key").eq("key", "cupid_db_store").maybeSingle();
        if (error) return res.json({ success: false, step: "read_error", error: error.message });
        return res.json({ success: true, step: "complete", message: "Supabase connected successfully!", row: data });
    } catch (e: any) {
        res.status(500).json({ success: false, step: "exception", error: e.message });
    }
});

app.post("/api/admin/update-settings", adminAuthGate, async (req, res) => {
    try {
        const { routingEmail, introHeadline, introSubheadline, introBody, adminPassword } = req.body;
        if (!routingEmail || !introHeadline || !introSubheadline || !introBody)
            return res.status(400).json({ success: false, error: "Required global values cannot be empty." });
        const db = await readDB();
        db.globalSettings = { ...db.globalSettings, routingEmail, introHeadline, introSubheadline, introBody };
        if (adminPassword && adminPassword.trim() !== "") db.globalSettings.adminPassword = adminPassword.trim();
        await writeDB(db);
        res.json({ success: true, message: "Global settings successfully updated!" });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/update-guidelines", adminAuthGate, async (req, res) => {
    try {
        const { locationDescription, sessionBoundaries, rules, expectations } = req.body;
        const db = await readDB();
        db.nurseryGuidelines = { locationDescription: locationDescription || "", sessionBoundaries: sessionBoundaries || "", rules: rules || "", expectations: expectations || "" };
        await writeDB(db);
        res.json({ success: true, message: "Nursery guidelines updated!" });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/packages", adminAuthGate, async (req, res) => {
    try {
        const pkg = req.body as NurseryPackage;
        if (!pkg.name || !pkg.description || pkg.duration <= 0 || pkg.price < 0)
            return res.status(400).json({ success: false, error: "Please enter valid values for the package fields." });
        const db = await readDB();
        const index = db.packages.findIndex(p => p.id === pkg.id);
        if (index >= 0) { db.packages[index] = { ...db.packages[index], ...pkg }; }
        else { pkg.id = "pkg-" + Date.now(); db.packages.push(pkg); }
        await writeDB(db);
        res.json({ success: true, message: "Package details saved!", package: pkg });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete("/api/admin/packages/:id", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        db.packages = db.packages.filter(p => p.id !== req.params.id);
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/caregivers", adminAuthGate, async (req, res) => {
    try {
        const caregiver = req.body as Caregiver;
        if (!caregiver.name || !caregiver.bio || !caregiver.philosophy)
            return res.status(400).json({ success: false, error: "Name, Biography, and Philosophy are required." });
        const db = await readDB();
        const index = db.caregivers.findIndex(c => c.id === caregiver.id);
        if (index >= 0) { db.caregivers[index] = { ...db.caregivers[index], ...caregiver }; }
        else {
            caregiver.id = "cg-" + Date.now();
            if (!caregiver.imageUrl || caregiver.imageUrl.trim() === "") caregiver.imageUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400";
            db.caregivers.push(caregiver);
        }
        await writeDB(db);
        res.json({ success: true, message: "Caregiver profile saved!", caregiver });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete("/api/admin/caregivers/:id", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        db.caregivers = db.caregivers.filter(c => c.id !== req.params.id);
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/blog", adminAuthGate, async (req, res) => {
    try {
        const article = req.body as BlogArticle;
        if (!article.title || !article.content || !article.category)
            return res.status(400).json({ success: false, error: "Title, content, and category are required." });
        const db = await readDB();
        const index = db.blogArticles.findIndex(b => b.id === article.id);
        if (index >= 0) { db.blogArticles[index] = { ...db.blogArticles[index], ...article }; }
        else { article.id = "blog-" + Date.now(); article.date = new Date().toISOString().split("T")[0]; db.blogArticles.push(article); }
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete("/api/admin/blog/:id", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        db.blogArticles = db.blogArticles.filter(b => b.id !== req.params.id);
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/safety-alerts", adminAuthGate, async (req, res) => {
    try {
        const alert = req.body as SafetyAlert;
        if (!alert.title || !alert.details || !alert.recommendations)
            return res.status(400).json({ success: false, error: "Title, details, and recommendations are required." });
        const db = await readDB();
        const index = db.safetyAlerts.findIndex(s => s.id === alert.id);
        if (index >= 0) { db.safetyAlerts[index] = { ...db.safetyAlerts[index], ...alert }; }
        else { alert.id = "safe-" + Date.now(); alert.date = new Date().toISOString().split("T")[0]; db.safetyAlerts.push(alert); }
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete("/api/admin/safety-alerts/:id", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        db.safetyAlerts = db.safetyAlerts.filter(s => s.id !== req.params.id);
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/hotlines", adminAuthGate, async (req, res) => {
    try {
        const hot = req.body as MentalHealthResource;
        if (!hot.name || !hot.phone || !hot.description || !hot.category)
            return res.status(400).json({ success: false, error: "Name, phone, category, and description are required." });
        const db = await readDB();
        const index = db.hotlines.findIndex(h => h.id === hot.id);
        if (index >= 0) { db.hotlines[index] = { ...db.hotlines[index], ...hot }; }
        else { hot.id = "hl-" + Date.now(); db.hotlines.push(hot); }
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete("/api/admin/hotlines/:id", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        db.hotlines = db.hotlines.filter(h => h.id !== req.params.id);
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/faqs", adminAuthGate, async (req, res) => {
    try {
        const faq = req.body as FAQItem;
        if (!faq.question || !faq.answer || !faq.category)
            return res.status(400).json({ success: false, error: "Question, answer, and category are required." });
        const db = await readDB();
        const index = db.faqs.findIndex(f => f.id === faq.id);
        if (index >= 0) { db.faqs[index] = { ...db.faqs[index], ...faq }; }
        else { faq.id = "faq-" + Date.now(); faq.orderIndex = db.faqs.length; db.faqs.push(faq); }
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete("/api/admin/faqs/:id", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        db.faqs = db.faqs.filter(f => f.id !== req.params.id);
        await writeDB(db);
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post("/api/admin/inquiries/:id/read", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        const index = db.inquiries.findIndex(i => i.id === req.params.id);
        if (index >= 0) {
            db.inquiries[index].read = !!req.body.read;
            await writeDB(db);
            return res.json({ success: true });
        }
        res.status(404).json({ success: false, error: "Inquiry not found." });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get("/api/admin/mailing-list/export", adminAuthGate, async (req, res) => {
    try {
        const db = await readDB();
        const csvRows = (db.mailingList || []).map(e => `"${e.email.replace(/"/g, '""')}","${e.date}"`).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=newsletter_subscribers.csv");
        res.status(200).send("Email Address,Subscription Date\n" + csvRows);
    } catch (e: any) {
        res.status(500).send("Error: " + e.message);
    }
});

export default app;

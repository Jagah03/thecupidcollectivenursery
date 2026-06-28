import "dotenv/config";
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json({ limit: "15mb" }));

// ---- Types (inlined to avoid cross-file imports) ----
interface GlobalSettings {
  adminPassword?: string;
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
  date: string;
  category: string;
}

interface SafetyAlert {
  id: string;
  title: string;
  date: string;
  details: string;
  recommendations: string;
}

interface MentalHealthResource {
  id: string;
  name: string;
  phone: string;
  textCode?: string;
  link?: string;
  category: string;
  description: string;
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
  quote: string;
  rating: number;
  role: string;
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

interface PrivateInquiry {
  id: string;
  name: string;
  pronouns: string;
  email: string;
  fantasy: string;
  specialRequest: string;
  date: string;
  read: boolean;
}

// New interface for registered users
export interface RegisteredUser {
  id: string;
  name: string;
  pronouns: string;
  age: string;
  goals: string;
  email: string;
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
  privateInquiries: PrivateInquiry[];
  registeredUsers: RegisteredUser[];
  mailingList: Array<{ email: string; date: string }>;
}

// ---- Supabase ----
let supabaseClient: any = null;
function getSupabase() {
    if (!supabaseClient) {
        const url = process.env.SUPABASE_URL || "";
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                process.env.SUPABASE_KEY || "";
        if (url && key && url !== "MY_SUPABASE_URL" && key !== "MY_SUPABASE_KEY" && url.trim() !== "" && key.trim() !== "" && process.env.SUPABASE_SERVICE_ROLE_KEY !== "MY_SUPABASE_SERVICE_ROLE_KEY") {
            supabaseClient = createClient(url, key);
        }
    }
    return supabaseClient;
}

function getDefaultDB(): DBStore {
    return {
        globalSettings: {
            adminPassword: "admin",
            routingEmail: "care@thecupidcollectivenursery.com",
            introHeadline: "A Safe, Nurturing Sanctuary for Therapeutic Age-Regression",
            introSubheadline: "Step into a professionally-guided, non-sexual space designed to relieve adult stress, anxiety, and trauma.",
            introBody: "The Cupid Collective Nursery offers a welcoming environment where adults (18+) can safely utilize childhood regression as a healthy, guided coping mechanism. Led by professional, compassionate caregivers, our programs offer a peaceful escape from the demands of everyday life, ensuring complete safety, clear boundaries, and empathetic care."
        },
        nurseryGuidelines: {
            locationDescription: "Our primary physical sanctuary is nestled in a quiet, private location, designed to feel exactly like a warm, comforting nursery. Complete with soft pastel colors, reading nooks, activity tables, and clean amenities, it offers the ultimate peace of mind.",
            sessionBoundaries: "### Absolute Boundaries (Strictly Non-Sexual)\n- **Strict Professional Standards**: The Cupid Collective Nursery operates on a 100% therapeutic, non-sexual foundation. No sexual behaviors, language, or implications are tolerated under any circumstances.\n- **Consent & Dual-Signed Agreements**: Written consent contracts detailing specific activities, limits, and rules are signed by both staff and clients before every session begins.\n- **Active Session Stop Signals**: Reliable verbal and non-verbal 'stop' signals are established so that clients maintain complete control over their physical safety.\n- **Dress Code**: Modest, non-suggestive clothing is required for all clients and staff.",
            rules: "### Nursery House Rules\n1. **Kindness First**: Respect the space, yourself, and your caregivers at all times.\n2. **Cleanliness**: Always wash hands before snacks and clean up toys when finished playing.\n3. **Honesty**: Communicate how you feel. If you feel scared, happy, tired, or overwhelmed, share it with Mommy or Nanny.\n4. **Inside Voices**: Help keep the nursery peaceful by using soft, quiet voices during quiet hours.",
            expectations: "### What to Expect\n- **Consultation Integration**: Every relationship begins with an in-depth intake call to discuss emotional triggers, desired regression level (infancy, toddlerhood, early school-age), and specific care goals.\n- **Unconditional Care**: We supply custom snacks, tailored story sessions, interactive drawing prompts, and guided sensory play.\n- **Safe Transition Integration**: Caregivers provide structured warm-down periods to help you transition smoothly and safely back into your adult headspace."
        },
        packages: [
            {
                id: "pkg-1",
                name: "Nursery Playtime & Sensory Session",
                description: "An immersive in-person session in our physical playroom. Includes custom coloring, sensory toys (kinetic sand, blocks), personalized snack-time, and therapeutic caregiver support.",
                duration: 180,
                price: 280,
                isActive: true,
                isVirtual: false
            },
            {
                id: "pkg-2",
                name: "Nursery Nurture & Bedtime Comfort",
                description: "Our premium in-person regression session. Designed for deeper stress relief. Includes story reading, soft nursery rhyme therapy, caregiver feeding assistance if requested, cuddles, and an extended nap period.",
                duration: 240,
                price: 380,
                isActive: true,
                isVirtual: false
            },
            {
                id: "pkg-3",
                name: "Virtual Caregiver Consultation",
                description: "A 1-on-1 virtual video counseling session to discuss your therapeutic age regression goals, design customized home routines, and review healthy boundary-setting techniques.",
                duration: 60,
                price: 85,
                isActive: true,
                isVirtual: true
            },
            {
                id: "pkg-4",
                name: "Virtual Storytime & Cozy Co-Regulating",
                description: "A heartwarming virtual caregiver session via Zoom, Google Meet, or Discord. Enjoy comforting storybook reading, soft caregiver check-ins, nursery talk, and interactive drawing games.",
                duration: 90,
                price: 120,
                isActive: true,
                isVirtual: true
            }
        ],
        caregivers: [
            {
                id: "cg-1",
                name: "Mommy Emma",
                imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
                bio: "Emma is a certified social worker and experienced nursery care dynamic facilitator who has dedicated her life to mental health care and comforting safe spaces. She believes that healing our inner child is vital for adult well-being.",
                philosophy: "Therapeutic age-regression is not about escaping reality permanently, but about resting the adult mind so it can return to everyday challenges with renewed peace and resilience."
            },
            {
                id: "cg-2",
                name: "Nanny Clara",
                imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
                bio: "Clara holds a degree in Early Childhood Studies and has spent over six years consulting with individuals on trauma rehabilitation and ADHD sensory management techniques.",
                philosophy: "Every adult carries burdens they were forced to take on too early. My goal is to create a nurturing, unconditionally quiet cocoon where you can temporarily put that armor down."
            }
        ],
        blogArticles: [
            {
                id: "blog-1",
                title: "A Guide to Safe Regression Spaces at Home",
                content: "Creating a personal nursery at home doesn't require a whole room. A cozy corner with soft pastel pillows, stuffed animals, coloring supplies, and specialized non-alcoholic beverages is a great start. Learn how to craft a sensory regression kit today.",
                date: "2026-06-15",
                category: "Reviews"
            },
            {
                id: "blog-2",
                title: "Reviews: Top Comfort Products of 2026",
                content: "Our caregivers reviewed the latest therapeutic regression items on the market. From specialized heavy blankets that help alleviate ADHD sensory overloads, to high-durability infant-styled melamine dining sets designed for safe therapeutic motor-control exercises.",
                date: "2026-05-20",
                category: "Reviews"
            },
            {
                id: "blog-3",
                title: "What to Expect at ABDL Conventions",
                content: "Attending public adult community gatherings can be stressful for beginners. We cover travel checklists, hotel security boundaries, and how to verify that organizers uphold professional, safe standards for regressors and companions alike.",
                date: "2026-04-10",
                category: "Conventions"
            }
        ],
        safetyAlerts: [
            {
                id: "safe-1",
                title: "Online Financial Grooming Exploitations",
                date: "2026-06-18",
                details: "We have received community warnings regarding malicious actors posting as caregiver figures with the primary intent of extracting heavy financial payments or emotional blackmail.",
                recommendations: "Never send personal money transfers to unvetted 'caregivers' online. Set professional consultation frameworks, utilize transparent platform billing, and immediately cease conversations if a caregiver pressures you for financial favors or personal identification documents."
            },
            {
                id: "safe-2",
                title: "Identifying Vetted Therapeutic Frameworks",
                date: "2026-05-14",
                details: "Understanding who is on the internet is vital for adult safety. Authentic, ethical caregiving services must always provide standard boundary checklists, age gates, clear non-sexual declarations, and standard corporate consultation channels.",
                recommendations: "Always check for a clear and professional privacy policy, structured dual-signed agreement files, and public reviews or social standing indicators before engaging in direct virtual caregiving packages."
            }
        ],
        hotlines: [
            {
                id: "hl-1",
                name: "National Crisis Lifeline (USA)",
                phone: "988",
                textCode: "988",
                link: "https://988lifeline.org",
                category: "General",
                description: "Free, confidential, 24/7 suicide and mental health crisis support service."
            },
            {
                id: "hl-2",
                name: "Crisis Text Line",
                phone: "Text HOME to 741741",
                textCode: "HOME to 741741",
                link: "https://www.crisistextline.org",
                category: "General",
                description: "Standard mental health text line supporting emotional distress crisis support."
            },
            {
                id: "hl-3",
                name: "Veterans Crisis Line",
                phone: "988 (Press 1)",
                textCode: "838255",
                link: "https://www.veteranscrisisline.net",
                category: "Veterans",
                description: "Dedicated, secure crisis support for military veterans, service members, and their families."
            },
            {
                id: "hl-4",
                name: "The Trevor Project Lifeline",
                phone: "1-866-488-7386",
                textCode: "START to 678-678",
                link: "https://www.thetrevorproject.org",
                category: "LGBTQ+",
                description: "Under-25 crisis line specifically staffed and tailored for LGBTQ+ youth."
            }
        ],
        faqs: [
            {
                id: "faq-1",
                question: "What is Age-Regression?",
                answer: "Age-regression is a natural psychological coping mechanism where an adult temporarily retreats to an earlier childhood state to relieve stress, anxiety, or heal trauma. It allows the conscious mind to release worries and experience quiet nurturing.",
                category: "Terminology",
                orderIndex: 0
            },
            {
                id: "faq-2",
                question: "Is this platform or your sessions sexual in any way?",
                answer: "No. The Cupid Collective Nursery operates on a highly strict, 100% professional non-sexual framework. Regression sessions are entirely platonic, therapeutic, and boundary-checked. We strictly support adult psychological health.",
                category: "Safety",
                orderIndex: 1
            },
            {
                id: "faq-3",
                question: "How do you verify my age?",
                answer: "All visitors must consent to our age gates confirming they are 18 years or older. All physical or virtual sessions require submitting state-issued picture IDs to prove adult legal status before booking.",
                category: "Administration",
                orderIndex: 2
            }
        ],
        testimonials: [
            {
                id: "t-1",
                author: "Theo (Little Theo)",
                quote: "Mommy Emma and Nanny Clara are incredibly respectful of boundaries. Coming here has helped ease my complex PTSD more than any conventional clinical therapy alone.",
                rating: 5,
                role: "In-person Little"
            },
            {
                id: "t-2",
                author: "Maya",
                quote: "The virtual storytime sessions help me fall into a physical sleep without overnight panic attacks. I feel so incredibly protected and validated.",
                rating: 5,
                role: "Virtual Client"
            },
            {
                id: "t-3",
                author: "Coby",
                quote: "Exceptional respect for agreement documents. Having dual-signed session boundaries makes it totally stress-free to regress securely.",
                rating: 5,
                role: "Nursery Session regular"
            }
        ],
        inquiries: [],
        privateInquiries: [],
        registeredUsers: [],
        mailingList: []
    };
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
    // 1️⃣ Try Supabase first
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from("nursery_store")
                .select("data")
                .eq("key", "cupid_db_store")
                .maybeSingle();
            if (error) {
                console.warn("Supabase query warning:", error.message);
                // fall through to fallback storage
            } else if (data && data.data) {
                const db = data.data as DBStore;
                // Ensure new collections exist for older DB versions
                if (!Array.isArray(db.privateInquiries)) db.privateInquiries = [];
                if (!Array.isArray(db.inquiries)) db.inquiries = [];
                if (!Array.isArray(db.registeredUsers)) db.registeredUsers = [];
                return db;
            } else {
                console.log("Supabase row 'cupid_db_store' not found. Initializing with default db configuration...");
                const defaultData = getDefaultDB();
                await writeDBToSupabase(defaultData);
                return defaultData;
            }
        } catch (err: any) {
            console.error("Supabase read exception:", err.message || err);
        }
    }
    // 2️⃣ Local file fallback
    try {
        const filePath = path.resolve(process.cwd(), "local_db.json");
        const raw = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw) as DBStore;
        // Ensure arrays exist
        if (!Array.isArray(parsed.privateInquiries)) parsed.privateInquiries = [];
        if (!Array.isArray(parsed.inquiries)) parsed.inquiries = [];
        if (!Array.isArray(parsed.registeredUsers)) parsed.registeredUsers = [];
        return parsed;
    } catch (e) {
        // If file missing or parse error, start with defaults
        return getDefaultDB();
    }
}

async function writeDB(data: DBStore) {
    const supabase = getSupabase();
    // 1️⃣ If Supabase client exists, try to persist there
    if (supabase) {
        try {
            await writeDBToSupabase(data);
            return;
        } catch (err: any) {
            console.error("Supabase write exception:", err.message);
        }
    }
    // 2️⃣ Fallback to local JSON file
    try {
        const filePath = path.resolve(process.cwd(), "local_db.json");
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log("Local DB write succeeded.");
    } catch (e) {
        console.error("Failed to write local DB fallback:", e);
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

// Register user endpoint
app.post("/api/register-user", async (req, res) => {
  try {
    const { name, pronouns, age, goals, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }
    const db = await readDB();
    if (!Array.isArray(db.registeredUsers)) {
      db.registeredUsers = [];
    }
    db.registeredUsers.push({
      id: "usr-" + Date.now(),
      name: String(name).slice(0, 100),
      pronouns: String(pronouns || "Not specified").slice(0, 50),
      age: String(age || "").slice(0, 10),
      goals: String(goals || "").slice(0, 1000),
      email: String(email).slice(0, 100),
      date: new Date().toISOString(),
      read: false
    });
    await writeDB(db);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Private Inquiry (no payment)
app.post("/api/private-inquiries", async (req, res) => {
  try {
    const { name, pronouns, email, fantasy, specialRequest } = req.body;
    if (!name || !email || !fantasy || !specialRequest) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }
    const db = await readDB();
    // Ensure array exists for older DB versions
    if (!Array.isArray(db.privateInquiries)) {
      db.privateInquiries = [];
    }
    db.privateInquiries.push({
      id: "pinq-" + Date.now(),
      name: String(name).slice(0, 100),
      pronouns: String(pronouns || "Not specified").slice(0, 50),
      email: String(email).slice(0, 100),
      fantasy: String(fantasy).slice(0, 500),
      specialRequest: String(specialRequest).slice(0, 2000),
      date: new Date().toISOString(),
      read: false
    });
    await writeDB(db);
    res.json({ success: true, message: "Private inquiry saved." });
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

// Create Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
    try {
        const { subject } = req.body;
        if (!subject) {
            return res.status(400).json({ error: "Missing subject" });
        }

        const db = await readDB();
        const cleanSubject = subject.replace(/^(In-Person Package|Virtual Package):\s*/i, "");
        const pkg = db.packages.find((p: any) => p.name === cleanSubject);
        if (!pkg) {
            return res.status(400).json({ error: "Package not found for: " + subject });
        }

        const { default: Stripe } = await import("stripe");
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

        const origin = req.headers.origin || `https://${req.headers.host || "thecupidcollectivenursery.me"}`;
        const domain = origin.includes("localhost") || origin.includes("127.0.0.1")
            ? origin
            : "https://thecupidcollectivenursery.me";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: pkg.name },
                        unit_amount: Math.round(pkg.price * 100),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${domain}/bookings?success=true`,
            cancel_url: `${domain}/bookings?canceled=true`,
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (e: any) {
        console.error("Stripe session creation error:", e);
        res.status(500).json({ error: e.message || "Failed to create checkout session" });
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

// Toggle read flag for private inquiries
app.post("/api/admin/private-inquiries/:id/read", adminAuthGate, async (req, res) => {
  try {
    const db = await readDB();
    const index = db.privateInquiries.findIndex(i => i.id === req.params.id);
    if (index >= 0) {
      db.privateInquiries[index].read = !!req.body.read;
      await writeDB(db);
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: "Private inquiry not found." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Toggle read flag for registered users
app.post("/api/admin/registered-users/:id/read", adminAuthGate, async (req, res) => {
  try {
    const db = await readDB();
    const index = db.registeredUsers.findIndex(u => u.id === req.params.id);
    if (index >= 0) {
      db.registeredUsers[index].read = !!req.body.read;
      await writeDB(db);
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: "User not found." });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Delete a single private inquiry
app.delete("/api/admin/private-inquiries/:id", adminAuthGate, async (req, res) => {
  try {
    const db = await readDB();
    const before = db.privateInquiries.length;
    db.privateInquiries = db.privateInquiries.filter(i => i.id !== req.params.id);
    if (db.privateInquiries.length === before) {
      return res.status(404).json({ success: false, error: "Private inquiry not found." });
    }
    await writeDB(db);
    res.json({ success: true });
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

import "dotenv/config";
import express from "express";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { DBStore, GlobalSettings, NurseryGuidelines, NurseryPackage, Caregiver, BlogArticle, SafetyAlert, MentalHealthResource, FAQItem, Testimonial, Inquiry } from "./src/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "15mb" })); // Support large base64 uploads if needed

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
    mailingList: []
  };
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
        console.warn("Supabase query warning:", error.message);
        return getDefaultDB();
      } else if (data && data.data) {
        return data.data as DBStore;
      } else {
        console.log("Supabase row 'cupid_db_store' not found. Initializing with default db configuration...");
        const defaultData = getDefaultDB();
        await writeDBToSupabaseOnly(defaultData);
        return defaultData;
      }
    } catch (err: any) {
      console.error("Supabase failover read exception:", err.message || err);
    }
  }
  return getDefaultDB();
}

// Lazy-initialized asynchronous global writeDB helper
async function writeDB(data: DBStore) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await writeDBToSupabaseOnly(data);
    } catch (err: any) {
      console.error("Supabase failover write exception:", err.message || err);
    }
  } else {
    console.warn("Supabase is not initialized. Cannot persist writeDB.");
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

// Create Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject) {
      return res.status(400).json({ error: "Missing subject" });
    }

    const db = await readDB();
    const cleanSubject = subject.replace(/^(In-Person Package|Virtual Package):\s*/i, "");
    const pkg = db.packages.find(p => p.name === cleanSubject);
    if (!pkg) {
      return res.status(400).json({ error: "Package not found for: " + subject });
    }

    const origin = req.headers.origin || `https://${req.headers.host || "thecupidcollectivenursery.me"}`;
    const protocol = origin.startsWith("https") ? "https" : "http";
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
    const { createServer: createViteServer } = await import("vite");
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

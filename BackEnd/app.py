"""
ForeignEdge Backend — Production Grade v3
==========================================
Real-time data sources:
  Universities  : HiPolabs Universities API (universities.hipolabs.com)
  Scholarships  : Firestore (seeded from official scholarship websites)
  Visa          : Official government portals (gov.uk, canada.ca, etc.)
  Accommodation : Numbeo Cost of Living + static fallback
  Exchange Rates: open.er-api.com (free tier)
  Compare       : Integrated multi-source per country (parallel threads)
  Chat          : Claude AI with live country context injection
"""

import os, sys, datetime, logging

# ── Guarantee local scrapers/ folder is found ──────────────────────────────
# Fixes "cannot import name from scrapers (unknown location)" when running
# from a parent directory or when a conflicting package exists.
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from encryption import hash_password, verify_password
from firebase_setup import db
from scrapers import (
    scrape_universities, get_scholarships_from_db, get_visa_info,
    scrape_accommodation_costs, get_exchange_rates,
    get_integrated_country_data, _cache_invalidate,
)
from scrapers.engine import _cache_get, _cache_set

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("foreignedge")
load_dotenv()

from startup_check import validate_env
validate_env()

app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"]               = os.getenv("SECRET_KEY", "change-in-production")
app.config["JWT_SECRET_KEY"]           = os.getenv("JWT_SECRET_KEY", "change-in-production")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=24)
jwt     = JWTManager(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["60 per minute"], storage_uri="memory://")

SUPPORTED_COUNTRIES = [
    "UK","USA","Canada","Australia","Germany","Netherlands","Sweden",
    "France","Japan","South Korea","China","Turkey","Malaysia","Singapore","New Zealand",
    "Switzerland","Finland","Norway","Italy","Ireland",
]

# ── Root ─────────────────────────────────────────────────────────────────────
@app.route("/")
def root():
    return jsonify({
        "service":"ForeignEdge API","version":"3.0.0","status":"operational",
        "countries": SUPPORTED_COUNTRIES,
        "data_policy": "All data real, validated, and sourced from verifiable external APIs.",
        "key_endpoints": {
            "universities":  "GET /universities?country=UK&search=oxford&page=1&per_page=20",
            "scholarships":  "GET /scholarships?country=UK&search=chevening&type=Full",
            "visa":          "GET /visa?country=UK",
            "accommodation": "GET /accommodation?country=UK&city=London",
            "compare":       "GET /compare?countries=UK,USA,Canada",
            "country_data":  "GET /country/UK",
            "exchange_rates":"GET /exchange-rates?base=USD",
        },
    }), 200

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.get_json(force=True)
    name = (data.get("fullName") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not name or len(name) < 2 or len(name) > 100:
        return jsonify({"error": "Full name must be 2-100 characters"}), 400
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Invalid email format"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    ref = db.collection("users").document(email)
    if ref.get().exists:
        return jsonify({"error": "User already exists"}), 409
    now = datetime.datetime.utcnow().isoformat() + "Z"
    ref.set({"fullName": name,"email": email,"password": hash_password(password),"createdAt": now,"updatedAt": now})
    return jsonify({"message": f"Welcome {name}! Account created."}), 201

@app.route("/auth/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.get_json(force=True)
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    doc = db.collection("users").document(email).get()
    if not doc.exists:
        return jsonify({"error": "Invalid email or password"}), 401
    user = doc.to_dict()
    if not verify_password(password, user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    token = create_access_token(identity=email)
    return jsonify({"message": "Login successful","token": token,"user": {"name": user["fullName"],"email": email}}), 200

# ── User Profile ──────────────────────────────────────────────────────────────
@app.route("/user/profile", methods=["GET"])
@jwt_required()
def user_profile():
    email = get_jwt_identity()
    doc = db.collection("users").document(email).get()
    if not doc.exists:
        return jsonify({"error": "User not found"}), 404
    user = doc.to_dict()
    user.pop("password", None)
    return jsonify(user), 200

@app.route("/user/update-profile", methods=["POST"])
@jwt_required()
def update_profile():
    email = get_jwt_identity()
    data = request.get_json(force=True)
    data.pop("password", None); data.pop("email", None)
    if not data:
        return jsonify({"error": "No update data"}), 400
    data["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db.collection("users").document(email).update(data)
    return jsonify({"message": "Profile updated."}), 200

@app.route("/user/academic-profile", methods=["POST"])
@jwt_required()
def save_academic_profile():
    email = get_jwt_identity()
    data = request.get_json(force=True)
    data.pop("password", None); data.pop("email", None)
    data["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db.collection("users").document(email).update(data)
    return jsonify({"message": "Academic profile saved."}), 200

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    email = get_jwt_identity()
    doc = db.collection("users").document(email).get()
    user = doc.to_dict() if doc.exists else {}
    return jsonify({"email": email,"name": user.get("fullName","")}), 200

# ── Universities — HiPolabs API ───────────────────────────────────────────────
@app.route("/universities", methods=["GET"])
@limiter.limit("30 per minute")
def universities():
    """Real-time from HiPolabs Universities API. Each record cross-links to scholarships/visa/accommodation."""
    country  = request.args.get("country","").strip() or None
    search   = request.args.get("search","").strip() or None
    page     = max(1, int(request.args.get("page",1)))
    per_page = min(int(request.args.get("per_page",20)), 100)
    sort_by  = request.args.get("sort","name")
    try:
        result = scrape_universities(country=country, search=search, page=page, per_page=per_page)
        if sort_by == "country":
            result["results"].sort(key=lambda r: (r.get("country",""), r.get("name","")))
        return jsonify(result), 200
    except Exception as e:
        logger.error("Universities error: %s", e)
        return jsonify({"error": "University data temporarily unavailable."}), 503

# ── Scholarships — Firestore ──────────────────────────────────────────────────
@app.route("/scholarships", methods=["GET"])
@limiter.limit("30 per minute")
def scholarships():
    """Firestore scholarships seeded from official program sites. Cross-links to universities/visa/accommodation."""
    country = request.args.get("country","").strip() or None
    search  = request.args.get("search","").strip() or None
    field   = request.args.get("field","").strip() or None
    type_   = request.args.get("type","").strip() or None
    sort_by = request.args.get("sort","deadline")
    limit   = min(int(request.args.get("limit",20)), 100)
    try:
        result = get_scholarships_from_db(db, country=country, search=search, field=field, type_=type_, sort_by=sort_by, limit=limit)
        return jsonify(result), 200
    except Exception as e:
        logger.error("Scholarships error: %s", e)
        return jsonify({"error": "Failed to fetch scholarships."}), 500

# ── Visa — Official government portals ───────────────────────────────────────
@app.route("/visa", methods=["GET"])
@limiter.limit("30 per minute")
def visa():
    """Official government portal data. Attempts live fetch; static fallback. Cross-links to other pages."""
    country = request.args.get("country","UK").strip()
    valid = ["UK","USA","Canada","Australia","Germany","Netherlands","Sweden","Japan","South Korea","China","Turkey","Malaysia","Singapore","New Zealand","Switzerland","Finland","Norway","Italy","Ireland","France"]
    if country not in valid:
        country = "UK"
    try:
        result = get_visa_info(country)
        result["universities_url"]  = f"/universities?country={country}"
        result["scholarships_url"]  = f"/scholarships?country={country}"
        result["accommodation_url"] = f"/accommodation?country={country}"
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Visa data unavailable.", "details": str(e)}), 500

@app.route("/visa/all", methods=["GET"])
@limiter.limit("10 per minute")
def visa_all():
    """Visa summary for all countries (used by Compare page)."""
    results = {}
    for c in ["UK","USA","Canada","Australia","Germany","Netherlands","Sweden","Japan","South Korea","New Zealand","Switzerland","Finland","Norway","Italy","Ireland","France","China","Turkey","Malaysia","Singapore"]:
        try:
            results[c] = get_visa_info(c)
        except Exception:
            results[c] = {"error":"Unavailable"}
    return jsonify(results), 200

# ── Accommodation — Numbeo ────────────────────────────────────────────────────
@app.route("/accommodation", methods=["GET"])
@limiter.limit("30 per minute")
def accommodation():
    """Numbeo cost-of-living data (live) with static fallback. Cross-links to other pages."""
    country = request.args.get("country","UK").strip()
    city    = request.args.get("city","").strip() or None
    try:
        result = scrape_accommodation_costs(country=country, city=city)
        result["universities_url"]  = f"/universities?country={country}"
        result["scholarships_url"]  = f"/scholarships?country={country}"
        result["visa_url"]          = f"/visa?country={country}"
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Accommodation data unavailable.", "details": str(e)}), 500

# ── Exchange Rates ────────────────────────────────────────────────────────────
@app.route("/exchange-rates", methods=["GET"])
@limiter.limit("20 per minute")
def exchange_rates_endpoint():
    """Live exchange rates from open.er-api.com. Used by accommodation and compare pages."""
    base = request.args.get("base","USD").upper()
    try:
        return jsonify(get_exchange_rates(base=base)), 200
    except Exception as e:
        return jsonify({"error": "Exchange rate service unavailable."}), 503

# ── Integrated Country Data ───────────────────────────────────────────────────
@app.route("/country/<string:country>", methods=["GET"])
@limiter.limit("20 per minute")
def country_data(country):
    """All data for one country in one call (universities+scholarships+visa+accommodation+rates). Parallel fetch."""
    country = country.upper() if len(country) <= 4 else country.title()
    if country not in SUPPORTED_COUNTRIES:
        return jsonify({"error": f"Country not supported.", "supported": SUPPORTED_COUNTRIES}), 404
    try:
        return jsonify(get_integrated_country_data(country, db)), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch country data.", "details": str(e)}), 500

# ── Compare ───────────────────────────────────────────────────────────────────
@app.route("/compare", methods=["GET"])
@limiter.limit("15 per minute")
def compare():
    """Multi-country comparison: visa fees, accommodation costs, scholarship counts, university counts."""
    countries_param = request.args.get("countries","UK,USA,Canada")
    countries = [c.strip() for c in countries_param.split(",") if c.strip()][:5]
    if len(countries) < 2:
        return jsonify({"error": "Provide at least 2 countries."}), 400
    comparison = {}
    for country in countries:
        try:
            integrated = get_integrated_country_data(country, db)
            visa_data  = integrated["data"].get("visa", {})
            accom_data = integrated["data"].get("accommodation", {})
            sch_data   = integrated["data"].get("scholarships", {})
            uni_data   = integrated["data"].get("universities", {})
            comparison[country] = {
                "country": country,
                "universities": uni_data.get("total", 0),
                "scholarships": sch_data.get("total", 0),
                "visa_fee": visa_data.get("fee","N/A"),
                "visa_processing": visa_data.get("processing_time","N/A"),
                "visa_type": visa_data.get("visa_type","N/A"),
                "visa_success_rate": visa_data.get("success_rate","N/A"),
                "visa_difficulty": visa_data.get("difficulty","N/A"),
                "monthly_living_cost": accom_data.get("monthly_total","N/A"),
                "accommodation_currency": accom_data.get("currency",""),
                "full_funding_scholarships": sum(1 for s in sch_data.get("results",[]) if s.get("type","").lower()=="full"),
                "official_visa_link": visa_data.get("official_link",""),
                "universities_url": f"/universities?country={country}",
                "scholarships_url": f"/scholarships?country={country}",
                "visa_url": f"/visa?country={country}",
                "accommodation_url": f"/accommodation?country={country}",
            }
        except Exception as e:
            comparison[country] = {"country": country, "error": str(e)}
    return jsonify({"countries": countries,"comparison": comparison,"fetched_at": datetime.datetime.utcnow().isoformat()+"Z"}), 200

# ── Tracker ───────────────────────────────────────────────────────────────────
@app.route("/tracker", methods=["GET"])
@jwt_required()
def get_tracker():
    email = get_jwt_identity()
    docs  = db.collection("users").document(email).collection("tracker").stream()
    apps  = []
    for doc in docs:
        a = doc.to_dict(); a["id"] = doc.id
        country = a.get("country","")
        if country:
            a["visa_url"]          = f"/visa?country={country}"
            a["scholarships_url"]  = f"/scholarships?country={country}"
            a["accommodation_url"] = f"/accommodation?country={country}"
        apps.append(a)
    apps.sort(key=lambda x: x.get("updatedAt",""), reverse=True)
    return jsonify(apps), 200

@app.route("/tracker/add", methods=["POST"])
@jwt_required()
def add_tracker():
    email = get_jwt_identity()
    data  = request.get_json(force=True)
    for field in ["university","program","status"]:
        if not str(data.get(field,"")).strip():
            return jsonify({"error": f"'{field}' is required"}), 400
    valid_statuses = ["Planning","In Progress","Submitted","Accepted","Rejected","Withdrawn"]
    if data["status"] not in valid_statuses:
        return jsonify({"error": f"Status must be one of: {', '.join(valid_statuses)}"}), 400
    now = datetime.datetime.utcnow().isoformat() + "Z"
    data["createdAt"] = now; data["updatedAt"] = now
    doc_ref = db.collection("users").document(email).collection("tracker").document()
    doc_ref.set(data)
    return jsonify({"message": "Application added.","id": doc_ref.id}), 201

@app.route("/tracker/<app_id>", methods=["PUT"])
@jwt_required()
def update_tracker(app_id):
    email = get_jwt_identity()
    data  = request.get_json(force=True)
    if "status" in data:
        valid = ["Planning","In Progress","Submitted","Accepted","Rejected","Withdrawn"]
        if data["status"] not in valid:
            return jsonify({"error": "Invalid status"}), 400
    data["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db.collection("users").document(email).collection("tracker").document(app_id).update(data)
    return jsonify({"message": "Updated."}), 200

@app.route("/tracker/<app_id>", methods=["DELETE"])
@jwt_required()
def delete_tracker(app_id):
    email = get_jwt_identity()
    db.collection("users").document(email).collection("tracker").document(app_id).delete()
    return jsonify({"message": "Removed."}), 200

# ── Reminders ─────────────────────────────────────────────────────────────────
@app.route("/reminders", methods=["GET"])
@jwt_required()
def get_reminders():
    email = get_jwt_identity()
    docs  = db.collection("users").document(email).collection("reminders").stream()
    items = []
    for doc in docs:
        r = doc.to_dict(); r["id"] = doc.id
        if r.get("scholarshipName"):
            r["scholarship_info_url"] = f"/scholarships?search={r['scholarshipName']}"
        if r.get("country"):
            r["visa_url"] = f"/visa?country={r['country']}"
        items.append(r)
    items.sort(key=lambda x: x.get("deadline",""))
    return jsonify(items), 200

@app.route("/reminders/add", methods=["POST"])
@jwt_required()
def add_reminder():
    email = get_jwt_identity()
    data  = request.get_json(force=True)
    if not str(data.get("title","")).strip():
        return jsonify({"error": "'title' is required"}), 400
    if not str(data.get("deadline","")).strip():
        return jsonify({"error": "'deadline' is required"}), 400
    now = datetime.datetime.utcnow().isoformat() + "Z"
    data["createdAt"] = now; data["updatedAt"] = now
    doc_ref = db.collection("users").document(email).collection("reminders").document()
    doc_ref.set(data)
    return jsonify({"message": "Reminder added.","id": doc_ref.id}), 201

@app.route("/reminders/<rid>", methods=["PUT"])
@jwt_required()
def update_reminder(rid):
    email = get_jwt_identity()
    data  = request.get_json(force=True)
    data["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db.collection("users").document(email).collection("reminders").document(rid).update(data)
    return jsonify({"message": "Updated."}), 200

@app.route("/reminders/<rid>", methods=["DELETE"])
@jwt_required()
def delete_reminder(rid):
    email = get_jwt_identity()
    db.collection("users").document(email).collection("reminders").document(rid).delete()
    return jsonify({"message": "Deleted."}), 200

# ── SOP ───────────────────────────────────────────────────────────────────────
@app.route("/sop", methods=["GET"])
@jwt_required()
def get_sops():
    email = get_jwt_identity()
    docs  = db.collection("users").document(email).collection("sops").stream()
    sops  = [dict(doc.to_dict(), id=doc.id) for doc in docs]
    sops.sort(key=lambda x: x.get("createdAt",""), reverse=True)
    return jsonify(sops), 200

@app.route("/sop/generate", methods=["POST"])
@jwt_required()
@limiter.limit("10 per minute")
def generate_sop():
    data = request.get_json(force=True)
    for f in ["program","university","country","fullName"]:
        if not str(data.get(f,"")).strip():
            return jsonify({"error": f"'{f}' is required"}), 400
    country_context = ""
    try:
        visa = get_visa_info(data["country"])
        country_context = (
            f"\nVisa for {data['country']}: {visa.get('visa_type', '')}, "
            f"fee {visa.get('fee', '')}, processing {visa.get('processing_time', '')}"
        )
    except Exception:
        pass

    prompt = (
        f"Write a professional Statement of Purpose (SOP) for a Pakistani student applying to "
        f"{data['program']} at {data['university']} in {data['country']}.\n\n"
        f"Student Details:\n"
        f"- Name: {data.get('fullName')}\n"
        f"- Degree: {data.get('currentDegree', '')} in {data.get('currentField', '')} "
        f"from {data.get('currentUniversity', '')}\n"
        f"- GPA: {data.get('gpa', 'not provided')}\n"
        f"- Achievements: {data.get('achievements', 'not provided')}\n"
        f"- Work Experience: {data.get('workExperience', 'not provided')}\n"
        f"- Skills: {data.get('skills', 'not provided')}\n"
        f"- Why this program: {data.get('whyThisProgram', 'not provided')}\n"
        f"- Why this country: {data.get('whyThisCountry', 'not provided')}\n"
        f"- Career Goals: {data.get('careerGoals', 'not provided')}\n"
        f"- Research Interests: {data.get('researchInterests', 'not provided')}\n"
        f"- Tone: {data.get('tone', 'Professional')}\n"
        f"- Word count: ~{data.get('wordCount', '600')}\n"
        f"{country_context}\n\n"
        f"Write a compelling SOP with proper paragraphs. "
        f"Start with 'Dear Admissions Committee,' and end with "
        f"'Sincerely, {data.get('fullName')}'. "
        f"No headings or bullet points — flowing paragraphs only."
    )
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        msg = client.messages.create(model="claude-opus-4-6", max_tokens=1500, messages=[{"role":"user","content":prompt}])
        return jsonify({"sop": msg.content[0].text}), 200
    except Exception as e:
        logger.error("SOP error: %s", e)
        return jsonify({"error": "SOP generation failed."}), 500

@app.route("/sop/save", methods=["POST"])
@jwt_required()
def save_sop():
    email = get_jwt_identity()
    data  = request.get_json(force=True)
    if not str(data.get("sop","")).strip():
        return jsonify({"error": "'sop' content required"}), 400
    now = datetime.datetime.utcnow().isoformat() + "Z"
    data["createdAt"] = now; data["updatedAt"] = now
    doc_ref = db.collection("users").document(email).collection("sops").document()
    doc_ref.set(data)
    return jsonify({"message": "SOP saved.","id": doc_ref.id}), 201

@app.route("/sop/<sop_id>", methods=["PUT"])
@jwt_required()
def update_sop(sop_id):
    email = get_jwt_identity()
    data  = request.get_json(force=True)
    data["updatedAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db.collection("users").document(email).collection("sops").document(sop_id).update(data)
    return jsonify({"message": "Updated."}), 200

@app.route("/sop/<sop_id>", methods=["DELETE"])
@jwt_required()
def delete_sop(sop_id):
    email = get_jwt_identity()
    db.collection("users").document(email).collection("sops").document(sop_id).delete()
    return jsonify({"message": "Deleted."}), 200

# ── Chatbot — Groq AI with profile-based suggestions + conversation memory ────
@app.route("/chat/query", methods=["POST"])
@jwt_required()
@limiter.limit("15 per minute")
def chat_query():
    email   = get_jwt_identity()
    data    = request.get_json(force=True)
    message = str(data.get("message","")).strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message required"}), 400
    if len(message) > 1000:
        return jsonify({"error": "Message too long (max 1000 chars)"}), 400

    # Fetch user academic profile from Firestore
    profile = {}
    try:
        prof_doc = db.collection("users").document(email).collection("profile").document("academic").get()
        if prof_doc.exists:
            profile = prof_doc.to_dict() or {}
    except Exception:
        pass

    # Build profile context
    profile_context = ""
    if profile:
        parts = []
        if profile.get("degree"):     parts.append(f"Degree: {profile['degree']}")
        if profile.get("field"):      parts.append(f"Field: {profile['field']}")
        if profile.get("gpa"):        parts.append(f"GPA: {profile['gpa']}")
        if profile.get("ieltsScore"): parts.append(f"IELTS: {profile['ieltsScore']}")
        if profile.get("targetCountries"):
            c = profile["targetCountries"]
            parts.append(f"Target Countries: {', '.join(c) if isinstance(c, list) else c}")
        if parts:
            profile_context = "\n\nUser Academic Profile:\n" + "\n".join(f"- {p}" for p in parts)
            profile_context += "\n\nIMPORTANT: Give PERSONALIZED suggestions based on this profile. Recommend specific scholarships, universities, and countries that match their GPA, IELTS, field, and target countries."

    # Inject live visa context if country mentioned
    country_context = ""
    for c in SUPPORTED_COUNTRIES:
        if c.lower() in message.lower():
            try:
                visa = get_visa_info(c)
                country_context = (
                    f"\n\n[Live {c} visa data] Type: {visa.get('visa_type')}, "
                    f"Fee: {visa.get('fee')}, Processing: {visa.get('processing_time')}"
                )
            except Exception:
                pass
            break

    system = (
        "You are ForeignEdge Assistant — a trusted advisor for Pakistani students planning to study abroad.\n\n"
        "You help with: university selection, scholarships (Chevening, Gates Cambridge, Fulbright, DAAD, MEXT, GKS, HEC, etc.), "
        "visa requirements, accommodation costs, SOPs, IELTS/TOEFL/GRE prep, and budgeting.\n\n"
        "Guidelines: Be concise. Direct users to official sources. Never fabricate data. "
        "Keep responses under 300 words unless essential."
        + profile_context
        + (f"\n\nLive data:{country_context}" if country_context else "")
    )

    # Build messages with conversation history (last 6 messages = 3 exchanges)
    messages = []
    for h in history[-6:]:
        if h.get("role") in ("user", "assistant") and h.get("content"):
            messages.append({"role": h["role"], "content": str(h["content"])})
    messages.append({"role": "user", "content": message})

    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            max_tokens=500,
            messages=[{"role": "system", "content": system}] + messages,
        )
        return jsonify({
            "reply": resp.choices[0].message.content,
            "profile_used": bool(profile_context),
        }), 200
    except Exception as e:
        logger.error("Chat error: %s", e)
        return jsonify({"error": "Chat service temporarily unavailable."}), 500

# ── Stats ─────────────────────────────────────────────────────────────────────
# ── ML Recommendations ───────────────────────────────────────────────────────
@app.route("/recommendations", methods=["GET"])
@jwt_required()
@limiter.limit("10 per minute")
def get_recommendations():
    email = get_jwt_identity()

    # Check cache first
    cache_key = f"recommendations:{email}"
    cached = _cache_get(cache_key)
    if cached:
        return jsonify(cached), 200

    # Fetch user profile
    profile = {}
    try:
        prof_doc = db.collection("users").document(email).collection("profile").document("academic").get()
        if prof_doc.exists:
            profile = prof_doc.to_dict() or {}
    except Exception as e:
        logger.error("Profile fetch error: %s", e)

    if not profile:
        return jsonify({"error": "Please complete your academic profile first to get recommendations."}), 400

    try:
        from ML.recommendations import RecommendationEngine
        engine = RecommendationEngine()
        recs   = engine.recommend_for_user(profile, top_k=10)

        result = {
            "scholarships": recs.get("scholarships", [])[:5],
            "universities": recs.get("universities", [])[:5],
            "profile_used": {
                "field":   profile.get("field", ""),
                "degree":  profile.get("degree", ""),
                "gpa":     profile.get("gpa", ""),
                "ielts":   profile.get("ieltsScore", ""),
            },
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        }

        _cache_set(cache_key, result, ttl=300)  # cache 5 mins
        logger.info("Recommendations generated for %s", email)
        return jsonify(result), 200

    except Exception as e:
        logger.error("Recommendations error: %s", e)
        return jsonify({"error": "Could not generate recommendations. Please try again."}), 500

@app.route("/stats", methods=["GET"])
def platform_stats():
    cached = _cache_get("platform_stats")
    if cached:
        return jsonify(cached), 200
    try:
        docs      = list(db.collection("scholarships").stream())
        countries = {d.to_dict().get("country") for d in docs if d.to_dict().get("country")}
        result    = {"scholarships": len(docs),"countries": len(countries),"fetched_at": datetime.datetime.utcnow().isoformat()+"Z"}
        _cache_set("platform_stats", result)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": "Stats unavailable"}), 503

# ── Admin ─────────────────────────────────────────────────────────────────────
@app.route("/admin/cache/clear", methods=["POST"])
@limiter.limit("5 per minute")
def clear_cache():
    if request.headers.get("X-Admin-Key") != os.getenv("ADMIN_KEY",""):
        return jsonify({"error": "Unauthorized"}), 401
    prefix = (request.json or {}).get("prefix","")
    _cache_invalidate(prefix)
    return jsonify({"message": f"Cache cleared: '{prefix}'"}), 200

# ── Admin Routes ─────────────────────────────────────────────────────────────
def verify_admin(request):
    """Check admin key from header or JWT role"""
    admin_key = os.getenv("ADMIN_KEY", "")
    return request.headers.get("X-Admin-Key") == admin_key and admin_key != ""

@app.route("/admin/users", methods=["GET"])
@limiter.limit("20 per minute")
def admin_get_users():
    if not verify_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    try:
        users_ref  = db.collection("users").stream()
        users_list = []
        for doc in users_ref:
            u = doc.to_dict() or {}
            users_list.append({
                "email":      doc.id,
                "name":       u.get("name", ""),
                "created_at": u.get("created_at", ""),
                "role":       u.get("role", "user"),
            })
        # Stats
        today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        new_today = sum(1 for u in users_list if str(u.get("created_at","")).startswith(today))
        return jsonify({
            "users":      users_list,
            "total":      len(users_list),
            "new_today":  new_today,
            "fetched_at": datetime.datetime.utcnow().isoformat() + "Z",
        }), 200
    except Exception as e:
        logger.error("Admin users error: %s", e)
        return jsonify({"error": "Failed to fetch users"}), 500

@app.route("/admin/scholarships", methods=["GET"])
@limiter.limit("20 per minute")
def admin_get_scholarships():
    if not verify_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    try:
        docs = db.collection("scholarships").stream()
        scholarships = []
        for doc in docs:
            s = doc.to_dict() or {}
            s["id"] = doc.id
            scholarships.append(s)
        return jsonify({
            "scholarships": scholarships,
            "total":        len(scholarships),
            "fetched_at":   datetime.datetime.utcnow().isoformat() + "Z",
        }), 200
    except Exception as e:
        logger.error("Admin scholarships error: %s", e)
        return jsonify({"error": "Failed to fetch scholarships"}), 500

@app.route("/admin/scholarships", methods=["POST"])
@limiter.limit("10 per minute")
def admin_add_scholarship():
    if not verify_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = request.get_json(force=True)
        required = ["name", "country", "amount", "deadline"]
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"Missing field: {field}"}), 400
        data["created_at"] = datetime.datetime.utcnow().isoformat() + "Z"
        ref = db.collection("scholarships").add(data)
        return jsonify({"message": "Scholarship added", "id": ref[1].id}), 201
    except Exception as e:
        logger.error("Admin add scholarship error: %s", e)
        return jsonify({"error": "Failed to add scholarship"}), 500

@app.route("/admin/scholarships/<scholarship_id>", methods=["PUT"])
@limiter.limit("10 per minute")
def admin_update_scholarship(scholarship_id):
    if not verify_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    try:
        data = request.get_json(force=True)
        data["updated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
        db.collection("scholarships").document(scholarship_id).update(data)
        return jsonify({"message": "Scholarship updated"}), 200
    except Exception as e:
        logger.error("Admin update scholarship error: %s", e)
        return jsonify({"error": "Failed to update scholarship"}), 500

@app.route("/admin/scholarships/<scholarship_id>", methods=["DELETE"])
@limiter.limit("10 per minute")
def admin_delete_scholarship(scholarship_id):
    if not verify_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    try:
        db.collection("scholarships").document(scholarship_id).delete()
        return jsonify({"message": "Scholarship deleted"}), 200
    except Exception as e:
        logger.error("Admin delete scholarship error: %s", e)
        return jsonify({"error": "Failed to delete scholarship"}), 500

@app.route("/admin/stats", methods=["GET"])
@limiter.limit("20 per minute")
def admin_get_stats():
    if not verify_admin(request):
        return jsonify({"error": "Unauthorized"}), 401
    try:
        users_count        = len(list(db.collection("users").stream()))
        scholarships_count = len(list(db.collection("scholarships").stream()))
        # Count all trackers across users
        tracker_count = 0
        sop_count     = 0
        reminder_count = 0
        for user_doc in db.collection("users").stream():
            tracker_count  += len(list(db.collection("users").document(user_doc.id).collection("applications").stream()))
            sop_count      += len(list(db.collection("users").document(user_doc.id).collection("sops").stream()))
            reminder_count += len(list(db.collection("users").document(user_doc.id).collection("reminders").stream()))

        return jsonify({
            "users":        users_count,
            "scholarships": scholarships_count,
            "applications": tracker_count,
            "sops":         sop_count,
            "reminders":    reminder_count,
            "fetched_at":   datetime.datetime.utcnow().isoformat() + "Z",
        }), 200
    except Exception as e:
        logger.error("Admin stats error: %s", e)
        return jsonify({"error": "Failed to fetch stats"}), 500

# ── Scrap.do Real-time Data ──────────────────────────────────────────────────
@app.route("/scrape/realtime", methods=["GET"])
@jwt_required()
@limiter.limit("10 per minute")
def scrape_realtime():
    """
    Fetch real-time data from external portals via Scrap.do.
    ?type=daad_scholarships | chevening | germany_universities | accommodation
    """
    data_type = request.args.get("type", "")
    city      = request.args.get("city", "London")

    if not data_type:
        return jsonify({"error": "type parameter required"}), 400

    # Check cache
    cache_key = f"scrapdo:{data_type}:{city}"
    cached = _cache_get(cache_key)
    if cached:
        return jsonify(cached), 200

    try:
        from scrapers.scrapdo_scraper import get_real_time_data
        result = get_real_time_data(data_type, {"city": city})
        _cache_set(cache_key, result, ttl=3600)  # cache 1 hour
        return jsonify(result), 200
    except Exception as e:
        logger.error("Scrap.do route error: %s", e)
        return jsonify({"error": "Failed to fetch real-time data"}), 500

# ── Country Info — RestCountries API ─────────────────────────────────────────
@app.route("/country-info", methods=["GET"])
@limiter.limit("30 per minute")
def country_info():
    """
    GET /country-info?country=UK
    Returns flag, capital, currency, population, languages from RestCountries API.
    No API key needed — free and unlimited.
    """
    country = request.args.get("country", "").strip()
    if not country:
        return jsonify({"error": "country parameter required"}), 400
    try:
        from scrapers.engine import get_country_info
        result = get_country_info(country)
        return jsonify(result), 200
    except Exception as e:
        logger.error("Country info error: %s", e)
        return jsonify({"error": "Failed to fetch country info"}), 500

# ── News API ─────────────────────────────────────────────────────────────────
@app.route("/news", methods=["GET"])
@limiter.limit("20 per minute")
def get_news():
    """
    GET /news?topic=scholarships
    Fetches latest news about study abroad, scholarships, universities.
    """
    import requests
    topic = request.args.get("topic", "scholarships study abroad")
    
    cache_key = f"news:{topic}"
    cached = _cache_get(cache_key)
    if cached:
        return jsonify(cached), 200

    api_key = os.getenv("NEWS_API_KEY", "")
    if not api_key:
        return jsonify({"error": "NEWS_API_KEY not set"}), 500

    queries = {
        "scholarships": "scholarships international students 2025",
        "universities": "university rankings admissions 2025",
        "study abroad": "study abroad Pakistani students 2025",
        "accommodation": "student accommodation housing 2025",
        "visa":         "student visa requirements 2025",
    }

    query = queries.get(topic, topic)

    try:
        resp = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q":        query,
                "language": "en",
                "sortBy":   "publishedAt",
                "pageSize": 10,
                "apiKey":   api_key,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        articles = []
        for a in data.get("articles", []):
            if not a.get("title") or a["title"] == "[Removed]":
                continue
            articles.append({
                "title":       a.get("title", ""),
                "description": a.get("description", ""),
                "url":         a.get("url", ""),
                "image":       a.get("urlToImage", ""),
                "source":      a.get("source", {}).get("name", ""),
                "published_at": a.get("publishedAt", ""),
            })

        result = {
            "topic":       topic,
            "articles":    articles,
            "total":       len(articles),
            "fetched_at":  datetime.datetime.utcnow().isoformat() + "Z",
            "source":      "NewsAPI",
        }
        _cache_set(cache_key, result)
        return jsonify(result), 200

    except Exception as e:
        logger.error("NewsAPI error: %s", e)
        return jsonify({"error": "Failed to fetch news"}), 500

# ── Health ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"healthy","version":"3.0.0","timestamp":datetime.datetime.utcnow().isoformat()+"Z"}), 200

if __name__ == "__main__":
    app.run(debug=False, port=5000)
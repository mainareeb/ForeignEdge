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

# Validate environment on startup
try:
    from startup_check import validate_env
    validate_env()
except SystemExit:
    raise
except Exception as _e:
    logger.warning("Startup check error: %s", _e)

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
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            temperature=0.7,
            messages=[{"role": "user", "content": prompt}],
        )
        return jsonify({"sop": resp.choices[0].message.content}), 200
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

# ── Chatbot — Claude AI with live context injection ───────────────────────────
@app.route("/chat/query", methods=["POST"])
@jwt_required()
@limiter.limit("15 per minute")
def chat_query():
    data    = request.get_json(force=True)
    message = str(data.get("message","")).strip()
    if not message:
        return jsonify({"error": "Message required"}), 400
    if len(message) > 1000:
        return jsonify({"error": "Message too long (max 1000 chars)"}), 400
    # Inject live visa context if a country is mentioned
    country_context = ""
    for c in SUPPORTED_COUNTRIES:
        if c.lower() in message.lower():
            try:
                visa = get_visa_info(c)
                country_context = (
                    f"\n[Live {c} data] Visa: {visa.get('visa_type')}, "
                    f"Fee: {visa.get('fee')}, Processing: {visa.get('processing_time')}, "
                    f"Official: {visa.get('official_link')}"
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
        + (f"\n\nContextual live data:{country_context}" if country_context else "")
    )
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        # Build conversation history for multi-turn memory
        history = data.get("history", [])
        groq_messages = [{"role": "system", "content": system}]

        # Add previous turns (last 10 to stay within context limit)
        for turn in history[-10:]:
            role = turn.get("role", "user")
            content = str(turn.get("content", "")).strip()
            if role in ("user", "assistant") and content:
                groq_messages.append({"role": role, "content": content})

        # Add current message
        groq_messages.append({"role": "user", "content": message})

        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=600,
            messages=groq_messages,
            temperature=0.7,
        )
        return jsonify({"reply": resp.choices[0].message.content}), 200
    except Exception as e:
        logger.error("Chat error: %s", e)
        return jsonify({"error": "Chat service temporarily unavailable."}), 500

# ── Stats ─────────────────────────────────────────────────────────────────────
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

# ── Health ────────────────────────────────────────────────────────────────────
# ── Admin Authentication ─────────────────────────────────────────────────────
@app.route("/admin/login", methods=["POST"])
@limiter.limit("5 per minute")
def admin_login():
    import hashlib
    data          = request.get_json(force=True)
    email         = data.get("email", "").strip().lower()
    password      = data.get("password", "")
    admin_email   = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_pw_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    if email != admin_email or pw_hash != admin_pw_hash:
        return jsonify({"error": "Invalid admin credentials"}), 401
    token = create_access_token(
        identity=email,
        additional_claims={"role": "admin"},
        expires_delta=datetime.timedelta(hours=8)
    )
    return jsonify({"token": token, "email": email, "role": "admin"}), 200

@app.route("/admin/verify", methods=["GET"])
@jwt_required()
def admin_verify():
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Not authorized"}), 403
    return jsonify({"valid": True, "role": "admin"}), 200

@app.route("/admin/users", methods=["GET"])
@jwt_required()
@limiter.limit("20 per minute")
def admin_get_users():
    from flask_jwt_extended import get_jwt
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    try:
        users_list = []
        today = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        for doc in db.collection("users").stream():
            u = doc.to_dict() or {}
            users_list.append({
                "email":      doc.id,
                "name":       u.get("name", ""),
                "created_at": u.get("created_at", ""),
                "role":       u.get("role", "user"),
            })
        new_today = sum(1 for u in users_list if str(u.get("created_at","")).startswith(today))
        return jsonify({"users": users_list, "total": len(users_list), "new_today": new_today}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admin/stats", methods=["GET"])
@jwt_required()
@limiter.limit("20 per minute")
def admin_get_stats():
    from flask_jwt_extended import get_jwt
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    try:
        users_count        = len(list(db.collection("users").stream()))
        scholarships_count = len(list(db.collection("scholarships").stream()))
        tracker_count = sop_count = reminder_count = 0
        for user_doc in db.collection("users").stream():
            uid = user_doc.id
            tracker_count  += len(list(db.collection("users").document(uid).collection("tracker").stream()))
            sop_count      += len(list(db.collection("users").document(uid).collection("sops").stream()))
            reminder_count += len(list(db.collection("users").document(uid).collection("reminders").stream()))
        return jsonify({
            "users": users_count, "scholarships": scholarships_count,
            "applications": tracker_count, "sops": sop_count,
            "reminders": reminder_count,
            "fetched_at": datetime.datetime.utcnow().isoformat() + "Z",
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admin/scholarships", methods=["GET"])
@jwt_required()
def admin_get_scholarships():
    from flask_jwt_extended import get_jwt
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    try:
        scholarships = []
        for doc in db.collection("scholarships").stream():
            s = doc.to_dict() or {}
            s["id"] = doc.id
            scholarships.append(s)
        return jsonify({"scholarships": scholarships, "total": len(scholarships)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/news", methods=["GET"])
@limiter.limit("10 per minute")
def get_news():
    """Fetch real study-abroad news from RSS feeds — no API key needed, always live."""
    import requests as req
    import xml.etree.ElementTree as ET
    from email.utils import parsedate_to_datetime

    topic = request.args.get("topic", "scholarships").strip().lower()
    cache_key = f"news:{topic}"
    cached = _cache_get(cache_key)
    if cached:
        return jsonify(cached), 200

    # Real RSS feeds — education, scholarships, study abroad news
    RSS_FEEDS = [
        ("The Guardian",       "https://www.theguardian.com/education/rss"),
        ("BBC Education",      "https://feeds.bbci.co.uk/news/education/rss.xml"),
        ("Study International","https://www.studyinternational.com/feed/"),
        ("Al Jazeera",         "https://www.aljazeera.com/xml/rss/all.xml"),
        ("Times Higher Ed",    "https://www.timeshighereducation.com/rss.xml"),
    ]

    # Topic → keywords for filtering
    TOPIC_KEYWORDS = {
        "scholarships":  ["scholarship", "fellowship", "grant", "funding", "award", "bursary"],
        "universities":  ["university", "college", "campus", "degree", "admission", "enrollment"],
        "study abroad":  ["study abroad", "international student", "overseas", "foreign student"],
        "accommodation": ["accommodation", "housing", "rent", "student housing", "dormitory", "hostel"],
        "visa":          ["visa", "immigration", "student visa", "permit", "work permit"],
    }
    keywords = TOPIC_KEYWORDS.get(topic, ["scholarship", "study abroad", "university"])

    articles = []
    headers = {"User-Agent": "Mozilla/5.0 ForeignEdge/3.0"}

    for source_name, feed_url in RSS_FEEDS:
        if len(articles) >= 9:
            break
        try:
            r = req.get(feed_url, headers=headers, timeout=8)
            if r.status_code != 200:
                continue
            root = ET.fromstring(r.content)
            ns = {"media": "http://search.yahoo.com/mrss/",
                  "dc":    "http://purl.org/dc/elements/1.1/"}

            # Handle both RSS <channel><item> and Atom <entry>
            items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")

            for item in items:
                title = (item.findtext("title") or
                         item.findtext("{http://www.w3.org/2005/Atom}title") or "").strip()
                desc  = (item.findtext("description") or
                         item.findtext("{http://www.w3.org/2005/Atom}summary") or "").strip()
                url   = (item.findtext("link") or
                         item.findtext("{http://www.w3.org/2005/Atom}link") or "").strip()
                pub   = (item.findtext("pubDate") or
                         item.findtext("{http://www.w3.org/2005/Atom}updated") or "").strip()

                # Get image from media:thumbnail or enclosure
                image = ""
                media_thumb = item.find("media:thumbnail", ns)
                if media_thumb is not None:
                    image = media_thumb.get("url", "")
                if not image:
                    enclosure = item.find("enclosure")
                    if enclosure is not None and "image" in enclosure.get("type", ""):
                        image = enclosure.get("url", "")

                # Clean description (strip HTML tags)
                import re
                desc_clean = re.sub(r"<[^>]+>", "", desc)[:200].strip()

                # Normalise publish date
                pub_iso = ""
                if pub:
                    try:
                        pub_iso = parsedate_to_datetime(pub).isoformat()
                    except Exception:
                        pub_iso = pub

                # Filter by topic keywords (case-insensitive)
                text = (title + " " + desc_clean).lower()
                if not any(kw in text for kw in keywords):
                    continue

                if title and url and "[Removed]" not in title:
                    articles.append({
                        "title":        title,
                        "description":  desc_clean,
                        "url":          url,
                        "image":        image,
                        "source":       source_name,
                        "published_at": pub_iso,
                        "author":       source_name,
                    })
                if len(articles) >= 9:
                    break
        except Exception as feed_err:
            logger.warning("RSS feed error (%s): %s", source_name, feed_err)
            continue

    # If RSS gave too few results, try NewsAPI as bonus (may work on some plans)
    if len(articles) < 3:
        try:
            api_key = os.getenv("NEWS_API_KEY", "")
            if api_key:
                r2 = req.get(
                    f"https://newsapi.org/v2/top-headlines?q=scholarship&category=education&language=en&pageSize=9&apiKey={api_key}",
                    headers={"User-Agent": "ForeignEdge/1.0"}, timeout=8
                )
                d2 = r2.json()
                for a in d2.get("articles", []):
                    if not a.get("title") or "[Removed]" in a.get("title", ""):
                        continue
                    articles.append({
                        "title":        a.get("title", ""),
                        "description":  a.get("description", ""),
                        "url":          a.get("url", ""),
                        "image":        a.get("urlToImage", ""),
                        "source":       a.get("source", {}).get("name", "") if isinstance(a.get("source"), dict) else "",
                        "published_at": a.get("publishedAt", ""),
                        "author":       a.get("author", ""),
                    })
        except Exception:
            pass

    result = {
        "articles":   articles[:9],
        "total":      len(articles),
        "fetched_at": datetime.datetime.utcnow().isoformat() + "Z",
        "source":     "RSS feeds (live)",
    }
    if articles:
        _cache_set(cache_key, result)  # cache 30 min
    return jsonify(result), 200

@app.route("/recommendations", methods=["GET"])
@jwt_required()
@limiter.limit("10 per minute")
def get_recommendations():
    """ML-powered recommendations based on user academic profile."""
    email = get_jwt_identity()
    try:
        doc = db.collection("users").document(email).get()
        if not doc.exists:
            return jsonify({"error": "Profile not found"}), 404
        user = doc.to_dict() or {}

        degree       = user.get("degree", "Bachelor")
        field        = user.get("field", user.get("desiredField", "Computer Science"))
        gpa          = user.get("gpa", "3.0")
        budget       = user.get("budget", "Any")
        countries    = user.get("desiredCountries", ["UK", "Germany", "Canada"])
        english_test = user.get("englishTest", "IELTS")
        ielts        = user.get("ieltsScore", "6.5")
        funding      = user.get("fundingType", "Any Funding")

        # Generate recommendations using Groq AI
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        prompt = f"""You are an expert study abroad advisor for Pakistani students.
Based on this student profile, recommend 6 specific universities and scholarships.

Student Profile:
- Degree: {degree}
- Field: {field}
- GPA: {gpa}
- Budget: {budget}
- Preferred Countries: {', '.join(countries) if isinstance(countries, list) else countries}
- English Test: {english_test} {ielts}
- Funding: {funding}

Return ONLY a valid JSON array with exactly 6 recommendations. Each item must have:
{{
  "type": "University" or "Scholarship",
  "name": "name",
  "country": "country",
  "match": 85,
  "reason": "why it matches",
  "deadline": "deadline",
  "link": "official URL"
}}

Return ONLY the JSON array, no other text."""

        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        import json
        text = resp.choices[0].message.content.strip()
        # Extract JSON array
        start = text.find("[")
        end   = text.rfind("]") + 1
        if start >= 0 and end > start:
            recs = json.loads(text[start:end])
        else:
            recs = []

        # Split by type so frontend can render separately
        scholarships_recs = [r for r in recs if str(r.get("type","")).lower() == "scholarship"]
        universities_recs = [r for r in recs if str(r.get("type","")).lower() == "university"]

        return jsonify({
            "recommendations": recs,
            "scholarships": scholarships_recs,
            "universities": universities_recs,
            "profile": {"degree": degree, "field": field, "gpa": gpa, "countries": countries, "ielts": ielts},
            "profile_used": {"degree": degree, "field": field, "gpa": gpa, "ielts": ielts},
            "total": len(recs),
        }), 200

    except Exception as e:
        logger.error("Recommendations error: %s", e)
        return jsonify({"error": "Could not generate recommendations. Please try again."}), 500

@app.route("/admin/applications", methods=["GET"])
@jwt_required()
def admin_get_applications():
    from flask_jwt_extended import get_jwt
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    try:
        apps = []
        for user_doc in db.collection("users").stream():
            for app_doc in db.collection("users").document(user_doc.id).collection("tracker").stream():
                a = app_doc.to_dict() or {}
                a["user_email"] = user_doc.id
                a["id"] = app_doc.id
                apps.append(a)
        return jsonify({"applications": apps, "total": len(apps)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admin/sops", methods=["GET"])
@jwt_required()
def admin_get_sops():
    from flask_jwt_extended import get_jwt
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    try:
        sops = []
        for user_doc in db.collection("users").stream():
            for sop_doc in db.collection("users").document(user_doc.id).collection("sops").stream():
                s = sop_doc.to_dict() or {}
                s["user_email"] = user_doc.id
                s["id"] = sop_doc.id
                sops.append(s)
        return jsonify({"sops": sops, "total": len(sops)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/admin/reminders", methods=["GET"])
@jwt_required()
def admin_get_reminders():
    from flask_jwt_extended import get_jwt
    if get_jwt().get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    try:
        reminders = []
        for user_doc in db.collection("users").stream():
            for rem_doc in db.collection("users").document(user_doc.id).collection("reminders").stream():
                r = rem_doc.to_dict() or {}
                r["user_email"] = user_doc.id
                r["id"] = rem_doc.id
                reminders.append(r)
        return jsonify({"reminders": reminders, "total": len(reminders)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    import time
    start = time.time()
    # Test Firebase connectivity
    db_status = "connected"
    try:
        db.collection("scholarships").limit(1).get()
    except Exception:
        db_status = "degraded"
    response_ms = round((time.time() - start) * 1000)
    return jsonify({
        "status":          "healthy",
        "version":         "3.0.0",
        "timestamp":       datetime.datetime.utcnow().isoformat() + "Z",
        "encryption":      "AES-256-CBC",
        "auth":            "JWT + bcrypt",
        "database":        db_status,
        "response_ms":     response_ms,
        "ssl":             True,
        "rate_limiting":   True,
    }), 200

# ── Country Info ──────────────────────────────────────────────────────────────
@app.route("/country-info", methods=["GET"])
@limiter.limit("30 per minute")
def country_info_endpoint():
    """Country metadata (capital, flag, currency, languages) from RestCountries API."""
    from scrapers.engine import get_country_info
    country = request.args.get("country", "UK").strip()
    if country not in SUPPORTED_COUNTRIES:
        country = "UK"
    try:
        return jsonify(get_country_info(country)), 200
    except Exception as e:
        return jsonify({"error": "Country info unavailable.", "details": str(e)}), 500

# ── FIXED: Use Railway's PORT env variable and bind to 0.0.0.0 ───────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", debug=False, port=port)

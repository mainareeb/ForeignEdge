import os
import sys
import logging

logger = logging.getLogger("foreignedge.startup")

REQUIRED_VARS = [
    ("FIREBASE_PROJECT_ID",   "CRITICAL", "Firebase project ID"),
    ("FIREBASE_PRIVATE_KEY",  "CRITICAL", "Firebase service-account private key"),
    ("FIREBASE_CLIENT_EMAIL", "CRITICAL", "Firebase service-account client email"),
    ("SECRET_KEY",            "CRITICAL", "Flask secret key"),
    ("JWT_SECRET_KEY",        "CRITICAL", "JWT signing secret"),
    ("AES_KEY",               "CRITICAL", "AES encryption key (must be 32 chars)"),
    ("GROQ_API_KEY",          "CRITICAL", "Groq API key (chatbot + SOP)"),
    ("ADMIN_KEY",             "WARNING",  "Admin route protection key"),
    ("SENDGRID_API_KEY",      "WARNING",  "SendGrid key for email reminders"),
]

def validate_env():
    missing_critical = []
    missing_warning  = []
    ok               = []

    for key, level, description in REQUIRED_VARS:
        value = os.getenv(key, "").strip()
        if value:
            ok.append(key)
        elif level == "CRITICAL":
            missing_critical.append((key, description))
        elif level == "WARNING":
            missing_warning.append((key, description))

    print("\n" + "=" * 55)
    print("  ForeignEdge — Environment Check")
    print("=" * 55 + "\n")

    for key in ok:
        print("  OK    " + key)

    for key, desc in missing_warning:
        print("  WARN  " + key + "  (" + desc + ")")

    for key, desc in missing_critical:
        print("  FAIL  " + key + "  (" + desc + ")")

    print()

    aes = os.getenv("AES_KEY", "")
    if aes and len(aes) != 32:
        print("  WARN  AES_KEY is " + str(len(aes)) + " characters — must be exactly 32.\n")

    jwt_key = os.getenv("JWT_SECRET_KEY", "")
    if jwt_key in ("change-in-production", "jwt-secret-key"):
        print("  WARN  JWT_SECRET_KEY is using an insecure default value.\n")

    secret = os.getenv("SECRET_KEY", "")
    if secret in ("change-in-production",):
        print("  WARN  SECRET_KEY is using an insecure default value.\n")

    n_ok   = len(ok)
    n_warn = len(missing_warning)
    n_crit = len(missing_critical)

    print("  Summary:  " + str(n_ok) + " OK  |  "
          + str(n_warn) + " warnings  |  "
          + str(n_crit) + " critical\n")

    if missing_critical:
        print("  FAILED — " + str(len(missing_critical)) + " critical variable(s) missing.")
        print("  Set them in your .env file and restart.\n")
        print("=" * 55 + "\n")
        sys.exit(1)

    if missing_warning:
        logger.warning(
            "Optional env vars missing: %s",
            ", ".join(k for k, _ in missing_warning),
        )

    print("  All critical variables present. Server starting...")
    print("\n" + "=" * 55 + "\n")
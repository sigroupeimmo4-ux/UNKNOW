"""StudyBeam commercial safety gate.
Default: certify that the public site stays in honest, non-collecting prelaunch mode.
--launch: fail until verified commercial/legal/consumer/child/payment prerequisites exist.
This script cannot itself verify legal advice or successful card payments.
"""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
failures = []
def load(path):
    try:
        return json.loads((ROOT / path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as error:
        failures.append(f"{path}: {error}")
        return {}

config = load("data/commercial-status.json")
pricing = load("data/learning-pass.json")
operator = config.get("operator") or {}
checks = config.get("checks") or {}
payment = config.get("payment") or {}
launch = "--launch" in sys.argv
if config.get("schema_version") != 1:
    failures.append("Commercial readiness schema should be v1")
if config.get("mode") not in ("prelaunch", "commercial"):
    failures.append("Unrecognized commercial mode")
if config.get("commercial_open") != (config.get("mode") == "commercial"):
    failures.append("Commercial mode and commercial_open flag disagree")
if any(not isinstance(v, bool) for v in checks.values()):
    failures.append("Every commercial validation must be boolean")
required_checks = (
    "legal_identity", "contact_verified", "tax_and_prices_validated",
    "terms_of_sale_validated", "withdrawal_refund_validated",
    "data_protection_reviewed", "minor_safeguards_verified",
    "auth_e2e_verified", "rls_isolation_verified", "payment_e2e_verified",
    "pedagogy_reviewed", "accessibility_mobile_e2e_verified"
)
missing_checks = [k for k in required_checks if k not in checks]
if missing_checks:
    failures.append("Missing release gates: " + ", ".join(missing_checks))
for path in ("mentions-legales.html", "conditions-utilisation.html", "confidentialite.html", "conditions-vente.html", "statut-ouverture.html", "legal.css"):
    if not (ROOT/path).is_file():
        failures.append(f"Public information page missing: {path}")
home = (ROOT / "index.html").read_text(encoding="utf-8")
for path in ("mentions-legales.html", "conditions-utilisation.html", "confidentialite.html", "conditions-vente.html", "statut-ouverture.html"):
    if f'./{path}' not in home:
        failures.append(f"Homepage must link to {path}")
if not (ROOT / "signup.html").read_text(encoding="utf-8").count('id="adultTester"'):
    failures.append("Adult beta declaration is absent from signup")
if not (ROOT / "auth.js").read_text(encoding="utf-8").count("adultTester"):
    failures.append("Signup handler must check beta declaration")
if (config.get("mode") == "prelaunch"):
    if payment.get("enabled") or pricing.get("payments",{}).get("enabled"):
        failures.append("Payments must remain OFF while the site is in prelaunch")
    if pricing.get("status") != "proposed":
        failures.append("Commercial prices must remain proposals before launch")
    if config.get("commercial_open"):
        failures.append("Prelaunch cannot accept commercial purchases")
    for name, enabled in checks.items():
        if enabled:
            failures.append(f"Unverified prelaunch gate must not be claimed passed: {name}")
if launch or config.get("mode") == "commercial":
    for name in required_checks:
        if checks.get(name) is not True:
            failures.append(f"BLOCKED: launch requires verified {name}")
    for name in ("legal_name", "registered_address", "public_email", "public_phone", "registration_number", "tax_identifier"):
        value = operator.get(name)
        if not isinstance(value,str) or not value.strip():
            failures.append(f"BLOCKED: verified operator detail {name} is absent")
    if not (payment.get("enabled") and payment.get("merchant_verified") and payment.get("webhook_verified")
            and isinstance(payment.get("provider"),str) and payment.get("provider")):
        failures.append("BLOCKED: real merchant, secure payment backend and webhooks must be verified")
    if not pricing.get("payments", {}).get("enabled") or pricing.get("status") != "active":
        failures.append("BLOCKED: payment contract and pricing are not active")
    if re.search(r"window\\.STUDYBEAM_AGENT_ENDPOINT\\s*=\\s*null", (ROOT/"agent-config.js").read_text(encoding="utf-8")):
        print("INFO: generative AI remains disabled; do not advertise it as a paid feature.")
if failures:
    print("COMMERCIAL SAFETY CHECK FAILED")
    for f in failures: print(" -",f)
    sys.exit(1)
print("Prelaunch safety check passed." if config["mode"]=="prelaunch" else "Commercial flags are internally consistent; legal and real transactions still require independent verification.")

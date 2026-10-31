"""Commercial gate is fail-closed until the release owner has signed off."""
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def run(*args):
    return subprocess.run([sys.executable,str(ROOT/"scripts/audit_commercial.py"),*args],capture_output=True,text=True,cwd=ROOT)
pre=run()
assert pre.returncode==0,(pre.stdout,pre.stderr)
assert "Prelaunch safety check passed" in pre.stdout
launch=run("--launch")
assert launch.returncode!=0,"Commercial activation cannot pass while operator and merchant are unknown"
for required in ("legal_identity","payment_e2e_verified","minor_safeguards_verified","legal_name"):
    assert required in launch.stdout, f"Missing critical gate: {required}"
print("OK: public beta passes, commercial launch fails closed")


import os
import re
import datetime
import glob
from github import Github

# Initialize GitHub
token = os.environ.get("GITHUB_TOKEN")
if not token:
    try:
        with open(".gh_token", "r") as f:
            token = f.read().strip()
    except:
        print("❌ Error: No GITHUB_TOKEN found.")
        exit(1)

private_repo_name = os.environ.get("PRIVATE_DATA_REPO", "alstonhuang/my-agent-data")
g = Github(token)

def get_projects_from_dashboard(repo):
    """Parses DASHBOARD.md to find registered projects."""
    try:
        content = repo.get_contents("DASHBOARD.md").decoded_content.decode("utf-8")
        projects = []
        # Look for rows like: | 🎨 | **Beauty-PK** | ... |
        for line in content.split('\n'):
            if "| **" in line and "** |" in line:
                parts = line.split('|')
                if len(parts) >= 3:
                    name_part = parts[2].strip() # **Beauty-PK**
                    name = name_part.replace('*', '').strip()
                    projects.append(name)
        return projects
    except Exception as e:
        print(f"❌ Failed to read Dashboard: {e}")
        return []

def get_actual_path(repo, project_name):
    """Reads STATUS.md to find 'Actual Code Path'."""
    try:
        path = f"projects/{project_name}/STATUS.md"
        content = repo.get_contents(path).decoded_content.decode("utf-8")
        match = re.search(r"\|\s*\*\*Actual Code Path\*\*\s*\|\s*`([^`]+)`", content)
        if match:
            return match.group(1).strip()
    except:
        pass
    return None

def scan_local_activity(path):
    """Scans a local directory for recent modifications (last 24 hours)."""
    if not os.path.exists(path):
        return None, "❌ Path not found"
    
    last_mod_time = 0
    last_mod_file = ""
    
    # Simple scan of top-level and 1-level deep
    for root, dirs, files in os.walk(path):
        if "node_modules" in root or ".git" in root or ".next" in root:
            continue
        for file in files:
            full_path = os.path.join(root, file)
            try:
                mtime = os.path.getmtime(full_path)
                if mtime > last_mod_time:
                    last_mod_time = mtime
                    last_mod_file = file
            except:
                continue
                
    if last_mod_time == 0:
        return None, "No files found"

    dt_mod = datetime.datetime.fromtimestamp(last_mod_time)
    now = datetime.datetime.now()
    delta = now - dt_mod
    
    status = "💤 Idle"
    if delta.total_seconds() < 3600: # 1 hour
        status = "🔥 Active (files changed < 1h ago)"
    elif delta.total_seconds() < 86400: # 24 hours
        status = "🟢 Active (files changed today)"
    else:
        status = f"💤 Idle (Last edit: {dt_mod.strftime('%Y-%m-%d')})"
        
    return status, f"Last edited: {last_mod_file}"

def post_audit_log(repo, project_name, message, level="AUDIT"):
    """Appends an audit log to STATUS.md."""
    try:
        path = f"projects/{project_name}/STATUS.md"
        contents = repo.get_contents(path)
        content_str = contents.decoded_content.decode("utf-8")
        
        insert_marker = "<!-- LOG_START -->"
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        icon = "🕵️‍♂️"
        
        log_entry = f"- `{timestamp}` {icon} **{level}**: {message}"
        
        if insert_marker in content_str:
            new_content = content_str.replace(insert_marker, f"{insert_marker}\n{log_entry}")
            
            # Also insert Signal if it's a remote ping
            if level == "SIGNAL":
                signal_header = "## 🔔 PENDING REQUEST: Please Report Status!"
                if signal_header not in new_content:
                    new_content = new_content.replace("# Project Status:", f"{signal_header}\n\n# Project Status:")
            
            if new_content != content_str:
                repo.update_file(path, f"🕵️‍♂️ Audit: {project_name}", new_content, contents.sha)
                print(f"✅ Logged to {project_name}: {message}")
        else:
            print(f"⚠️ Marker not found in {project_name}")
            
    except Exception as e:
        print(f"❌ Failed to log to {project_name}: {e}")

def main():
    print(f"🕵️‍♂️ AI Manager Audit starting... (Target: {private_repo_name})")
    try:
        repo = g.get_repo(private_repo_name)
    except:
        print("❌ Failed to connect to Private Data Repo.")
        return

    projects = get_projects_from_dashboard(repo)
    print(f"📋 Found {len(projects)} projects: {projects}")
    
    for proj in projects:
        print(f"\n🔍 Auditing {proj}...")
        local_path = get_actual_path(repo, proj)
        
        if local_path and os.path.exists(local_path):
            # LOCAL AUDIT
            status, detail = scan_local_activity(local_path)
            print(f"   🏠 Local Path: {local_path}")
            print(f"   📊 Result: {status} ({detail})")
            
            # Only log if active or specifically requested
            if "Active" in status or "Idle" in status:
                 post_audit_log(repo, proj, f"System Scan: {status}. {detail}")
                 
        else:
            # REMOTE / SIGNAL AUDIT
            print(f"   ☁️ Remote/Unknown Path. Sending Signal...")
            post_audit_log(repo, proj, "Manager requested status update.", level="SIGNAL")

if __name__ == "__main__":
    main()

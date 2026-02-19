# Fix GitHub Permission Error (403)

## Problem
You're getting `403 Permission denied` because:
- Remote repository: `Yaradiprasanth/Student-Managment-System`
- Your GitHub account: `Prasanth128`
- These don't match!

## Solutions

### Option 1: Create New Repository Under Your Account (Recommended)

1. **Go to GitHub** → https://github.com/new
2. **Repository name**: `Student-Management-System` (or any name)
3. **Visibility**: Public or Private
4. **DO NOT** initialize with README
5. **Click "Create repository"**

6. **Update remote URL**:
   ```bash
   git remote set-url origin https://github.com/Prasanth128/Student-Management-System.git
   ```

7. **Push**:
   ```bash
   git push -u origin main
   ```

---

### Option 2: Use Personal Access Token

If you want to use the existing repository:

1. **Generate Token**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token (classic)
   - Select scopes: `repo` (full control)
   - Copy the token

2. **Push with token**:
   ```bash
   git push https://YOUR_TOKEN@github.com/Yaradiprasanth/Student-Managment-System.git main
   ```

---

### Option 3: Use SSH (More Secure)

1. **Generate SSH key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add to GitHub**:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key

3. **Change remote to SSH**:
   ```bash
   git remote set-url origin git@github.com:Yaradiprasanth/Student-Managment-System.git
   ```

4. **Push**:
   ```bash
   git push -u origin main
   ```

---

## Quick Fix (Recommended)

**Create your own repository and push:**

```bash
# 1. Remove current remote
git remote remove origin

# 2. Create new repo on GitHub (via browser)
# Go to: https://github.com/new
# Name: Student-Management-System
# Don't initialize with README

# 3. Add your repository as remote
git remote add origin https://github.com/Prasanth128/Student-Management-System.git

# 4. Push
git push -u origin main
```

---

## If You Need Access to Existing Repo

If `Yaradiprasanth` is your account and you want to use it:

1. Make sure you're logged into the correct GitHub account
2. Use Personal Access Token (see Option 2)
3. Or contact the repository owner to add you as collaborator


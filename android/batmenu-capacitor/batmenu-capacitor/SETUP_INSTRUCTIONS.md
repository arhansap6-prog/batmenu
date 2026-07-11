# BAT MENU — Android APK Setup Instructions

Everything is pre-generated. Follow these steps exactly.

---

## Step 1 — Clone your repo locally

```bash
git clone https://github.com/arhansap6-prog/batmenu.git
cd batmenu
```

---

## Step 2 — Copy the generated files into your repo

Extract the ZIP you downloaded from Claude and run:

```bash
# From inside your batmenu repo:
bash /path/to/batmenu-capacitor/scripts/apply-to-repo.sh
```

Or manually copy:
- `capacitor.config.ts` → repo root
- `.gitignore` → repo root (merge with existing)
- `.github/workflows/build-apk.yml` → repo
- `android/` folder → repo root

---

## Step 3 — Install Capacitor packages

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen
```

---

## Step 4 — Add the 4 GitHub Secrets

Go to: **GitHub → your repo → Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret Name | Value |
|---|---|
| `KEYSTORE_BASE64` | *(full contents of `KEYSTORE_BASE64.txt` file included in the ZIP)* |
| `KEYSTORE_PASS` | `BatMenu2024!` |
| `KEY_ALIAS` | `batmenukey` |
| `KEY_PASS` | `BatMenu2024!` |

⚠️ Keep these values private. Never commit them.

---

## Step 5 — Commit and push

```bash
git add -A
git commit -m "feat: add Capacitor Android + GitHub Actions APK build"
git push
```

---

## Step 6 — Download your APK

1. Go to **GitHub → your repo → Actions** tab
2. Click the latest workflow run
3. Wait ~5 minutes for it to finish
4. Under **Releases** (or the **Artifacts** section), download `batmenu-apk-*.apk`

Or go to **GitHub → your repo → Releases** — the APK will be attached automatically.

---

## Install on your Android phone

1. Open the APK file from your phone's browser/files app
2. If prompted, allow "Install from unknown sources" for your browser
3. Tap **Install**

The app will open `https://batmenu.lovable.app` inside a native Android shell.

---

## Every future push = new APK

Any time you push to `main`/`master`, GitHub Actions automatically:
- Builds a new signed APK
- Uploads it as an artifact (kept 30 days)
- Creates a new GitHub Release with the APK attached

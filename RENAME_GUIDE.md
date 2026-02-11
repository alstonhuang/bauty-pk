# Project Renaming Guide: bauty-pk -> beauty-pk

This guide outlines the steps to correctly rename your project while maintaining all configurations and services.

## 1. GitHub Rename
1.  Go to your repository: `https://github.com/alstonhuang/bauty-pk`
2.  Click **Settings** (top tab).
3.  In the **Repository Name** field, change it to `beauty-pk`.
4.  Click **Rename**.
    *   *Note: GitHub automatically redirects old links to the new name, so your local git push will still work for a while, but you should update it later.*

## 2. Vercel Rename & Domain
1.  Go to your Vercel Dashboard and select the project.
2.  Go to **Settings** -> **General**.
3.  Change the **Project Name** to `beauty-pk`.
4.  Go to **Settings** -> **Domains**.
5.  Add `beauty-pk.vercel.app`.
6.  *(Optional but recommended)* Keep `bauty-pk.vercel.app` and set it to **Redirect** to the new domain so old links don't break.

## 3. LINE Developers Console (CRITICAL)
Once the Vercel domain changes, your login will break until you update these:
1.  Go to [LINE Developers Console](https://developers.line.biz/console/).
2.  Update the **Callback URL** to:
    `https://beauty-pk.vercel.app/api/auth/line/callback`

## 4. Local Workspace Update
I can help with this! I will update internal strings and instructions.
- Change README titles.
- Update documentation links.

## 5. Environment Variables
Ensure the `origin` used in your code (if hardcoded) is updated. Our current code uses dynamic `x-forwarded-host`, so it should adapt automatically once the domain changes!

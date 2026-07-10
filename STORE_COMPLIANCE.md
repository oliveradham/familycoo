# Store Submission Compliance Answers

Fill these in verbatim when submitting to the App Store and Google Play. They
match `ios-privacy/PrivacyInfo.xcprivacy` and the privacy notice at
`/privacy-policy`. Keep this file in sync if the data model changes.

---

## Apple App Store — App Privacy Questionnaire

Path in App Store Connect: **App → App Privacy → Get Started**.

### Data collected and linked to the user

| Data type | Purposes | Used for tracking? |
| --- | --- | --- |
| Email Address | App Functionality, Account Management | No |
| Name | App Functionality | No |
| User ID | App Functionality | No |
| Other User Content (family/household data — calendar events, tasks, groceries, receipts, medical notes, documents) | App Functionality | No |
| Health & Fitness (medical hub entries such as allergies, medications) | App Functionality | No |
| Purchase History (subscription status) | App Functionality | No |

### Data collected and NOT linked to the user

| Data type | Purposes | Used for tracking? |
| --- | --- | --- |
| Crash Data | App Functionality, Analytics | No |
| Performance Data | Analytics | No |

### Tracking
**Do you or your third-party partners use data for tracking?** No.

### Contact info
- Privacy policy URL: `https://familycoo.lovable.app/privacy-policy`
- Support URL: `https://familycoo.lovable.app` (add a dedicated `/support` before submitting)

### Account deletion
- **Account deletion is available in-app.** Path: `More → Settings → Delete account`.
- Deleting the account cancels the subscription and removes all household data.

### Sign in with Apple
- Google sign-in offered → **Sign in with Apple is also offered** on iOS (present in `src/routes/auth.tsx`). Required by App Store Review Guideline 4.8.

### In-app purchase
- Digital subscriptions use **Apple In-App Purchase** (RevenueCat). No Paddle or external checkout is shown on iOS. See `src/routes/plans.tsx` platform branch.

---

## Google Play — Data Safety Form

Path in Play Console: **Policy → App content → Data safety**.

### Data collection & sharing
- **Does your app collect or share any of the required user data types?** Yes, collects. Does not share with third parties for advertising or analytics.
- **Is all user data encrypted in transit?** Yes (HTTPS/TLS everywhere; Supabase enforces TLS).
- **Do you provide a way for users to request that their data be deleted?** Yes — in-app (`Settings → Delete account`) and by email.

### Data types collected

| Category | Type | Collected | Shared | Purpose | Optional? |
| --- | --- | --- | --- | --- | --- |
| Personal info | Name | Yes | No | App functionality | No |
| Personal info | Email address | Yes | No | Account management, App functionality | No |
| Personal info | User IDs | Yes | No | App functionality | No |
| Financial info | Purchase history | Yes | No | App functionality | No |
| Health & fitness | Health info (family medical entries) | Yes | No | App functionality | Yes |
| Photos & videos | Photos (scanned receipts, vault uploads) | Yes | No | App functionality | Yes |
| Files & docs | Files & documents (vault uploads) | Yes | No | App functionality | Yes |
| Messages | Other in-app messages (concierge chat) | Yes | No | App functionality | Yes |
| App activity | App interactions | Yes | No | Analytics, App functionality | No |
| App info & performance | Crash logs | Yes | No | Analytics, App functionality | No |
| App info & performance | Diagnostics | Yes | No | Analytics, App functionality | No |

### Security practices
- Data encrypted in transit: **Yes**.
- Users can request data deletion: **Yes**.
- Committed to Play Families Policy: **N/A** (app is not directed at children).
- Independent security review: **No** (update if this changes).

---

## Content ratings

- Apple: **4+**
- Google IARC: **Everyone**
- Rationale: no user-generated public content, no ads, no gambling, no violence, no explicit material. Users share data only within their own household.

---

## Required URLs

| Purpose | URL |
| --- | --- |
| Marketing / homepage | `https://familycoo.lovable.app` |
| Privacy notice | `https://familycoo.lovable.app/privacy-policy` |
| Terms & conditions | `https://familycoo.lovable.app/terms` |
| Refund policy | `https://familycoo.lovable.app/refund-policy` |
| Support | `https://familycoo.lovable.app/support` *(create before submission)* |

---

## Reviewer demo account

Create before submitting and paste into the App Review / Play review notes:

```
Email:    reviewer@familycoo.app
Password: (generate a strong one; store in your password manager)
Notes:    Sample household is pre-seeded. To test premium features, use the
          sandbox IAP product `pro_monthly` — no real card is charged.
```

---

## What still needs to be done outside the codebase

1. Apple Developer Program enrollment ($99/yr) and Google Play Console ($25 one-time).
2. Run `npx cap add ios && npx cap add android` on macOS.
3. Copy `ios-privacy/PrivacyInfo.xcprivacy` into `ios/App/App/` and add it to the Xcode target.
4. Configure IAP products in App Store Connect and Google Play, wire them to RevenueCat (see `REVENUECAT_SETUP.md`).
5. Generate screenshots via `scripts/screenshots.ts` and upload for every required device size.
6. Fill in the questionnaires above using this file as the source of truth.

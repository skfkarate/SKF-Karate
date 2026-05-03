# Athlete Profile Google Sheet Template

This template is designed around the current SKF athlete schema and admin flow.

The main keys are:

- `skfId`: links one student to one athlete profile, fees, attendance, portal login, points, certificates, and event results.
- `tournamentId`: identifies one tournament once, even when many students and categories are involved.
- `eventId`: identifies a non-tournament event once, such as grading, belt exam, camp, seminar, or fun event.

## Tabs

Use these tabs in this order:

| Tab | Purpose |
| --- | --- |
| `Form_Questions` | Question plan for building a student/parent Google Form. |
| `FILL_Student_Profile` | Student/parent profile submissions. Keep this as raw intake for review, not the final app source. |
| `FILL_Tournament_Result` | Student/parent tournament result claims with certificate/proof links for verification. |
| `Students_Master` | One row per athlete. This is the main collection sheet for identity, portal access, training assignment, fees, consent, and public profile flags. |
| `Students` | App-compatible export tab for the current Google Sheets integration. Columns match `lib/server/sheets.ts` range `Students!A:L`. |
| `Tournament_Catalog` | One row per tournament. Tournament metadata is entered once here. |
| `Tournament_Results` | One row per athlete per tournament category/result. This is where same-tournament categorization happens. |
| `Tournaments` | Legacy app-compatible tournament export tab with `skfId`, tournament name, date, category, medal, and points. |
| `Events_Catalog` | One row per non-tournament event: grading, belt exam, seminar, camp, fun event. |
| `Event_Results` | One row per athlete event result. Used for belt/pass/fail, camp completion, seminar attendance, and special awards. |
| `Fees` | App-compatible fee rows. One row per `skfId` plus month plus year. |
| `Attendance` | App-compatible attendance rows. One row per `skfId` plus date. |
| `Lists` | Dropdown values and controlled vocabulary. Hide this tab after setup. |
| `Import_Checks` | Data quality work queue for missing fields, duplicates, and broken linkages. |
| `Field_Dictionary` | Field-by-field reference for required status, format, allowed values, and app usage. |

## Required Student Data

For privacy and accuracy, families should not edit `Students_Master` directly. The best workflow is:

1. Parents/students submit through a Google Form built from `Form_Questions`.
2. Responses land in `FILL_Student_Profile` and optional tournament claims land in `FILL_Tournament_Result`.
3. The team reviews consent, duplicate names, DOB, phone, branch, belt, and proof links.
4. Approved rows are copied or imported into `Students_Master`.
5. Verified tournament results are linked to `Tournament_Catalog` and `Tournament_Results`.

Do not share a public editable sheet containing all students' DOB, phone, address, emergency, or medical information. Use form responses or protected access for admins only.

## Student-Friendly Intake Design

The student/parent-facing form should feel short and safe. Keep the form sections in this order:

| Section | What families fill | Why |
| --- | --- | --- |
| Athlete Details | new/update, existing SKF ID, athlete name, DOB, gender | Identifies the athlete and supports portal login. |
| Training Details | branch, batch, current belt, joined date | Places the athlete in the correct profile, portal, and ranking context. |
| Parent Contact | guardian name, WhatsApp phone, alternate phone, email | Enables communication and sibling matching by phone. |
| Safety | emergency contact, medical conditions, allergies/restrictions | Helps instructors handle class safety. |
| Consent | photo/video consent, data storage consent, public profile consent, parent declaration | Prevents accidental publication or storage without permission. |
| Optional Proof | profile photo link, certificate folder link, notes | Gives the team supporting material without forcing long answers. |

Use `FILL_Student_Profile` column `Review Status` as the team's work queue:

| Status | Meaning |
| --- | --- |
| `new` | New submission, not reviewed. |
| `needs_review` | Missing or unclear data. Contact parent/student. |
| `approved` | Ready to move into `Students_Master`. |
| `imported` | Already moved into the master/app source. |
| `rejected` | Duplicate, invalid, or not accepted. |

For tournament claims submitted by students, use `FILL_Tournament_Result` only as a claim/proof queue. A result should not be published to an athlete profile until the team verifies the certificate/result proof, matches the SKF ID, and links it to a `Tournament_Catalog.tournamentId`.

## Linkage Map

| Source | Link Field | Destination | Purpose |
| --- | --- | --- | --- |
| `FILL_Student_Profile.Existing SKF ID` | `skfId` | `Students_Master.skfId` | Updates an existing athlete profile. |
| `Students_Master.skfId` | `skfId` | `Students.skfId` | Exports to the current app-compatible Students tab. |
| `Students_Master.skfId` | `skfId` | `Fees`, `Attendance`, `Tournament_Results`, `Event_Results` | Links operational records to one athlete. |
| `FILL_Tournament_Result.Linked Tournament ID` | `tournamentId` | `Tournament_Catalog.tournamentId` | Converts a student-submitted tournament claim into a verified tournament result. |
| `Tournament_Results.tournamentId` | `tournamentId` | `Tournament_Catalog.tournamentId` | Groups every category/result under one tournament. |
| `Event_Results.eventId` | `eventId` | `Events_Catalog.eventId` | Links grading, camp, seminar, or special event results. |

## ID Generation

Your teammate should not manually invent technical IDs. Keep the ID columns in the sheet because they are needed for reliable linking, but let the script generate them.

| ID | Where it lives | Who fills it | Rule |
| --- | --- | --- | --- |
| `skfId` | `Students_Master`, `Students`, result tabs | App/admin after athlete profile creation | Leave blank for new students. Fill only for existing students or after the app assigns the SKF ID. |
| `tournamentId` | `Tournament_Catalog` | Apps Script | Generated from tournament date and name. Example: `tour_20260420_state_open_karate_championship_2026`. |
| `eventId` | `Events_Catalog` | Apps Script | Generated from event date, type, and name. |
| `resultId` | `Tournament_Results`, `Event_Results` | Apps Script | Generated from source event/tournament plus SKF ID/category. |
| `sourceParticipantId` | `Tournament_Results` | Apps Script | Generated for profile achievement linkage. |

Use the `SKF Athlete Template > Generate missing IDs` menu after adding new tournaments, events, or result rows.

The generated workbook has a visible `SKF Karate - [Sheet Name]` title row on every sheet, then the field headers below it. The app reader has been made tolerant of this branded title row for Google Sheets tabs.

These fields are required to finish a normal athlete profile:

| Field | Why it is needed |
| --- | --- |
| `name` | Public profile display, admin search, certificates, results. |
| `dob` | Athlete portal login credential. Treat as sensitive data. The teammate-facing sheet uses `DD-MM-YYYY`; the app reader normalizes it internally. |
| `gender` | Profile and tournament grouping. |
| `branch` | Training assignment, rankings context, portal filtering. |
| `batch` | Portal videos/timetable assignment. |
| `belt` | Profile, rankings, tournament grouping. |
| `status` | Active/inactive filtering. |
| `enrolledDate` | Join date and initial white belt achievement. |
| `monthlyFee` | Fee ledger generation. |
| `photoConsent` | Media usage and public image safety. |
| `dataConsent` | Required before storing student data. |
| `isPublic` | Controls whether the athlete profile should be visible. |
| `isFeatured` | Controls highlighted public surfaces. |

Optional but useful:

- `parentName`, `phone`, `email`
- `photoUrl`
- emergency contact fields
- school/college
- medical notes
- profile notes

## Tournament Categorization

Enter the tournament once in `Tournament_Catalog`, then use `Tournament_Results` for each athlete result.

Recommended grouping fields:

- `tournamentId`
- `category`: free text. Fill exactly as written on the certificate or result sheet, including age and/or weight category where applicable. Example: `Sub-Junior Boys -35kg Kumite`.
- `ageGroup`: `sub-junior`, `junior`, `senior`, `open`
- `weightCategory`: example `-35kg`, `+84kg`, `open`
- `beltAtEvent`
- `genderAtEvent`
- `branchName`
- `result`, `medal`, `position`
- `wins`, `difficultyLevel`

This lets the team filter or pivot the same tournament cleanly:

- all SKF students in one tournament
- all students in one category
- medal list by branch
- medal list by belt
- points/ranking impact by athlete
- readiness to publish profile achievements

## Current App Mapping

The current app reads `Students!A:L` as:

```text
skfId, name, branch, batch, belt, parentName, phone, status, enrolledDate, monthlyFee, photoConsent, dob
```

The full admin athlete profile uses these fields:

```text
name, dob, branch, batch, belt, gender, parentName, phone, email, photoUrl,
monthlyFee, photoConsent, dataConsent, consentGivenAt, isPublic, isFeatured,
status, enrolledDate
```

Tournament achievements published to profiles need:

```text
tournamentId, skfId, athleteName, category, ageGroup, weightCategory,
result, medal, position, wins, difficultyLevel
```

The app links tournament results to athlete profiles by `skfId` first, and uses `tournamentId` as the source event id when publishing achievements.

## Setup Options

Option A: use the CSV files in `templates/google-sheets/athlete-profile/` and import each CSV into a Google Sheet tab with the matching name.

Option B: use the Apps Script file at `templates/google-sheets/athlete-profile/apps-script/athlete-profile-template.gs`.

1. Create a blank Google Sheet.
2. Open `Extensions > Apps Script`.
3. Paste the script.
4. Run `setupAthleteProfileWorkbook`.
5. Use the added `SKF Athlete Template` menu to generate missing IDs and refresh checks.

The Apps Script creates tabs, headers, dropdowns, frozen rows, filters, formulas for app-compatible exports, the field dictionary, and a data quality check tab.

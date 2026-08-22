# SKF Kunigal Agent Import Instructions

Use the accompanying JSON file to create the 25 athlete profiles, White Belt enrollment records, separate grading events, and event assignments.

## Confirmed rules

- Process events from oldest to newest.
- `currentBelt` is the athlete's current belt as of 26 July 2026.
- Use **Dr. Renshi Channegowda UC** as examiner for every grading event.
- Use **Grade A**, **Pass**, and **Promoted** for all listed examination assignments.
- Use **Kunigal** for branch, hosting branch, venue, city, dojo, and location.
- Use **₹400** as the default monthly fee.
- Profile-photo URLs remain blank until the image folder is uploaded.
- Every historical examination date in the JSON should be treated as the actual event date for this import.
- Create each examination as a separate event and link only its listed athletes.
- Preran A must not be connected to the 26 July 2026 event in any way.

## Joining-date fallback

Only the joining year is known. First try the four-digit year in `joinDate`. If the portal requires a full `YYYY-MM-DD` value, generate a valid random date within that year, ensure it is earlier than the athlete's first examination, and reuse the same date for the White Belt enrollment journey record.

## Profile-picture handling

When the profile-picture folder is supplied, match each image to the athlete using the full name or closest filename match, upload it, and populate `photoUrl`. Keep `photoConsent` as `false` unless consent is separately confirmed.

- Athlete profiles: 25
- Separate grading events: 12
- Current-event assignments: 24
/*
# Add signature support for multi-admin approval

1. Changes to `profiles`
   - Add `signature` (text) — a typed signature that each admin sets once on their profile.
     Used to stamp approval records with the admin's personal signature.

2. Changes to `approval_snapshots`
   - Add `signature` (text) — the signature text the admin typed at the moment of approval.
     Captured at approval time so the record is immutable even if the admin later changes their profile signature.

3. Security
   - No new tables. RLS already enabled on both tables.
   - `profiles.signature` is readable by the profile owner and by staff (covered by existing profiles SELECT policies).
   - `approval_snapshots.signature` follows the same immutability as the rest of the table (INSERT + SELECT only, no UPDATE/DELETE).
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS signature text;

ALTER TABLE approval_snapshots ADD COLUMN IF NOT EXISTS signature text;

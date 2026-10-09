# DBTHON 2026 Certificate Portal

A Next.js certificate portal for DBTHON 2026.

## What it does

1. Student enters a VIT registration number.
2. The server checks the participant database.
3. If the participant is eligible, a Participation Certificate is available.
4. The server checks the achievement database.
5. If an eligible achievement exists, an Achievement Certificate is available too.
6. The student's name is dynamically placed into the certificate template.
7. The achievement name is dynamically placed into the achievement certificate.
8. A PDF is generated and downloaded.

## Certificate templates

The two uploaded designs are stored as:

- `public/templates/participation.png`
- `public/templates/achievement.png`

The generator covers the placeholder text and draws the real student's name over it.

## Fastest local setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open:

http://localhost:3000

The project starts in **local JSON mode** if Supabase environment variables are not configured.

Test registration:

```text
24BDS0024
```

The sample data gives this student both certificates.

## Local data

Edit:

```text
data/participants.json
data/achievements.json
```

Participant schema:

```json
{
  "id": 1,
  "registration_number": "24BDS0024",
  "name": "Aditya Udiya",
  "eligible": true
}
```

Achievement schema:

```json
{
  "id": 1,
  "registration_number": "24BDS0024",
  "name": "Best Project Award",
  "eligible": true
}
```

## Supabase production mode

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Add your Supabase URL and service-role key to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Insert/import the participant and achievement data.
6. Run:

```bash
npm run build
npm start
```

### Important

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit `.env.local` to GitHub.

## Hosting

Recommended:

- GitHub for source code
- Vercel for Next.js
- Supabase for PostgreSQL

Set the two environment variables in Vercel and deploy.

## Important data interpretation

The current requested achievement schema is:

```text
id
registration_number
name
eligible
```

The implementation therefore treats `achievements.name` as the **award/achievement name**.

If your actual achievement CSV contains both the student's name and award name, use:

```text
id
registration_number
student_name
achievement_name
eligible
```

and update `lib/types.ts`, `lib/data.ts`, and the SQL schema accordingly.

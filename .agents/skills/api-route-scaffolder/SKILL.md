---
name: api-route-scaffolder
description: Scaffolds a new Next.js API route adhering to the Carzaar architecture (Zod validation, Auth guard, JSON response format).
---

# API Route Scaffolder

**Purpose:** Generates a compliant Next.js 14 API route.
**Traces to:** PRD Section 7 (Technical Requirements), `api-pipeline.md`, `coding-standards.md`, `security.md`.

## Execution Steps

1. **Verify Path:** Determine the correct path under `app/api/` (e.g., `app/api/listings/route.ts`).
2. **Setup Imports:** Import `NextRequest`, `NextResponse`, your Zod schema from `src/validators/`, and `prisma` from `src/lib/prisma`.
3. **Add Auth Guard (if mutation):** If creating a POST, PUT, or DELETE route, import `getSessionFromRequest` and enforce authentication.
4. **Implement Validation:** Extract the JSON body and parse it using your Zod schema.
5. **Database Operation:** Perform the Prisma database operation inside a `try/catch` block.
6. **Return Standard Response:** Return `{ success: true, data: result }` on success, or `{ success: false, error: message }` on failure.

## Code Skeleton
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth'; // Ensure correct path
import { MyZodSchema } from '@/validators/my.validator';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Guard
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Body Validation
    const body = await req.json();
    const validationResult = MyZodSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validationResult.error.errors }, { status: 400 });
    }

    // 3. Database Operation
    const data = await prisma.myModel.create({ data: validationResult.data });

    // 4. Standard Response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## Verify Before Done
- [ ] Is it using Next.js App Router syntax (`export async function POST(...)`)?
- [ ] Is the Zod schema applied correctly?
- [ ] Are authentication checks in place for state-changing methods?
- [ ] Does it return the exact `{ success, ... }` JSON structure?

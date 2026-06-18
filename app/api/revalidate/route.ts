import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  revalidatePath('/classes');
  revalidatePath('/classes/[citySlug]', 'page');
  revalidatePath('/classes/[citySlug]/[branchSlug]', 'page');
  return new Response('Revalidated', { status: 200 });
}

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: name => cookieStore.get(name)?.value ?? null,
        set: () => {},
        remove: () => {},
      },
    },
  );

  const { data, error } = await supabase.from('projects').select('*').eq('id', params.id).single();

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

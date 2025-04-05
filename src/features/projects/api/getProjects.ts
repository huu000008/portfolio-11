import { isServer } from '@/lib/utils/isServer';

export const getProjects = async () => {
  if (isServer()) {
    const { cookies } = await import('next/headers');
    const { createServerClient } = await import('@supabase/ssr');

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: name => cookieStore.get(name)?.value ?? null,
          set() {},
          remove() {},
        },
      },
    );

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) throw error;
    return data;
  }

  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('프로젝트 목록 조회 실패');
  return res.json();
};

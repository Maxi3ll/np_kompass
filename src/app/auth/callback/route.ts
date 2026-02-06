import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { isEmailAllowed } from '@/lib/supabase/actions';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        const allowed = await isEmailAllowed(user.email);
        if (!allowed) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=access_denied`);
        }

        // Auto-link auth user to persons record (if not already linked)
        const serviceClient = createServiceClient();
        const { data: person } = await serviceClient
          .from('persons')
          .select('id, auth_user_id')
          .eq('email', user.email)
          .single();

        if (person && !person.auth_user_id) {
          await serviceClient
            .from('persons')
            .update({ auth_user_id: user.id })
            .eq('id', person.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

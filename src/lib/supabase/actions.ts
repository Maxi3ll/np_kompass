'use server';

import { createClient } from './server';
import { createServiceClient } from './service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// =====================================================
// AUTH & EMAIL ALLOWLIST
// =====================================================

function getAdminEmail(): string | null {
  const allowedEmails = process.env.ALLOWED_EMAILS;
  if (!allowedEmails) return null;
  const first = allowedEmails.split(',')[0]?.trim().toLowerCase();
  return first || null;
}

export async function isEmailAllowed(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

  // Always allow admin email from env (can never lock yourself out)
  const adminEmail = getAdminEmail();
  if (adminEmail && normalizedEmail === adminEmail) {
    return true;
  }

  // Check database
  const service = createServiceClient();
  const { data } = await service
    .from('allowed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (data) return true;

  // Fallback: check full ALLOWED_EMAILS env list (for initial setup before DB is seeded)
  const envList = process.env.ALLOWED_EMAILS;
  if (envList) {
    const list = envList.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    return list.includes(normalizedEmail);
  }

  return false;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const adminEmail = getAdminEmail();
  return !!adminEmail && user.email.toLowerCase() === adminEmail;
}

export async function getAllowedEmails() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('allowed_emails')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return { error: error.message };
  return { emails: data, adminEmail: getAdminEmail() };
}

export async function addAllowedEmail(email: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'invalid_email' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('allowed_emails')
    .insert({ email: normalizedEmail, added_by: user?.email || null });

  if (error) {
    if (error.code === '23505') return { error: 'already_exists' };
    return { error: error.message };
  }

  revalidatePath('/profil');
  return { success: true };
}

export async function removeAllowedEmail(id: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const supabase = await createClient();

  // Fetch the email first to prevent deleting admin
  const { data: record } = await supabase
    .from('allowed_emails')
    .select('email')
    .eq('id', id)
    .single();

  if (!record) return { error: 'not_found' };

  const adminEmail = getAdminEmail();
  if (adminEmail && record.email.toLowerCase() === adminEmail) {
    return { error: 'cannot_remove_admin' };
  }

  const { error } = await supabase
    .from('allowed_emails')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/profil');
  return { success: true };
}

export async function sendMagicLink(email: string, redirectTo: string) {
  const allowed = await isEmailAllowed(email);
  if (!allowed) {
    return { error: 'access_denied' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return { error: 'send_failed' };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// =====================================================
// TENSIONS
// =====================================================

export interface CreateTensionData {
  title: string;
  description?: string;
  circleId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  raisedBy: string;
}

export async function createTension(data: CreateTensionData) {
  const supabase = await createClient();

  const { data: tension, error } = await supabase
    .from('tensions')
    .insert({
      title: data.title,
      description: data.description || null,
      circle_id: data.circleId,
      priority: data.priority,
      raised_by: data.raisedBy,
      status: 'NEW',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tension:', error);
    return { error: error.message };
  }

  revalidatePath('/spannungen');
  revalidatePath('/');

  return { tension };
}

export async function createTensionAndRedirect(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const circleId = formData.get('circleId') as string;
  const priority = formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH';
  const raisedBy = formData.get('raisedBy') as string;

  if (!title || !circleId || !raisedBy) {
    return { error: 'Titel und Kreis sind erforderlich' };
  }

  const result = await createTension({
    title,
    description,
    circleId,
    priority: priority || 'MEDIUM',
    raisedBy,
  });

  if (result.error) {
    return result;
  }

  redirect('/spannungen');
}

// =====================================================
// UPDATE TENSION
// =====================================================

export interface UpdateTensionData {
  id: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  nextAction?: string | null;
  assignedTo?: string | null;
  resolution?: string | null;
}

export async function updateTension(data: UpdateTensionData) {
  const supabase = await createClient();

  const updateData: Record<string, any> = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'RESOLVED') {
      updateData.resolved_at = new Date().toISOString();
    }
  }
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.nextAction !== undefined) updateData.next_action = data.nextAction;
  if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;
  if (data.resolution !== undefined) updateData.resolution = data.resolution;

  const { data: tension, error } = await supabase
    .from('tensions')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tension:', error);
    return { error: error.message };
  }

  revalidatePath(`/spannungen/${data.id}`);
  revalidatePath('/spannungen');
  revalidatePath('/');

  return { tension };
}

export async function resolveTension(id: string, resolution: string) {
  return updateTension({
    id,
    status: 'RESOLVED',
    resolution,
  });
}

export async function startWorkingOnTension(id: string, assignedTo: string, nextAction?: string) {
  return updateTension({
    id,
    status: 'IN_PROGRESS',
    assignedTo,
    nextAction,
  });
}

// =====================================================
// MEETINGS
// =====================================================

export interface CreateMeetingData {
  type: 'TACTICAL' | 'GOVERNANCE';
  circleId: string;
  date: string; // ISO string
  facilitatorId?: string;
  notes?: string;
}

export async function createMeeting(data: CreateMeetingData) {
  const supabase = await createClient();

  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert({
      type: data.type,
      circle_id: data.circleId,
      date: data.date,
      facilitator_id: data.facilitatorId || null,
      notes: data.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating meeting:', error);
    return { error: error.message };
  }

  revalidatePath('/meetings');
  revalidatePath('/');

  return { meeting };
}

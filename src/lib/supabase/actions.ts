'use server';

import { createClient } from './server';
import { createServiceClient } from './service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sendTelegramMessage } from '@/lib/telegram';
import { searchAll } from './queries';

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

  // Join with persons to get names
  const serviceClient = createServiceClient();
  const { data: persons } = await serviceClient
    .from('persons')
    .select('email, name');

  const personMap = new Map<string, string>();
  if (persons) {
    for (const p of persons) {
      personMap.set(p.email.toLowerCase(), p.name);
    }
  }

  const emailsWithNames = data.map((entry: any) => ({
    ...entry,
    personName: personMap.get(entry.email.toLowerCase()) || null,
  }));

  return { emails: emailsWithNames, adminEmail: getAdminEmail() };
}

export async function addAllowedEmail(email: string, name?: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'invalid_email' };
  }

  const supabase = await createClient();
  const serviceClient = createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await serviceClient
    .from('allowed_emails')
    .insert({ email: normalizedEmail, added_by: user?.email || null });

  if (error) {
    if (error.code === '23505') return { error: 'already_exists' };
    return { error: error.message };
  }

  // Auto-create person entry if name is provided
  if (name?.trim()) {
    const { data: existingPerson } = await serviceClient
      .from('persons')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!existingPerson) {
      await serviceClient.from('persons').insert({
        email: normalizedEmail,
        name: name.trim(),
        role: 'member',
      });
    }
  }

  revalidatePath('/profil');
  return { success: true };
}

export async function removeAllowedEmail(id: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();

  // Fetch the email first to prevent deleting admin
  const { data: record } = await serviceClient
    .from('allowed_emails')
    .select('email')
    .eq('id', id)
    .single();

  if (!record) return { error: 'not_found' };

  const adminEmail = getAdminEmail();
  if (adminEmail && record.email.toLowerCase() === adminEmail) {
    return { error: 'cannot_remove_admin' };
  }

  const { error } = await serviceClient
    .from('allowed_emails')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/profil');
  return { success: true };
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message, error.status);
    if (error.message === 'Invalid login credentials') {
      return { error: 'invalid_credentials' };
    }
    return { error: 'sign_in_failed', details: error.message };
  }

  return { success: true };
}

export async function signUpWithPassword(email: string, password: string) {
  const allowed = await isEmailAllowed(email);
  if (!allowed) {
    return { error: 'access_denied' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: undefined },
  });

  if (error) {
    console.error('Sign up error:', error.message, error.status);
    if (error.message?.includes('already registered')) {
      return { error: 'already_registered' };
    }
    return { error: 'sign_up_failed', details: error.message };
  }

  // Auto-link to persons record
  if (data.user) {
    const serviceClient = createServiceClient();
    const { data: person } = await serviceClient
      .from('persons')
      .select('id, auth_user_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (person && !person.auth_user_id) {
      await serviceClient
        .from('persons')
        .update({ auth_user_id: data.user.id })
        .eq('id', person.id);
    }
  }

  return { success: true };
}

export async function resetPassword(email: string, redirectTo: string) {
  const allowed = await isEmailAllowed(email);
  if (!allowed) {
    return { error: 'access_denied' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error('Reset password error:', error.message, error.status);
    return { error: 'reset_failed', details: error.message };
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
// SEARCH
// =====================================================

export async function performSearch(query: string) {
  return searchAll(query);
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
  const serviceClient = createServiceClient();

  const { data: tension, error } = await serviceClient
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

  // Fetch circle and creator info for notifications
  const { data: circle } = await serviceClient
    .from('circles')
    .select('name')
    .eq('id', data.circleId)
    .single();

  const { data: creator } = await serviceClient
    .from('persons')
    .select('name')
    .eq('id', data.raisedBy)
    .single();

  const notifMessage = `${creator?.name || 'Jemand'} hat "${data.title}" im Kreis "${circle?.name}" erfasst.`;

  // Send Telegram notification (if creator hasn't opted out)
  const { data: creatorTgPref } = await serviceClient
    .from('persons')
    .select('telegram_notifications')
    .eq('id', data.raisedBy)
    .single();
  if (creatorTgPref?.telegram_notifications !== false) {
    await sendTelegramMessage(`⚡ <b>Neue Spannung</b>\n${notifMessage}`);
  }

  // Notify circle members (except creator) via in-app notification
  const circleMembers = await getCircleMemberIds(data.circleId);
  for (const memberId of circleMembers) {
    if (memberId !== data.raisedBy) {
      await createNotification({
        personId: memberId,
        type: 'TENSION_CREATED',
        title: 'Neue Spannung',
        message: notifMessage,
        tensionId: tension.id,
        circleId: data.circleId,
      });
    }
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
  title?: string;
  description?: string | null;
  circleId?: string;
}

export async function updateTension(data: UpdateTensionData) {
  const serviceClient = createServiceClient();

  // Get old tension data BEFORE update (for notifications)
  const { data: oldTension } = await serviceClient
    .from('tensions')
    .select('title, assigned_to, raised_by, circle_id')
    .eq('id', data.id)
    .single();

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
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.circleId !== undefined) updateData.circle_id = data.circleId;

  const { data: tension, error } = await serviceClient
    .from('tensions')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tension:', error);
    return { error: error.message };
  }

  // Notification: tension assigned to someone new
  if (oldTension && data.assignedTo && data.assignedTo !== oldTension.assigned_to) {
    await createNotification({
      personId: data.assignedTo,
      type: 'TENSION_ASSIGNED',
      title: 'Spannung zugewiesen',
      message: `Dir wurde die Spannung "${oldTension.title}" zugewiesen.`,
      tensionId: data.id,
      circleId: oldTension.circle_id,
    });
  }

  // Notification: tension resolved → notify creator
  if (oldTension && data.status === 'RESOLVED' && oldTension.raised_by) {
    await createNotification({
      personId: oldTension.raised_by,
      type: 'TENSION_RESOLVED',
      title: 'Spannung erledigt',
      message: `Deine Spannung "${oldTension.title}" wurde als erledigt markiert.`,
      tensionId: data.id,
      circleId: oldTension.circle_id,
    });
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
  const serviceClient = createServiceClient();

  const { data: meeting, error } = await serviceClient
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

// =====================================================
// MEETING AGENDA
// =====================================================

export async function addAgendaItem(meetingId: string, data: { notes?: string; tensionId?: string }) {
  const serviceClient = createServiceClient();

  // Get next position
  const { data: existing } = await serviceClient
    .from('meeting_agenda_items')
    .select('position')
    .eq('meeting_id', meetingId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = (existing && existing.length > 0) ? existing[0].position + 1 : 1;

  const { data: item, error } = await serviceClient
    .from('meeting_agenda_items')
    .insert({
      meeting_id: meetingId,
      tension_id: data.tensionId || null,
      notes: data.notes || null,
      position: nextPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding agenda item:', error);
    return { error: error.message };
  }

  revalidatePath(`/meetings/${meetingId}`);
  return { item };
}

export async function removeAgendaItem(agendaItemId: string, meetingId: string) {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('meeting_agenda_items')
    .delete()
    .eq('id', agendaItemId);

  if (error) {
    console.error('Error removing agenda item:', error);
    return { error: error.message };
  }

  revalidatePath(`/meetings/${meetingId}`);
  return { success: true };
}

// =====================================================
// VORHABEN (Initiatives)
// =====================================================

export interface CreateVorhabenData {
  title: string;
  shortDescription?: string;
  description?: string;
  coordinatorId?: string;
  createdBy: string;
  circleIds?: string[];
  startDate?: string;
  endDate?: string;
}

export async function createVorhaben(data: CreateVorhabenData) {
  const serviceClient = createServiceClient();

  const { data: vorhaben, error } = await serviceClient
    .from('vorhaben')
    .insert({
      title: data.title,
      short_description: data.shortDescription || null,
      description: data.description || null,
      coordinator_id: data.coordinatorId || null,
      created_by: data.createdBy,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      status: 'OPEN',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating vorhaben:', error);
    return { error: error.message };
  }

  // Insert circle associations
  if (data.circleIds && data.circleIds.length > 0) {
    await serviceClient
      .from('vorhaben_circles')
      .insert(data.circleIds.map(circleId => ({
        vorhaben_id: vorhaben.id,
        circle_id: circleId,
      })));
  }

  // Fetch creator name for notifications
  const { data: creator } = await serviceClient
    .from('persons')
    .select('name')
    .eq('id', data.createdBy)
    .single();

  // Notify coordinator (if different from creator)
  if (data.coordinatorId && data.coordinatorId !== data.createdBy) {
    await createNotification({
      personId: data.coordinatorId,
      type: 'VORHABEN_CREATED',
      title: 'Neues Vorhaben',
      message: `${creator?.name || 'Jemand'} hat das Vorhaben "${data.title}" erstellt und dich als Koordinator:in eingetragen.`,
      vorhabenId: vorhaben.id,
    });
  }

  // Send Telegram notification
  const { data: creatorTgPref } = await serviceClient
    .from('persons')
    .select('telegram_notifications')
    .eq('id', data.createdBy)
    .single();
  if (creatorTgPref?.telegram_notifications !== false) {
    await sendTelegramMessage(`🚀 <b>Neues Vorhaben</b>\n${creator?.name || 'Jemand'} hat "${data.title}" erstellt.`);
  }

  revalidatePath('/vorhaben');
  revalidatePath('/');

  return { vorhaben };
}

export interface UpdateVorhabenData {
  id: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  title?: string;
  shortDescription?: string | null;
  description?: string | null;
  coordinatorId?: string | null;
  circleIds?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

export async function updateVorhaben(data: UpdateVorhabenData) {
  const serviceClient = createServiceClient();

  const updateData: Record<string, any> = {};

  if (data.status !== undefined) updateData.status = data.status;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.shortDescription !== undefined) updateData.short_description = data.shortDescription;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.coordinatorId !== undefined) updateData.coordinator_id = data.coordinatorId;
  if (data.startDate !== undefined) updateData.start_date = data.startDate;
  if (data.endDate !== undefined) updateData.end_date = data.endDate;

  const { data: vorhaben, error } = await serviceClient
    .from('vorhaben')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating vorhaben:', error);
    return { error: error.message };
  }

  // Update circle associations if provided
  if (data.circleIds !== undefined) {
    await serviceClient
      .from('vorhaben_circles')
      .delete()
      .eq('vorhaben_id', data.id);

    if (data.circleIds.length > 0) {
      await serviceClient
        .from('vorhaben_circles')
        .insert(data.circleIds.map(circleId => ({
          vorhaben_id: data.id,
          circle_id: circleId,
        })));
    }
  }

  revalidatePath(`/vorhaben/${data.id}`);
  revalidatePath('/vorhaben');
  revalidatePath('/');

  return { vorhaben };
}

export async function createSubtask(data: {
  vorhabenId: string;
  title: string;
  description?: string;
  contactPersonId?: string;
  createdBy: string;
}) {
  const serviceClient = createServiceClient();

  const { data: subtask, error } = await serviceClient
    .from('subtasks')
    .insert({
      vorhaben_id: data.vorhabenId,
      title: data.title,
      description: data.description || null,
      contact_person_id: data.contactPersonId || null,
      created_by: data.createdBy,
      status: 'OPEN',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subtask:', error);
    return { error: error.message };
  }

  revalidatePath(`/vorhaben/${data.vorhabenId}`);

  return { subtask };
}

export async function updateSubtask(subtaskId: string, data: {
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  title?: string;
  description?: string | null;
  contactPersonId?: string | null;
}) {
  const serviceClient = createServiceClient();

  // Get subtask info for notification + revalidation
  const { data: oldSubtask } = await serviceClient
    .from('subtasks')
    .select('title, vorhaben_id, vorhaben:vorhaben!subtasks_vorhaben_id_fkey(coordinator_id, title)')
    .eq('id', subtaskId)
    .single();

  const updateData: Record<string, any> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.contactPersonId !== undefined) updateData.contact_person_id = data.contactPersonId;

  const { data: subtask, error } = await serviceClient
    .from('subtasks')
    .update(updateData)
    .eq('id', subtaskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subtask:', error);
    return { error: error.message };
  }

  // Notify coordinator when subtask completed
  if (oldSubtask && data.status === 'DONE') {
    const coordinatorId = (oldSubtask.vorhaben as any)?.coordinator_id;
    if (coordinatorId) {
      await createNotification({
        personId: coordinatorId,
        type: 'VORHABEN_SUBTASK_COMPLETED',
        title: 'Unteraufgabe erledigt',
        message: `Die Unteraufgabe "${oldSubtask.title}" im Vorhaben "${(oldSubtask.vorhaben as any)?.title}" wurde abgeschlossen.`,
        vorhabenId: oldSubtask.vorhaben_id,
      });
    }
  }

  if (oldSubtask) {
    revalidatePath(`/vorhaben/${oldSubtask.vorhaben_id}`);
    revalidatePath(`/vorhaben/${oldSubtask.vorhaben_id}/unteraufgaben/${subtaskId}`);
  }
  revalidatePath('/vorhaben');

  return { subtask };
}

export async function volunteerForSubtask(subtaskId: string, personId: string) {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('subtask_volunteers')
    .insert({
      subtask_id: subtaskId,
      person_id: personId,
    });

  if (error) {
    if (error.code === '23505') return { error: 'already_volunteered' };
    console.error('Error volunteering:', error);
    return { error: error.message };
  }

  // Get subtask + vorhaben info for notification
  const { data: subtask } = await serviceClient
    .from('subtasks')
    .select('title, vorhaben_id, vorhaben:vorhaben!subtasks_vorhaben_id_fkey(coordinator_id, title)')
    .eq('id', subtaskId)
    .single();

  const { data: volunteer } = await serviceClient
    .from('persons')
    .select('name')
    .eq('id', personId)
    .single();

  if (subtask) {
    const coordinatorId = (subtask.vorhaben as any)?.coordinator_id;
    if (coordinatorId && coordinatorId !== personId) {
      await createNotification({
        personId: coordinatorId,
        type: 'VORHABEN_VOLUNTEER',
        title: 'Neue:r Helfer:in',
        message: `${volunteer?.name || 'Jemand'} hilft bei "${subtask.title}" im Vorhaben "${(subtask.vorhaben as any)?.title}".`,
        vorhabenId: subtask.vorhaben_id,
      });
    }

    revalidatePath(`/vorhaben/${subtask.vorhaben_id}/unteraufgaben/${subtaskId}`);
    revalidatePath(`/vorhaben/${subtask.vorhaben_id}`);
  }

  return { success: true };
}

export async function unvolunteerFromSubtask(subtaskId: string, personId: string) {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('subtask_volunteers')
    .delete()
    .eq('subtask_id', subtaskId)
    .eq('person_id', personId);

  if (error) {
    console.error('Error unvolunteering:', error);
    return { error: error.message };
  }

  // Get vorhaben_id for revalidation
  const { data: subtask } = await serviceClient
    .from('subtasks')
    .select('vorhaben_id')
    .eq('id', subtaskId)
    .single();

  if (subtask) {
    revalidatePath(`/vorhaben/${subtask.vorhaben_id}/unteraufgaben/${subtaskId}`);
    revalidatePath(`/vorhaben/${subtask.vorhaben_id}`);
  }

  return { success: true };
}

export async function createSubtaskComment(subtaskId: string, personId: string, content: string) {
  const serviceClient = createServiceClient();

  const { data: comment, error } = await serviceClient
    .from('subtask_comments')
    .insert({
      subtask_id: subtaskId,
      person_id: personId,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating subtask comment:', error);
    return { error: error.message };
  }

  // Fetch subtask + vorhaben info for notifications
  const { data: subtask } = await serviceClient
    .from('subtasks')
    .select('title, vorhaben_id, contact_person_id, vorhaben:vorhaben!subtasks_vorhaben_id_fkey(coordinator_id, title)')
    .eq('id', subtaskId)
    .single();

  const { data: commenter } = await serviceClient
    .from('persons')
    .select('name')
    .eq('id', personId)
    .single();

  if (subtask) {
    const notifMessage = `${commenter?.name || 'Jemand'} hat eine Unteraufgabe in "${(subtask.vorhaben as any)?.title}" kommentiert.`;
    const notifyIds = new Set<string>();

    const coordinatorId = (subtask.vorhaben as any)?.coordinator_id;
    if (coordinatorId && coordinatorId !== personId) notifyIds.add(coordinatorId);
    if (subtask.contact_person_id && subtask.contact_person_id !== personId) notifyIds.add(subtask.contact_person_id);

    for (const recipientId of notifyIds) {
      await createNotification({
        personId: recipientId,
        type: 'VORHABEN_COMMENTED',
        title: 'Neuer Kommentar',
        message: notifMessage,
        vorhabenId: subtask.vorhaben_id,
      });
    }

    revalidatePath(`/vorhaben/${subtask.vorhaben_id}/unteraufgaben/${subtaskId}`);
  }

  return { comment };
}

export async function deleteSubtaskComment(commentId: string) {
  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('subtask_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting subtask comment:', error);
    return { error: error.message };
  }

  return { success: true };
}

// =====================================================
// CIRCLES
// =====================================================

export interface CreateCircleData {
  name: string;
  purpose?: string;
  color?: string;
  icon?: string;
  parentCircleId?: string;
}

export async function createCircle(data: CreateCircleData) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();
  const { data: circle, error } = await serviceClient
    .from('circles')
    .insert({
      name: data.name,
      purpose: data.purpose || null,
      color: data.color || '#4A90D9',
      icon: data.icon || '⭕',
      parent_circle_id: data.parentCircleId || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/kreise');
  revalidatePath('/');
  return { circle };
}

export async function updateCircle(id: string, data: Partial<CreateCircleData>) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.purpose !== undefined) updateData.purpose = data.purpose;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;

  const serviceClient = createServiceClient();
  const { data: circle, error } = await serviceClient
    .from('circles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/kreise/${id}`);
  revalidatePath('/kreise');
  revalidatePath('/');
  return { circle };
}

export async function deleteCircle(id: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();

  // Check for roles in this circle
  const { count } = await serviceClient
    .from('roles')
    .select('id', { count: 'exact', head: true })
    .eq('circle_id', id);

  if (count && count > 0) {
    return { error: 'has_roles' };
  }

  const { error } = await serviceClient.from('circles').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/kreise');
  revalidatePath('/');
  return { success: true };
}

// =====================================================
// ROLES
// =====================================================

export interface CreateRoleData {
  name: string;
  purpose?: string;
  domains?: string[];
  accountabilities?: string[];
  circleId: string;
}

export async function createRole(data: CreateRoleData) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();
  const { data: role, error } = await serviceClient
    .from('roles')
    .insert({
      name: data.name,
      purpose: data.purpose || null,
      domains: data.domains || [],
      accountabilities: data.accountabilities || [],
      circle_id: data.circleId,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/kreise/${data.circleId}`);
  revalidatePath('/kreise');
  return { role };
}

export async function updateRole(id: string, data: Partial<Omit<CreateRoleData, 'circleId'>>) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.purpose !== undefined) updateData.purpose = data.purpose;
  if (data.domains !== undefined) updateData.domains = data.domains;
  if (data.accountabilities !== undefined) updateData.accountabilities = data.accountabilities;

  const serviceClient = createServiceClient();
  const { data: role, error } = await serviceClient
    .from('roles')
    .update(updateData)
    .eq('id', id)
    .select('*, circle_id')
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/rollen/${id}`);
  revalidatePath(`/kreise/${role.circle_id}`);
  revalidatePath('/kreise');
  return { role };
}

export async function deleteRole(id: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();

  // Get circle_id before deleting
  const { data: role } = await serviceClient
    .from('roles')
    .select('circle_id')
    .eq('id', id)
    .single();

  // Check for active assignments
  const { count } = await serviceClient
    .from('role_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', id)
    .is('valid_until', null);

  if (count && count > 0) {
    return { error: 'has_active_assignment' };
  }

  const { error } = await serviceClient.from('roles').delete().eq('id', id);
  if (error) return { error: error.message };

  if (role) {
    revalidatePath(`/kreise/${role.circle_id}`);
  }
  revalidatePath('/kreise');
  return { success: true };
}

// =====================================================
// ROLE ASSIGNMENTS
// =====================================================

export async function getPersonsList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('persons')
    .select('id, name, email')
    .eq('is_active', true)
    .order('name');

  if (error) return { error: error.message };
  return { persons: data };
}

export async function assignRole(roleId: string, personId: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();

  // Create new assignment (additive — does not end existing holders)
  const { error } = await serviceClient
    .from('role_assignments')
    .insert({
      role_id: roleId,
      person_id: personId,
      valid_from: new Date().toISOString().split('T')[0],
    });

  if (error) return { error: error.message };

  // Send notification to assigned person
  const { data: roleData } = await serviceClient
    .from('roles')
    .select('name, circle_id, circle:circles(name)')
    .eq('id', roleId)
    .single();

  if (roleData) {
    await createNotification({
      personId,
      type: 'ROLE_ASSIGNED',
      title: 'Neue Rolle zugewiesen',
      message: `Du wurdest zur Rolle "${roleData.name}" im Kreis "${(roleData.circle as any)?.name}" zugewiesen.`,
      roleId,
      circleId: roleData.circle_id,
    });
  }

  revalidatePath(`/rollen/${roleId}`);
  revalidatePath('/kreise');
  revalidatePath('/');
  return { success: true };
}

export async function updateProfile(personId: string, data: { name?: string; avatar_color?: string | null; phone?: string | null }) {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  // Verify the user owns this person record
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };

  const { data: person } = await serviceClient
    .from('persons')
    .select('auth_user_id')
    .eq('id', personId)
    .single();

  if (!person || person.auth_user_id !== user.id) {
    return { error: 'unauthorized' };
  }

  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.avatar_color !== undefined) updateData.avatar_color = data.avatar_color;
  if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;

  if (Object.keys(updateData).length === 0) return { error: 'no changes' };

  const { error } = await serviceClient
    .from('persons')
    .update(updateData)
    .eq('id', personId);

  if (error) return { error: error.message };

  revalidatePath('/profil');
  revalidatePath('/');
  return { success: true };
}

export async function unassignRole(roleId: string, personId: string) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return { error: 'unauthorized' };

  const serviceClient = createServiceClient();

  const { error } = await serviceClient
    .from('role_assignments')
    .update({ valid_until: new Date().toISOString().split('T')[0] })
    .eq('role_id', roleId)
    .eq('person_id', personId)
    .is('valid_until', null);

  if (error) return { error: error.message };

  // Send notification to former holder
  if (personId) {
    const { data: roleData } = await serviceClient
      .from('roles')
      .select('name, circle_id, circle:circles(name)')
      .eq('id', roleId)
      .single();

    if (roleData) {
      await createNotification({
        personId,
        type: 'ROLE_UNASSIGNED',
        title: 'Rolle beendet',
        message: `Deine Rolle "${roleData.name}" im Kreis "${(roleData.circle as any)?.name}" wurde beendet.`,
        roleId,
        circleId: roleData.circle_id,
      });
    }
  }

  revalidatePath(`/rollen/${roleId}`);
  revalidatePath('/kreise');
  revalidatePath('/');
  return { success: true };
}

// =====================================================
// NOTIFICATIONS
// =====================================================

const TELEGRAM_ICONS: Record<string, string> = {
  ROLE_ASSIGNED: '👤',
  ROLE_UNASSIGNED: '👋',
  TENSION_CREATED: '⚡',
  TENSION_ASSIGNED: '📌',
  TENSION_RESOLVED: '✅',
  VORHABEN_CREATED: '🚀',
  VORHABEN_VOLUNTEER: '🙋',
  VORHABEN_SUBTASK_COMPLETED: '✅',
  VORHABEN_COMMENTED: '💬',
};

async function createNotification(data: {
  personId: string;
  type: string;
  title: string;
  message: string;
  roleId?: string;
  tensionId?: string;
  vorhabenId?: string;
  circleId?: string;
}) {
  const serviceClient = createServiceClient();
  await serviceClient.from('notifications').insert({
    person_id: data.personId,
    type: data.type,
    title: data.title,
    message: data.message,
    role_id: data.roleId || null,
    tension_id: data.tensionId || null,
    vorhaben_id: data.vorhabenId || null,
    circle_id: data.circleId || null,
  });

  // Send Telegram notification (except TENSION_CREATED which is handled separately)
  if (data.type !== 'TENSION_CREATED') {
    // Check if the person has Telegram notifications enabled
    const { data: personPref } = await serviceClient
      .from('persons')
      .select('telegram_notifications')
      .eq('id', data.personId)
      .single();

    if (personPref?.telegram_notifications !== false) {
      const icon = TELEGRAM_ICONS[data.type] || '🔔';
      await sendTelegramMessage(`${icon} <b>${data.title}</b>\n${data.message}`);
    }
  }
}

async function getCircleMemberIds(circleId: string): Promise<string[]> {
  const serviceClient = createServiceClient();
  const { data } = await serviceClient
    .from('role_assignments')
    .select('person_id, role:roles!inner(circle_id)')
    .is('valid_until', null);

  if (!data) return [];

  const members = data.filter((d: any) => d.role?.circle_id === circleId);
  return [...new Set(members.map((d: any) => d.person_id))];
}

export async function fetchNotifications(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const serviceClient = createServiceClient();
  const { data: person } = await serviceClient
    .from('persons')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!person) return [];

  const { data, error } = await serviceClient
    .from('notifications')
    .select('*')
    .eq('person_id', person.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };

  const serviceClient = createServiceClient();
  const { data: person } = await serviceClient
    .from('persons')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!person) return { error: 'person not found' };

  // Verify ownership
  const { data: notification } = await serviceClient
    .from('notifications')
    .select('person_id')
    .eq('id', notificationId)
    .single();

  if (!notification || notification.person_id !== person.id) {
    return { error: 'unauthorized' };
  }

  const { error } = await serviceClient
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

// =====================================================
// ACCOUNT DELETION (DSGVO Art. 17)
// =====================================================

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };

  const serviceClient = createServiceClient();

  // Find person record
  const { data: person } = await serviceClient
    .from('persons')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (person) {
    // Delete notifications
    await serviceClient.from('notifications').delete().eq('person_id', person.id);

    // End all active role assignments
    await serviceClient
      .from('role_assignments')
      .update({ valid_until: new Date().toISOString().split('T')[0] })
      .eq('person_id', person.id)
      .is('valid_until', null);

    // Anonymize tensions (set raised_by/assigned_to to null)
    await serviceClient
      .from('tensions')
      .update({ raised_by: null })
      .eq('raised_by', person.id);
    await serviceClient
      .from('tensions')
      .update({ assigned_to: null })
      .eq('assigned_to', person.id);

    // Anonymize vorhaben
    await serviceClient
      .from('vorhaben')
      .update({ created_by: null })
      .eq('created_by', person.id);
    await serviceClient
      .from('vorhaben')
      .update({ coordinator_id: null })
      .eq('coordinator_id', person.id);

    // Anonymize subtasks
    await serviceClient
      .from('subtasks')
      .update({ created_by: null })
      .eq('created_by', person.id);
    await serviceClient
      .from('subtasks')
      .update({ contact_person_id: null })
      .eq('contact_person_id', person.id);

    // Remove volunteer entries
    await serviceClient
      .from('subtask_volunteers')
      .delete()
      .eq('person_id', person.id);

    // Anonymize meetings (set facilitator_id to null)
    await serviceClient
      .from('meetings')
      .update({ facilitator_id: null })
      .eq('facilitator_id', person.id);

    // Delete person record
    await serviceClient.from('persons').delete().eq('id', person.id);

    // Remove from allowed_emails
    await serviceClient.from('allowed_emails').delete().eq('email', user.email!);
  }

  // Delete Supabase auth user
  const { error } = await serviceClient.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('Error deleting auth user:', error);
    return { error: error.message };
  }

  redirect('/login');
}

// =====================================================
// DATA EXPORT (DSGVO Art. 20)
// =====================================================

export async function exportUserData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };

  const serviceClient = createServiceClient();

  // Get person
  const { data: person } = await serviceClient
    .from('persons')
    .select('*, family:families(name)')
    .eq('auth_user_id', user.id)
    .single();

  if (!person) return { error: 'person not found' };

  // Get role assignments
  const { data: roleAssignments } = await serviceClient
    .from('role_assignments')
    .select('valid_from, valid_until, role:roles(name, circle:circles(name))')
    .eq('person_id', person.id);

  // Get tensions raised
  const { data: tensionsRaised } = await serviceClient
    .from('tensions')
    .select('title, description, status, priority, created_at, resolved_at, circle:circles(name)')
    .eq('raised_by', person.id);

  // Get tensions assigned
  const { data: tensionsAssigned } = await serviceClient
    .from('tensions')
    .select('title, status, priority, circle:circles(name)')
    .eq('assigned_to', person.id);

  // Get vorhaben created
  const { data: vorhabenCreated } = await serviceClient
    .from('vorhaben')
    .select('title, short_description, status, start_date, end_date, created_at')
    .eq('created_by', person.id);

  // Get vorhaben coordinated
  const { data: vorhabenCoordinated } = await serviceClient
    .from('vorhaben')
    .select('title, status')
    .eq('coordinator_id', person.id);

  // Get subtask volunteering
  const { data: volunteering } = await serviceClient
    .from('subtask_volunteers')
    .select('subtask:subtasks(title, vorhaben:vorhaben(title))')
    .eq('person_id', person.id);

  // Get notifications
  const { data: notifications } = await serviceClient
    .from('notifications')
    .select('type, title, message, is_read, created_at')
    .eq('person_id', person.id)
    .order('created_at', { ascending: false });

  const exportData = {
    exportiert_am: new Date().toISOString(),
    person: {
      name: person.name,
      email: person.email,
      telefon: person.phone || null,
      avatar_farbe: person.avatar_color || null,
      familie: (person.family as any)?.name || null,
      mitglied_seit: person.created_at,
    },
    auth: {
      email: user.email,
      letzter_login: user.last_sign_in_at,
      erstellt_am: user.created_at,
    },
    rollenzuweisungen: (roleAssignments || []).map((ra: any) => ({
      rolle: ra.role?.name,
      kreis: ra.role?.circle?.name,
      von: ra.valid_from,
      bis: ra.valid_until || 'aktiv',
    })),
    spannungen_erstellt: (tensionsRaised || []).map((t: any) => ({
      titel: t.title,
      beschreibung: t.description,
      status: t.status,
      prioritaet: t.priority,
      kreis: t.circle?.name,
      erstellt_am: t.created_at,
      geloest_am: t.resolved_at,
    })),
    spannungen_zugewiesen: (tensionsAssigned || []).map((t: any) => ({
      titel: t.title,
      status: t.status,
      prioritaet: t.priority,
      kreis: t.circle?.name,
    })),
    vorhaben_erstellt: (vorhabenCreated || []).map((v: any) => ({
      titel: v.title,
      kurzbeschreibung: v.short_description,
      status: v.status,
      startdatum: v.start_date,
      enddatum: v.end_date,
      erstellt_am: v.created_at,
    })),
    vorhaben_koordiniert: (vorhabenCoordinated || []).map((v: any) => ({
      titel: v.title,
      status: v.status,
    })),
    helfer_bei: (volunteering || []).map((v: any) => ({
      unteraufgabe: v.subtask?.title,
      vorhaben: v.subtask?.vorhaben?.title,
    })),
    benachrichtigungen: (notifications || []).map((n: any) => ({
      typ: n.type,
      titel: n.title,
      nachricht: n.message,
      gelesen: n.is_read,
      erstellt_am: n.created_at,
    })),
  };

  return { data: exportData };
}

// =====================================================
// TELEGRAM OPT-OUT
// =====================================================

export async function toggleTelegramNotifications(personId: string, enabled: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };

  const serviceClient = createServiceClient();

  // Verify ownership
  const { data: person } = await serviceClient
    .from('persons')
    .select('auth_user_id')
    .eq('id', personId)
    .single();

  if (!person || person.auth_user_id !== user.id) {
    return { error: 'unauthorized' };
  }

  const { error } = await serviceClient
    .from('persons')
    .update({ telegram_notifications: enabled })
    .eq('id', personId);

  if (error) return { error: error.message };

  revalidatePath('/profil');
  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' };

  const serviceClient = createServiceClient();
  const { data: person } = await serviceClient
    .from('persons')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!person) return { error: 'person not found' };

  const { error } = await serviceClient
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('person_id', person.id)
    .eq('is_read', false);

  if (error) return { error: error.message };

  revalidatePath('/');
  return { success: true };
}

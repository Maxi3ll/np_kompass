import { createClient } from './server';

// =====================================================
// CIRCLES
// =====================================================

export async function getCircles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('circle_stats')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching circles:', error);
    return [];
  }

  return data;
}

export async function getCircleById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('circles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching circle:', error);
    return null;
  }

  return data;
}

export async function getCircleWithRoles(id: string) {
  const supabase = await createClient();

  // Get circle
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select('*')
    .eq('id', id)
    .single();

  if (circleError) {
    console.error('Error fetching circle:', circleError);
    return null;
  }

  // Get roles with current holders
  const { data: roles, error: rolesError } = await supabase
    .from('current_role_holders')
    .select('*')
    .eq('circle_id', id)
    .order('role_name');

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return { ...circle, roles: [] };
  }

  // Get open tensions count
  const { count: openTensions } = await supabase
    .from('tensions')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', id)
    .in('status', ['NEW', 'IN_PROGRESS']);

  return {
    ...circle,
    roles,
    openTensions: openTensions || 0,
  };
}

// =====================================================
// ROLES
// =====================================================

export async function getAllRoles() {
  const supabase = await createClient();

  const { data: roles, error } = await supabase
    .from('roles')
    .select(`
      *,
      circle:circles(id, name, color, icon)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching roles:', error);
    return [];
  }

  // Get current holders for all roles
  const { data: assignments } = await supabase
    .from('role_assignments')
    .select(`
      role_id,
      person:persons(id, name)
    `)
    .is('valid_until', null);

  const holderMap = new Map<string, { id: string; name: string }>();
  if (assignments) {
    for (const a of assignments) {
      if (a.person) {
        holderMap.set(a.role_id, a.person as any);
      }
    }
  }

  return roles.map((role: any) => ({
    ...role,
    holder: holderMap.get(role.id) || null,
  }));
}

export async function getRoleById(id: string) {
  const supabase = await createClient();

  // Get role with all details
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select(`
      *,
      circle:circles(id, name, color, icon)
    `)
    .eq('id', id)
    .single();

  if (roleError) {
    console.error('Error fetching role:', roleError);
    return null;
  }

  // Get current holder
  const { data: assignment } = await supabase
    .from('role_assignments')
    .select(`
      *,
      person:persons(id, name, email, phone)
    `)
    .eq('role_id', id)
    .is('valid_until', null)
    .single();

  return {
    role_id: role.id,
    role_name: role.name,
    role_purpose: role.purpose,
    domains: role.domains,
    accountabilities: role.accountabilities,
    circle_id: role.circle?.id,
    circle_name: role.circle?.name,
    circle_color: role.circle?.color,
    holder_id: assignment?.person?.id,
    holder_name: assignment?.person?.name,
    holder_email: assignment?.person?.email,
    holder_phone: assignment?.person?.phone,
    holder_since: assignment?.valid_from,
  };
}

export async function getRoleHistory(roleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('role_assignments')
    .select(`
      *,
      person:persons(id, name, email)
    `)
    .eq('role_id', roleId)
    .order('valid_from', { ascending: false });

  if (error) {
    console.error('Error fetching role history:', error);
    return [];
  }

  return data;
}

// =====================================================
// TENSIONS
// =====================================================

export async function getTensions(filters?: {
  circleId?: string;
  status?: string;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('tensions')
    .select(`
      *,
      circle:circles!tensions_circle_id_fkey(id, name, color, icon),
      raised_by_person:persons!tensions_raised_by_fkey(id, name),
      assigned_to_person:persons!tensions_assigned_to_fkey(id, name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.circleId) {
    query = query.eq('circle_id', filters.circleId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tensions:', error);
    return [];
  }

  return data;
}

export async function getTensionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tensions')
    .select(`
      *,
      circle:circles!tensions_circle_id_fkey(id, name, color, icon),
      raised_by_person:persons!tensions_raised_by_fkey(id, name, email, phone),
      assigned_to_person:persons!tensions_assigned_to_fkey(id, name, email, phone)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tension:', error);
    return null;
  }

  return data;
}

export async function getOpenTensionsCount(circleIds?: string[]) {
  const supabase = await createClient();

  let query = supabase
    .from('tensions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['NEW', 'IN_PROGRESS']);

  if (circleIds && circleIds.length > 0) {
    query = query.in('circle_id', circleIds);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting tensions:', error);
    return 0;
  }

  return count || 0;
}

// =====================================================
// PERSONS
// =====================================================

export async function getPersonByAuthId(authUserId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error) {
    console.error('Error fetching person:', error);
    return null;
  }

  return data;
}

export async function getPersonWithRoles(personId: string) {
  const supabase = await createClient();

  // Get person
  const { data: person, error: personError } = await supabase
    .from('persons')
    .select('*, family:families(*)')
    .eq('id', personId)
    .single();

  if (personError) {
    console.error('Error fetching person:', personError);
    return null;
  }

  // Get current roles
  const { data: roleAssignments, error: rolesError } = await supabase
    .from('role_assignments')
    .select(`
      *,
      role:roles(
        id,
        name,
        purpose,
        circle:circles(id, name, color, icon)
      )
    `)
    .eq('person_id', personId)
    .is('valid_until', null);

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return { ...person, roles: [] };
  }

  return {
    ...person,
    roles: roleAssignments?.map(ra => ({
      ...ra.role,
      since: ra.valid_from,
    })) || [],
  };
}

// =====================================================
// MEETINGS
// =====================================================

export async function getMeetings(filters?: {
  circleId?: string;
  upcoming?: boolean;
  past?: boolean;
  limit?: number;
}) {
  const supabase = await createClient();

  let query = supabase
    .from('meetings')
    .select(`
      *,
      circle:circles(id, name, color, icon),
      facilitator:persons!meetings_facilitator_id_fkey(id, name)
    `)
    .order('date', { ascending: filters?.upcoming ? true : false });

  if (filters?.circleId) {
    query = query.eq('circle_id', filters.circleId);
  }

  if (filters?.upcoming) {
    query = query.gte('date', new Date().toISOString());
  }

  if (filters?.past) {
    query = query.lt('date', new Date().toISOString());
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }

  return data;
}

export async function getMeetingById(id: string) {
  const supabase = await createClient();

  // Get meeting with circle and facilitator
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select(`
      *,
      circle:circles(id, name, color, icon, purpose),
      facilitator:persons!meetings_facilitator_id_fkey(id, name, email)
    `)
    .eq('id', id)
    .single();

  if (meetingError) {
    console.error('Error fetching meeting:', meetingError);
    return null;
  }

  // Get attendees
  const { data: attendees } = await supabase
    .from('meeting_attendees')
    .select(`
      person:persons(id, name, email)
    `)
    .eq('meeting_id', id);

  // Get agenda items with tensions
  const { data: agendaItems } = await supabase
    .from('meeting_agenda_items')
    .select(`
      *,
      tension:tensions(id, title, status, priority)
    `)
    .eq('meeting_id', id)
    .order('position');

  // Get open tensions from this circle that could be added to agenda
  const { data: openTensions } = await supabase
    .from('tensions')
    .select('id, title, priority, status')
    .eq('circle_id', meeting.circle_id)
    .in('status', ['NEW', 'IN_PROGRESS'])
    .order('priority', { ascending: false });

  return {
    ...meeting,
    attendees: attendees?.map(a => a.person) || [],
    agendaItems: agendaItems || [],
    openTensions: openTensions || [],
  };
}

export async function getUpcomingMeetingsForPerson(personId: string, limit = 5) {
  const supabase = await createClient();

  // Get circles where person has roles
  const { data: roleAssignments } = await supabase
    .from('role_assignments')
    .select('role:roles(circle_id)')
    .eq('person_id', personId)
    .is('valid_until', null);

  const circleIds = [...new Set(roleAssignments?.map(ra => (ra.role as any)?.circle_id).filter(Boolean))] as string[];

  if (circleIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      circle:circles(id, name, color, icon)
    `)
    .in('circle_id', circleIds)
    .gte('date', new Date().toISOString())
    .order('date')
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming meetings:', error);
    return [];
  }

  return data;
}

// =====================================================
// DASHBOARD
// =====================================================

export async function getDashboardData(personId?: string) {
  const supabase = await createClient();

  // Get all circles with stats
  const { data: circles } = await supabase
    .from('circle_stats')
    .select('*');

  // Calculate total open tensions
  const openTensions = circles?.reduce((sum, c) => sum + (c.open_tensions || 0), 0) || 0;

  // Get user's roles if personId provided
  let myRoles: any[] = [];
  if (personId) {
    const { data: roleAssignments } = await supabase
      .from('role_assignments')
      .select(`
        *,
        role:roles(
          id,
          name,
          circle:circles(id, name, color)
        )
      `)
      .eq('person_id', personId)
      .is('valid_until', null);

    myRoles = roleAssignments?.map(ra => ({
      id: ra.role?.id,
      name: ra.role?.name,
      circle: ra.role?.circle?.name,
      color: ra.role?.circle?.color,
    })) || [];
  }

  // Get next meeting (placeholder - we'd need actual meeting data)
  const { data: nextMeeting } = await supabase
    .from('meetings')
    .select(`
      *,
      circle:circles(id, name, color, icon)
    `)
    .gte('date', new Date().toISOString())
    .order('date')
    .limit(1)
    .single();

  return {
    openTensions,
    myRoles,
    nextMeeting,
    circles,
  };
}

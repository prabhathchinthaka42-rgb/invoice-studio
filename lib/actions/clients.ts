'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Function to save a new client
export async function saveClient(clientData: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}) {
  const supabase = await createClient()

  // Get the current logged-in user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Unauthorized. Please log in.' }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([
      {
        user_id: user.id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        city: clientData.city,
      }
    ])
    .select()

  if (error) {
    console.error('Error saving client:', error)
    return { error: error.message }
  }

  // Refresh the page data to show the new client
  revalidatePath('/app')
  
  return { success: true, data }
}

// 2. Function to fetch all saved clients for the current user
export async function getClients() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return { error: error.message }
  }

  return { success: true, clients: data }
}
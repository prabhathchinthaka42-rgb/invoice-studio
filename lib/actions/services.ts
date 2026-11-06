'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Function to save a new service
export async function saveService(serviceData: {
  name: string;
  rate: number;
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('services')
    .insert([
      {
        user_id: user.id,
        name: serviceData.name,
        rate: serviceData.rate,
      }
    ])
    .select()

  if (error) {
    console.error('Error saving service:', error)
    return { error: error.message }
  }

  revalidatePath('/app')
  return { success: true, data }
}

// 2. Function to fetch all saved services
export async function getServices() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services:', error)
    return { error: error.message }
  }

  return { success: true, services: data }
}

// 3. Function to delete a service
export async function deleteService(serviceId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: error.message }
  }

  revalidatePath('/app')
  return { success: true }
}
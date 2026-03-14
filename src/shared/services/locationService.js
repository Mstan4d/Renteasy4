import { supabase } from '../lib/supabaseClient';

export const locationService = {
  async getStates(onlyActive = true) {
    let query = supabase.from('states').select('id, name, value').order('name');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getLGAsForState(stateValue, onlyActive = true) {
    // First get state id
    const { data: state, error: stateError } = await supabase
      .from('states')
      .select('id')
      .eq('value', stateValue)
      .single();
    if (stateError || !state) return [];

    let query = supabase
      .from('lgas')
      .select('name')
      .eq('state_id', state.id)
      .order('name');
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) return [];
    return data.map(l => l.name);
  }
};
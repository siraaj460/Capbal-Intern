// Supabase entity helpers - replaces base44.entities.*
import { supabase } from './supabase';

const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ── StudyMaterial ──────────────────────────────────────────
export const StudyMaterial = {
  filter: async (filters = {}, order = '-created_at', limit = 50) => {
    const user = await getUser();
    let q = supabase.from('study_materials').select('*').eq('user_id', user.id);
    if (filters.created_by) {} // handled by user_id
    const col = order.startsWith('-') ? order.slice(1) : order;
    q = q.order(col, { ascending: !order.startsWith('-') }).limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  get: async (id) => {
    const { data, error } = await supabase.from('study_materials').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (payload) => {
    const user = await getUser();
    const { data, error } = await supabase.from('study_materials').insert({ ...payload, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase.from('study_materials').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('study_materials').delete().eq('id', id);
    if (error) throw error;
  },
  uploadFile: async (file) => {
    const user = await getUser();
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('study-files').upload(path, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('study-files').getPublicUrl(path);
    return publicUrl;
  },
};

// ── Quiz ──────────────────────────────────────────────────
export const Quiz = {
  filter: async (filters = {}, order = '-created_at', limit = 50) => {
    const user = await getUser();
    let q = supabase.from('quizzes').select('*').eq('user_id', user.id);
    if (filters.material_id) q = q.eq('material_id', filters.material_id);
    const col = order.startsWith('-') ? order.slice(1) : order;
    q = q.order(col, { ascending: !order.startsWith('-') }).limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  get: async (id) => {
    const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (payload) => {
    const user = await getUser();
    const { data, error } = await supabase.from('quizzes').insert({ ...payload, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase.from('quizzes').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (error) throw error;
  },
};

// ── Flashcard ────────────────────────────────────────────
export const Flashcard = {
  filter: async (filters = {}, order = '-created_at', limit = 500) => {
    const user = await getUser();
    let q = supabase.from('flashcards').select('*').eq('user_id', user.id);
    if (filters.material_id) q = q.eq('material_id', filters.material_id);
    const col = order.startsWith('-') ? order.slice(1) : order;
    q = q.order(col, { ascending: !order.startsWith('-') }).limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  get: async (id) => {
    const { data, error } = await supabase.from('flashcards').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (payload) => {
    const user = await getUser();
    const { data, error } = await supabase.from('flashcards').insert({ ...payload, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },
  bulkCreate: async (items) => {
    const user = await getUser();
    const { data, error } = await supabase.from('flashcards').insert(items.map(i => ({ ...i, user_id: user.id }))).select();
    if (error) throw error;
    return data;
  },
  update: async (id, payload) => {
    const { data, error } = await supabase.from('flashcards').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (error) throw error;
  },
};

// ── QuizAttempt ──────────────────────────────────────────
export const QuizAttempt = {
  filter: async (filters = {}, order = '-created_at', limit = 50) => {
    const user = await getUser();
    let q = supabase.from('quiz_attempts').select('*').eq('user_id', user.id);
    if (filters.quiz_id) q = q.eq('quiz_id', filters.quiz_id);
    const col = order.startsWith('-') ? order.slice(1) : order;
    q = q.order(col, { ascending: !order.startsWith('-') }).limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  create: async (payload) => {
    const user = await getUser();
    const { data, error } = await supabase.from('quiz_attempts').insert({ ...payload, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },
};

// ── StudySession ─────────────────────────────────────────
export const StudySession = {
  filter: async (filters = {}, order = '-created_at', limit = 20) => {
    const user = await getUser();
    let q = supabase.from('study_sessions').select('*').eq('user_id', user.id);
    const col = order.startsWith('-') ? order.slice(1) : order;
    q = q.order(col, { ascending: !order.startsWith('-') }).limit(limit);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  },
  create: async (payload) => {
    const user = await getUser();
    const { data, error } = await supabase.from('study_sessions').insert({ ...payload, user_id: user.id }).select().single();
    if (error) throw error;
    return data;
  },
};

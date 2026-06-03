import { defaultCoverRuntime } from "../data/defaultCoverRuntime.js";
import { hasSupabaseConfig, supabase } from "../lib/supabaseClient.js";

const COVER_RUNTIME_ID = "main";
const LOCAL_STORAGE_KEY = "PERSONAL_COVER_RUNTIME";

function cloneRuntime(runtime) {
  return JSON.parse(JSON.stringify(runtime));
}

function normalizeRuntime(runtime = {}) {
  return {
    ...cloneRuntime(defaultCoverRuntime),
    ...runtime,
  };
}

function getLocalRuntime() {
  const storedRuntime = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedRuntime ? normalizeRuntime(JSON.parse(storedRuntime)) : cloneRuntime(defaultCoverRuntime);
}

function saveLocalRuntime(runtime) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(runtime));
}

export async function getCoverRuntime() {
  if (!hasSupabaseConfig) {
    return getLocalRuntime();
  }

  const { data, error } = await supabase
    .from("cover_runtime")
    .select("data")
    .eq("id", COVER_RUNTIME_ID)
    .maybeSingle();

  if (error) throw error;
  if (data?.data) {
    return normalizeRuntime(data.data);
  }

  return saveCoverRuntime(defaultCoverRuntime);
}

export async function saveCoverRuntime(runtime) {
  const normalizedRuntime = normalizeRuntime(runtime);

  if (!hasSupabaseConfig) {
    saveLocalRuntime(normalizedRuntime);
    return normalizedRuntime;
  }

  const { error } = await supabase.from("cover_runtime").upsert({
    id: COVER_RUNTIME_ID,
    data: normalizedRuntime,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return normalizedRuntime;
}

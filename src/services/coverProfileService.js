import { defaultCoverProfile } from "../data/defaultCoverProfile.js";
import { hasSupabaseConfig, supabase } from "../lib/supabaseClient.js";

const COVER_PROFILE_ID = "main";
const LOCAL_STORAGE_KEY = "PERSONAL_COVER_PROFILE";
const STORAGE_BUCKET = "cover-images";

function cloneProfile(profile) {
  return JSON.parse(JSON.stringify(profile));
}

function normalizeProfile(profile = {}) {
  const merged = {
    ...cloneProfile(defaultCoverProfile),
    ...profile,
    stats: { ...defaultCoverProfile.stats, ...profile.stats },
  };

  return {
    ...merged,
    portraitUrl: merged.portraitUrl || merged.portrait || defaultCoverProfile.portraitUrl,
  };
}

function getLocalProfile() {
  const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedProfile ? normalizeProfile(JSON.parse(storedProfile)) : cloneProfile(defaultCoverProfile);
}

function saveLocalProfile(profile) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function replaceRows(table, rows) {
  const { error: deleteError } = await supabase.from(table).delete().eq("profile_id", COVER_PROFILE_ID);
  if (deleteError) throw deleteError;

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from(table).insert(rows);
    if (insertError) throw insertError;
  }
}

async function syncProfileTables(profile) {
  await replaceRows("cover_socials", profile.socials.map((item, index) => ({ profile_id: COVER_PROFILE_ID, sort_order: index, ...item })));
  await replaceRows("cover_memories", profile.memories.map((item, index) => ({ profile_id: COVER_PROFILE_ID, sort_order: index, ...item })));
  await replaceRows("cover_gallery_items", profile.gallery.map((item, index) => ({
    id: item.id,
    profile_id: COVER_PROFILE_ID,
    sort_order: index,
    title: item.title,
    caption: item.caption,
    image_url: item.imageUrl || "",
  })));
  await replaceRows("cover_tags", profile.tags.map((value, index) => ({ profile_id: COVER_PROFILE_ID, value, sort_order: index })));
  await replaceRows("cover_stickers", profile.stickers.map((value, index) => ({ profile_id: COVER_PROFILE_ID, value, sort_order: index })));
  await replaceRows("cover_moods", profile.moods.map((item, index) => ({
    profile_id: COVER_PROFILE_ID,
    sort_order: index,
    label: item.label,
    icon_key: item.iconKey,
    color: item.color,
    quote: item.quote,
  })));
  await replaceRows("cover_fortunes", profile.fortunes.map((value, index) => ({ profile_id: COVER_PROFILE_ID, value, sort_order: index })));
  await replaceRows("cover_auras", profile.auras.map((value, index) => ({ profile_id: COVER_PROFILE_ID, value, sort_order: index })));
  await replaceRows("cover_charms", profile.charms.map((item, index) => ({
    id: item.id,
    profile_id: COVER_PROFILE_ID,
    sort_order: index,
    label: item.label,
    icon_key: item.iconKey,
  })));
}

export async function getCoverProfile() {
  if (!hasSupabaseConfig) {
    return getLocalProfile();
  }

  const { data, error } = await supabase
    .from("cover_profiles")
    .select("data")
    .eq("id", COVER_PROFILE_ID)
    .maybeSingle();

  if (error) throw error;
  if (data?.data) {
    return normalizeProfile(data.data);
  }

  return saveCoverProfile(defaultCoverProfile);
}

export async function saveCoverProfile(profile) {
  const normalizedProfile = normalizeProfile(profile);

  if (!hasSupabaseConfig) {
    saveLocalProfile(normalizedProfile);
    return normalizedProfile;
  }

  const { error } = await supabase.from("cover_profiles").upsert({
    id: COVER_PROFILE_ID,
    data: normalizedProfile,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  await syncProfileTables(normalizedProfile);
  return normalizedProfile;
}

export async function resetCoverProfile() {
  const profile = cloneProfile(defaultCoverProfile);

  if (!hasSupabaseConfig) {
    saveLocalProfile(profile);
    return profile;
  }

  const { error } = await supabase.from("cover_profiles").upsert({
    id: COVER_PROFILE_ID,
    data: profile,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  await syncProfileTables(profile);
  return profile;
}

export async function uploadCoverImage(file, field) {
  if (!file) throw new Error("No image file selected.");

  if (!hasSupabaseConfig) {
    return toDataUrl(file);
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeField = field.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const path = `${COVER_PROFILE_ID}/${safeField}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });

  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

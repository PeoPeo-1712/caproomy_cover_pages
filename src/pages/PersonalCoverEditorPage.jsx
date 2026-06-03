import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ImageUp, Lock, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { defaultCoverProfile } from "../data/defaultCoverProfile.js";
import { hasSupabaseConfig } from "../lib/supabaseClient.js";
import { getCoverProfile, resetCoverProfile, saveCoverProfile, uploadCoverImage } from "../services/coverProfileService.js";

const basicFields = ["name", "displayName", "username", "role", "location", "headline", "bio", "quote", "status"];
const vibeFields = ["birthday", "zodiac", "luckyNumber", "favoriteColor", "currentMood", "aura", "dreamMeter", "vibeScore", "accent"];
const editPassword = import.meta.env.VITE_COVER_EDIT_PASSWORD;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function Field({ field, value, onChange }) {
  const isLongText = ["headline", "bio", "quote"].includes(field);
  const isNumber = ["dreamMeter", "vibeScore"].includes(field);

  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-200/60">{field}</span>
      {isLongText ? (
        <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} rows={field === "bio" ? 4 : 2} className="editor-input resize-y" />
      ) : (
        <input type={isNumber ? "number" : "text"} min={isNumber ? 0 : undefined} max={isNumber ? 100 : undefined} value={value ?? ""} onChange={(event) => onChange(isNumber ? Number(event.target.value) : event.target.value)} className="editor-input" />
      )}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/55 p-4 shadow-xl shadow-pink-950/20 backdrop-blur-2xl">
      <h2 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-pink-300">{title}</h2>
      {children}
    </section>
  );
}

function ChipEditor({ items, onChange, placeholder }) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value || items.includes(value)) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <button key={item} type="button" onClick={() => onChange(items.filter((value) => value !== item))} className="rounded-full border border-pink-400/25 bg-pink-500/10 px-3 py-1 text-xs text-pink-100 transition hover:bg-pink-500/20">
            {item} <span className="ml-1 text-pink-300">x</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addItem())} placeholder={placeholder} className="editor-input" />
        <button type="button" onClick={addItem} className="editor-button"><Plus className="h-4 w-4" /> Add</button>
      </div>
    </div>
  );
}

function CatalogEditor({ profile, onChange }) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft(JSON.stringify({
      moods: profile.moods,
      fortunes: profile.fortunes,
      auras: profile.auras,
      charms: profile.charms,
    }, null, 2));
  }, [profile.moods, profile.fortunes, profile.auras, profile.charms]);

  function applyCatalog() {
    try {
      const catalog = JSON.parse(draft);
      onChange(catalog);
      toast.success("Catalog updated");
    } catch {
      toast.error("Catalog JSON is invalid");
    }
  }

  return (
    <div>
      <p className="mb-3 text-xs leading-relaxed text-white/45">Advanced JSON editor for mood options, fortunes, auras and Lucide charm icon keys.</p>
      <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={20} className="editor-input resize-y font-mono text-xs" />
      <button type="button" onClick={applyCatalog} className="editor-button mt-3">Apply catalog JSON</button>
    </div>
  );
}

function ImageUploadField({ field, value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    setIsUploading(true);
    try {
      onChange(await uploadCoverImage(file, field));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-200/60">{field}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageUp className="h-6 w-6 text-pink-200/40" />}
        </div>
        <div>
          <span className="editor-button cursor-pointer"><ImageUp className="h-4 w-4" /> {isUploading ? "Uploading..." : "Choose image"}</span>
          <p className="mt-2 max-w-sm truncate text-[10px] text-white/35">{value || "No image selected"}</p>
        </div>
      </div>
      <input type="file" accept="image/*" onChange={upload} disabled={isUploading} className="hidden" />
    </label>
  );
}

function CompactImageUpload({ value, onChange }) {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      onChange(await uploadCoverImage(file, "gallery"));
      toast.success("Gallery image uploaded");
    } catch {
      toast.error("Failed to upload gallery image");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <label className="editor-button cursor-pointer justify-center">
      <ImageUp className="h-4 w-4" /> {isUploading ? "Uploading..." : value ? "Replace image" : "Choose image"}
      <input type="file" accept="image/*" onChange={upload} disabled={isUploading} className="hidden" />
    </label>
  );
}

export default function PersonalCoverEditorPage() {
  const [profile, setProfile] = useState(clone(defaultCoverProfile));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!editPassword);
  const [password, setPassword] = useState("");

  useEffect(() => {
    getCoverProfile()
      .then(setProfile)
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, []);

  function updateField(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function updateListItem(key, index, field, value) {
    setProfile((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  function removeListItem(key, index) {
    setProfile((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));
  }

  function validate() {
    if (!profile.name.trim() || !profile.username.trim()) return "Name and username are required.";
    if (profile.dreamMeter < 0 || profile.dreamMeter > 100) return "Dream meter must be between 0 and 100.";
    if (profile.vibeScore < 0 || profile.vibeScore > 100) return "Vibe score must be between 0 and 100.";
    return "";
  }

  async function save() {
    const validationError = validate();
    if (validationError) return toast.error(validationError);

    setIsSaving(true);
    try {
      setProfile(await saveCoverProfile(profile));
      toast.success("Saved successfully");
    } catch {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function reset() {
    try {
      setProfile(await resetCoverProfile());
      toast.success("Reset successfully");
    } catch {
      toast.error("Failed to reset");
    }
  }

  if (!isUnlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080008] px-4 text-white">
        <form onSubmit={(event) => { event.preventDefault(); password === editPassword ? setIsUnlocked(true) : toast.error("Incorrect password"); }} className="w-full max-w-sm rounded-3xl border border-pink-400/20 bg-black/65 p-6 backdrop-blur-2xl">
          <Lock className="mb-4 h-8 w-8 text-pink-400" />
          <h1 className="text-2xl font-black">Unlock Editor</h1>
          <p className="mt-2 text-sm text-white/50">Enter the demo edit password to continue.</p>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="editor-input mt-5" autoFocus />
          <button className="editor-button mt-3 w-full justify-center">Unlock</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#3b0820,transparent_35%),linear-gradient(135deg,#050007,#180412,#000)] px-4 py-6 text-white">
      <style>{`.editor-input{width:100%;border:1px solid rgba(255,255,255,.12);border-radius:.85rem;background:rgba(255,255,255,.06);padding:.7rem .85rem;color:#fff;outline:none}.editor-input:focus{border-color:rgba(244,114,182,.65);box-shadow:0 0 0 3px rgba(236,72,153,.12)}.editor-button{display:inline-flex;align-items:center;gap:.4rem;border:1px solid rgba(244,114,182,.35);border-radius:.85rem;background:rgba(236,72,153,.16);padding:.7rem .9rem;font-size:.75rem;font-weight:800;color:#fbcfe8;transition:.2s}.editor-button:hover{background:rgba(236,72,153,.28)}`}</style>
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <a href="/personal-cover" className="mb-2 inline-flex items-center gap-1 text-xs text-pink-200/60 hover:text-pink-200"><ArrowLeft className="h-3.5 w-3.5" /> Back to cover</a>
            <h1 className="text-3xl font-black tracking-tight">Personal Cover Editor</h1>
            <p className="mt-1 text-xs text-white/45">{hasSupabaseConfig ? "Supabase connected" : "LocalStorage fallback active"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="editor-button"><RotateCcw className="h-4 w-4" /> Reset</button>
            <a href="/personal-cover" target="_blank" rel="noreferrer" className="editor-button"><ExternalLink className="h-4 w-4" /> Preview</a>
            <button onClick={save} disabled={isSaving} className="editor-button"><Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save"}</button>
          </div>
        </header>

        {isLoading ? <p className="animate-pulse text-pink-200/60">Loading profile...</p> : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <Section title="Basic Info"><div className="grid gap-3 md:grid-cols-2">{basicFields.map((field) => <Field key={field} field={field} value={profile[field]} onChange={(value) => updateField(field, value)} />)}</div></Section>
              <Section title="Vibe Details"><div className="grid gap-3 md:grid-cols-3">{vibeFields.map((field) => <Field key={field} field={field} value={profile[field]} onChange={(value) => updateField(field, value)} />)}</div></Section>
              <Section title="Music">
                <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_minmax(0,0.5fr)]">
                  <Field field="playlist" value={profile.playlist} onChange={(value) => updateField("playlist", value)} />
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-200/60">music link</span>
                    <input
                      type="url"
                      value={profile.playlistUrl ?? ""}
                      onChange={(event) => updateField("playlistUrl", event.target.value)}
                      placeholder="YouTube, Spotify, or SoundCloud link"
                      className="editor-input"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-pink-200/60">duration</span>
                    <input
                      value={profile.playlistDuration ?? ""}
                      onChange={(event) => updateField("playlistDuration", event.target.value)}
                      placeholder="3:14"
                      className="editor-input"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-white/40">Set duration as m:ss so the progress bar can run for the correct track length.</p>
              </Section>
              <Section title="Images"><div className="grid gap-3 md:grid-cols-2">{["portraitUrl", "avatarUrl"].map((field) => <ImageUploadField key={field} field={field} value={profile[field]} onChange={(value) => updateField(field, value)} />)}</div></Section>
              <Section title="Tags"><ChipEditor items={profile.tags} onChange={(tags) => updateField("tags", tags)} placeholder="Add tag" /></Section>
              <Section title="Socials">
                <div className="space-y-3">{profile.socials.map((social, index) => <div key={`${social.label}-${index}`} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_1fr_2fr_auto]">{["label", "value", "href"].map((field) => <input key={field} value={social[field]} onChange={(event) => updateListItem("socials", index, field, event.target.value)} placeholder={field} className="editor-input" />)}<button onClick={() => removeListItem("socials", index)} className="editor-button"><Trash2 className="h-4 w-4" /></button></div>)}</div>
                <button onClick={() => updateField("socials", [...profile.socials, { label: "Instagram", value: "", href: "" }])} className="editor-button mt-3"><Plus className="h-4 w-4" /> Social</button>
              </Section>
              <Section title="Memories">
                <div className="space-y-3">{profile.memories.map((item, index) => <div key={item.id} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_1fr_2fr_auto]">{["date", "title", "caption"].map((field) => <input key={field} value={item[field]} onChange={(event) => updateListItem("memories", index, field, event.target.value)} placeholder={field} className="editor-input" />)}<button onClick={() => removeListItem("memories", index)} className="editor-button"><Trash2 className="h-4 w-4" /></button></div>)}</div>
                <button onClick={() => updateField("memories", [...profile.memories, { id: newId("memory"), date: "", title: "", caption: "" }])} className="editor-button mt-3"><Plus className="h-4 w-4" /> Memory</button>
              </Section>
              <Section title="Gallery">
                <div className="space-y-3">{profile.gallery.map((item, index) => <div key={item.id} className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_1fr_auto_auto]"><input value={item.title} onChange={(event) => updateListItem("gallery", index, "title", event.target.value)} placeholder="title" className="editor-input" /><input value={item.caption} onChange={(event) => updateListItem("gallery", index, "caption", event.target.value)} placeholder="caption" className="editor-input" /><CompactImageUpload value={item.imageUrl} onChange={(value) => updateListItem("gallery", index, "imageUrl", value)} /><button onClick={() => removeListItem("gallery", index)} className="editor-button"><Trash2 className="h-4 w-4" /></button></div>)}</div>
                <button onClick={() => updateField("gallery", [...profile.gallery, { id: newId("gallery"), title: "", caption: "", imageUrl: "" }])} className="editor-button mt-3"><Plus className="h-4 w-4" /> Gallery item</button>
              </Section>
              <Section title="Stickers"><ChipEditor items={profile.stickers} onChange={(stickers) => updateField("stickers", stickers)} placeholder="Add sticker" /></Section>
              <Section title="Mock Catalog"><CatalogEditor profile={profile} onChange={(catalog) => setProfile((current) => ({ ...current, ...catalog }))} /></Section>
            </div>

            <aside className="xl:sticky xl:top-6 xl:self-start">
              <div className="overflow-hidden rounded-[2rem] border border-pink-300/20 bg-black/60 p-5 shadow-2xl shadow-pink-950/40 backdrop-blur-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-pink-400">Live Preview</p>
                <div className="relative mt-4 h-72 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_bottom,#4b1230,transparent_60%),#090109]">
                  <img src={profile.portraitUrl} alt="" className="absolute bottom-0 left-1/2 h-[290px] -translate-x-1/2 object-contain" />
                </div>
                <h2 className="mt-4 text-4xl font-black leading-none text-pink-100" style={{fontFamily: "Playfair Display, serif"}}>{profile.name || "Your Name"}</h2>
                <p className="mt-2 text-xs text-pink-200/65">{profile.username} / {profile.role}</p>
                <p className="mt-3 text-sm italic text-white/55">"{profile.headline}"</p>
                <div className="mt-4 flex flex-wrap gap-1.5">{profile.tags.map((tag) => <span key={tag} className="rounded-full border border-pink-300/20 px-2 py-1 text-[10px] text-pink-100/70">{tag}</span>)}</div>
              </div>
            </aside>
          </div>
        )}

        <div className="sticky bottom-4 mt-5 flex justify-end">
          <button onClick={save} disabled={isSaving} className="editor-button shadow-xl shadow-pink-950/50"><Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save changes"}</button>
        </div>
      </div>
    </main>
  );
}

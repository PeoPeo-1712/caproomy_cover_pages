import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { defaultCoverProfile } from "../data/defaultCoverProfile.js";
import { getCoverProfile } from "../services/coverProfileService.js";
import { getCoverRuntime, saveCoverRuntime } from "../services/coverRuntimeService.js";
import { 
  BadgeCheck, MapPin, Hash, Share2, Sparkles, 
  SmilePlus, Music, Star, Lock, EyeOff, Eye, 
  SkipForward, SkipBack, Play, Pause, Image as ImageIcon, 
  Home, User, Heart, Settings, Camera, RefreshCw, MessageCircle, PlusCircle, ChevronRight, Zap,
  Facebook, Instagram, ExternalLink, Cloud, Moon, Gem, Cake, Check
} from "lucide-react";

const iconMap = { cloud: Cloud, zap: Zap, moon: Moon, star: Star, heart: Heart, gem: Gem };

function getMusicEmbed(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be" || host.endsWith("youtube.com")) {
      const videoId = host === "youtu.be"
        ? parsed.pathname.split("/").filter(Boolean)[0]
        : parsed.searchParams.get("v") || parsed.pathname.split("/").filter(Boolean).pop();

      if (!videoId) return null;
      return {
        platform: "YouTube",
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
        coverUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        canEmbed: true,
        showPlayer: false,
      };
    }

    if (host === "open.spotify.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const [type, id] = parts;
      if (!type || !id) return null;
      return {
        platform: "Spotify",
        embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        coverUrl: "",
        canEmbed: true,
        showPlayer: true,
      };
    }

    if (host.endsWith("soundcloud.com")) {
      return {
        platform: "SoundCloud",
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false`,
        coverUrl: "",
        canEmbed: true,
        showPlayer: true,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function parseDuration(value) {
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : 194;
  if (!value) return 194;

  const parts = String(value).trim().split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 194;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] > 0 ? parts[0] : 194;
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function PortraitFallback() {
  return (
    <div className="relative z-30 flex h-[460px] w-[300px] items-end justify-center lg:h-[680px] lg:max-h-[78vh] lg:w-[420px]">

      {/* back halo layers */}
      <div className="absolute bottom-20 h-[420px] w-[300px] rounded-full bg-pink-500/10 blur-3xl lg:h-[520px] lg:w-[360px]" />
      <div className="absolute bottom-36 h-[320px] w-[260px] rounded-full bg-fuchsia-500/10 blur-2xl lg:h-[420px] lg:w-[320px]" />
      <div className="absolute bottom-0 h-28 w-[300px] rounded-full bg-pink-500/20 blur-3xl lg:h-32 lg:w-[360px]" />

      {/* orbit rings */}
      <div className="absolute top-14 h-48 w-48 rounded-full border border-pink-300/10 shadow-[0_0_80px_rgba(236,72,153,0.18)] lg:top-20 lg:h-64 lg:w-64" />
      <div className="absolute top-20 h-32 w-32 rounded-full border border-white/5 lg:top-28 lg:h-44 lg:w-44" />

      {/* head */}
      <div className="absolute top-10 h-24 w-24 rounded-full border border-pink-200/20 bg-[radial-gradient(circle_at_32%_24%,#ffd1ea_0%,#ff5faf_24%,#d41466_56%,#350015_100%)] shadow-[0_0_70px_rgba(236,72,153,0.5)] lg:top-14 lg:h-36 lg:w-36" />
      {/* head gloss */}
      <div className="absolute top-14 left-1/2 h-7 w-10 -translate-x-8 rounded-full bg-white/25 blur-xl lg:top-20 lg:h-10 lg:w-14 lg:-translate-x-10" />

      {/* neck */}
      <div className="absolute top-[122px] h-10 w-9 rounded-b-2xl bg-gradient-to-b from-rose-800/80 to-black/70 shadow-[0_0_35px_rgba(236,72,153,0.22)] lg:top-[176px] lg:h-14 lg:w-14 lg:rounded-b-[1.5rem]" />

      {/* shoulder glows */}
      <div className="absolute bottom-36 left-2 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl lg:bottom-44 lg:left-6 lg:h-44 lg:w-44" />
      <div className="absolute bottom-36 right-2 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl lg:bottom-44 lg:right-6 lg:h-44 lg:w-44" />

      {/* body */}
      <div className="absolute bottom-8 h-[270px] w-[230px] overflow-hidden rounded-[48%_48%_34%_34%] border border-pink-300/10 bg-[linear-gradient(145deg,rgba(255,95,175,0.18)_0%,rgba(97,13,52,0.38)_38%,rgba(8,0,8,0.96)_78%)] shadow-[0_40px_120px_rgba(236,72,153,0.22)] lg:bottom-10 lg:h-[390px] lg:w-[310px]">
        {/* inner pink side light */}
        <div className="absolute left-0 top-10 h-48 w-16 rounded-full bg-pink-400/[0.18] blur-2xl lg:h-64 lg:w-20" />
        <div className="absolute right-0 top-16 h-40 w-12 rounded-full bg-fuchsia-400/10 blur-2xl lg:top-20 lg:h-56 lg:w-16" />
        {/* soft chest shadow */}
        <div className="absolute inset-x-6 bottom-0 h-32 rounded-t-full bg-black/50 blur-xl lg:inset-x-8 lg:h-44" />
        {/* scanlines */}
        <div className="absolute inset-0 opacity-[0.08]" style={{background: "repeating-linear-gradient(0deg,rgba(255,255,255,0.35) 0px,rgba(255,255,255,0.35) 1px,transparent 1px,transparent 7px)"}} />
        {/* gloss reflection */}
        <div className="absolute left-8 top-10 h-24 w-10 rounded-full bg-white/10 blur-xl lg:left-10 lg:top-12 lg:h-32 lg:w-14" />
      </div>

      {/* front shadow to blend bottom */}
      <div className="absolute bottom-3 h-16 w-[280px] rounded-full bg-black/45 blur-2xl lg:bottom-4 lg:h-24 lg:w-[340px]" />
      <div className="absolute bottom-6 h-14 w-[230px] rounded-full bg-pink-500/[0.12] blur-2xl lg:bottom-8 lg:h-20 lg:w-[280px]" />

      {/* label */}
      <div className="absolute bottom-16 rounded-full border border-pink-300/20 bg-black/50 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.35em] text-pink-100/90 shadow-lg shadow-pink-500/10 backdrop-blur-xl lg:bottom-20 lg:px-5 lg:py-2 lg:text-[10px]">
        Cutout Portrait
      </div>

      {/* sparkle dots */}
      <div className="absolute top-8 left-[28%] h-1 w-1 animate-pulse rounded-full bg-pink-400 shadow-[0_0_6px_#ff5faf]" />
      <div className="absolute top-16 right-[24%] h-0.5 w-0.5 animate-pulse rounded-full bg-fuchsia-400 shadow-[0_0_5px_#c026d3]" style={{animationDelay:"0.6s"}} />
      <div className="absolute top-24 left-[18%] h-1 w-1 animate-pulse rounded-full bg-pink-300 shadow-[0_0_4px_#f9a8d4]" style={{animationDelay:"1.1s"}} />
    </div>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div className={`max-lg:!rotate-0 rounded-[1.35rem] p-3 transition-all duration-300 hover:-translate-y-0.5 lg:rounded-3xl lg:p-4 ${className}`}
      style={{border: "1px solid rgba(255,255,255,0.12)", background: "radial-gradient(circle at center, rgba(0,0,0,0.48) 15%, rgba(0,0,0,0.64) 62%, rgba(0,0,0,0.78) 100%)", backdropFilter: "blur(24px)", boxShadow: "0 20px 40px rgba(244,114,182,0.08)"}}>
      {children}
    </div>
  );
}

function DockButton({ icon: Icon, label, onClick, active, accentColor }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-[1.1rem] transition-all hover:-translate-y-1 lg:h-11 lg:w-11 lg:rounded-2xl"
      style={{
        border: active ? `1px solid ${accentColor}80` : "1px solid rgba(255,255,255,0.08)",
        background: active ? `${accentColor}20` : "rgba(255,255,255,0.06)",
        color: active ? accentColor : "rgba(244,114,182,0.6)",
        backdropFilter: "blur(12px)"
      }}>
      <Icon className="h-4.5 w-4.5" style={{width: 18, height: 18}} />
    </button>
  );
}

export default function PersonalCoverPage() {
  const [profile, setProfile] = useState(defaultCoverProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [portraitError, setPortraitError] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrackTime, setCurrentTrackTime] = useState(0);
  const [accent, setAccent] = useState("pink");
  const [messageOpen, setMessageOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [galleryItem, setGalleryItem] = useState(null);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [vibeScore, setVibeScore] = useState(99);
  const [luckyNumber, setLuckyNumber] = useState("16");
  const [secretRevealed, setSecretRevealed] = useState(false);
  
  const [currentMood, setCurrentMood] = useState(defaultCoverProfile.moods[0]);
  const [fortune, setFortune] = useState(defaultCoverProfile.fortunes[0]);
  const [fortuneFlipped, setFortuneFlipped] = useState(false);
  const [activeStickers, setActiveStickers] = useState([]);
  const [activeCharms, setActiveCharms] = useState([]);
  const [aura, setAura] = useState("Soft Rebel");
  const [isScanningAura, setIsScanningAura] = useState(false);
  const [guestNotes, setGuestNotes] = useState(["your vibe is cute ✦", "pink era unlocked"]);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [selectedStar, setSelectedStar] = useState(null);

  const moodColors = {
    Dreamy: "#ff5faf",
    "Chaos Cute": "#f472b6",
    "Midnight Glow": "#e11d74",
    "Lucky Star": "#ff2f8f",
    "Soft Rebel": "#fb7185",
  };
  const auraColors = {
    "Pink Velvet": "#ff8ac7",
    "Soft Rebel": "#fb7185",
    "Midnight Rose": "#e11d74",
    "Cherry Noir": "#be185d",
    "Dream Glitch": "#f472b6",
  };
  const accentColors = { pink: "#ff2f8f", fuchsia: "#c026d3", rose: "#e11d74" };
  const fallbackAccentColor = accentColors[accent] || accentColors.pink;
  const currentMoodColor = moodColors[currentMood?.label] || currentMood?.color || fallbackAccentColor;
  const auraGlowColor = auraColors[aura] || "#ff5faf";
  const accentColor = currentMoodColor;
  const CurrentMoodIcon = iconMap[currentMood.iconKey] || Sparkles;
  const musicEmbed = getMusicEmbed(profile.playlistUrl);
  const trackDuration = parseDuration(profile.playlistDuration);
  const profileStats = [
    { label: "Era", value: profile.stats.era || "Pink Era" },
    { label: "Focus", value: profile.stats.focus || profile.stats.posts || "Dreams" },
    { label: "Energy", value: profile.stats.energy || profile.stats.followers || "Soft" },
  ];

  function getRuntimeSnapshot(overrides = {}) {
    return {
      isFollowing, liked, likeCount, vibeScore, luckyNumber,
      currentMood: currentMood.label, aura, activeStickers, activeCharms,
      selectedStar, guestNotes, ...overrides,
    };
  }

  function persistRuntime(overrides = {}) {
    saveCoverRuntime(getRuntimeSnapshot(overrides)).catch(() => toast.error("Could not save interaction"));
  }

  useEffect(() => {
    let isCurrent = true;

    getCoverProfile()
      .then((nextProfile) => {
        if (!isCurrent) return;
        setProfile(nextProfile);
        setAccent(nextProfile.accent || "pink");
        setVibeScore(nextProfile.vibeScore ?? 99);
        setLuckyNumber(nextProfile.luckyNumber || "16");
        setAura(nextProfile.aura || "Soft Rebel");
        setCurrentMood(nextProfile.moods.find((mood) => mood.label === nextProfile.currentMood) || nextProfile.moods[0]);
      })
      .catch(() => toast.error("Could not load saved profile"))
      .finally(() => {
        if (isCurrent) setIsLoadingProfile(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    getCoverRuntime()
      .then((runtime) => {
        if (!isCurrent) return;
        setIsFollowing(runtime.isFollowing);
        setLiked(runtime.liked);
        setLikeCount(runtime.likeCount);
        setVibeScore(runtime.vibeScore);
        setLuckyNumber(runtime.luckyNumber);
        setCurrentMood(profile.moods.find((mood) => mood.label === runtime.currentMood) || profile.moods[0]);
        setAura(runtime.aura);
        setActiveStickers(runtime.activeStickers);
        setActiveCharms(runtime.activeCharms);
        setSelectedStar(runtime.selectedStar);
        setGuestNotes(runtime.guestNotes);
      })
      .catch(() => toast.error("Could not load saved interactions"));

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTrackTime((time) => {
          const nextTime = time >= trackDuration ? 0 : time + 1;
          setProgress(Math.min(100, (nextTime / trackDuration) * 100));
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, trackDuration]);

  useEffect(() => {
    setCurrentTrackTime(0);
    setProgress(0);
  }, [profile.playlistUrl, profile.playlistDuration]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/") { e.preventDefault(); setCommandOpen(true); }
      if (e.key === "Escape") {
        setCommandOpen(false); setMessageOpen(false);
        setGalleryItem(null); setNoteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: profile.name, text: profile.headline, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied");
      }
    } catch {}
  };

  const toggleLike = () => {
    const delta = liked ? -1 : 1;
    const nextLiked = !liked;
    const nextLikeCount = Math.max(0, likeCount + delta);

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);
    persistRuntime({ liked: nextLiked, likeCount: nextLikeCount });
  };

  const toggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    persistRuntime({ isFollowing: next });
  };

  const runVibeCheck = () => {
    const score = Math.floor(Math.random() * 21) + 80;
    setVibeScore(score);
    persistRuntime({ vibeScore: score });
    toast.success("Vibe check: " + score + "% glowing.");
  };

  const rollLuckyNumber = () => {
    const num = Math.floor(Math.random() * 99) + 1;
    setLuckyNumber(String(num));
    persistRuntime({ luckyNumber: String(num) });
    toast.success("Lucky number today: " + num);
  };

  const shuffleMood = () => {
    const next = profile.moods[Math.floor(Math.random() * profile.moods.length)];
    setCurrentMood(next);
    persistRuntime({ currentMood: next.label });
    toast.success("Mood: " + next.label);
  };

  const drawFortune = () => {
    setFortuneFlipped(true);
    setTimeout(() => {
      setFortune(profile.fortunes[Math.floor(Math.random() * profile.fortunes.length)]);
      setFortuneFlipped(false);
      toast.success("Fortune drawn");
    }, 300);
  };

  const toggleSticker = (sticker) => {
    const next = activeStickers.includes(sticker) ? activeStickers.filter(s => s !== sticker) : [...activeStickers, sticker];
    setActiveStickers(next);
    persistRuntime({ activeStickers: next });
    toast.success("Sticker updated on your vibe board");
  };

  const toggleCharm = (charm) => {
    setActiveCharms(prev => {
      const next = prev.includes(charm) ? prev.filter(c => c !== charm) : [...prev, charm];
      if (next.length >= 3 && prev.length < 3) toast.success("Charm combo unlocked");
      persistRuntime({ activeCharms: next });
      return next;
    });
  };

  const scanAura = () => {
    setIsScanningAura(true);
    setTimeout(() => {
      const next = profile.auras[Math.floor(Math.random() * profile.auras.length)];
      setAura(next);
      persistRuntime({ aura: next });
      setIsScanningAura(false);
      toast.success("Aura scanned: " + next);
    }, 900);
  };

  const submitTinyNote = () => {
    if (!noteInput.trim()) return;

    const message = noteInput.trim();

    const nextGuestNotes = [message, ...guestNotes].slice(0, 4);
    setGuestNotes(nextGuestNotes);
    persistRuntime({ guestNotes: nextGuestNotes });
    setNoteInput("");
    setNoteModalOpen(false);
    toast.success("Tiny note added");
  };

  const pickStar = (index) => {
    const rewards = ["You found a lucky signal.", "You found a hidden sparkle.", "You unlocked soft confidence."];
    setSelectedStar(index);
    persistRuntime({ selectedStar: index });
    toast.success(rewards[index] || "A tiny star chose you.");
  };

  const cycleMood = () => shuffleMood();
  const toggleMusic = () => setIsPlaying(p => !p);

  const quickActions = [
    { label: "Vibe Check", icon: Sparkles, action: runVibeCheck },
    { label: "Mood", icon: SmilePlus, action: cycleMood },
    { label: "Playlist", icon: Music, action: toggleMusic },
    { label: "Lucky", icon: Star, action: rollLuckyNumber },
    { label: "Secret", icon: Lock, action: () => setSecretRevealed(r => !r) },
  ];

  const commands = [
    { label: "Shuffle Mood", action: () => { shuffleMood(); setCommandOpen(false); } },
    { label: "Draw Fortune", action: () => { drawFortune(); setCommandOpen(false); } },
    { label: "Scan Aura", action: () => { scanAura(); setCommandOpen(false); } },
    { label: "Run Vibe Check", action: () => { runVibeCheck(); setCommandOpen(false); } },
    { label: "Roll Lucky Number", action: () => { rollLuckyNumber(); setCommandOpen(false); } },
    { label: "Toggle Playlist", action: () => { toggleMusic(); setCommandOpen(false); } },
    { label: "Open Memory Wall", action: () => { setGalleryItem(profile.gallery[0]); setCommandOpen(false); } },
    { label: "Leave Tiny Note", action: () => { setNoteModalOpen(true); setCommandOpen(false); } },
    { label: "Share Profile", action: () => { shareProfile(); setCommandOpen(false); } },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden font-sans pb-24 lg:pb-0 relative text-white" style={{background: "radial-gradient(circle at top left, #3b0820, transparent 30%), radial-gradient(circle at bottom right, #1a0030, transparent 40%), linear-gradient(135deg, #050007, #180412, #000)"}}>
      {isLoadingProfile && <div className="fixed inset-x-0 top-0 z-50 h-0.5 animate-pulse bg-pink-500" />}
      <style>{`
        @keyframes enterPanelFromLeft { from { opacity: 0; transform: translate(-72px, -18px); } to { opacity: 1; transform: translate(0, 0); } }
        @keyframes enterPanelFromRight { from { opacity: 0; transform: translate(72px, -18px); } to { opacity: 1; transform: translate(0, 0); } }
        @keyframes enterPanelMobile { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes revealPortrait { from { opacity: 0; transform: translateY(42px) scale(0.94); filter: blur(10px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        @keyframes orbitSpin { from { transform: rotate(0deg) translateX(140px) rotate(0deg); } to { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
        @keyframes scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }
        @keyframes sparklePop { 0% { opacity:0; transform: scale(0) rotate(0deg); } 50% { opacity:1; transform: scale(1.4) rotate(180deg); } 100% { opacity:0; transform: scale(0) rotate(360deg); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(255,47,143,0.3); } 50% { box-shadow: 0 0 50px rgba(255,47,143,0.7); } }
        @keyframes eqBar { 0%,100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
        .panel-stack-left > *, .panel-stack-right > * { animation-duration: 0.78s; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); animation-fill-mode: both; }
        .panel-stack-left > * { animation-name: enterPanelFromLeft; }
        .panel-stack-right > * { animation-name: enterPanelFromRight; }
        .panel-stack-left > :nth-child(1), .panel-stack-right > :nth-child(1) { animation-delay: 0.08s; }
        .panel-stack-left > :nth-child(2), .panel-stack-right > :nth-child(2) { animation-delay: 0.18s; }
        .panel-stack-left > :nth-child(3), .panel-stack-right > :nth-child(3) { animation-delay: 0.28s; }
        .panel-stack-left > :nth-child(4), .panel-stack-right > :nth-child(4) { animation-delay: 0.38s; }
        .panel-stack-left > :nth-child(5), .panel-stack-right > :nth-child(5) { animation-delay: 0.48s; }
        .panel-stack-left > :nth-child(6), .panel-stack-right > :nth-child(6) { animation-delay: 0.58s; }
        .panel-stack-left > :nth-child(7), .panel-stack-right > :nth-child(7) { animation-delay: 0.68s; }
        .panel-stack-right > :nth-child(8) { animation-delay: 0.78s; }
        .animate-reveal-portrait { animation: revealPortrait 1.1s 0.24s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-sparkle-pop { animation: sparklePop 0.8s ease-out forwards; }
        .animate-pulse-glow { animation: pulseGlow 2s ease-in-out infinite; }
        @media (max-width: 1023px) {
          .panel-stack-left > *, .panel-stack-right > * { animation-name: enterPanelMobile; }
        }
      `}</style>

      {/* Desktop Dock */}
      <nav className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 rounded-3xl border border-white/10 bg-black/40 p-2 backdrop-blur-2xl lg:flex">
        <DockButton icon={Home} label="Home" active={true} accentColor={accentColor} onClick={() => {}} />
        <DockButton icon={User} label="Profile" active={false} accentColor={accentColor} onClick={() => {}} />
        <DockButton icon={Heart} label="Likes" active={liked} accentColor={accentColor} onClick={toggleLike} />
        <DockButton icon={Star} label="Favorites" active={false} accentColor={accentColor} onClick={rollLuckyNumber} />
        <DockButton icon={Settings} label="Settings" active={false} accentColor={accentColor} onClick={() => {}} />
        <DockButton icon={Share2} label="Share" active={false} accentColor={accentColor} onClick={shareProfile} />
        <DockButton icon={Camera} label="Camera" active={false} accentColor={accentColor} onClick={() => {}} />
        <DockButton icon={Music} label="Music" active={isPlaying} accentColor={accentColor} onClick={toggleMusic} />
        <DockButton icon={ImageIcon} label="Gallery" active={false} accentColor={accentColor} onClick={() => setGalleryItem(profile.gallery[0])} />
        <DockButton icon={Sparkles} label="Vibe" active={false} accentColor={accentColor} onClick={runVibeCheck} />
      </nav>

      {/* Mobile Dock */}
      <nav className="fixed bottom-3 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-[360px] -translate-x-1/2 justify-between gap-1 rounded-[1.6rem] border border-white/10 bg-black/55 px-2.5 py-2 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:hidden">
        <DockButton icon={Home} label="Home" active={true} accentColor={accentColor} onClick={() => {}} />
        <DockButton icon={Heart} label="Likes" active={liked} accentColor={accentColor} onClick={toggleLike} />
        <DockButton icon={Music} label="Music" active={isPlaying} accentColor={accentColor} onClick={toggleMusic} />
        <DockButton icon={Star} label="Star" active={false} accentColor={accentColor} onClick={rollLuckyNumber} />
        <DockButton icon={Share2} label="Share" active={false} accentColor={accentColor} onClick={shareProfile} />
      </nav>

      <main className="relative mx-auto flex min-h-screen max-w-[1600px] items-start justify-center px-4 py-5 sm:px-5 sm:py-6 lg:px-4 lg:py-8 lg:pl-24">
        
        <section className="relative mx-auto min-h-0 w-full max-w-[1400px] overflow-hidden rounded-[1.75rem] px-4 py-6 sm:px-6 sm:py-7 lg:min-h-[860px] lg:rounded-[3rem] lg:px-10 lg:py-10" style={{border: `1px solid ${accentColor}22`, background: `linear-gradient(135deg, ${accentColor}12, rgba(255,255,255,0.03) 34%, rgba(0,0,0,0.18) 100%)`, backdropFilter: "blur(40px)", boxShadow: `0 25px 70px ${accentColor}20`}}>
          
          {/* Background Layers */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl z-0 pointer-events-none" style={{background: `radial-gradient(circle, ${accentColor}18, transparent 70%)`}} />
          <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full blur-3xl z-0 pointer-events-none" style={{background: `${accentColor}0f`}} />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-3xl z-0 pointer-events-none" style={{background: `${accentColor}14`}} />

          <div className="absolute top-8 left-6 z-0 text-[10rem] lg:text-[14rem] font-black uppercase tracking-tighter pointer-events-none opacity-[0.025]" style={{fontFamily: "Playfair Display, serif"}}>PROFILE</div>
          <div className="absolute top-1/3 right-4 z-0 text-[5rem] font-black uppercase tracking-tighter pointer-events-none text-right opacity-[0.018]" style={{fontFamily: "Playfair Display, serif"}}>MAIN CHARACTER</div>
          <div className="absolute bottom-16 left-1/4 z-0 text-[7rem] font-black uppercase tracking-tighter pointer-events-none opacity-[0.02]" style={{fontFamily: "Playfair Display, serif"}}>Y2K COVER</div>

          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]" style={{backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)"}} />
          <div className="absolute inset-0 z-0 pointer-events-none opacity-5" style={{backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
          
          <div className="absolute right-5 top-1/4 h-1/2 w-px pointer-events-none z-0 hidden lg:block" style={{background: `linear-gradient(to bottom, ${accentColor}, transparent)`}} />

          {/* Y2K FLOATING BADGES */}
          {/* Footer meta strip — VER / ID / Y2K Edition grouped at bottom-center */}
          <div className="absolute bottom-6 left-1/2 z-40 hidden -translate-x-1/2 lg:flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 backdrop-blur-xl">VER 2.4</span>
            <span className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-200/70 backdrop-blur-xl" style={{borderColor: `${accentColor}30`}}>ID 24</span>
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 backdrop-blur-xl">Y2K Edition</span>
          </div>
          <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col gap-2 p-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur pointer-events-auto">
            {Object.keys(accentColors).map(key => (
              <button key={key} onClick={() => setAccent(key)} className="w-4 h-4 rounded-full transition-transform hover:scale-125" style={{background: accentColors[key], border: accent === key ? "2px solid white" : "none", opacity: accent === key ? 1 : 0.5}} aria-label={`Set accent ${key}`} />
            ))}
          </div>
          <div className="absolute top-1/2 left-1 z-40 hidden lg:block -translate-y-1/2 pointer-events-none" style={{writingMode: "vertical-rl", textOrientation: "mixed", transform: "translateY(-50%) rotate(180deg)"}}>
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30" style={{color: "#f9a8d4"}}>◈ DREAM MODE</span>
          </div>

          <div className="relative z-20 grid min-h-0 grid-cols-1 gap-3 lg:min-h-[780px] lg:grid-cols-12 lg:gap-5">

            {/* LEFT COLUMN */}
            <div className="panel-stack-left relative z-20 flex flex-col gap-3 lg:col-span-5 lg:gap-4">
              
              {/* Title Block */}
              <div className="relative">
                <h1
                  className="relative z-20 max-w-[8.5em] px-1 pb-4 pt-2 text-[clamp(3.05rem,16vw,4.65rem)] font-black leading-[1.08] tracking-normal sm:text-[clamp(3.6rem,13vw,5.4rem)] lg:pb-6 lg:pt-3 lg:text-[clamp(3.85rem,7.8vw,6.55rem)] lg:leading-[1.12]"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    backgroundImage: `linear-gradient(90deg, #ffffff 0%, #ffd1ea 42%, ${accentColor} 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: `drop-shadow(0 0 18px ${accentColor}55) drop-shadow(0 0 52px ${accentColor}24)`,
                  }}
                >
                  <span
                    className="text-transparent"
                    style={{WebkitTextFillColor: "transparent"}}
                  >
                    {profile.name}
                  </span>
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-white/70 sm:text-sm lg:mt-3 lg:gap-x-3">
                  <span className="text-pink-300/80">{profile.username}</span>
                  <span style={{color: "rgba(244,114,182,0.5)"}}>•</span>
                  <span className="flex items-center gap-1 text-pink-100/70">
                    <BadgeCheck className="w-3.5 h-3.5" /> {profile.role}
                  </span>
                  <span style={{color: "rgba(244,114,182,0.5)"}}>•</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5" /> {profile.location}
                  </span>
                </div>
                <p className="mt-2 max-w-sm text-sm italic leading-relaxed text-pink-100/60 sm:text-base lg:mt-3" style={{fontFamily: "Playfair Display, serif"}}>
                  "{profile.headline}"
                </p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider" style={{background: `${accentColor}1A`, border: `1px solid ${accentColor}40`}}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {profile.status}
                </div>
              </div>

              {/* CTA Row */}
              <div className="mt-2 grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:flex sm:flex-wrap">
                <button onClick={toggleFollow} className="rounded-full px-4 py-2.5 text-sm font-bold transition-all sm:px-5"
                  style={{background: isFollowing ? "transparent" : accentColor, border: `1px solid ${accentColor}`, color: isFollowing ? accentColor : "#fff"}}>
                  {isFollowing ? <span className="flex items-center gap-1">Following <Check className="h-3.5 w-3.5" /></span> : "Follow"}
                </button>
                <button onClick={() => setMessageOpen(true)} className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-pink-400/40 hover:bg-pink-500/10 sm:px-5" style={{background: "rgba(255,255,255,0.04)"}}>
                  Message
                </button>
                <button onClick={shareProfile} aria-label="Share" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-pink-300/70 transition hover:border-pink-400/40 hover:bg-pink-500/10" style={{background: "rgba(255,255,255,0.04)"}}>
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile portrait */}
              <div className="relative mt-[clamp(2.25rem,10vw,4rem)] rounded-[2rem] border border-pink-200/10 bg-black/35 p-3 shadow-2xl shadow-pink-950/30 sm:p-4 lg:hidden">
                <div
                  className="absolute inset-0 overflow-hidden rounded-[2rem]"
                  style={{background: `radial-gradient(circle at 50% 24%, ${auraGlowColor}30, transparent 48%), linear-gradient(180deg, ${accentColor}12, rgba(0,0,0,0.18) 100%)`}}
                />
                <div className="absolute left-1/2 top-[12%] h-56 w-56 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700" style={{background: `${auraGlowColor}38`}} />
                <div className="absolute inset-0 overflow-hidden rounded-[2rem] opacity-[0.05]" style={{backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px"}} />
                <div
                  className="relative flex items-end justify-center overflow-visible"
                  style={{height: "clamp(230px, 58vw, 330px)"}}
                >
                  {!portraitError ? (
                    <img
                      src={profile.portraitUrl}
                      alt={profile.name}
                      onError={() => setPortraitError(true)}
                      className="relative z-10 w-auto max-w-none object-contain"
                      style={{
                        height: "clamp(340px, 90vw, 470px)",
                        filter: `drop-shadow(0 28px 64px ${auraGlowColor}70)`,
                        transform: "translateY(3%)",
                      }}
                    />
                  ) : (
                    <div className="pointer-events-auto scale-75"><PortraitFallback /></div>
                  )}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] rounded-b-[2rem] bg-gradient-to-t from-[#12000b] via-[#12000b]/70 to-transparent" />
                <div className="pointer-events-none absolute inset-x-7 bottom-4 h-px sm:inset-x-8" style={{background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)`}} />
              </div>

              {/* Fun Actions Row */}
              <div className="flex flex-wrap gap-2 mt-2">
                {quickActions.map(action => (
                  <button key={action.label} onClick={action.action} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors">
                    <action.icon className="w-3.5 h-3.5" style={{color: accentColor}} /> {action.label}
                  </button>
                ))}
              </div>

              {/* Polaroid Memory Wall */}
              <div className="mt-1 flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide lg:mt-2">
                {profile.memories.map((mem, i) => (
                  <div
                    key={mem.id}
                    onClick={() => setGalleryItem({title: mem.title, caption: mem.caption})}
                    className="cursor-pointer flex-shrink-0 snap-start group"
                    style={{
                      width: 110,
                      background: "#0f0010",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "8px 8px 28px 8px",
                      transform: `rotate(${[-1.5, 1, -0.8][i % 3]}deg)`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(255,47,143,0.15)",
                      transition: "box-shadow 0.25s ease, border-color 0.25s ease"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.6), 0 4px 16px rgba(255,47,143,0.3)"; e.currentTarget.style.borderColor = "rgba(255,47,143,0.35)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(255,47,143,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  >
                    <div style={{height: 80, borderRadius: 8, background: `linear-gradient(135deg, ${["#3b0820, #ff2f8f20", "#1a0030, #c026d320", "#0a000a, #e11d7420"][i % 3]})`, marginBottom: 6}} />
                    <p style={{fontSize: 9, fontWeight: 700, color: "#f9a8d4", letterSpacing: "0.1em", textTransform: "uppercase"}}>{mem.date}</p>
                    <p style={{fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 1.3}}>{mem.title}</p>
                  </div>
                ))}
              </div>

              {/* Sticker Board */}
              <div className="mt-1 rounded-2xl p-3 lg:mt-2" style={{border: "1px solid rgba(255,255,255,0.12)", background: "radial-gradient(circle at center, rgba(0,0,0,0.46) 20%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.76) 100%)", backdropFilter: "blur(18px)"}}>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Vibe Board</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.stickers.map(s => {
                    const isActive = activeStickers.includes(s);
                    return (
                      <button key={s} onClick={() => toggleSticker(s)}
                        className="rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all hover:scale-105"
                        style={{
                          border: isActive ? `1px solid rgba(255,47,143,0.6)` : "1px solid rgba(255,255,255,0.1)",
                          background: isActive ? "rgba(255,47,143,0.18)" : "rgba(255,255,255,0.05)",
                          color: isActive ? "#ff5faf" : "rgba(255,255,255,0.55)"
                        }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-2 lg:gap-4">
                {/* Tiny Notes */}
                <div className="rounded-2xl p-3" style={{border: "1px solid rgba(255,255,255,0.12)", background: "radial-gradient(circle at center, rgba(0,0,0,0.46) 20%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.76) 100%)", backdropFilter: "blur(18px)"}}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Tiny Notes</span>
                    <button onClick={() => setNoteModalOpen(true)} className="text-xs hover:underline" style={{color: accentColor}}>+ Add</button>
                  </div>
                  <div className="space-y-1">
                    {guestNotes.slice(0,3).map((note, i) => (
                      <p key={i} className="text-[11px]" style={{color: "rgba(255,255,255,0.5)"}}>{note}</p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 justify-between">
                  {/* Pick a Star */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.5)"}}>Pick a Star</span>
                    {[0,1,2].map(i => (
                      <button key={i} onClick={() => pickStar(i)} aria-label={`Star ${i+1}`}
                        className="transition-all duration-300 hover:scale-125"
                        style={{
                          color: selectedStar === i ? "#ff2f8f" : "rgba(255,255,255,0.2)",
                          filter: selectedStar === i ? "drop-shadow(0 0 8px rgba(255,47,143,0.8))" : "none",
                          fontSize: 20
                        }}>
                        <Star className="h-5 w-5" fill={selectedStar === i ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-1 rounded-2xl p-3 lg:mt-4" style={{border: "1px solid rgba(255,255,255,0.12)", background: "radial-gradient(circle at center, rgba(0,0,0,0.46) 20%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.76) 100%)", backdropFilter: "blur(18px)"}}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Find Me Online</span>
                  <Share2 className="h-3.5 w-3.5" style={{color: accentColor}} />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {profile.socials.map((social) => {
                    const SocialIcon = social.label === "Facebook" ? Facebook : social.label === "Instagram" ? Instagram : Music;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => toast(`Opening ${social.label}`)}
                        className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 transition-all hover:-translate-y-0.5 hover:border-pink-500/40 hover:bg-pink-500/10"
                      >
                        <SocialIcon className="h-4 w-4 shrink-0 text-pink-300/80" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white/80">{social.label}</p>
                          <p className="truncate text-[10px] text-white/40">{social.value}</p>
                        </div>
                        <ExternalLink className="h-3 w-3 shrink-0 text-white/25 transition-colors group-hover:text-pink-300/80" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CENTER PORTRAIT (Desktop absolute) */}
            <div className="pointer-events-none absolute -bottom-[435px] left-1/2 z-[5] hidden -translate-x-[47%] lg:block">
              <div className="relative animate-reveal-portrait">

                {/* sparkle dots — always visible */}
                <div className="absolute animate-pulse" style={{top: 40, left: "68%", width: 5, height: 5, borderRadius: "50%", background: "#ff5faf", boxShadow: "0 0 10px #ff5faf", zIndex: 40}} />
                <div className="absolute animate-pulse" style={{top: 70, right: "16%", width: 4, height: 4, borderRadius: "50%", background: "#c026d3", boxShadow: "0 0 8px #c026d3", animationDelay: "0.5s", zIndex: 40}} />
                <div className="absolute animate-pulse" style={{top: 120, left: "12%", width: 3, height: 3, borderRadius: "50%", background: "#f9a8d4", boxShadow: "0 0 6px #f9a8d4", animationDelay: "1s", zIndex: 40}} />

                {!portraitError ? (
                  <div className="relative">
                    {/* halo stage behind real image */}
                    <div
                      className="absolute bottom-16 left-1/2 h-[520px] w-[420px] -translate-x-1/2 rounded-full blur-3xl transition-all duration-700"
                      style={{background: `${auraGlowColor}${isScanningAura ? "44" : "2e"}`}}
                    />
                    <div
                      className="absolute bottom-12 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700"
                      style={{background: `${auraGlowColor}26`}}
                    />
                    <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full transition-colors duration-700" style={{border: `1px solid ${auraGlowColor}24`, boxShadow: `0 0 70px ${auraGlowColor}18`}} />
                    <div className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full border border-white/5" />
                    <div
                      className="absolute bottom-0 left-1/2 h-24 w-72 -translate-x-1/2 rounded-full blur-2xl transition-colors duration-700"
                      style={{background: `${auraGlowColor}36`}}
                    />
                    {/* image */}
                    <img src={profile.portraitUrl} alt={profile.name} onError={() => setPortraitError(true)}
                      className="relative z-10 h-[1480px] max-h-none w-auto origin-bottom object-contain pointer-events-auto"
                      style={{filter: `drop-shadow(0 50px 100px ${auraGlowColor}66)`, transform: "scale(1.30)"}} />
                  </div>
                ) : (
                  <div className="pointer-events-auto"><PortraitFallback /></div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="panel-stack-right relative z-20 flex flex-col gap-3 lg:col-span-4 lg:col-start-9 lg:gap-4">
              
              {/* Identity Card */}
              <GlassCard className="relative rotate-[0.5deg]">
                {/* Heart badge — attached to top-right of Identity Card */}
                <button
                  onClick={toggleLike}
                  aria-label="Like"
                  className="absolute -right-3 -top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 shadow-lg"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: liked ? accentColor : "rgba(0,0,0,0.6)",
                    color: liked ? "#fff" : "rgba(244,114,182,0.9)",
                    backdropFilter: "blur(12px)",
                    boxShadow: liked ? `0 4px 20px ${accentColor}50` : "0 4px 12px rgba(0,0,0,0.4)"
                  }}>
                  <Heart className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} /> {likeCount}
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative w-16 h-16 rounded-full border-2 overflow-hidden flex-shrink-0" style={{borderColor: `${accentColor}40`, background: `linear-gradient(135deg, ${accentColor}, #000)`}}>
                    <div className="w-full h-full opacity-50" style={{background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)"}} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg">{profile.displayName}</h3>
                      <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{border: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)", color: "rgba(244,114,182,0.7)"}}><Cake className="h-3 w-3" /> {profile.birthday}</span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">{profile.username}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-green-400/80 font-bold uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs italic text-zinc-300 mb-3 border-l-2 pl-2" style={{borderColor: accentColor}}>"{profile.quote}"</p>
                <div className="flex justify-between items-center pt-3 border-t border-white/10 font-mono text-center">
                  {profileStats.map((item) => (
                    <div key={item.label} className="min-w-0 px-1">
                      <div className="truncate text-sm font-bold text-white">{item.value}</div>
                      <div className="text-[9px] text-zinc-500 uppercase">{item.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Mood Machine */}
              <GlassCard className="rotate-[-0.8deg] overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div
                      className="relative mb-3 overflow-hidden rounded-2xl px-3 py-2"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: `linear-gradient(135deg, ${currentMoodColor}2e, rgba(255,255,255,0.08) 46%, ${accentColor}24)`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 14px 30px ${currentMoodColor}1f`,
                      }}
                    >
                      <div
                        className="absolute -right-5 -top-8 h-20 w-20 rounded-full blur-2xl"
                        style={{background: `${currentMoodColor}55`}}
                      />
                      <div className="absolute right-5 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-white/70" />
                      <div className="absolute right-12 bottom-3 h-1 w-1 animate-pulse rounded-full bg-white/50" style={{animationDelay: "0.45s"}} />
                      <p className="relative mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/60">Current Mood</p>
                      <p className="relative flex min-w-0 items-center gap-2 text-xl font-black text-white">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl"
                          style={{background: `${currentMoodColor}28`, color: currentMoodColor, boxShadow: `0 0 22px ${currentMoodColor}55`}}
                        >
                          <CurrentMoodIcon className="h-5 w-5" />
                        </span>
                        <span className="truncate" style={{textShadow: `0 0 18px ${currentMoodColor}66`}}>{currentMood.label}</span>
                      </p>
                    </div>
                    <p className="mt-1 text-xs italic" style={{color: "rgba(255,255,255,0.5)"}}>{currentMood.quote}</p>
                  </div>
                  <button onClick={shuffleMood} aria-label="Shuffle Mood"
                    className="ml-3 rounded-2xl p-2.5 transition-all hover:scale-110"
                    style={{border: `1px solid ${currentMoodColor}55`, background: `${currentMoodColor}18`, boxShadow: `0 0 22px ${currentMoodColor}22`}}>
                    <RefreshCw className="h-4 w-4" style={{color: currentMoodColor}} />
                  </button>
                </div>
              </GlassCard>

              {/* Vibe Check */}
              <GlassCard className="rotate-[0.5deg]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Vibe Match</p>
                  <p className="text-lg font-black" style={{color: accentColor}}>{vibeScore}%</p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/50 border border-white/10 mb-3">
                  <div className="h-full rounded-full transition-all duration-1000" style={{width: `${vibeScore}%`, background: `linear-gradient(90deg, ${accentColor}80, ${accentColor})`}} />
                </div>
                <button onClick={runVibeCheck} className="w-full rounded-xl py-2 text-xs font-bold transition-all hover:bg-white/10" style={{border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)"}}>
                  Check My Vibe
                </button>
              </GlassCard>

              {/* Aura Scanner */}
              <GlassCard className="rotate-[-0.5deg]">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Aura Scanner</p>
                <p
                  className="text-lg font-black transition-colors duration-700"
                  style={{color: auraGlowColor, textShadow: `0 0 18px ${auraGlowColor}66`}}
                >
                  {isScanningAura ? "Scanning..." : aura}
                </p>
                <div
                  className="my-2 h-1 overflow-hidden rounded-full transition-opacity duration-300"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    opacity: isScanningAura ? 1 : 0,
                  }}
                >
                  <div
                    className="h-full rounded-full animate-pulse"
                    style={{width: "60%", background: auraGlowColor, boxShadow: `0 0 14px ${auraGlowColor}`}}
                  />
                </div>
                <button onClick={scanAura} disabled={isScanningAura}
                  className="mt-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all hover:scale-105"
                  style={{background: isScanningAura ? `${auraGlowColor}12` : `${auraGlowColor}22`, border: `1px solid ${auraGlowColor}50`, color: isScanningAura ? "rgba(255,255,255,0.35)" : auraGlowColor, boxShadow: isScanningAura ? `0 0 24px ${auraGlowColor}20` : "none"}}>
                  {isScanningAura ? "Scanning..." : "Scan Aura"}
                </button>
              </GlassCard>

              {/* About Me */}
              <GlassCard>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>About Me</p>
                <p className="text-sm leading-relaxed text-zinc-300 mb-3">{profile.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded border border-white/10 bg-white/5 text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>

              {/* Playlist */}
              <GlassCard>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Now Playing</p>
                {musicEmbed && (
                  <div className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    {isPlaying && musicEmbed.canEmbed && musicEmbed.showPlayer ? (
                      <iframe
                        title={`${musicEmbed.platform} player`}
                        src={musicEmbed.embedUrl}
                        className="h-32 w-full border-0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={toggleMusic}
                          className="group relative flex h-32 w-full items-center justify-center overflow-hidden"
                          style={{
                            background: musicEmbed.coverUrl
                              ? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.72)), url(${musicEmbed.coverUrl}) center/cover`
                              : `radial-gradient(circle at center, ${accentColor}26, rgba(0,0,0,0.78) 70%)`,
                          }}
                        >
                          <span className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/0" />
                          <span className="relative grid h-12 w-12 place-items-center rounded-full text-white shadow-lg transition-transform group-hover:scale-110" style={{background: accentColor}}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                          </span>
                        </button>
                        {isPlaying && musicEmbed.canEmbed && !musicEmbed.showPlayer && (
                          <iframe
                            title={`${musicEmbed.platform} hidden player`}
                            src={musicEmbed.embedUrl}
                            className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
                            allow="autoplay; encrypted-media"
                            tabIndex={-1}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center gap-0.5 overflow-hidden rounded border border-white/10 bg-black/50"
                    style={musicEmbed?.coverUrl && !isPlaying ? {background: `url(${musicEmbed.coverUrl}) center/cover`} : undefined}
                  >
                    {(!musicEmbed?.coverUrl || isPlaying) && [0.3, 0.6, 1, 0.7, 0.4].map((delay, i) => (
                      <div key={i} style={{
                        width: 3, height: 20, borderRadius: 2,
                        background: accentColor,
                        transformOrigin: "bottom",
                        transform: "scaleY(0.3)",
                        animation: isPlaying ? `eqBar ${0.6 + delay * 0.4}s ease-in-out infinite alternate` : "none",
                        animationDelay: i * 0.08 + "s"
                      }} />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">{profile.playlist}</p>
                    <p className="truncate text-xs text-zinc-400">{musicEmbed ? `${musicEmbed.platform} · ${currentMood.label}` : currentMood.label}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="hidden h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 sm:flex"><SkipBack className="w-3.5 h-3.5" /></button>
                    <button onClick={toggleMusic} className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{background: accentColor}}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    {profile.playlistUrl ? (
                      <a href={profile.playlistUrl} target="_blank" rel="noreferrer" aria-label="Open playlist" className="flex h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button className="hidden h-8 w-8 items-center justify-center rounded-full text-white hover:bg-white/10 sm:flex"><SkipForward className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-[9px] font-mono text-zinc-500">{formatDuration(currentTrackTime)}</div>
                  <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-300" style={{width: `${progress}%`, background: accentColor}} />
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500">{formatDuration(trackDuration)}</div>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Charm Collection */}
                <GlassCard>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Charm Collection</p>
                  <div className="flex gap-2">
                    {profile.charms.map((charm) => {
                      const CharmIcon = iconMap[charm.iconKey] || Sparkles;
                      const isActive = activeCharms.includes(charm.label);
                      return (
                        <button key={charm.id} onClick={() => toggleCharm(charm.label)} aria-label={`Charm ${charm.label}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-all hover:scale-110"
                          style={{
                            border: isActive ? `1px solid ${accentColor}80` : "1px solid rgba(255,255,255,0.1)",
                            background: isActive ? `${accentColor}20` : "rgba(255,255,255,0.05)",
                            color: isActive ? accentColor : "rgba(255,255,255,0.3)",
                            boxShadow: isActive ? `0 0 16px ${accentColor}40` : "none"
                          }}>
                          <CharmIcon className="h-5 w-5" fill={isActive && charm.iconKey === "heart" ? "currentColor" : "none"} />
                        </button>
                      );
                    })}
                  </div>
                  {activeCharms.length > 0 && (
                    <p className="mt-2 text-xs" style={{color: "rgba(244,114,182,0.5)"}}>{activeCharms.length} charm{activeCharms.length > 1 ? "s" : ""} collected</p>
                  )}
                </GlassCard>

                {/* Fortune Card */}
                <GlassCard className="rotate-[1deg]">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{color: "rgba(244,114,182,0.6)"}}>Fortune Card</p>
                  <p className="text-xs leading-relaxed transition-all duration-300"
                    style={{color: "rgba(255,255,255,0.8)", filter: fortuneFlipped ? "blur(6px)" : "none", opacity: fortuneFlipped ? 0 : 1}}>
                    "{fortune}"
                  </p>
                  <button onClick={drawFortune}
                    className="mt-3 rounded-full px-3 py-1 text-[10px] font-bold transition-all hover:scale-105 uppercase tracking-wider"
                    style={{background: `${accentColor}18`, border: `1px solid ${accentColor}40`, color: accentColor}}>
                    Draw Fortune
                  </button>
                </GlassCard>
              </div>

              {/* Vibe Passport */}
              <GlassCard>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em]" style={{color: accentColor}}>VIBE PASSPORT</p>
                    <p className="mt-0.5 text-[10px]" style={{color: "rgba(255,255,255,0.3)"}}>ID 24 / Y2K EDITION</p>
                  </div>
                  <span className="rounded px-2 py-0.5 text-[9px] font-bold uppercase" style={{background: accentColor + "30", color: accentColor}}>ACTIVE</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    ["Mood", currentMood.label],
                    ["Aura", aura],
                    ["Lucky #", luckyNumber],
                    ["Charms", activeCharms.length + "/4"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[9px] uppercase tracking-widest" style={{color: "rgba(255,255,255,0.3)"}}>{label}</p>
                      <p className="text-xs font-bold" style={{color: "rgba(244,114,182,0.9)"}}>{value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
              
            </div>

          </div>

        </section>
      </main>

      {/* MODALS */}
      
      {/* Gallery Lightbox */}
      {galleryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setGalleryItem(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="w-full aspect-video rounded-3xl border border-white/10 mb-4 overflow-hidden relative" style={{background: `linear-gradient(135deg, #180412, #3b0820)`}}>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageIcon className="w-16 h-16 mb-4 opacity-20" style={{color: accentColor}} />
                <p className="text-xl font-bold text-white">{galleryItem.title}</p>
                <p className="text-pink-300/60">{galleryItem.caption}</p>
              </div>
            </div>
            <p className="text-center text-xs font-mono text-zinc-500 uppercase tracking-widest">Click anywhere to close</p>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setMessageOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a000a] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">Send a Vibe <Sparkles className="w-5 h-5" style={{color: accentColor}} /></h3>
            <textarea className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-pink-500/50 min-h-[120px]" placeholder="Say something nice..." />
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl py-3 font-bold text-white transition hover:opacity-90" style={{background: accentColor}} onClick={() => { toast.success("Message sent!"); setMessageOpen(false); }}>
                Send
              </button>
              <button className="px-4 py-3 font-semibold text-zinc-400 hover:text-white" onClick={() => setMessageOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tiny Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setNoteModalOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a000a] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">Leave a Tiny Note <Heart className="h-4 w-4 text-pink-300" /></h3>
            <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitTinyNote()} className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-pink-500/50" placeholder="your vibe is..." />
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl py-3 font-bold text-white transition hover:opacity-90" style={{background: accentColor}} onClick={submitTinyNote}>
                Add Note
              </button>
              <button className="px-4 py-3 font-semibold text-zinc-400 hover:text-white" onClick={() => setNoteModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/80 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a000a]/90 backdrop-blur-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <Zap className="w-5 h-5" style={{color: accentColor}} />
              <input type="text" autoFocus placeholder="Type a command or search..." className="w-full bg-transparent border-none text-white outline-none placeholder-zinc-500" />
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {commands.map((cmd, i) => (
                <button key={i} onClick={cmd.action} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-left text-zinc-300 hover:text-white transition-colors">
                  <div className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  {cmd.label}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-white/5 text-center">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Press ESC to close</p>
            </div>
          </div>
        </div>
      )}

      {/* Hint for command palette */}
      <div className="fixed bottom-6 right-6 z-40 hidden lg:block text-[10px] font-mono tracking-widest text-zinc-500 bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur">
        PRESS <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">/</kbd> FOR CMDS
      </div>

    </div>
  );
}

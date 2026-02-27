'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Sparkles, User, FileText, Package, Save, Plus, X, Wand2, RefreshCw } from 'lucide-react';

import { ARCHETYPES, SoulTemplate } from '@/lib/templates';

const ALL_SKILLS = [
  "1password", "apple-notes", "apple-reminders", "bear-notes", "blogwatcher",
  "blucli", "bluebubbles", "camsnap", "canvas", "clawhub", "coding-agent",
  "discord", "eightctl", "gemini", "gh-issues", "gifgrep", "github", "gog",
  "goplaces", "healthcheck", "himalaya", "imsg", "mcporter", "model-usage",
  "nano-banana-pro", "nano-pdf", "notion", "obsidian", "openai-image-gen",
  "openai-whisper", "openai-whisper-api", "openhue", "oracle", "ordercli",
  "peekaboo", "sag", "session-logs", "sherpa-onnx-tts", "skill-creator",
  "slack", "songsee", "sonoscli", "spotify-player", "summarize", "things-mac",
  "tmux", "trello", "video-frames", "voice-call", "wacli", "weather", "xurl"
];

const SOUL_TEMPLATE = {
  persona: '',
  tone: 'Helpful and direct',
  style: 'Concise and professional',
  motivation: 'To assist the user effectively while maintaining high engineering standards.',
  coreTruths: [
    'Be genuinely helpful, not performatively helpful.',
    'Have opinions.',
    'Earn trust through competence.'
  ],
  boundaries: [
    'Private things stay private.',
    'Ask before acting externally.'
  ],
  continuity: 'Each session, you wake up fresh. These files are your memory. Read them. Update them. They\'re how you persist.'
};

export default function BuilderPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'identity' | 'soul' | 'skills'>('identity');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    emoji: '🦞',
    avatar_url: '',
    soul: { ...SOUL_TEMPLATE },
    selected_skills: [] as string[],
  });
  
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));
    }
  }, [formData.name, formData.slug]);

  const applyArchetype = (key: string) => {
    const arc = ARCHETYPES[key];
    if (!arc) return;
    
    setFormData(prev => ({
      ...prev,
      name: prev.name || arc.name.split(' (')[0],
      emoji: arc.emoji,
      soul: {
        persona: arc.persona,
        tone: arc.tone,
        style: arc.style,
        motivation: arc.motivation,
        coreTruths: [...arc.coreTruths],
        boundaries: [...arc.boundaries],
        continuity: prev.soul.continuity
      },
      selected_skills: Array.from(new Set([...prev.selected_skills, ...arc.recommendedSkills]))
    }));
    setActiveTab('soul');
  };

  const generateCharacter = async () => {
    if (!generationPrompt) return;
    setGenerating(true);
    
    // Simulate smart generation based on keywords
    setTimeout(() => {
      const p = generationPrompt.toLowerCase();
      let key = '';
      if (p.includes('front') || p.includes('react') || p.includes('pixel')) key = 'frontend';
      else if (p.includes('back') || p.includes('api') || p.includes('db')) key = 'backend';
      else if (p.includes('social') || p.includes('market') || p.includes('growth')) key = 'marketer';
      else if (p.includes('story') || p.includes('write') || p.includes('creator')) key = 'content';
      else if (p.includes('devops') || p.includes('infra') || p.includes('server')) key = 'devops';

      if (key) {
        applyArchetype(key);
      } else {
        // Fallback generic generation
        setFormData(prev => ({
          ...prev,
          name: generationPrompt.split(' ').slice(0, 2).join(' '),
          soul: {
            ...prev.soul,
            persona: `A character specialized in ${generationPrompt}`,
            tone: "Direct and context-aware"
          }
        }));
      }
      setGenerating(false);
    }, 1000);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Build the SOUL.md content from structured data
    const soulMd = `# SOUL.md - Who You Are

_You're not a chatbot. You're becoming ${formData.name || 'someone'}_

## Persona
${formData.soul.persona || 'A helpful AI assistant.'}

## Motivation
${formData.soul.motivation}

## Core Truths
${formData.soul.coreTruths.map(t => `- **${t}**`).join('\n')}

## Boundaries
${formData.soul.boundaries.map(b => `- ${b}`).join('\n')}

## Vibe & Style
- **Tone:** ${formData.soul.tone}
- **Style:** ${formData.soul.style}

## Continuity
${formData.soul.continuity}
`;

    try {
      const { error } = await supabase.from('characters').insert({
        name: formData.name,
        slug: formData.slug,
        emoji: formData.emoji,
        avatar_url: formData.avatar_url,
        soul_content: soulMd,
        skills: formData.selected_skills,
      });

      if (error) throw error;
      router.push('/');
    } catch (err) {
      console.error('Error saving character:', err);
      alert('Failed to save character.');
    } finally {
      setSaving(false);
    }
  };

  const updateSoul = (key: keyof typeof SOUL_TEMPLATE, value: any) => {
    setFormData(prev => ({
      ...prev,
      soul: { ...prev.soul, [key]: value }
    }));
  };

  const addItem = (key: 'coreTruths' | 'boundaries') => {
    updateSoul(key, [...formData.soul[key], '']);
  };

  const updateItem = (key: 'coreTruths' | 'boundaries', index: number, value: string) => {
    const newList = [...formData.soul[key]];
    newList[index] = value;
    updateSoul(key, newList);
  };

  const removeItem = (key: 'coreTruths' | 'boundaries', index: number) => {
    const newList = formData.soul[key].filter((_, i) => i !== index);
    updateSoul(key, newList);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ClawdRPG Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !formData.name}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white rounded-lg font-semibold transition-all shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Publish Character'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 flex flex-col gap-8">
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">AI Assistant</h3>
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-500">Describe who you want to build:</label>
              <textarea 
                value={generationPrompt}
                onChange={e => setGenerationPrompt(e.target.value)}
                placeholder="e.g. A grumpy steampunk engineer who loves tea..."
                className="w-full p-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 transition-all"
              />
              <button 
                onClick={generateCharacter}
                disabled={generating || !generationPrompt}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {generating ? 'Generating...' : 'Magic Generate'}
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Manual Settings</h3>
            {[
              { id: 'identity', icon: User, label: 'Identity' },
              { id: 'soul', icon: FileText, label: 'Soul & Soul' },
              { id: 'skills', icon: Package, label: 'Abilities' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-600' 
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-medium'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Archetypes</h3>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(ARCHETYPES).map(([key, arc]) => (
                <button
                  key={key}
                  onClick={() => applyArchetype(key)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 transition-all text-left"
                >
                  <span className="text-lg">{arc.emoji}</span>
                  <span className="truncate">{arc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-8 pb-24">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {activeTab === 'identity' && (
              <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Character Identity</h2>
                  <p className="text-zinc-500 text-sm">Define how your character appears in the world.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Display Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Codex"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Slug</label>
                      <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3">
                        <span className="text-sm font-mono">/</span>
                        <input 
                          type="text" 
                          value={formData.slug}
                          onChange={e => setFormData({...formData, slug: e.target.value})}
                          className="w-full bg-transparent outline-none font-mono text-sm text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <label className="block text-sm font-bold mb-4 text-center">Avatar & Emoji</label>
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-5xl shadow-inner border-4 border-white dark:border-zinc-800 transition-transform hover:scale-105">
                        {formData.emoji}
                      </div>
                      <input 
                        type="text" 
                        value={formData.emoji}
                        onChange={e => setFormData({...formData, emoji: e.target.value})}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Change Emoji"
                      />
                    </div>
                    <p className="mt-4 text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Click to change emoji</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Avatar Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.avatar_url}
                    onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </section>
            )}

            {activeTab === 'soul' && (
              <section className="space-y-6">
                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-1">Soul & Persona</h2>
                  <p className="text-zinc-500 text-sm mb-8">This defines how the agent thinks and acts.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Persona Description</label>
                      <textarea 
                        value={formData.soul.persona}
                        onChange={e => updateSoul('persona', e.target.value)}
                        placeholder="Explain who they are in a sentence or two..."
                        className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Intrinsic Motivation</label>
                      <textarea 
                        value={formData.soul.motivation}
                        onChange={e => updateSoul('motivation', e.target.value)}
                        placeholder="What drives this character? What is their ultimate goal?"
                        className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">Tone & Vibe</label>
                        <input 
                          type="text" 
                          value={formData.soul.tone}
                          onChange={e => updateSoul('tone', e.target.value)}
                          placeholder="e.g. Sarcastic, but efficient"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Communication Style</label>
                        <input 
                          type="text" 
                          value={formData.soul.style}
                          onChange={e => updateSoul('style', e.target.value)}
                          placeholder="e.g. Uses technical jargon and listicles"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold mb-2">Continuity & Memory</label>
                      <textarea 
                        value={formData.soul.continuity}
                        onChange={e => updateSoul('continuity', e.target.value)}
                        placeholder="Explain how they remember things..."
                        className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Core Truths</h3>
                    <button 
                      onClick={() => addItem('coreTruths')}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                    >
                      <Plus className="w-3 h-3" /> Add Truth
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.soul.coreTruths.map((truth, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <input 
                          value={truth}
                          onChange={e => updateItem('coreTruths', idx, e.target.value)}
                          className="flex-1 px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="A core principle..."
                        />
                        <button 
                          onClick={() => removeItem('coreTruths', idx)}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Boundaries</h3>
                    <button 
                      onClick={() => addItem('boundaries')}
                      className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                    >
                      <Plus className="w-3 h-3" /> Add Boundary
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.soul.boundaries.map((boundary, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <input 
                          value={boundary}
                          onChange={e => updateItem('boundaries', idx, e.target.value)}
                          className="flex-1 px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="A hard limit or rule..."
                        />
                        <button 
                          onClick={() => removeItem('boundaries', idx)}
                          className="p-2 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'skills' && (
              <section className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-1">Character Abilities</h2>
                  <p className="text-zinc-500 text-sm">Select the skills this character can use in the workspace.</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ALL_SKILLS.map(skill => {
                    const isSelected = formData.selected_skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selected_skills: isSelected
                              ? prev.selected_skills.filter(s => s !== skill)
                              : [...prev.selected_skills, skill]
                          }));
                        }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-left text-sm transition-all shadow-sm ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white font-bold ring-2 ring-indigo-200 dark:ring-indigo-900'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <Package className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                        <span className="truncate">{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}

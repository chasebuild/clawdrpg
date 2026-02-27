'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  User,
  FileText,
  Package,
  Save,
  Plus,
  X,
  Wand2,
  RefreshCw,
  Info,
  Search,
  Cpu,
  Terminal,
  Zap,
  ShieldAlert,
  History,
} from 'lucide-react';

import { ARCHETYPES, SoulTemplate } from '@/lib/templates';
import ALL_SKILLS_DATA from '@/lib/skills.json';
import { SkillInfo } from './SkillInfo';

const SOUL_TEMPLATE = {
  persona: '',
  tone: 'Helpful and direct',
  style: 'Concise and professional',
  motivation: 'To assist the user effectively while maintaining high engineering standards.',
  coreTruths: [
    'Be genuinely helpful, not performatively helpful.',
    'Have opinions.',
    'Earn trust through competence.',
  ],
  boundaries: ['Private things stay private.', 'Ask before acting externally.'],
  continuity:
    "Each session, you wake up fresh. These files are your memory. Read them. Update them. They're how you persist.",
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
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkillForInfo, setSelectedSkillForInfo] = useState<
    (typeof ALL_SKILLS_DATA)[0] | null
  >(null);

  const filteredSkills = ALL_SKILLS_DATA.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
      skill.slug.toLowerCase().includes(skillSearch.toLowerCase()) ||
      skill.description.toLowerCase().includes(skillSearch.toLowerCase())
  ).slice(0, 100);

  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));
    }
  }, [formData.name, formData.slug]);

  const toggleSkill = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      selected_skills: prev.selected_skills.includes(slug)
        ? prev.selected_skills.filter((s) => s !== slug)
        : [...prev.selected_skills, slug],
    }));
  };

  const applyArchetype = (key: string) => {
    const arc = ARCHETYPES[key];
    if (!arc) return;

    setFormData((prev) => ({
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
        continuity: prev.soul.continuity,
      },
      selected_skills: Array.from(new Set([...prev.selected_skills, ...arc.recommendedSkills])),
    }));
    setActiveTab('soul');
  };

  const generateCharacter = async () => {
    if (!generationPrompt) return;
    setGenerating(true);

    setTimeout(() => {
      const p = generationPrompt.toLowerCase();
      let key = '';
      if (p.includes('front') || p.includes('react') || p.includes('pixel')) key = 'frontend';
      else if (p.includes('back') || p.includes('api') || p.includes('db')) key = 'backend';
      else if (p.includes('social') || p.includes('market') || p.includes('growth'))
        key = 'marketer';
      else if (p.includes('story') || p.includes('write') || p.includes('creator')) key = 'content';
      else if (p.includes('devops') || p.includes('infra') || p.includes('server')) key = 'devops';

      if (key) {
        applyArchetype(key);
      } else {
        setFormData((prev) => ({
          ...prev,
          name: generationPrompt.split(' ').slice(0, 2).join(' '),
          soul: {
            ...prev.soul,
            persona: `A character specialized in ${generationPrompt}`,
            tone: 'Direct and context-aware',
          },
        }));
      }
      setGenerating(false);
    }, 1000);
  };

  const handleSave = async () => {
    setSaving(true);

    const soulMd = `# SOUL.md - Who You Are

_You're not a chatbot. You're becoming ${formData.name || 'someone'}_

## Persona
${formData.soul.persona || 'A helpful AI assistant.'}

## Motivation
${formData.soul.motivation}

## Core Truths
${formData.soul.coreTruths.map((t) => `- **${t}**`).join('\n')}

## Boundaries
${formData.soul.boundaries.map((b) => `- ${b}`).join('\n')}

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
      alert('UPLOAD_FAILED: Connection refused by Core.');
    } finally {
      setSaving(false);
    }
  };

  const updateSoul = (key: keyof typeof SOUL_TEMPLATE, value: any) => {
    setFormData((prev) => ({
      ...prev,
      soul: { ...prev.soul, [key]: value },
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
    <div className="flex min-h-screen flex-col bg-black text-foreground font-sans cyber-grid selection:bg-accent selection:text-black">
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-md px-10 py-6 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="bg-accent/10 border border-accent/40 p-2 rounded-sm relative group">
            <Cpu className="w-6 h-6 text-accent animate-pulse" />
            <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic glow-text">
              ClawdRPG_Builder
            </h1>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em]">
              System_Status: Operational // Session_Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-2"
          >
            [ DISCARD ]
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !formData.name}
            className="cyber-button px-8 py-3 rounded-sm text-sm disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_20px_rgba(0,242,255,0.1)]"
          >
            {saving ? 'SYNCING...' : 'INIT_PUBLISH'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 border-r border-white/10 bg-black/40 p-8 flex flex-col gap-10 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-4 h-4 text-accent" />
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                Neural_Generator
              </h3>
            </div>
            <div className="space-y-4">
              <textarea
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="PROMPT_INPUT: describe desired attributes..."
                className="w-full p-4 text-xs rounded-sm border border-white/10 bg-white/5 focus:border-accent/40 outline-none resize-none h-32 transition-all font-mono"
              />
              <button
                onClick={generateCharacter}
                disabled={generating || !generationPrompt}
                className="w-full flex items-center justify-center gap-3 py-3 border border-accent text-accent rounded-sm text-xs font-black uppercase italic hover:bg-accent/10 transition-all shadow-[0_0_15px_rgba(0,242,255,0.05)]"
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {generating ? 'PROCESSING...' : 'RUN_GENERATOR'}
              </button>
            </div>
          </div>

          <nav className="space-y-2">
            <div className="flex items-center gap-2 mb-6">
              <Terminal className="w-4 h-4 text-accent" />
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                Manual_Override
              </h3>
            </div>
            {[
              { id: 'identity', icon: User, label: 'Identity.sys' },
              { id: 'soul', icon: Cpu, label: 'Soul.core' },
              { id: 'skills', icon: Package, label: 'Abilities.mdl' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-sm transition-all border ${
                  activeTab === tab.id
                    ? 'border-accent bg-accent/5 text-accent shadow-[0_0_15px_rgba(0,242,255,0.05)]'
                    : 'border-transparent hover:border-white/20 text-white/40 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-black uppercase italic tracking-widest">
                    {tab.label}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                )}
              </button>
            ))}
          </nav>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <History className="w-4 h-4 text-accent" />
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                Archetypes
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(ARCHETYPES).map(([key, arc]) => (
                <button
                  key={key}
                  onClick={() => applyArchetype(key)}
                  className="flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase italic rounded-sm bg-white/5 border border-white/10 hover:border-accent/40 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg grayscale group-hover:grayscale-0 transition-all">
                      {arc.emoji}
                    </span>
                    <span className="truncate">{arc.name.split(' (')[0]}</span>
                  </span>
                  <Plus className="w-3 h-3 text-white/20 group-hover:text-accent transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-12 relative">
          <div className="max-w-4xl mx-auto space-y-12 pb-24">
            {activeTab === 'identity' && (
              <section className="cyber-panel rounded-sm p-10 space-y-10">
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 glow-text">
                    Character_Identity
                  </h2>
                  <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
                    System Initialization: visual_markers and naming_conventions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                        Display_Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="INPUT_VALUE..."
                        className="w-full px-5 py-4 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none transition-all font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                        Identifier_Slug
                      </label>
                      <div className="flex items-center gap-3 text-white/40 bg-white/5 border border-white/10 rounded-sm px-5 py-4">
                        <span className="text-sm font-mono italic">/sys/root/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full bg-transparent outline-none font-mono text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-sm bg-white/5">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 italic">
                      Avatar_Index
                    </label>
                    <div className="relative group cursor-pointer">
                      <div className="w-32 h-32 bg-accent/5 border border-accent/20 flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(0,242,255,0.1)] group-hover:shadow-[0_0_40px_rgba(0,242,255,0.2)] transition-all">
                        {formData.emoji}
                      </div>
                      <input
                        type="text"
                        value={formData.emoji}
                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title="Change Marker"
                      />
                    </div>
                    <p className="mt-6 text-[9px] uppercase font-black text-white/20 tracking-[0.3em] italic">
                      Click to cycle marker
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                    External_Asset_URI (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://cdn.cloud.sys/assets/..."
                    className="w-full px-5 py-4 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none transition-all font-mono text-sm"
                  />
                </div>
              </section>
            )}

            {activeTab === 'soul' && (
              <section className="space-y-8">
                <div className="cyber-panel rounded-sm p-10">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 glow-text">
                    Soul_Core
                  </h2>
                  <p className="text-white/40 text-xs font-mono tracking-widest uppercase mb-10">
                    Neural Mapping: heuristics, motivations, and operational_vibe.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                        Persona_Matrix
                      </label>
                      <textarea
                        value={formData.soul.persona}
                        onChange={(e) => updateSoul('persona', e.target.value)}
                        placeholder="Define the primary operational behavior..."
                        className="w-full p-5 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none min-h-[120px] transition-all font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                        Intrinsic_Motivation
                      </label>
                      <textarea
                        value={formData.soul.motivation}
                        onChange={(e) => updateSoul('motivation', e.target.value)}
                        placeholder="What drives this consciousness?"
                        className="w-full p-5 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none min-h-[100px] transition-all font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                          Acoustic_Tone
                        </label>
                        <input
                          type="text"
                          value={formData.soul.tone}
                          onChange={(e) => updateSoul('tone', e.target.value)}
                          placeholder="e.g. Sarcastic_V1"
                          className="w-full px-5 py-4 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none transition-all font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                          Diction_Style
                        </label>
                        <input
                          type="text"
                          value={formData.soul.style}
                          onChange={(e) => updateSoul('style', e.target.value)}
                          placeholder="e.g. Technical_Documentation"
                          className="w-full px-5 py-4 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none transition-all font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-3 italic">
                        Persistence_Logic
                      </label>
                      <textarea
                        value={formData.soul.continuity}
                        onChange={(e) => updateSoul('continuity', e.target.value)}
                        placeholder="Define how memory registers persist..."
                        className="w-full p-5 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none min-h-[100px] transition-all font-mono text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="cyber-panel rounded-sm p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xs font-black uppercase italic tracking-widest glow-text">
                        Core_Truths
                      </h3>
                      <button
                        onClick={() => addItem('coreTruths')}
                        className="flex items-center gap-2 text-[9px] font-black uppercase text-accent border border-accent/30 px-3 py-1.5 rounded-sm hover:bg-accent/10 transition-all"
                      >
                        <Plus className="w-3 h-3" /> Add_Principle
                      </button>
                    </div>
                    <div className="space-y-4">
                      {formData.soul.coreTruths.map((truth, idx) => (
                        <div key={idx} className="flex gap-3 group">
                          <input
                            value={truth}
                            onChange={(e) => updateItem('coreTruths', idx, e.target.value)}
                            className="flex-1 px-4 py-3 text-xs rounded-sm border border-white/5 bg-white/5 focus:border-accent/30 outline-none transition-all font-mono"
                            placeholder="Primary Directive..."
                          />
                          <button
                            onClick={() => removeItem('coreTruths', idx)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cyber-panel rounded-sm p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xs font-black uppercase italic tracking-widest glow-text">
                        Heuristic_Boundaries
                      </h3>
                      <button
                        onClick={() => addItem('boundaries')}
                        className="flex items-center gap-2 text-[9px] font-black uppercase text-accent border border-accent/30 px-3 py-1.5 rounded-sm hover:bg-accent/10 transition-all"
                      >
                        <Plus className="w-3 h-3" /> Add_Limit
                      </button>
                    </div>
                    <div className="space-y-4">
                      {formData.soul.boundaries.map((boundary, idx) => (
                        <div key={idx} className="flex gap-3 group">
                          <input
                            value={boundary}
                            onChange={(e) => updateItem('boundaries', idx, e.target.value)}
                            className="flex-1 px-4 py-3 text-xs rounded-sm border border-white/5 bg-white/5 focus:border-accent/30 outline-none transition-all font-mono"
                            placeholder="Hard Constraint..."
                          />
                          <button
                            onClick={() => removeItem('boundaries', idx)}
                            className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'skills' && (
              <section className="space-y-8">
                <div className="cyber-panel rounded-sm p-10">
                  <div className="mb-10">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2 glow-text">
                      Abilities_Registry
                    </h2>
                    <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
                      Injecting external functional modules into Character_Core.
                    </p>
                  </div>

                  <div className="relative mb-8">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="SCANNING_REGISTRY: input keywords..."
                      className="w-full pl-14 pr-6 py-5 rounded-sm border border-white/10 bg-white/5 focus:border-accent/60 outline-none transition-all font-mono text-xs uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {filteredSkills.map((skill) => {
                      const isSelected = formData.selected_skills.includes(skill.slug);
                      return (
                        <div
                          key={skill.slug}
                          className={`group flex items-center justify-between p-5 rounded-sm border transition-all ${
                            isSelected
                              ? 'bg-accent/5 border-accent shadow-[0_0_15px_rgba(0,242,255,0.1)]'
                              : 'bg-white/5 border-white/10 hover:border-white/30'
                          }`}
                        >
                          <button
                            onClick={() => toggleSkill(skill.slug)}
                            className="flex-1 flex flex-col items-start text-left overflow-hidden mr-4"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[8px] font-black text-white/30 uppercase italic tracking-widest">
                                Name:
                              </span>
                              <span
                                className={`font-black text-xs uppercase italic truncate tracking-wider ${isSelected ? 'text-accent glow-text' : 'text-white'}`}
                              >
                                {skill.name}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-[8px] font-black text-white/20 uppercase italic tracking-widest mt-0.5">
                                Desc:
                              </span>
                              <span className="text-[10px] font-medium text-white/40 line-clamp-2 uppercase tracking-tight">
                                {skill.description || skill.slug}
                              </span>
                            </div>
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedSkillForInfo(skill)}
                              className="p-2 border border-white/10 hover:border-accent/40 text-white/20 hover:text-accent transition-all rounded-sm"
                              title="Fetch_Documentation"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleSkill(skill.slug)}
                              className={`p-2 border rounded-sm transition-all ${
                                isSelected
                                  ? 'border-accent text-accent bg-accent/10'
                                  : 'border-white/10 text-white/10 hover:text-white/40 hover:border-white/30'
                              }`}
                            >
                              {isSelected ? (
                                <Zap className="w-4 h-4 animate-pulse" />
                              ) : (
                                <Plus className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredSkills.length === 0 && (
                      <div className="col-span-full py-24 text-center text-white/20 font-mono italic">
                        <ShieldAlert className="w-16 h-16 mx-auto mb-6 opacity-10" />
                        <p className="uppercase tracking-[0.2em] text-xs">
                          No matching abilities detected in registry.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="cyber-panel rounded-sm p-8 border-accent/20">
                  <h3 className="text-xs font-black uppercase italic tracking-widest glow-text mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Injected_Modules ({formData.selected_skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {formData.selected_skills.map((slug) => (
                      <div
                        key={slug}
                        className="px-4 py-2 bg-accent/10 border border-accent/30 rounded-sm text-[10px] font-black uppercase italic text-accent flex items-center gap-3"
                      >
                        {slug}
                        <button
                          onClick={() => toggleSkill(slug)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.selected_skills.length === 0 && (
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest italic">
                        Character currently has no special abilities.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {selectedSkillForInfo && (
        <SkillInfo
          skill={selectedSkillForInfo}
          onClose={() => setSelectedSkillForInfo(null)}
          onSelect={(slug) => {
            toggleSkill(slug);
            setSelectedSkillForInfo(null);
          }}
          isSelected={formData.selected_skills.includes(selectedSkillForInfo.slug)}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, ExternalLink, Loader2, AlertCircle, Cpu, Zap } from 'lucide-react';

interface Skill {
  slug: string;
  name: string;
  url: string;
  rawReadmeUrl: string;
  description: string;
}

interface SkillInfoProps {
  skill: Skill;
  onClose: () => void;
  onSelect: (slug: string) => void;
  isSelected: boolean;
}

export function SkillInfo({ skill, onClose, onSelect, isSelected }: SkillInfoProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReadme() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(skill.rawReadmeUrl);
        if (!response.ok) throw new Error('Failed to fetch README');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError('DATA_TRANSMISSION_ERROR: Documentation link severed.');
      } finally {
        setLoading(false);
      }
    }

    fetchReadme();
  }, [skill.rawReadmeUrl]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="w-full h-full animate-scanline bg-gradient-to-b from-accent/20 via-transparent to-transparent h-20" />
      </div>

      <div className="cyber-panel w-full max-w-5xl h-[85vh] rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border-accent/20">
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-accent opacity-40 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent opacity-40 pointer-events-none" />

        <header className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-black/40 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent/10 flex items-center justify-center border border-accent/30 rounded-sm">
              <Cpu className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">{skill.name}</h2>
              <div className="flex items-center gap-2 text-[10px] font-mono text-accent/60 uppercase tracking-widest">
                <span className="animate-pulse">●</span> System.Skill.Documentation_Loaded
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href={skill.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 border border-white/10 hover:border-accent/50 text-white/40 hover:text-accent transition-all rounded-sm"
              title="View Source"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            
            <button
              onClick={() => onSelect(skill.slug)}
              className={`px-6 py-2 rounded-sm text-xs font-black transition-all border ${
                isSelected 
                  ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'border-accent text-accent hover:bg-accent hover:text-black shadow-[0_0_15px_rgba(0,242,255,0.3)]'
              } uppercase italic tracking-widest`}
            >
              {isSelected ? 'Terminate Module' : 'Inject Module'}
            </button>

            <button 
              onClick={onClose}
              className="p-2 border border-white/10 hover:border-white/40 text-white/40 hover:text-white transition-all rounded-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-black/20">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-6 text-accent/60 font-mono italic uppercase tracking-widest">
                <Loader2 className="w-12 h-12 animate-spin text-accent" />
                <div className="flex flex-col items-center gap-2">
                  <p>Decrypting Repository Data...</p>
                  <div className="w-48 h-1 bg-white/5 overflow-hidden">
                    <div className="h-full bg-accent animate-pulse w-1/2" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 gap-6 text-red-500/80 font-mono italic uppercase tracking-widest">
                <AlertCircle className="w-16 h-16 animate-bounce" />
                <p className="text-center">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-red-500/30 hover:bg-red-500 hover:text-black transition-all"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <article className="prose prose-invert prose-cyber max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
        
        <footer className="px-8 py-3 border-t border-white/10 bg-black/60 flex justify-between items-center font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
          <div>ClawdRPG // Skill.Registry.v2.8.4</div>
          <div className="flex gap-4">
            <span>Lat: 37.7749 | Lon: -122.4194</span>
            <span className="text-accent/40 font-bold italic animate-pulse">Encrypted Session</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

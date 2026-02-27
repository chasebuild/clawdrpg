'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, Plus, Download, Package } from 'lucide-react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  avatar_url: string;
  soul_content: string;
  skills: string[];
}

export default function Home() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCharacters(data || []);
      } catch (err) {
        console.error('Error fetching characters:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacters();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-500" />
          <h1 className="text-xl font-bold">ClawdRPG</h1>
        </div>
        <Link
          href="/builder"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Character
        </Link>
      </header>

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center sm:text-left">
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">
              Discover & Install Characters
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Explore custom personas with unique souls and skill sets for your OpenClaw workspace.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
                />
              ))}
            </div>
          ) : characters.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No characters found</h3>
              <p className="text-zinc-500 mb-6">Be the first to create a character for the RPG!</p>
              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-medium"
              >
                Start Building
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{char.emoji}</div>
                      <div className="flex gap-1">
                        {char.skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold rounded uppercase tracking-wider text-zinc-500"
                          >
                            {skill}
                          </span>
                        ))}
                        {char.skills?.length > 3 && (
                          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] font-bold rounded text-zinc-500">
                            +{char.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{char.name}</h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 mb-4">
                      {char.soul_content.replace(/^#.*\n/g, '').trim()}
                    </p>
                  </div>
                  <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 flex justify-between items-center">
                    <code className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                      /{char.slug}
                    </code>
                    <button
                      onClick={() => {
                        const cmd = `npx clawdrpg install ${char.slug}`;
                        navigator.clipboard.writeText(cmd);
                        alert(`Copied to clipboard: ${cmd}`);
                      }}
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                    >
                      <Download className="w-4 h-4" />
                      Install
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

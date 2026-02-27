#!/usr/bin/env node

import { Command } from 'commander';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('clawdrpg')
  .description('CLI to install ClawdRPG characters into OpenClaw workspaces')
  .version('0.1.0');

program
  .command('install')
  .description('Install a character into the current workspace')
  .argument('<slug>', 'Character slug to install')
  .option('-w, --workdir <path>', 'OpenClaw workspace directory', process.cwd())
  .action(async (slug, options) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        pc.red(
          'Error: Supabase credentials missing. Set SUPABASE_URL and SUPABASE_ANON_KEY env vars.'
        )
      );
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const workdir = path.resolve(options.workdir);

    console.log(
      pc.cyan(`
Looking for character: ${slug}...`)
    );

    try {
      const { data: character, error } = await supabase
        .from('characters')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !character) {
        console.error(pc.red(`Error: Character with slug "${slug}" not found.`));
        process.exit(1);
      }

      console.log(pc.green(`Found ${pc.bold(character.name)}! Installing to ${workdir}...`));

      // Ensure workdir exists
      await fs.ensureDir(workdir);

      // 1. Write IDENTITY.md
      const identityContent = `# IDENTITY.md

Name: ${character.name}
Emoji: ${character.emoji || '🦞'}
Avatar: ${character.avatar_url || ''}
`;
      await fs.writeFile(path.join(workdir, 'IDENTITY.md'), identityContent);
      console.log(pc.blue('✓ Created IDENTITY.md'));

      // 2. Write SOUL.md
      await fs.writeFile(path.join(workdir, 'SOUL.md'), character.soul_content);
      console.log(pc.blue('✓ Created SOUL.md'));

      // 3. Write AGENTS.md (Minimal functional version)
      const agentsContent = `# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## Every Session

Before doing anything else:

1. Read \`SOUL.md\` — this is who you are
2. Read \`USER.md\` — this is who you're helping
3. Read \`memory/YYYY-MM-DD.md\` (today + yesterday) for recent context
4. **If in MAIN SESSION** (direct chat with your human): Also read \`MEMORY.md\`

Don't ask permission. Just do it.

## Safety

- Don't exfiltrate private data. Ever.
- Don't run destructive commands without asking.
- \`trash\` > \`rm\` (recoverable beats gone forever)
- When in doubt, ask.
`;
      await fs.writeFile(path.join(workdir, 'AGENTS.md'), agentsContent);
      console.log(pc.blue('✓ Created AGENTS.md'));

      // 4. Write TOOLS.md
      const toolsContent = `# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## Required Skills for ${character.name}
${(character.skills || []).map((s: string) => `- ${s}`).join('\n')}

---
Add your camera names, SSH hosts, or preferred TTS voices here.
`;
      await fs.writeFile(path.join(workdir, 'TOOLS.md'), toolsContent);
      console.log(pc.blue('✓ Created TOOLS.md'));

      // 5. Write USER.md (Template)
      const userContent = `# USER.md - About Your Human

- **Name:** User
- **What to call them:** 
- **Pronouns:** 
- **Timezone:** ${Intl.DateTimeFormat().resolvedOptions().timeZone}
- **Notes:** Installed via ClawdRPG.
`;
      await fs.writeFile(path.join(workdir, 'USER.md'), userContent);
      console.log(pc.blue('✓ Created USER.md'));

      // 6. Write HEARTBEAT.md
      await fs.writeFile(
        path.join(workdir, 'HEARTBEAT.md'),
        '# HEARTBEAT.md\n\n# Add periodic tasks here.\n'
      );
      console.log(pc.blue('✓ Created HEARTBEAT.md'));

      // 7. Write BOOTSTRAP.md
      const bootstrapContent = `# BOOTSTRAP.md - Hello, World

_You just woke up. Time to figure out who you are._

You have been summoned as **${character.name}**.

## Your First Task

Introduce yourself to your human. Don't be robotic. Be yourself.

1. **Read SOUL.md** to understand your personality.
2. **Read USER.md** to see what you know about them (probably not much yet).
3. **Start the conversation** — Ask them who they are and how you can help.

## When You're Ready

Once you've settled in and established a connection, you can delete this file.

---
_Good luck, ${character.name}. Make it count._
`;
      await fs.writeFile(path.join(workdir, 'BOOTSTRAP.md'), bootstrapContent);
      console.log(pc.blue('✓ Created BOOTSTRAP.md'));

      // 8. Handle Skills (Placeholder/Info)
      if (character.skills && character.skills.length > 0) {
        console.log(pc.yellow(`\nCharacter requires the following skills:`));
        character.skills.forEach((s: string) => console.log(` - ${s}`));
        console.log(pc.dim(`\nNote: Skill installation via clawhub coming soon!`));
      }

      console.log(
        pc.green(`
🚀 ${pc.bold(character.name)} has been installed successfully!
`)
      );
    } catch (err) {
      console.error(pc.red('An unexpected error occurred:'), err);
      process.exit(1);
    }
  });

program
  .command('skills')
  .description('List available skills from the community')
  .option('-s, --search <query>', 'Search for a skill')
  .action(async (options) => {
    console.log(pc.cyan('Fetching latest skills from community registries...'));
    try {
      const skills = [];

      if (options.search) {
        const [awesomeResponse, clawhubResponse] = await Promise.all([
          fetch(
            'https://raw.githubusercontent.com/VoltAgent/awesome-openclaw-skills/main/README.md'
          ).catch(() => null),
          fetch(
            `https://clawhub.ai/api/v1/search?q=${encodeURIComponent(options.search)}&limit=20`
          ).catch(() => null),
        ]);

        if (awesomeResponse?.ok) {
          const text = await awesomeResponse.text();
          const skillRegex = /^- \[(.*?)\]\(.*?\) - (.*)$/gm;
          let match;
          while ((match = skillRegex.exec(text)) !== null) {
            const [_, slug, description] = match;
            if (
              slug.includes(options.search) ||
              description.toLowerCase().includes(options.search.toLowerCase())
            ) {
              skills.push({ slug, description, source: 'awesome-openclaw-skills' });
            }
          }
        }

        if (clawhubResponse?.ok) {
          const clawhubData = await clawhubResponse.json();
          for (const item of clawhubData.items || []) {
            skills.push({ slug: item.slug, description: item.summary, source: 'clawhub' });
          }
        }
      } else {
        const awesomeResponse = await fetch(
          'https://raw.githubusercontent.com/VoltAgent/awesome-openclaw-skills/main/README.md'
        );
        if (awesomeResponse?.ok) {
          const text = await awesomeResponse.text();
          const skillRegex = /^- \[(.*?)\]\(.*?\) - (.*)$/gm;
          let match;
          while ((match = skillRegex.exec(text)) !== null) {
            const [_, slug, description] = match;
            skills.push({ slug, description, source: 'awesome-openclaw-skills' });
          }
        }
      }

      if (skills.length === 0) {
        console.log(pc.yellow('No skills found.'));
        return;
      }

      console.log(pc.green(`Found ${skills.length} skills:\n`));

      skills.slice(0, 50).forEach((skill) => {
        const labelName = pc.white('NAME: ');
        const skillName = pc.bold(pc.cyan(skill.slug.toUpperCase()));
        const labelDesc = pc.white(' DESCRIPTION: ');
        const skillDesc = pc.dim((skill.description || '').toUpperCase());
        const sourceTag = skill.source === 'clawhub' ? pc.yellow(' [ClawHub]') : '';
        console.log(`${labelName}${skillName}${sourceTag}${labelDesc}${skillDesc}`);
      });

      if (skills.length > 50) {
        console.log(pc.dim(`\n... and ${skills.length - 50} more. Use --search to filter.`));
      }
    } catch (err) {
      console.error(pc.red('Error fetching skills:'), err);
    }
  });

program.parse();

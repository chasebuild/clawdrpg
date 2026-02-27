import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_URL =
  'https://raw.githubusercontent.com/VoltAgent/awesome-openclaw-skills/main/README.md';
const CLAWHUB_API_URL =
  'https://clawhub.ai/api/v1/skills?sort=downloads&nonSuspicious=true&limit=50';
const OUTPUT_PATH = path.join(__dirname, '../src/lib/skills.json');

async function fetchAwesomeOpenClawSkills() {
  console.log('Fetching skills from awesome-openclaw-skills...');
  const response = await fetch(README_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }
  const text = await response.text();

  const skillRegex = /^- \[(.*?)\]\((.*?)\) - (.*)$/gm;
  const skills = [];
  let match;

  while ((match = skillRegex.exec(text)) !== null) {
    const [_, slug, url, description] = match;

    let rawReadmeUrl = url;
    if (url.includes('github.com')) {
      rawReadmeUrl = url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace('/tree/', '/')
        .replace('/blob/', '/');
    }

    skills.push({
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
      url,
      rawReadmeUrl,
      description: description.trim(),
      source: 'awesome-openclaw-skills',
    });
  }

  console.log(`Found ${skills.length} skills from awesome-openclaw-skills.`);
  return skills;
}

async function fetchClawHubSkills() {
  console.log('Fetching skills from ClawHub...');
  let allSkills = [];
  let cursor = null;
  let page = 0;

  do {
    let url = CLAWHUB_API_URL;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429) {
        console.log('Rate limited, waiting 2 seconds...');
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw new Error(`Failed to fetch ClawHub skills: ${response.statusText}`);
    }
    const data = await response.json();

    const skills = (data.items || []).map((item) => ({
      slug: item.slug,
      name: item.displayName,
      url: `https://clawhub.ai/skill/${item.slug}`,
      rawReadmeUrl: `https://clawhub.ai/api/v1/skills/${item.slug}/readme`,
      description: item.summary,
      stats: item.stats,
      source: 'clawhub',
    }));

    allSkills = [...allSkills, ...skills];
    cursor = data.nextCursor;
    page++;

    if (cursor) {
      await new Promise((r) => setTimeout(r, 500));
    }
  } while (cursor && page < 10);

  console.log(`Found ${allSkills.length} skills from ClawHub.`);
  return allSkills;
}

async function fetchSkills() {
  const [awesomeSkills, clawhubSkills] = await Promise.all([
    fetchAwesomeOpenClawSkills(),
    fetchClawHubSkills(),
  ]);

  const slugToSkill = new Map();

  for (const skill of awesomeSkills) {
    slugToSkill.set(skill.slug, skill);
  }

  for (const skill of clawhubSkills) {
    if (!slugToSkill.has(skill.slug)) {
      slugToSkill.set(skill.slug, skill);
    }
  }

  const skills = Array.from(slugToSkill.values());
  console.log(`Total unique skills: ${skills.length}`);

  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(skills, null, 2));
  console.log(`Saved ${skills.length} skills to ${OUTPUT_PATH}`);
}

fetchSkills();

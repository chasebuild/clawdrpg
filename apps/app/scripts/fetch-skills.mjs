import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const README_URL = 'https://raw.githubusercontent.com/VoltAgent/awesome-openclaw-skills/main/README.md';
const OUTPUT_PATH = path.join(__dirname, '../src/lib/skills.json');

async function fetchSkills() {
  console.log('Fetching skills from awesome-openclaw-skills...');
  try {
    const response = await fetch(README_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch README: ${response.statusText}`);
    }
    const text = await response.text();
    
    // Regex to match: - [slug](url) - description
    // Example: - [arena](https://github.com/openclaw/skills/tree/main/skills/sscottdev/arena/SKILL.md) - OpenClaw Arena
    const skillRegex = /^- \[(.*?)\]\((.*?)\) - (.*)$/gm;
    const skills = [];
    let match;

    while ((match = skillRegex.exec(text)) !== null) {
      const [_, slug, url, description] = match;
      
      // Convert github tree/blob URL to raw URL for README rendering
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
        description: description.trim()
      });
    }

    console.log(`Found ${skills.length} skills.`);
    
    // Ensure the directory exists
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(skills, null, 2));
    console.log(`Saved ${skills.length} skills to ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('Error fetching skills:', error);
    process.exit(1);
  }
}

fetchSkills();

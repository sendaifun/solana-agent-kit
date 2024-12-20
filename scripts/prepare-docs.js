// scripts/prepare-docs.js
const fs = require('fs');
const path = require('path');

function processFile(sourcePath, targetPath) {
  let content = fs.readFileSync(sourcePath, 'utf8');
  
  const filename = path.basename(sourcePath, path.extname(sourcePath))
    .replace(/_/g, ' '); // Replace underscores with spaces for the title
  
  const frontmatter = `---
title: "${filename}"
description: "Documentation for ${filename}"
---

`;

  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, frontmatter + content);
}

const baseConfig = {
  "$schema": "https://mintlify.com/schema.json",
  "name": "Solana Agent Kit",
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "layout": "sidenav",
  "favicon": "/favicon.svg",
  "sidebar": {
    "items": "border"
  },
  "colors": {
    "primary": "#9945FF",
    "light": "#14F195",
    "dark": "#9945FF"
  },
  "background": {
    "style": "windows"
  },
  "codeBlock": {
    "mode": "auto"
  },
  "feedback": {
    "thumbsRating": true,
    "suggestEdit": true
  }
};

try {
  const TARGET_DIR = 'v0';
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const navigation = [];

  // Add Getting Started section
  navigation.push({
    group: "Getting Started",
    pages: ["v0/introduction", "v0/quickstart"]
  });

  // Function to process TypeDoc generated content
  function processTypeDocContent(sourceDir, targetSubDir, groupName, icon) {
    if (fs.existsSync(sourceDir)) {
      const files = fs.readdirSync(sourceDir)
        .filter(file => file.endsWith('.md'))
        .map(file => file.replace('.md', ''));

      if (files.length > 0) {
        navigation.push({
          group: groupName,
          icon: icon,
          pages: files.map(file => `${TARGET_DIR}/${targetSubDir}/${file}`)
        });

        // Process files
        files.forEach(file => {
          const sourceFile = fs.readdirSync(sourceDir)
            .find(f => f.startsWith(file) && (f.endsWith('.md')));
          const sourcePath = path.join(sourceDir, sourceFile);
          const targetPath = path.join(TARGET_DIR, targetSubDir, `${file}.mdx`);
          processFile(sourcePath, targetPath);
        });
      }
    }
  }

  // Process TypeDoc generated content
  processTypeDocContent('docs/classes', 'classes', 'Classes', 'cube');
  processTypeDocContent('docs/functions', 'functions', 'Functions', 'function');
  processTypeDocContent('docs/interfaces', 'interfaces', 'Interfaces', 'brackets-curly');

  // Process guides
  const guidesSourceDir = 'guides';
  if (fs.existsSync(guidesSourceDir)) {
    const guideFiles = fs.readdirSync(guidesSourceDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    if (guideFiles.length > 0) {
      navigation.push({
        group: "Guides",
        icon: "book-open",
        pages: guideFiles.map(file => `${TARGET_DIR}/guides/${file}`)
      });

      // Process guide files
      guideFiles.forEach(file => {
        const sourcePath = path.join(guidesSourceDir, `${file}.md`);
        const targetPath = path.join(TARGET_DIR, 'guides', `${file}.mdx`);
        processFile(sourcePath, targetPath);
      });
    }
  }

  const mintConfig = {
    ...baseConfig,
    navigation,
    footer: {
      socials: {
        github: "https://github.com/sendaifun/solana-agent-kit"
      }
    }
  };

  fs.writeFileSync('mint.json', JSON.stringify(mintConfig, null, 2));
  console.log('Documentation processing complete!');
  console.log('Navigation structure:', JSON.stringify(navigation, null, 2));

} catch (error) {
  console.error('Error processing documentation:', error);
  process.exit(1);
}
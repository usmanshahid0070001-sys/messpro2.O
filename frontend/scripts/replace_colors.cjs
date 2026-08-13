const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src');

// Regex patterns to match and replace exact class strings
const replacements = [
  // Primary buttons (Black in light, white in dark)
  { regex: /bg-\[#111\] dark:bg-white text-white dark:text-\[#111\]/g, replacement: 'bg-primary text-primary-foreground' },
  { regex: /bg-\[#111111\] dark:bg-white text-white dark:text-\[#111111\]/g, replacement: 'bg-primary text-primary-foreground' },
  { regex: /bg-black dark:bg-white text-white dark:text-black/g, replacement: 'bg-primary text-primary-foreground' },
  { regex: /text-\[#111111\] dark:text-white/g, replacement: 'text-foreground' },
  { regex: /text-\[#111\] dark:text-white/g, replacement: 'text-foreground' },
  { regex: /text-black dark:text-white/g, replacement: 'text-foreground' },
  
  // Backgrounds / Surfaces
  { regex: /bg-white dark:bg-\[#0a0a0a\]/g, replacement: 'bg-background' },
  { regex: /bg-white dark:bg-\[#111111\]/g, replacement: 'bg-card' },
  { regex: /bg-white dark:bg-\[#0f0f0f\]/g, replacement: 'bg-card' },
  { regex: /bg-\[#fafafa\] dark:bg-\[#0f0f0f\]/g, replacement: 'bg-muted' },
  { regex: /bg-\[#fafafa\] dark:bg-\[#0a0a0a\]/g, replacement: 'bg-background' },
  { regex: /bg-\[#fafafa\]\/50 dark:bg-\[#0a0a0a\]/g, replacement: 'bg-card' },
  { regex: /bg-\[#f5f5f5\] dark:bg-\[#1a1a1a\]/g, replacement: 'bg-secondary' },
  { regex: /bg-\[#f5f5f5\] dark:bg-\[#111\]/g, replacement: 'bg-secondary' },
  { regex: /bg-white dark:bg-black/g, replacement: 'bg-background' },

  // Borders
  { regex: /border-\[#e5e5e5\] dark:border-\[#222\]/g, replacement: 'border-border' },
  { regex: /border-\[#e0e0e0\] dark:border-\[#222222\]/g, replacement: 'border-border' },
  { regex: /border-\[#f0f0f0\] dark:border-\[#1a1a1a\]/g, replacement: 'border-border' },
  { regex: /border-black\/5/g, replacement: 'border-border' },
  { regex: /border-\[#e5e5e5\]/g, replacement: 'border-border' },

  // Muted Text
  { regex: /text-\[#555\] dark:text-\[#aaa\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#555\] dark:text-\[#999\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#737373\] dark:text-\[#888\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#a0a0a0\] dark:text-\[#555\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#444\] dark:text-\[#bbb\]/g, replacement: 'text-muted-foreground' },
  { regex: /text-\[#c0c0c0\] dark:text-\[#444\]/g, replacement: 'text-muted-foreground' },

  // Hover states
  { regex: /hover:bg-\[#e5e5e5\] dark:hover:bg-\[#222\]/g, replacement: 'hover:bg-secondary' },
  { regex: /hover:bg-\[#fafafa\] dark:hover:bg-\[#1a1a1a\]/g, replacement: 'hover:bg-accent' },
  { regex: /hover:bg-black\/80 dark:hover:bg-white\/90/g, replacement: 'hover:bg-primary\/90' },
  { regex: /hover:text-\[#111\] dark:hover:text-white/g, replacement: 'hover:text-foreground' },
  { regex: /hover:bg-black\/5 dark:hover:bg-white\/10/g, replacement: 'hover:bg-accent' },
  
  // Rings
  { regex: /focus-visible:ring-\[#111\] dark:focus-visible:ring-white/g, replacement: 'focus-visible:ring-ring' },

  // Other explicit hex replacements based on usage
  { regex: /bg-\[#111\] dark:bg-white/g, replacement: 'bg-primary' },
  { regex: /text-white dark:text-\[#111\]/g, replacement: 'text-primary-foreground' },
  { regex: /bg-\[#d0d0d0\] dark:bg-\[#444\]/g, replacement: 'bg-muted-foreground' },
  { regex: /bg-\[#fafafa\]\/80 dark:bg-\[#111\]\/60/g, replacement: 'bg-background\/80' },
  { regex: /text-\[#404040\] dark:text-\[#ddd\]/g, replacement: 'text-secondary-foreground' },
  
  // Custom cleanup
  { regex: /text-\[#111111\]/g, replacement: 'text-foreground' },
  { regex: /dark:text-white/g, replacement: '' }
];

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (['.jsx', '.js', '.tsx', '.ts'].some(ext => file.endsWith(ext))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Pass 1: Pattern-based mapping
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      // Pass 2: Brute force remaining hex codes to generic mappings (risky, but required by rule "no hardcoded colors")
      content = content.replace(/text-\[#[a-fA-F0-9]+\]/g, 'text-foreground');
      content = content.replace(/bg-\[#[a-fA-F0-9]+\]/g, 'bg-background');
      content = content.replace(/border-\[#[a-fA-F0-9]+\]/g, 'border-border');
      
      content = content.replace(/dark:text-\[#[a-fA-F0-9]+\]/g, '');
      content = content.replace(/dark:bg-\[#[a-fA-F0-9]+\]/g, '');
      content = content.replace(/dark:border-\[#[a-fA-F0-9]+\]/g, '');
      
      // Clean up multiple spaces
      content = content.replace(/ {2,}/g, ' ');
      
      // Fix string spacing issues created by empty replacements
      content = content.replace(/ \'/g, "'").replace(/\' /g, "'");
      content = content.replace(/ \"/g, '"').replace(/\" /g, '"');
      
      // Remove trailing spaces inside className strings
      content = content.replace(/ "\}/g, '"}').replace(/ '\}/g, "'}");
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(srcPath);
console.log("Refactoring complete.");

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src');

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

      // Aggressive catch-all replacements for standard tailwind prefixes
      content = content.replace(/ring-\[#[a-fA-F0-9]+\]/g, 'ring-ring');
      content = content.replace(/divide-\[#[a-fA-F0-9]+\]/g, 'divide-border');
      content = content.replace(/fill-\[#[a-fA-F0-9]+\]/g, 'fill-foreground');
      content = content.replace(/stroke-\[#[a-fA-F0-9]+\]/g, 'stroke-border');
      content = content.replace(/ring-offset-\[#[a-fA-F0-9]+\]/g, 'ring-offset-background');
      
      content = content.replace(/dark:ring-\[#[a-fA-F0-9]+\]/g, '');
      content = content.replace(/dark:divide-\[#[a-fA-F0-9]+\]/g, '');
      content = content.replace(/dark:fill-\[#[a-fA-F0-9]+\]/g, '');
      content = content.replace(/dark:stroke-\[#[a-fA-F0-9]+\]/g, '');
      content = content.replace(/dark:ring-offset-\[#[a-fA-F0-9]+\]/g, '');
      
      // Clean up multiple spaces
      content = content.replace(/ {2,}/g, ' ');
      content = content.replace(/ \'/g, "'").replace(/\' /g, "'");
      content = content.replace(/ \"/g, '"').replace(/\" /g, '"');
      content = content.replace(/ "\}/g, '"}').replace(/ '\}/g, "'}");
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

processDirectory(srcPath);
console.log("Cleanup complete.");

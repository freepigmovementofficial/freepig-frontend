const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');

const pagesToUpdate = {
  'home/home.jsx': 'Home | FreePigMovement',
  'store/Store.jsx': 'Store | FreePigMovement',
  'about/About.jsx': 'About Us | FreePigMovement',
  'riders/Riders.jsx': 'Riders | FreePigMovement',
  'customer/Customer.jsx': 'Customers | FreePigMovement',
  'custom/Custom.jsx': 'Custom Board | FreePigMovement',
  'location/Location.jsx': 'Location | FreePigMovement',
  'volume/Volume.jsx': 'Volume Calculator | FreePigMovement',
  'login/Login.jsx': 'Login | FreePigMovement',
  'gallery/Gallery.jsx': 'Gallery | FreePigMovement'
};

for (const [relPath, title] of Object.entries(pagesToUpdate)) {
  const filePath = path.join(pagesDir, relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  
  // If already added, skip
  if (content.includes('useDocumentTitle')) continue;

  // Add import at the top
  const importStatement = `import useDocumentTitle from '../../hooks/useDocumentTitle';\n`;
  content = importStatement + content;

  // Find the component function declaration
  const componentMatch = content.match(/export\s+default\s+function\s+\w+\([^)]*\)\s*\{/);
  if (componentMatch) {
    const insertPos = componentMatch.index + componentMatch[0].length;
    const hookCall = `\n  useDocumentTitle('${title}');`;
    content = content.slice(0, insertPos) + hookCall + content.slice(insertPos);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added title hook to ${relPath}`);
  }
}

const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, '../src'), function(filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace .png, .jpg, .jpeg with .webp in import statements
    content = content.replace(/from\s+['"](.+?)\.(png|jpg|jpeg)['"]/gi, "from '$1.webp'");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});

const fs = require('fs');

const files = [
  'src/pages/about/About.jsx',
  'src/pages/location/Location.jsx',
  'src/pages/customer/Customer.jsx',
  'src/pages/volume/Volume.jsx',
  'src/pages/riders/Riders.jsx'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Change overflow-hidden to overflow-visible in the header banner div
  content = content.replace(
    /className="relative w-full flex items-center justify-center bg-cover bg-\[center_15%\] overflow-hidden"/g,
    'className="relative w-full flex items-center justify-center bg-cover bg-[center_15%] overflow-visible"'
  );
  // Change translate-y-[63%] to translate-y-[45%]
  content = content.replace(/translate-y-\[63%\]/g, 'translate-y-[45%]');
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

// Product Detail has a slightly different banner for video
const prodFile = 'src/pages/product/ProductDetail.jsx';
let prodContent = fs.readFileSync(prodFile, 'utf8');
prodContent = prodContent.replace(
  /className="relative w-full overflow-hidden bg-black"/g,
  'className="relative w-full overflow-visible bg-black"'
);
prodContent = prodContent.replace(
  /className="relative w-full bg-cover bg-\[center_15%\] overflow-hidden"/g,
  'className="relative w-full bg-cover bg-[center_15%] overflow-visible"'
);
prodContent = prodContent.replace(/translate-y-\[63%\]/g, 'translate-y-[45%]');
fs.writeFileSync(prodFile, prodContent);
console.log('Fixed ' + prodFile);

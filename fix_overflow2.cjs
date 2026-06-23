const fs = require('fs');

const files = [
  'src/pages/about/About.jsx',
  'src/pages/location/Location.jsx',
  'src/pages/customer/Customer.jsx',
  'src/pages/volume/Volume.jsx',
  'src/pages/riders/Riders.jsx',
  'src/pages/home/home.jsx'
];

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /className="relative w-full flex items-center justify-center bg-cover bg-\[center_15%\] overflow-visible"/g,
    'className="relative w-full flex items-center justify-center bg-cover bg-[center_15%] overflow-hidden"'
  );
  content = content.replace(
    /className="absolute bottom-\[-1px\] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal translate-y-\[45%\]"/g,
    'className="absolute bottom-[-1px] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal"'
  );
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

// Product Detail has a slightly different banner for video
const prodFile = 'src/pages/product/ProductDetail.jsx';
let prodContent = fs.readFileSync(prodFile, 'utf8');
prodContent = prodContent.replace(
  /className="relative w-full overflow-visible bg-black"/g,
  'className="relative w-full overflow-hidden bg-black"'
);
prodContent = prodContent.replace(
  /className="relative w-full bg-cover bg-\[center_15%\] overflow-visible"/g,
  'className="relative w-full bg-cover bg-[center_15%] overflow-hidden"'
);
prodContent = prodContent.replace(
  /className="absolute bottom-\[-1px\] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal translate-y-\[45%\]"/g,
  'className="absolute bottom-[-1px] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal"'
);
fs.writeFileSync(prodFile, prodContent);
console.log('Fixed ' + prodFile);

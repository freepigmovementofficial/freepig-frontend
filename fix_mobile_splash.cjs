const fs = require('fs');

const files = [
  'src/pages/about/About.jsx',
  'src/pages/location/Location.jsx',
  'src/pages/customer/Customer.jsx',
  'src/pages/volume/Volume.jsx',
  'src/pages/riders/Riders.jsx'
];

const newClasses = 'className="absolute bottom-[-1px] left-0 w-full h-[120px] sm:h-[180px] md:h-[250px] lg:h-auto object-cover object-bottom pointer-events-none z-10 mix-blend-normal"';

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /className="absolute bottom-\[-1px\] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal"/g,
    newClasses
  );
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}

// Product Detail
const prodFile = 'src/pages/product/ProductDetail.jsx';
let prodContent = fs.readFileSync(prodFile, 'utf8');
prodContent = prodContent.replace(
  /className="absolute bottom-\[-1px\] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal"/g,
  newClasses
);
fs.writeFileSync(prodFile, prodContent);
console.log('Fixed ' + prodFile);

// Home
const homeFile = 'src/pages/home/home.jsx';
let homeContent = fs.readFileSync(homeFile, 'utf8');
homeContent = homeContent.replace(
  /className="absolute bottom-\[-250px\] left-0 w-full object-cover pointer-events-none z-10 mix-blend-normal"/g,
  newClasses
);
homeContent = homeContent.replace(
  /className="absolute top-0 left-0 w-full z-0"/g,
  'className="absolute top-0 left-0 w-full z-0 overflow-hidden"'
);
fs.writeFileSync(homeFile, homeContent);
console.log('Fixed ' + homeFile);

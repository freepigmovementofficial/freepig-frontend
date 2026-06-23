const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/about/About.jsx',
  'src/pages/location/Location.jsx',
  'src/pages/customer/Customer.jsx',
  'src/pages/store/Store.jsx',
  'src/pages/volume/Volume.jsx',
  'src/pages/riders/Riders.jsx'
];

const replacementOther = `        <div
          className="absolute inset-0 bg-cover bg-[center_15%] pointer-events-none z-20"
          style={{ backgroundImage: \`url(\${headerTransparanImg})\` }}
        ></div>

        {/* Gradient tambahan untuk fade-out banner ke warna hitam #000000 agar menyatu tanpa garis pembatas */}
        <div
          className="absolute bottom-0 left-0 w-full h-32 md:h-56 pointer-events-none z-[5]"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)",
          }}
        ></div>

        <img
          src={bercakPembatas}`;

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /        <div\n          className="absolute inset-0 bg-cover bg-\[center_15%\] pointer-events-none z-20"\n          style=\{\{ backgroundImage: `url\(\$\{headerTransparanImg\}\)` \}\}\n        ><\/div>\n        <img\n          src=\{bercakPembatas\}/g,
    replacementOther
  );
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}

// Product Detail
const prodFile = 'src/pages/product/ProductDetail.jsx';
let prodContent = fs.readFileSync(prodFile, 'utf8');
const replacementProd = `          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(150% 100% at 50% 0%, rgba(0, 0, 0, 0) 44%, rgba(0, 0, 0, 0.25) 68%, rgba(0, 0, 0, 1) 100%)",
            }}
          ></div>

          {/* Gradient tambahan untuk fade-out banner ke warna hitam #000000 agar menyatu tanpa garis pembatas */}
          <div
            className="absolute bottom-0 left-0 w-full h-32 md:h-56 pointer-events-none z-[5]"
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)",
            }}
          ></div>

          <img
            src={bercakPembatas}`;

prodContent = prodContent.replace(
  /          <div\n            className="absolute inset-0 pointer-events-none"\n            style=\{\{\n              background:\n                "radial-gradient\(150% 100% at 50% 0%, rgba\(0, 0, 0, 0\) 44%, rgba\(0, 0, 0, 0.25\) 68%, rgba\(0, 0, 0, 1\) 100%\)",\n            \}\}\n          ><\/div>\n          <img\n            src=\{bercakPembatas\}/g,
  replacementProd
);
fs.writeFileSync(prodFile, prodContent);
console.log('Updated ' + prodFile);

import * as fa from 'react-icons/fa';
import * as fa6 from 'react-icons/fa6';
import * as tb from 'react-icons/tb';
import * as gi from 'react-icons/gi';

console.log("FA Icons:");
Object.keys(fa).filter(k => k.toLowerCase().includes('pig')).forEach(k => {
  console.log(k);
});

console.log("FA6 Icons:");
Object.keys(fa6).filter(k => k.toLowerCase().includes('pig')).forEach(k => {
  console.log(k);
});

console.log("TB Icons:");
Object.keys(tb).filter(k => k.toLowerCase().includes('pig')).forEach(k => {
  console.log(k);
});

console.log("GI Icons:");
Object.keys(gi).filter(k => k.toLowerCase().includes('pig')).forEach(k => {
  console.log(k);
});

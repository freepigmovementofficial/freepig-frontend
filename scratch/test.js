const testStr = "a9.05 9.05 0 1 0-9.05 9.05 9.05 9.05 0 0 0 9.05-9.05";
const args = (testStr.match(/[-+]?[0-9]*\.?[0-9]+/g) || []).map(Number);
console.log("Length of args:", args.length);
console.log("Args:", args);

let x = 415.155, y = 243.065;
const newArgs = [];
const isRelative = true;

for (let j = 0; j < args.length; j += 7) {
  const rx = args[j];
  const ry = args[j + 1];
  const xAxisRotation = args[j + 2];
  const largeArcFlag = args[j + 3];
  const sweepFlag = args[j + 4];
  if (isRelative) {
    x += args[j + 5];
    y += args[j + 6];
  } else {
    x = args[j + 5];
    y = args[j + 6];
  }
  newArgs.push(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y);
}

console.log("New Args:", newArgs);

import * as gi from 'react-icons/gi';

const giPigElement = gi.GiPig({});
const realPath = giPigElement.props.children[0].props.d;

console.log("Real path in react-icons:", realPath);

function parseSvgPath(pathStr) {
  const commands = [];
  const regex = /([a-df-z])([^a-df-z]*)/gi;
  let match;
  while ((match = regex.exec(pathStr)) !== null) {
    const type = match[1];
    const argsStr = match[2].trim();
    const args = (argsStr.match(/[-+]?[0-9]*\.?[0-9]+/g) || []).map(Number);
    commands.push({ type, args });
  }
  return commands;
}

const parsed = parseSvgPath(realPath);
console.log("Last parsed command:", parsed[parsed.length - 1]);
console.log("Second to last:", parsed[parsed.length - 2]);

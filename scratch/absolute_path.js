import * as gi from 'react-icons/gi';
import fs from 'fs';

const giPigElement = gi.GiPig({});
const giPigPath = giPigElement.props.children[0].props.d;

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

function toAbsolute(commands) {
  let x = 0, y = 0;
  let mx = 0, my = 0;
  const absCommands = [];

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    const type = cmd.type;
    const args = [...cmd.args];
    const upperType = type.toUpperCase();
    const isRelative = type !== upperType;

    let newType = upperType;
    let newArgs = [];

    switch (upperType) {
      case 'M':
        for (let j = 0; j < args.length; j += 2) {
          if (isRelative) {
            x += args[j];
            y += args[j + 1];
          } else {
            x = args[j];
            y = args[j + 1];
          }
          if (j === 0) {
            mx = x;
            my = y;
            newArgs.push(x, y);
          } else {
            newType = 'L';
            newArgs.push(x, y);
          }
        }
        break;
      case 'L':
        for (let j = 0; j < args.length; j += 2) {
          if (isRelative) {
            x += args[j];
            y += args[j + 1];
          } else {
            x = args[j];
            y = args[j + 1];
          }
          newArgs.push(x, y);
        }
        break;
      case 'H':
        for (let j = 0; j < args.length; j++) {
          if (isRelative) {
            x += args[j];
          } else {
            x = args[j];
          }
          newArgs.push(x);
        }
        break;
      case 'V':
        for (let j = 0; j < args.length; j++) {
          if (isRelative) {
            y += args[j];
          } else {
            y = args[j];
          }
          newArgs.push(y);
        }
        break;
      case 'C':
        for (let j = 0; j < args.length; j += 6) {
          if (isRelative) {
            newArgs.push(
              x + args[j], y + args[j + 1],
              x + args[j + 2], y + args[j + 3],
              x + args[j + 4], y + args[j + 5]
            );
            x += args[j + 4];
            y += args[j + 5];
          } else {
            newArgs.push(
              args[j], args[j + 1],
              args[j + 2], args[j + 3],
              args[j + 4], args[j + 5]
            );
            x = args[j + 4];
            y = args[j + 5];
          }
        }
        break;
      case 'S':
        for (let j = 0; j < args.length; j += 4) {
          if (isRelative) {
            newArgs.push(
              x + args[j], y + args[j + 1],
              x + args[j + 2], y + args[j + 3]
            );
            x += args[j + 2];
            y += args[j + 3];
          } else {
            newArgs.push(
              args[j], args[j + 1],
              args[j + 2], args[j + 3]
            );
            x = args[j + 2];
            y = args[j + 3];
          }
        }
        break;
      case 'Q':
        for (let j = 0; j < args.length; j += 4) {
          if (isRelative) {
            newArgs.push(
              x + args[j], y + args[j + 1],
              x + args[j + 2], y + args[j + 3]
            );
            x += args[j + 2];
            y += args[j + 3];
          } else {
            newArgs.push(
              args[j], args[j + 1],
              args[j + 2], args[j + 3]
            );
            x = args[j + 2];
            y = args[j + 3];
          }
        }
        break;
      case 'T':
        for (let j = 0; j < args.length; j += 2) {
          if (isRelative) {
            x += args[j];
            y += args[j + 1];
          } else {
            x = args[j];
            y = args[j + 1];
          }
          newArgs.push(x, y);
        }
        break;
      case 'A':
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
        break;
      case 'Z':
        x = mx;
        y = my;
        break;
    }

    absCommands.push({ type: newType, args: newArgs });
  }

  return absCommands;
}

function stringify(commands) {
  return commands.map(c => c.type + (c.args.length ? c.args.join(' ') : '')).join('');
}

const parsed = parseSvgPath(giPigPath);
const absCmds = toAbsolute(parsed);

const subpaths = [];
let currentSubpath = [];
for (let i = 0; i < absCmds.length; i++) {
  const cmd = absCmds[i];
  if (cmd.type === 'M' && currentSubpath.length > 0) {
    subpaths.push(stringify(currentSubpath));
    currentSubpath = [];
  }
  currentSubpath.push(cmd);
}
if (currentSubpath.length > 0) {
  subpaths.push(stringify(currentSubpath));
}

console.log("Found", subpaths.length, "absolute subpaths:");
subpaths.forEach((s, idx) => {
  console.log(`Subpath ${idx}:`);
  console.log(s);
});

const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #222; color: white; font-family: sans-serif; text-align: center; }
    .card { background: #333; padding: 20px; margin: 20px; display: inline-block; }
    svg { background: #444; width: 250px; height: 250px; }
  </style>
</head>
<body>
  <h1>Isolated Absolute Paths for GiPig</h1>
  <div class="card">
    <h3>Full Combined (Control)</h3>
    <svg viewBox="0 0 512 512">
      <path d="${stringify(absCmds)}" fill="pink" stroke="black" stroke-width="2" />
    </svg>
  </div>
  <br>
  ${subpaths.map((s, idx) => `
    <div class="card">
      <h3>Part ${idx}</h3>
      <svg viewBox="0 0 512 512">
        <path d="${s}" fill="pink" stroke="black" stroke-width="2" />
      </svg>
    </div>
  `).join('')}
</body>
</html>
`;

fs.writeFileSync('/home/pc-5/Documents/freepigMovment_Frontend/FreepigMovment/scratch/absolute_preview.html', previewHtml);
console.log("Wrote absolute_preview.html");

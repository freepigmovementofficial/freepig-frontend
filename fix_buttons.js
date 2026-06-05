const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminDashboard.jsx', 'utf8');

// Replace standard Delete Confirm cancel button
code = code.replace(
  /<button onClick=\{\(\) => setDeleteConfirm\(null\)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button([^>]*)disabled=\{([^}]+)\}([^>]*)>\s*\{([^?]+)\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\}\s*<\/button>/g,
  `<button onClick={() => setDeleteConfirm(null)} disabled={$3} className="$1 disabled:opacity-50">CANCEL</button>
                <button$2disabled={$3}$4>
                  {$5 ? <PigLoader size="mini" text="$6" /> : '$7'}
                </button>`
);

// Specifically handle cases without ternary if they exist
code = code.replace(
  /<button onClick=\{\(\) => setDeleteConfirm\(null\)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button([^>]*)disabled=\{([^}]+)\}(.*?)>\s*DELETE\s*<\/button>/g,
  `<button onClick={() => setDeleteConfirm(null)} disabled={$3} className="$1 disabled:opacity-50">CANCEL</button>
                <button$2disabled={$3}$4>
                  {$3 ? <PigLoader size="mini" text="DELETING..." /> : 'DELETE'}
                </button>`
);

// General pattern for Cancel + Submit Action
code = code.replace(
  /<button type="button" onClick=\{([^}]+)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button type="submit" disabled=\{([^}]+)\} className="(.*?)">\s*\{([^?]+)\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\}\s*<\/button>/g,
  `<button type="button" onClick={$1} disabled={$3} className="$2 disabled:opacity-50">CANCEL</button>
                  <button type="submit" disabled={$3} className="$4 flex items-center justify-center gap-2">
                    {$5 ? <PigLoader size="mini" text="$6" /> : '$7'}
                  </button>`
);

// General pattern for Cancel + Submit Action with PigLoader already (just missing disabled)
code = code.replace(
  /<button type="button" onClick=\{([^}]+)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button type="submit" disabled=\{([^}]+)\} className="(.*?)">\s*\{([^?]+)\s*\?\s*<PigLoader([^>]+)>\s*:\s*([^}]+)\}\s*<\/button>/g,
  `<button type="button" onClick={$1} disabled={$3} className="$2 disabled:opacity-50">CANCEL</button>
              <button type="submit" disabled={$3} className="$4 flex items-center justify-center gap-2">
                {$5 ? <PigLoader$6> : $7}
              </button>`
);

// Write it back
fs.writeFileSync('src/pages/admin/AdminDashboard.jsx', code);
console.log("Done");

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

// Specifically handle Delete confirm that DOES NOT have disabled attribute natively in original (like line 1641)
code = code.replace(
  /<button onClick=\{\(\) => setDeleteConfirm\(null\)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button onClick=\{\(\) => handleDelete\(deleteConfirm\)\} className="(.*?)">\s*DELETE\s*<\/button>/g,
  `<button onClick={() => setDeleteConfirm(null)} disabled={deleteLoading} className="$1 disabled:opacity-50">CANCEL</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleteLoading} className="$2 disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleteLoading ? <PigLoader size="mini" text="DELETING..." /> : 'DELETE'}
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

// General pattern for Cancel + Submit Action with PigLoader already (just missing disabled on Cancel)
code = code.replace(
  /<button type="button" onClick=\{([^}]+)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button type="submit" disabled=\{([^}]+)\} className="(.*?)">\s*\{([^?]+)\s*\?\s*<PigLoader([^>]+)>\s*:\s*([^}]+)\}\s*<\/button>/g,
  `<button type="button" onClick={$1} disabled={$3} className="$2 disabled:opacity-50">CANCEL</button>
              <button type="submit" disabled={$3} className="$4 flex items-center justify-center gap-2">
                {$5 ? <PigLoader$6> : $7}
              </button>`
);


// Save Section CANCEL button (Line 1962/1963)
code = code.replace(
  /<button onClick=\{\(\) => setEditSection\(null\)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button\s*onClick=\{handleSaveProducts\}\s*disabled=\{([^}]+)\}\s*className="(.*?)"\s*>\s*\{([^?]+)\s*\?\s*'([^']+)'\s*:\s*'([^']+)'\}\s*<\/button>/g,
  `<button onClick={() => setEditSection(null)} disabled={$2} className="$1 disabled:opacity-50">CANCEL</button>
                  <button
                    onClick={handleSaveProducts}
                    disabled={$2}
                    className="$3 flex items-center justify-center gap-2"
                  >
                    {$4 ? <PigLoader size="mini" text="$5" /> : '$6'}
                  </button>`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.jsx', code);
console.log("Done");

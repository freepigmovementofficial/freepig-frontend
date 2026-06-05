const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminDashboard.jsx', 'utf8');

code = code.replace(
  /<button onClick=\{\(\) => setDeleteConfirm\(null\)\} className="(.*?)"(?:>\s*|\s*>\s*)CANCEL\s*<\/button>\s*<button\s*onClick=\{\(\) => handleDelete\(deleteConfirm\)\}\s*disabled=\{deleteLoading\}\s*className="(.*?)"\s*>\s*\{deleteLoading \? 'DELETING\.\.\.' : 'DELETE'\}\s*<\/button>/g,
  `<button onClick={() => setDeleteConfirm(null)} disabled={deleteLoading} className="$1 disabled:opacity-50">
                  CANCEL
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deleteLoading}
                  className="$2 flex items-center justify-center gap-2"
                >
                  {deleteLoading ? <PigLoader size="mini" text="DELETING..." /> : 'DELETE'}
                </button>`
);

fs.writeFileSync('src/pages/admin/AdminDashboard.jsx', code);
console.log("Done");

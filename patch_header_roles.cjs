const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard/Header.tsx', 'utf-8');

// Ensure role switcher is fully functional and hooked up to the new context
content = content.replace(
  "const currentUserRole = state.role;",
  "const currentUserRole = state.role;\n  const handleRoleChange = (role: UserRole) => setRole(role);"
);

content = content.replace(
  /onClick=\{\(\) => switchUserRole\('League Manager'\)\}/g,
  "onClick={() => handleRoleChange('League Manager')}"
);
content = content.replace(
  /onClick=\{\(\) => switchUserRole\('Team Manager'\)\}/g,
  "onClick={() => handleRoleChange('Team Manager')}"
);
content = content.replace(
  /onClick=\{\(\) => switchUserRole\('Scorekeeper'\)\}/g,
  "onClick={() => handleRoleChange('Scorekeeper')}"
);
content = content.replace(
  /onClick=\{\(\) => switchUserRole\('Coach'\)\}/g,
  "onClick={() => handleRoleChange('Coach')}"
);
content = content.replace(
  /onClick=\{\(\) => switchUserRole\('Fan\/Guest'\)\}/g,
  "onClick={() => handleRoleChange('Fan/Guest')}"
);


fs.writeFileSync('src/components/Dashboard/Header.tsx', content);

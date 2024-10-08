const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

app.use(express.json());
app.use(cors());
app.post('/generate', (req, res) => {
  const configData = req.body;

  generateApplication(configData)
    .then((zipFilePath) => {
      res.download(zipFilePath, 'generated-app.zip', (err) => {
        if (err) {
          console.error(err);
        }
        fs.unlinkSync(zipFilePath);
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('An error occurred during code generation.');
    });
});

// Function to generate the application files
async function generateApplication(configData) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, 'generated-app');
    const zipFilePath = path.join(__dirname, 'generated-app.zip');

    // Ensure the output directory is clean
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir);

    // Generate the application files
    try {
      // Create package.json
      const packageJson = {
        name: 'generated-app',
        version: '1.0.0',
        private: true,
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          'react-scripts': '5.0.0',
          'react-router-dom': '^6.0.0',
          // Add other dependencies as needed
          dexie: '^3.2.0',
        },
        scripts: {
          start: 'react-scripts start',
          build: 'react-scripts build',
        },
      };
      fs.writeFileSync(
        path.join(outputDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create src directory
      const srcDir = path.join(outputDir, 'src');
      fs.mkdirSync(srcDir);

      // Create index.js
      const indexJsContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`;
      fs.writeFileSync(path.join(srcDir, 'index.js'), indexJsContent);

      // Create App.js
      const appJsContent = generateAppJs(configData);
      fs.writeFileSync(path.join(srcDir, 'App.js'), appJsContent);

      // Generate component files
      const { menus, tables, views } = configData;

      menus.forEach((menu, index) => {
        const componentName = `Menu${index}`;
        const componentContent = generateMenuComponent(menu, index);
        fs.writeFileSync(path.join(srcDir, `${componentName}.jsx`), componentContent);
      });

      views.forEach((view, index) => {
        const componentName = `View${index}`;
        const componentContent = generateViewComponent(view, tables);
        fs.writeFileSync(path.join(srcDir, `${componentName}.jsx`), componentContent);
      });

      // Generate DataEntry components
      tables.forEach((table) => {
        const componentContent = generateDataEntryComponent(table);
        fs.writeFileSync(
          path.join(srcDir, `DataEntry${table.name}.jsx`),
          componentContent
        );
      });

      // Create indexedDB.js
      const indexedDBContent = generateIndexedDB(tables);
      fs.writeFileSync(path.join(srcDir, 'indexedDB.js'), indexedDBContent);

      // Create index.html
      const publicDir = path.join(outputDir, 'public');
      fs.mkdirSync(publicDir);
      const indexHtmlContent = `

      
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Generated Application</title>
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
</body>
</html>
`;
      fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtmlContent);

      const dataEntryMenuContent = generateDataEntryMenu(tables);
        fs.writeFileSync(path.join(srcDir, `DataEntryMenu.jsx`), dataEntryMenuContent);

      // After creating all files, create the zip archive
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', function () {
        console.log(`Archive created (${archive.pointer()} total bytes)`);
        resolve(zipFilePath);
      });

      archive.on('error', function (err) {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(outputDir, false);
      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper Functions

function generateAppJs(configData) {
  // Destructure configurations
  const { menus, tables, views } = configData;

  // Generate code for menus, routes, and views
  // Generate menu components
  const menuComponents = generateMenuComponents(menus);

  // Generate routes
  const routes = generateRoutes(menus, views, tables);

  // Generate code for App.js
  const appJsContent = `
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
${menuComponents.imports}
${generateDataEntryImports(tables)}
${generateViewImports(views)}

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Menu */}
        <nav>
          <ul>
            ${menuComponents.links}
            <li><Link to="/data-entry">Data Entry</Link></li>
          </ul>
        </nav>

        {/* Route Definitions */}
        <Routes>
          ${routes}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
`;
  return appJsContent;
}

function generateMenuComponents(menus) {
  let imports = '';
  let links = '';
  menus.forEach((menu, index) => {
    const componentName = `Menu${index}`;
    imports += `import ${componentName} from './${componentName}';\n`;
    links += `<li><Link to="/menu${index}">${menu.name}</Link></li>\n`;
  });
  return { imports, links };
}

function generateRoutes(menus, views, tables) {
  let routes = '';

  menus.forEach((menu, index) => {
    const componentName = `Menu${index}`;
    routes += `<Route path="/menu${index}/*" element={<${componentName} />} />\n`;
  });

  views.forEach((view, index) => {
    const componentName = `View${index}`;
    routes += `<Route path="/view${index}" element={<${componentName} />} />\n`;
  });

  routes += `<Route path="/data-entry/*" element={<DataEntryMenu />} />\n`;

  return routes;
}

function generateMenuComponent(menu, index) {
  let secondaryLinks = '';
  menu.secondaryMenus.forEach((submenu, idx) => {
    secondaryLinks += `<li><Link to="/view${idx}">${submenu}</Link></li>\n`;
  });

  const componentContent = `
import React from 'react';
import { Link } from 'react-router-dom';

function Menu${index}() {
  return (
    <div>
      <h2>${menu.name}</h2>
      <ul>
        ${secondaryLinks}
      </ul>
    </div>
  );
}

export default Menu${index};
`;
  return componentContent;
}

function generateViewComponent(view, tables) {
  const table = tables[view.configuration.tableIndex];
  const columns = view.configuration.columns;
  const componentName = `View${view.name.replace(/\s+/g, '')}`;

  const componentContent = `
import React, { useEffect, useState } from 'react';
import db from './indexedDB';

function ${componentName}() {
  const [data, setData] = useState([]);

  useEffect(() => {
    db.${table.name}.toArray().then((records) => {
      setData(records);
    });
  }, []);

  return (
    <div>
      <h2>${view.name}</h2>
      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              ${columns.map((col) => `<td>{row['${col}']}</td>`).join('')}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ${componentName};
`;
  return componentContent;
}

function generateIndexedDB(tables) {
  let stores = '';
  tables.forEach((table) => {
    const columnNames = table.columns.map((col) => col.name).join(', ');
    stores += `'${table.name}': '++id, ${columnNames}',\n`;
  });

  const content = `
import Dexie from 'dexie';

const db = new Dexie('MyDatabase');
db.version(1).stores({
  ${stores}
});

export default db;
`;
  return content;
}

function generateDataEntryComponent(table) {
  const fields = table.columns
    .map((col) => {
      return `
        <div>
          <label>${col.name}:</label>
          <input
            type="text"
            name="${col.name}"
            value={formData.${col.name} || ''}
            onChange={handleChange}
          />
        </div>
      `;
    })
    .join('');

  const validationChecks = table.columns
    .map((col) => {
      switch (col.type) {
        case 'int':
          return `
      if (isNaN(parseInt(formData['${col.name}']))) {
        invalidFields.push('${col.name}');
      }`;
        case 'float':
          return `
      if (isNaN(parseFloat(formData['${col.name}']))) {
        invalidFields.push('${col.name}');
      }`;
        case 'date':
          return `
      if (isNaN(Date.parse(formData['${col.name}']))) {
        invalidFields.push('${col.name}');
      }`;
        default:
          return '';
      }
    })
    .join('');

  const componentContent = `
import React, { useState } from 'react';
import db from './indexedDB';

function DataEntry${table.name}() {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate data types
    const invalidFields = [];
    ${validationChecks}

    if (invalidFields.length > 0) {
      setMessage('Invalid data in fields: ' + invalidFields.join(', '));
      return;
    }

    db.${table.name}
      .add(formData)
      .then(() => {
        setMessage('Data saved successfully!');
        setFormData({});
      })
      .catch((error) => {
        console.error('Error saving data:', error);
        setMessage('Error saving data.');
      });
  };

  return (
    <div>
      <h2>Enter Data for ${table.name}</h2>
      <form onSubmit={handleSubmit}>
        ${fields}
        <button type="submit">Save</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DataEntry${table.name};
`;
  return componentContent;
}

function generateDataEntryImports(tables) {
  let imports = '';
  imports += `import DataEntryMenu from './DataEntryMenu';\n`;
  tables.forEach((table) => {
    imports += `import DataEntry${table.name} from './DataEntry${table.name}';\n`;
  });
  return imports;
}

function generateViewImports(views) {
  let imports = '';
  views.forEach((view, index) => {
    const componentName = `View${index}`;
    imports += `import ${componentName} from './${componentName}';\n`;
  });
  return imports;
}

// Generate DataEntryMenu component
function generateDataEntryMenu(tables) {
  let links = '';
  tables.forEach((table) => {
    links += `<li><Link to="/data-entry/${table.name}">${table.name}</Link></li>\n`;
  });

  const componentContent = `
import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
${tables.map((table) => `import DataEntry${table.name} from './DataEntry${table.name}';`).join('\n')}

function DataEntryMenu() {
  return (
    <div>
      <h2>Data Entry</h2>
      <ul>
        ${links}
      </ul>

      <Routes>
        ${tables
          .map(
            (table) =>
              `<Route path="/${table.name}" element={<DataEntry${table.name} />} />`
          )
          .join('\n')}
      </Routes>
    </div>
  );
}

export default DataEntryMenu;
`;
  return componentContent;
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
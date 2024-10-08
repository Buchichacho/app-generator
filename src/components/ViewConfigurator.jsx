import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function ViewConfigurator() {
  const primaryMenus = useSelector((state) => state.menu.primaryMenus);
  const tables = useSelector((state) => state.table.tables);

  const [views, setViews] = useState([]);
  const [viewName, setViewName] = useState('');
  const [selectedViewIndex, setSelectedViewIndex] = useState(null);
  const [selectedPrimaryMenuIndex, setSelectedPrimaryMenuIndex] = useState(null);
  const [selectedSecondaryMenuIndex, setSelectedSecondaryMenuIndex] = useState(null);
  const [selectedTableIndex, setSelectedTableIndex] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const addView = () => {
    if (viewName.trim() === '') return;
    setViews([...views, { name: viewName, configuration: {} }]);
    setViewName('');
  };

  const configureView = () => {
    if (
      selectedViewIndex === null ||
      selectedPrimaryMenuIndex === null ||
      selectedSecondaryMenuIndex === null ||
      selectedTableIndex === null ||
      selectedColumns.length === 0
    )
      return;

    const updatedViews = [...views];
    updatedViews[selectedViewIndex].configuration = {
      primaryMenuIndex: selectedPrimaryMenuIndex,
      secondaryMenuIndex: selectedSecondaryMenuIndex,
      tableIndex: selectedTableIndex,
      columns: selectedColumns,
    };
    setViews(updatedViews);
  };

  const exportApplication = () => {
    const configData = {
      menus: primaryMenus,
      tables: tables,
      views: views,
    };

    axios
      .post('http://localhost:5000/generate', configData, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'generated-app.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error('Error exporting application:', error);
      });
  };

  return (
    <div>
      <h1>View Configurator</h1>
      <div>
        <h2>Views</h2>
        <input
          type="text"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          placeholder="Enter view name"
        />
        <button onClick={addView}>Add View</button>
      </div>
      <ul>
        {views.map((view, index) => (
          <li key={index}>
            <button onClick={() => setSelectedViewIndex(index)}>
              {view.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedViewIndex !== null && (
        <div>
          <h2>Configure "{views[selectedViewIndex].name}"</h2>

          <div>
            <h3>Select Primary Menu Item</h3>
            <select
              value={selectedPrimaryMenuIndex || ''}
              onChange={(e) => {
                setSelectedPrimaryMenuIndex(parseInt(e.target.value));
                setSelectedSecondaryMenuIndex(null);
              }}
            >
              <option value="" disabled>
                Select Primary Menu
              </option>
              {primaryMenus.map((menu, idx) => (
                <option key={idx} value={idx}>
                  {menu.name}
                </option>
              ))}
            </select>
          </div>

          {selectedPrimaryMenuIndex !== null && (
            <div>
              <h3>Select Secondary Menu Item</h3>
              <select
                value={selectedSecondaryMenuIndex || ''}
                onChange={(e) =>
                  setSelectedSecondaryMenuIndex(parseInt(e.target.value))
                }
              >
                <option value="" disabled>
                  Select Secondary Menu
                </option>
                {primaryMenus[selectedPrimaryMenuIndex].secondaryMenus.map(
                  (submenu, idx) => (
                    <option key={idx} value={idx}>
                      {submenu}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          <div>
            <h3>Select Table</h3>
            <select
              value={selectedTableIndex || ''}
              onChange={(e) => {
                setSelectedTableIndex(parseInt(e.target.value));
                setSelectedColumns([]);
              }}
            >
              <option value="" disabled>
                Select Table
              </option>
              {tables.map((table, idx) => (
                <option key={idx} value={idx}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTableIndex !== null && (
            <div>
              <h3>Select Columns</h3>
              {tables[selectedTableIndex].columns.map((column, idx) => (
                <div key={idx}>
                  <input
                    type="checkbox"
                    value={column.name}
                    checked={selectedColumns.includes(column.name)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        setSelectedColumns([...selectedColumns, column.name]);
                      } else {
                        setSelectedColumns(
                          selectedColumns.filter((col) => col !== column.name)
                        );
                      }
                    }}
                  />
                  <label>{column.name}</label>
                </div>
              ))}
            </div>
          )}

          <button onClick={configureView}>Save View Configuration</button>
        </div>
      )}  
      <button onClick={exportApplication}>Export Program</button>
    </div>
  );
}

export default ViewConfigurator;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function TableBuilder() {
  const dispatch = useDispatch();
  const tables = useSelector((state) => state.table.tables);
  const [tableName, setTableName] = useState('');
  const [selectedTableIndex, setSelectedTableIndex] = useState(null);
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('varchar');

  const dataTypes = ['varchar', 'int', 'float', 'date'];

  const addTable = () => {
    if (tableName.trim() === '') return;
    const updatedTables = [...tables, { name: tableName, columns: [] }];
    dispatch({ type: 'SET_TABLES', payload: updatedTables });
    setTableName('');
  };

  const selectTable = (index) => {
    setSelectedTableIndex(index);
  };

  const addColumn = () => {
    if (columnName.trim() === '' || selectedTableIndex === null) return;

    const updatedTables = [...tables];
    updatedTables[selectedTableIndex].columns.push({
      name: columnName,
      type: columnType,
    });
    dispatch({ type: 'SET_TABLES', payload: updatedTables });
    setColumnName('');
    setColumnType('varchar');
  };

  return (
    <div>
      <h1>Table Builder</h1>
      <div>
        <h2>Tables</h2>
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Enter table name"
        />
        <button onClick={addTable}>Add Table</button>
      </div>

      <ul>
        {tables.map((table, index) => (
          <li key={index}>
            <button onClick={() => selectTable(index)}>{table.name}</button>
          </li>
        ))}
      </ul>

      {selectedTableIndex !== null && (
        <div>
          <h2>
            Columns for Table "{tables[selectedTableIndex].name}"
          </h2>
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            placeholder="Enter column name"
          />
          <select
            value={columnType}
            onChange={(e) => setColumnType(e.target.value)}
          >
            {dataTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button onClick={addColumn}>Add Column</button>
          <table>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
              </tr>
            </thead>
            <tbody>
              {tables[selectedTableIndex].columns.map((column, idx) => (
                <tr key={idx}>
                  <td>{column.name}</td>
                  <td>{column.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TableBuilder;

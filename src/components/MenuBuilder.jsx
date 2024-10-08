import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function MenuBuilder() {
  const dispatch = useDispatch();
  const primaryMenus = useSelector((state) => state.menu.primaryMenus);
  const [selectedPrimaryMenu, setSelectedPrimaryMenu] = useState(null);
  const [primaryMenuName, setPrimaryMenuName] = useState('');
  const [secondaryMenuName, setSecondaryMenuName] = useState('');

  const addPrimaryMenu = () => {
    if (primaryMenuName.trim() === '') return;
    const updatedMenus = [
      ...primaryMenus,
      { name: primaryMenuName, secondaryMenus: [] },
    ];
    dispatch({ type: 'SET_MENUS', payload: updatedMenus });
    setPrimaryMenuName('');
  };

  const selectPrimaryMenu = (index) => {
    setSelectedPrimaryMenu(index);
  };

  const addSecondaryMenu = () => {
    if (secondaryMenuName.trim() === '' || selectedPrimaryMenu === null) return;

    const updatedMenus = [...primaryMenus];
    updatedMenus[selectedPrimaryMenu].secondaryMenus.push(
      secondaryMenuName
    );
    dispatch({ type: 'SET_MENUS', payload: updatedMenus });
    setSecondaryMenuName('');
  };

  return (
    <div>
      <h1>Menu Builder</h1>
      <div>
        <h2>Primary Menus</h2>
        <input
          type="text"
          value={primaryMenuName}
          onChange={(e) => setPrimaryMenuName(e.target.value)}
          placeholder="Enter primary menu name"
        />
        <button onClick={addPrimaryMenu}>Add Primary Menu Item</button>
      </div>

      <ul>
        {primaryMenus.map((menu, index) => (
          <li key={index}>
            <button onClick={() => selectPrimaryMenu(index)}>
              {menu.name}
            </button>
          </li>
        ))}
      </ul>

      {selectedPrimaryMenu !== null && (
        <div>
          <h2>
            Secondary Menus for "{primaryMenus[selectedPrimaryMenu].name}"
          </h2>
          <input
            type="text"
            value={secondaryMenuName}
            onChange={(e) => setSecondaryMenuName(e.target.value)}
            placeholder="Enter secondary menu name"
          />
          <button onClick={addSecondaryMenu}>Add Secondary Menu Item</button>

          <ul>
            {primaryMenus[selectedPrimaryMenu].secondaryMenus.map(
              (submenu, idx) => (
                <li key={idx}>{submenu}</li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MenuBuilder;

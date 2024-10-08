// store.js
import { createStore, combineReducers } from 'redux';

// Initial state
const initialMenuState = {
  primaryMenus: [],
};

const initialTableState = {
  tables: [],
};

// Reducers
function menuReducer(state = initialMenuState, action) {
  switch (action.type) {
    case 'SET_MENUS':
      return { ...state, primaryMenus: action.payload };
    default:
      return state;
  }
}

function tableReducer(state = initialTableState, action) {
  switch (action.type) {
    case 'SET_TABLES':
      return { ...state, tables: action.payload };
    default:
      return state;
  }
}

// Combine reducers
const rootReducer = combineReducers({
  menu: menuReducer,
  table: tableReducer,
});

// Create store
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

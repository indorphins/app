// Reducer to manage App level state
// state object holds: classes, ...
// classes is hash map ex. {id: Class, id: Class, ...}
const AppReducer = (state, action) => {
	switch (action.type) {
		case 'addClass':
			let c = action.payload; // the class
			return { ...state, classes: { ...state.classes, [c.class_id]: c } };
		case 'removeClass':
			let classList = state.classes ? state.classes : {};
			c = action.payload;
			if (state.classes[c.class_id]) {
				delete classList[c.class_id];
			}
			return { ...state, classes: classList };
		case 'updateClass':
			// update current class, do nothing if class doesn't exist
			classList = state.classes ? state.classes : {};
			const id = action.payload.class_id;
			if (classList[id] && action.payload.class) {
				classList[id] = action.payload.class;
			}
			return { ...state, classes: classList };
		case 'updateCallFrame':
			return { ...state, myCallFrame: action.payload };
		case 'removeCallFrame':
			// Handle destroy here?
			return { ...state, myCallFrame: {} };
		case 'updateProfile':
			// update profile in state and local storage
			return { ...state, myProfile: action.payload };
		case 'removeProfile':
			return { ...state, myProfile: null };
		case 'updateInClass':
			return { ...state, inClass: action.payload };
		case 'updateCurrentClass':
			return { ...state, currentClass: action.payload };
		case 'removeCurrentClass':
			return { ...state, currentClass: {} };
		default:
			return state;
	}
};

export default AppReducer;

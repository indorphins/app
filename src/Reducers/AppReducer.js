// Reducer to manage App level state
// state object holds: classes, ...
// classes is hash map ex. {id: Class, id: Class, ...}
const AppReducer = (state, action) => {
	switch (action.type) {
		case 'addClass':
			const c = action.payload; // the class
			console.log('addClass returning state - ', {
				...state,
				classes: { ...state.classes, [c.id]: c }
			});
			return { ...state, classes: { ...state.classes, [c.id]: c } };
		case 'removeClass':
			let classList = state.classes ? state.classes : {};
			c = action.payload;
			if (state.classes[c.id]) {
				delete classList[c.id];
			}
			console.log('removeClass returning state ', {
				...state,
				classes: classList
			});
			return { ...state, classes: classList };
		case 'updateClass':
			// update current class, do nothing if class doesn't exist
			classList = state.classes ? state.classes : {};
			const id = action.payload.id;
			if (classList[id] && action.payload.class) {
				classList[id] = action.payload.class;
			}
			console.log('updateClass returning state : ', {
				...state,
				classes: classList
			});
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
		default:
			return state;
	}
};

export default AppReducer;

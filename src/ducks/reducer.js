const initialState = {
	loggedInUser: {},
}

//ACTION TYPES
const GET_LOGGED_IN_USER = 'GET_LOGGED_IN_USER';


//ACTION CREATORS
export function getLoggedInUser(userData) {
	return {
		type: GET_LOGGED_IN_USER,
		payload: userData
	};
};

//REDUCER
export default function reducer(state = initialState, action) {
	switch (action.type) {
			// case GET_USER_DATA:
			// 		return { ...state, user: action.payload }
			// default:
			// 		return state
	}
}

import axios from 'axios';
import { setAlert } from './alert';
import {
  REGISTER_SUCCESS,
  REGISTER_FAil,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAil,
  LOGOUT,
  CLEAR_PROFILE
} from './types';
import setAuthToken from '../utils/setAuthToken';
//Load user
export const loadUser = () => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }
  try {
    const res = await axios.get('/api/auth');

    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (e) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

//Register user
export const register = ({ name, email, password }) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const body = JSON.stringify({ name, email, password });
  try {
    const res = await axios.post('/api/users', body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });
    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg)));
    }
    dispatch({
      type: REGISTER_FAil
    });
  }
};

//Login user
export const login = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const body = JSON.stringify({ email, password });
  try {
    const res = await axios.post('/api/auth', body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });
    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg)));
    }
    dispatch({
      type: LOGIN_FAil
    });
  }
};

//LOGOUT
export const logout = () => dispatch => {
  dispatch({
    type: LOGOUT
  });
  dispatch({
    type: CLEAR_PROFILE
  });
};

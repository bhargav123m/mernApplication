import axios from 'axios';
import { setAlert } from './alert';
import {
  GET_POSTS,
  POST_ERROR,
  UPDATE_LIKES,
  DELETE_POSTS,
  ADD_POST,
  GET_POST,
  ADD_COMMENT,
  REMOVE_COMMENT
} from './types';

//Get Posts
export const getPosts = () => async dispatch => {
  try {
    const res = await axios.get('/api/posts');
    dispatch({
      type: GET_POSTS,
      payload: res.data
    });
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//Add like
export const addLike = postid => async dispatch => {
  try {
    const res = await axios.patch('/api/posts/like/' + postid);
    dispatch({
      type: UPDATE_LIKES,
      payload: {
        id: postid,
        likes: res.data
      }
    });
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//remove like
export const removeLike = postid => async dispatch => {
  try {
    const res = await axios.patch('/api/posts/unlike/' + postid);
    dispatch({
      type: UPDATE_LIKES,
      payload: {
        id: postid,
        likes: res.data
      }
    });
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//Delete Post
export const deletePost = id => async dispatch => {
  try {
    await axios.delete('/api/posts/' + id);
    dispatch({
      type: DELETE_POSTS,
      payload: {
        id
      }
    });
    dispatch(setAlert('Post Removed'));
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//ADD Post
export const addPost = formData => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const res = await axios.post('/api/posts/', formData, config);
    dispatch({
      type: ADD_POST,
      payload: res.data
    });
    dispatch(setAlert('Post Added'));
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//Get Post
export const getPost = id => async dispatch => {
  try {
    const res = await axios.get('/api/posts/' + id);
    dispatch({
      type: GET_POST,
      payload: res.data
    });
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//ADD comment
export const addComment = (postId, formData) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  try {
    const res = await axios.post(
      '/api/posts/comment/' + postId,
      formData,
      config
    );
    dispatch({
      type: ADD_COMMENT,
      payload: res.data
    });
    dispatch(setAlert('Comment Added'));
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

//Delete comment
export const deleteComment = (postId, commentId) => async dispatch => {
  try {
    const res = await axios.delete(
      '/api/posts/comment/' + postId + '/' + commentId
    );
    dispatch({
      type: REMOVE_COMMENT,
      payload: {
        id: commentId
      }
    });
    dispatch(setAlert('Comment Removed'));
  } catch (e) {
    dispatch({
      type: POST_ERROR,
      payload: {
        msg: e.response.statusText,
        status: e.response.status
      }
    });
  }
};

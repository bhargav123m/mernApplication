import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import { deleteEducation } from '../../actions/profile';

const Educations = ({ education, deleteEducation }) => {
  const educations = education.map(edu => (
    <tr key={edu._id}>
      <td>{edu.school}</td>
      <td>{edu.degree}</td>

      <td>
        <Moment format='YYYY/MM/DD'>{edu.from}</Moment> -{' '}
        {edu.to === null ? (
          'Now'
        ) : (
          <Moment format='YYYY/MM/DD'>{edu.to}</Moment>
        )}
      </td>
      <td>
        <button
          onClick={() => deleteEducation(edu._id)}
          className='btn btn-danger'
        >
          Delete
        </button>
      </td>
    </tr>
  ));
  return (
    <Fragment>
      <h2 className='my-2'>Education Credentials</h2>
      <table className='table'>
        <thead>
          <tr>
            <th>School</th>
            <th>degree</th>
            <th>Years</th>
          </tr>
        </thead>
        <tbody>{educations}</tbody>
      </table>
    </Fragment>
  );
};

Educations.propTypes = {
  education: PropTypes.array.isRequired,
  deleteEducation: PropTypes.func.isRequired
};

export default connect(
  null,
  { deleteEducation }
)(Educations);

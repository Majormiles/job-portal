import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CreateJob from './CreateJob';

/**
 * EditJob is a wrapper around CreateJob that sets edit mode
 * This component simply redirects to CreateJob with the job ID
 */
const EditJob = () => {
  const { id } = useParams();
  
  if (!id) {
    return <Navigate to="/admin/jobs" replace />;
  }
  
  return <CreateJob />;
};

export default EditJob; 
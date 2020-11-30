import { useState, useEffect } from 'react';

export default function useProjectTitle(title) {
  const [projectTitle, setProjectTitle] = useState();
  const [newProjectTitle, setNewProjectTitle] = useState();

  useEffect(() => {
    setProjectTitle(title);
    setNewProjectTitle(title);
  }, [title]);

  return {
    projectTitle,
    setProjectTitle,
    newProjectTitle,
    setNewProjectTitle,
  };
}

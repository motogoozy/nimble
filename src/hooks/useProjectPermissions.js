import { useState, useEffect } from 'react';

export default function useProjectPermissions(permissionsProps) {
  const [permissions, setPermissions] = useState({
    add_tasks: false,
    edit_tasks: false,
    delete_tasks: false,
    add_lists: false,
    edit_lists: false,
    delete_lists: false,
    edit_project: false,
    add_collaborators: false,
    remove_collaborators: false,
  });

  useEffect(() => {
    setPermissions(permissionsProps);
  }, [permissionsProps]);

  return [permissions, setPermissions];
}

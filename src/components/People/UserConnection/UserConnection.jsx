import React from 'react';
import './UserConnection.scss';

export default function UserConnection(props) {
   const { user } = props;

   return (
      <div className='user-connection'>
         <p>{user.first_name} {user.last_name}</p>
      </div>
   )
}

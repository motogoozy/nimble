import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

export default function LetterAvatars(props) {
   const useStyles = makeStyles({
      avatar: {
         color: 'white',
         backgroundColor: props.color,
         width: '2.5rem',
         height: '2.5rem',
      },
   });
   const classes = useStyles();

   return (
      <Avatar className={classes.avatar}>{props.initials.toUpperCase()}</Avatar>
   );
}
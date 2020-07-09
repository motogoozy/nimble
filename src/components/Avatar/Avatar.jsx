import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

export default function LetterAvatars(props) {
  const useStyles = makeStyles({
    avatar: {
      color: 'white',
      backgroundColor: props.color,
      width: props.size || '2.5rem',
      height: props.size || '2.5rem',
      fontSize: props.fontSize || 'default',
    },
  });
  const classes = useStyles();

  return <Avatar className={classes.avatar}>{props.initials.toUpperCase()}</Avatar>;
}

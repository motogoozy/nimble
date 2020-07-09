import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
let test;

const useStyles = makeStyles(theme => ({
  default: {
    // backgroundColor: '#995D81',
    // margin: '0 1rem',
    // '&:hover': {
    // 	backgroundColor: '#663f56'
    // }
  },
}));

export default function FloatingActionButtons() {
  const classes = useStyles();
  return (
    <div>
      <Fab color='primary' aria-label='add' size='medium' className={classes.default}>
        <AddIcon />
      </Fab>
    </div>
  );
}

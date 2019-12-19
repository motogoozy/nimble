import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles(theme => ({
	fab: {
		margin: theme.spacing(1),
		backgroundColor: '#995D81',
		marginLeft: '2rem',
		marginRight: '2rem',
		'&:hover': {
			backgroundColor: '#663f56'
		}
	}
}));

export default function FloatingActionButtons() {
	const classes = useStyles();
	return (
		<div>
			<Fab color="primary" aria-label="add" size='medium' className={classes.fab}>
				<AddIcon />
			</Fab>
		</div>
	);
};
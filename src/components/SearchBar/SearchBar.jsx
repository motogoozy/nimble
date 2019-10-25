import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    dense: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        width: '12rem',
        backgroundColor: 'white',
        borderRadius: '5px',
        '& label.Mui-focused': {
            color: 'black',
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: '#995D81',
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: '#995D81',
            },
            '&:hover fieldset': {
                borderColor: '#663f56',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#995D81',
            },
        }

        ,
    }
}));

export default function OutlinedTextFields(props) {
    const classes = useStyles();

    return (
        <form className={classes.container} noValidate autoComplete="off">
            <TextField
                id="outlined-dense"
                label="Search name or task"
                placeholder="ex: 'John Doe'"
                className={classes.dense}
                margin="dense"
                variant="outlined"
            />
        </form>
    );
}
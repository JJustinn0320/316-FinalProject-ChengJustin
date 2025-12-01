import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from '@mui/icons-material/Clear';

export default function ClearableTextField({ value, onChange, ...props }) {
    return (
        <TextField
            value={value}
            onChange={onChange}
            sx={{
                backgroundColor: '#d3d0ccff'
            }}
            slotProps={{
                input: {
                    endAdornment: value && (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="clear field"
                                onClick={() => onChange({ target: { value: '' } })}
                                edge="end"
                            >
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
            {...props}
        />
    );
}

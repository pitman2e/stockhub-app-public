import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CheckIcon from '@mui/icons-material/Check';

interface IConfirmationDialogWrapperProps {
    WrappingComponent: React.ComponentType<{ onClick: () => void }>;
    title: string;
    description: string;
    onDialogConfirm: (() => Promise<void>);
    onDialogCancel?: (() => void) | undefined | null;
}

export default function ConfirmationDialogWrapper({ WrappingComponent, title, description, onDialogConfirm, onDialogCancel } : IConfirmationDialogWrapperProps) {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        if (onDialogCancel) {
            onDialogCancel();
        }

        setOpen(false);
    };

    const handleConfirm = () => {
        if (onDialogConfirm) {
            setIsLoading(true);
            onDialogConfirm();
            setIsLoading(false);
        }

        setOpen(false);
    }

    return (
        <>
            <WrappingComponent onClick={handleClickOpen} />

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >

                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {description}
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color="primary" autoFocus>
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        color="primary"
                        loading={isLoading}
                        loadingPosition="start"
                        startIcon={<CheckIcon />}
                        onClick={handleConfirm}
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CheckIcon from "@mui/icons-material/Check";

interface IConfirmationDialogWrapperProps {
  WrappingComponent: React.ComponentType<{
    onClick: () => void;
    disabled?: boolean;
  }>;
  title: string;
  description: string;
  onDialogConfirm: () => Promise<void>;
  onDialogCancel?: (() => void) | undefined | null;
  confirmCooldownTimer?: number;
  disabled?: boolean;
}

export default function ConfirmationDialogWrapper({
  WrappingComponent,
  title,
  description,
  onDialogConfirm,
  onDialogCancel,
  confirmCooldownTimer = 2000,
  disabled,
}: IConfirmationDialogWrapperProps) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isConfirmCooldown, setIsConfirmCooldown] = React.useState(false);

  const cooldownTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleClickOpen = () => {
    setOpen(true);

    if (confirmCooldownTimer > 0) {
      setIsConfirmCooldown(true);

      cooldownTimerRef.current = setTimeout(() => {
        setIsConfirmCooldown(false);
      }, confirmCooldownTimer);
    } else {
      setIsConfirmCooldown(false);
    }
  };

  const handleClose = () => {
    if (cooldownTimerRef.current !== null) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    setIsConfirmCooldown(false);

    if (onDialogCancel) {
      onDialogCancel();
    }

    setOpen(false);
  };

  const handleConfirm = async () => {
    if (isConfirmCooldown || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await onDialogConfirm();
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (cooldownTimerRef.current !== null) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <WrappingComponent onClick={handleClickOpen} disabled={disabled} />

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
            disabled={isConfirmCooldown || isLoading}
            loading={isConfirmCooldown || isLoading}
            loadingPosition="start"
            startIcon={<CheckIcon />}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
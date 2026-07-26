import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { useForm } from "react-hook-form";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch } from 'react-redux'
import utils from '../../utils/utils';
import {
  postSuccessMessage,
} from '../../redux/snackbarSlice';
import { IBaseDto, IStockDividend } from '../../types/db';
import { IDividendPutDto, IHookError } from '../../types/api';
import repoDividend from '../../repo/repoDividend';
import { useQueryClient } from '@tanstack/react-query';

interface IEditFormScripPriceProps {
  onDialogClose: (data?: IDividendPutDto) => void;
  data: IStockDividend | null;
}

export default function EditFormScripPrice({ onDialogClose, data }: IEditFormScripPriceProps) {
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<IDividendPutDto & IBaseDto>();
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const onDialogSubmit = async (data: IDividendPutDto & IBaseDto) => {
    setIsSaving(true)

    const response = await utils.requestWithToken('PUT', repoDividend.Put().baseUrl, data);

    setIsSaving(false)

    if (response.status !== 200) {
      const actionResult = await response.data;

      if (actionResult.hookErrors?.length > 0) {
        actionResult.hookErrors.forEach((hookError: IHookError<IDividendPutDto & IBaseDto>) => {
          setError(hookError.fieldName, {
            type: "manual",
            message: hookError.message
          });
        }
        )
      } else {
        setError("genericErrorMsg", {
          type: "manual",
          message: actionResult?.message ? actionResult.message : 'Server rejected input. Please verify',
        });
      }
    } else {
      queryClient.invalidateQueries({ queryKey: repoDividend.Get().invalidateQueryKey });
      dispatch(postSuccessMessage(""))
      onDialogClose(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onDialogSubmit)}>
      <DialogTitle id="form-dialog-title">{data === null ? "Add" : "Edit"} Scrip</DialogTitle>
      <DialogContent>
        <FormControl error>
          <input type="hidden" {...register('dividendId')} value={data?.dividendId ?? undefined}></input>

          <TextField
            margin="dense"
            id="scripPrice"
            label="Scrip Conversion Price"
            type="any" //This is an HTML5 input type
            defaultValue={data?.scripPrice}
            error={!!errors.scripPrice?.message}
            helperText={errors.scripPrice?.message}
            fullWidth
            {...register("scripPrice")}
          />

          <FormHelperText id="component-error-text">{errors.genericErrorMsg?.message}</FormHelperText>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onDialogClose()} color="primary">Cancel</Button>
        {/*Note that type=submit for a HTML form*/}
        <Button
          type="submit"
          loading={isSaving}
          loadingPosition="start"
          onClick={() => clearErrors()}
          startIcon={<SaveIcon />}
          variant='outlined'
        >
          {data === null ? "Add" : "Edit"}
        </Button>
      </DialogActions>
    </form>
  );
}

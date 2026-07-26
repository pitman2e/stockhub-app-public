import { useState } from 'react';
import utils from '../../utils/utils';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useForm } from "react-hook-form";
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch } from 'react-redux'
import {
  postSuccessMessage,
} from '../../redux/snackbarSlice';
import { IRealisedScripPutDto } from "../../types/api";
import { IHookError } from '../../types/api';
import { repoStockRealisedScrip } from '../../repo/repoStockRealisedScrip';
import { useQueryClient } from '@tanstack/react-query';
import repoRealisedDividend from '../../repo/repoRealisedDividend';

interface IEditFormDividendProps {
  onDialogClose: (data?: IRealisedScripPutDto) => void;
  data: IRealisedScripPutDto;
}

export default function EditFormDividend({ onDialogClose, data }: IEditFormDividendProps) {
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<IRealisedScripPutDto>();
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const onDialogSubmit = async (data: IRealisedScripPutDto) => {
    setIsSaving(true)

    const response = await utils.requestWithToken('PUT', repoStockRealisedScrip.Put().baseUrl, data);

    setIsSaving(false)

    if (response.status !== 200) {
      const actionResult = await response.data;

      if (actionResult.hookErrors?.length > 0) {
        actionResult.hookErrors.forEach((hookError: IHookError<IRealisedScripPutDto>) => {
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
      dispatch(postSuccessMessage(""))
      queryClient.invalidateQueries({ queryKey: repoStockRealisedScrip.Put().invalidateQueryKey });
      queryClient.invalidateQueries({ queryKey: repoRealisedDividend.Get().invalidateQueryKey });
      onDialogClose(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onDialogSubmit)}>
      <DialogTitle id="form-dialog-title">{data === null ? "Add" : "Edit"} Scrip</DialogTitle>
      <DialogContent>
        <FormControl error>
          <input type="hidden" {...register('dividendId')} value={data.dividendId}></input>
          <input type="hidden" {...register('portfolioId')} value={data.portfolioId}></input>

          <TextField
            autoFocus
            margin="dense"
            id="scripReceived"
            label="Scrip Received"
            type="any" //This is an HTML5 input type
            defaultValue={data.scripReceived}
            error={Boolean(errors.scripReceived)}
            helperText={errors.scripReceived?.message?.toString()}
            fullWidth
            {...register("scripReceived")}
          />

          <TextField
            margin="dense"
            id="reinvestPrice"
            label="Reinvest Price"
            type="any" //This is an HTML5 input type
            defaultValue={data.reinvestPrice}
            error={Boolean(errors.reinvestPrice)}
            helperText={errors.reinvestPrice?.message?.toString()}
            fullWidth
            {...register("reinvestPrice")}
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
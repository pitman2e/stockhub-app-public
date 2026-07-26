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
import { IHookError, IPortfolioPostDto } from '../../types/api';
import { Checkbox, FormControlLabel } from '@mui/material';
import { IStockSummary } from "../../types/api";
import repoPortfolio from '../../repo/repoPortfolio';
import { useQueryClient } from '@tanstack/react-query';

interface IEditFormPortfolioProps {
  onDialogClose: () => void;
  data: IStockSummary | null;
}

export default function EditFormPortfolio({ onDialogClose, data }: IEditFormPortfolioProps) {
  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<IPortfolioPostDto>({
        defaultValues: {
          version: data?.version,
        }
    });
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const onDialogSubmit = async (data: IPortfolioPostDto) => {
    setIsSaving(true)

    const response = await utils.requestWithToken(data === null ? 'POST' : 'PUT', repoPortfolio.Post().baseUrl, data);

    setIsSaving(false)

    if (response.status !== 200) {
      const actionResult = await response.data;

      if (actionResult.hookErrors?.length > 0) {
        actionResult.hookErrors.forEach((hookError: IHookError<IPortfolioPostDto>) => {
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
      queryClient.invalidateQueries({ queryKey: repoPortfolio.Post().invalidateQueryKey });
      onDialogClose();
    }
  };

  return (
    <form onSubmit={handleSubmit(onDialogSubmit)}>
      <DialogTitle id="form-dialog-title">{data === null ? "Add" : "Edit"} Portfolio</DialogTitle>
      <DialogContent>
        <FormControl error>
          <TextField
            autoFocus
            disabled={data !== null}
            margin="dense"
            id="portfolioId"
            label="Portfolio Id"
            type="any" //This is an HTML5 input type
            defaultValue={data?.portfolioId}
            error={!!errors.portfolioId}
            helperText={errors.portfolioId?.message}
            fullWidth
            {...register("portfolioId")}
          />

          <TextField
            margin="dense"
            id="portfolioName"
            label="Portfolio Name"
            type="any" //This is an HTML5 input type
            defaultValue={data?.portfolioName}
            error={!!errors.portfolioName}
            helperText={errors.portfolioName?.message}
            fullWidth
            {...register("portfolioName")}
          />

          <TextField
            margin="dense"
            select
            id="defaultCurrency"
            label="Default Currency"
            defaultValue={data?.portfolioCurrency} // PortfolioCurrency -> defaultCurrency
            error={!!errors.defaultCurrency}
            helperText={errors.defaultCurrency?.message}
            slotProps={{
              select: {
                native: true,
              }
            }}
            {...register("defaultCurrency", { required: true })}> {/* Not working with Material-UI MenuItem, need to use native*/}
            <option value=""></option>
            <option value="USD">USD</option>
            <option value="HKD">HKD</option>
          </TextField>

          <FormControlLabel
            control={<Checkbox
              id="isVirtual"
              defaultChecked={data?.isVirtual}
              {...register("isVirtual")} />}
            label="Is Virtual?" />
          {errors.isVirtual && <FormHelperText>{errors.isVirtual?.message}</FormHelperText>}

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
  )
}

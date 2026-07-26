import FormControl from "@mui/material/FormControl";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import { Controller, useForm } from "react-hook-form";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import utils from "../../utils/utils";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { postSuccessMessage } from "../../redux/snackbarSlice";
import { IStock } from "../../types/db";
import {
  assetClasses,
  currencies,
  IStockPostDto,
  IStockPutDto,
} from "../../types/api";
import { Grid } from "@mui/system";
import repoStocks from "../../repo/repoStocks";
import { AxiosError } from "axios";

interface IEditFormStockProps {
  onDialogClose: () => void;
  dialogUpdateContent?: IStock | undefined | null;
}

export default function StockEditForm({
  onDialogClose,
  dialogUpdateContent,
}: IEditFormStockProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IStockPutDto | IStockPostDto>({
    defaultValues: {
      key_stockId: dialogUpdateContent?.stockId,
      version: dialogUpdateContent?.version,
    },
  });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const saveMutation = useMutation({
    mutationFn: async (formData: IStockPutDto | IStockPostDto) => {
      const mutationQuery = dialogUpdateContent
        ? repoStocks.Put()
        : repoStocks.Post();
      return {
        response: await mutationQuery.requestFn(formData),
        invalidateQueryKey: mutationQuery.invalidateQueryKey,
      };
    },
    onSuccess: async ({ invalidateQueryKey }) => {
      await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      onDialogClose();
      dispatch(postSuccessMessage(""));
    },
    onError: (error: AxiosError<any>) => {
      utils.setFormErrorFromApiError(error, setError);
    },
  });

  const onDialogSubmit = async (data: IStockPutDto | IStockPostDto) => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onDialogSubmit)}>
      <DialogTitle id="form-dialog-title">
        {!dialogUpdateContent ? "Add" : "Edit"} Stock
      </DialogTitle>
      <DialogContent>
        <FormControl error>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 3 }}>
              <TextField
                id="stockId"
                label="Ticker Id"
                slotProps={{
                  input: { readOnly: !!dialogUpdateContent },
                }}
                defaultValue={dialogUpdateContent?.stockId}
                type="text"
                error={!!errors.stockId}
                helperText={errors.stockId?.message}
                fullWidth
                {...register("stockId", { required: true })}
                autoFocus
              />
            </Grid>

            <Grid size={{ xs: 9 }}>
              <TextField
                id="stockName"
                label="Ticker Name"
                defaultValue={dialogUpdateContent?.stockName}
                type="any"
                error={!!errors.stockName}
                helperText={errors.stockName?.message}
                fullWidth
                {...register("stockName", { required: true })}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                select
                id="currency"
                label="Currency"
                defaultValue={dialogUpdateContent?.currency}
                error={!!errors.currency}
                helperText={errors.currency?.message}
                fullWidth
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                {...register("currency", { required: true })}
              >
                <option value=""></option>
                {currencies.map((currency) => (
                  <option key={currency.display} value={currency.value}>
                    {currency.display}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                select
                id="assetClass"
                label="Asset Class"
                defaultValue={dialogUpdateContent?.assetClass}
                error={!!errors.assetClass}
                helperText={errors.assetClass?.message}
                fullWidth
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                {...register("assetClass")}
              >
                {assetClasses.map((assetClass) => (
                  <option key={assetClass.value} value={assetClass.value}>
                    {assetClass.display}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                control={control}
                name="maturityDate"
                defaultValue={dialogUpdateContent?.maturityDate ?? ""}
                render={({ field }) => (
                  <DatePicker
                    name="maturityDate"
                    label="Maturity Date"
                    format="YYYY-MM-DD"
                    defaultValue={
                      field.value ? dayjs(field.value, "YYYY-MM-DD") : null
                    }
                    slotProps={{
                      textField: {
                        helperText: errors.maturityDate?.message,
                      },
                    }}
                    onChange={(date) => {
                      console.log(date);
                      if (date && date.isValid()) {
                        field.onChange(date.format("YYYY-MM-DD"));
                      } else {
                        field.onChange("");
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                id="coupon"
                label="Coupon"
                defaultValue={dialogUpdateContent?.coupon}
                type="any"
                error={!!errors.coupon}
                helperText={errors.coupon?.message}
                fullWidth
                {...register("coupon")}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                id="couponFreq"
                label="Coupon Frequency"
                defaultValue={dialogUpdateContent?.couponFreq}
                type="any"
                error={!!errors.couponFreq}
                helperText={errors.couponFreq?.message}
                fullWidth
                {...register("couponFreq")}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                id="faceValue"
                label="Face Value"
                defaultValue={dialogUpdateContent?.faceValue}
                type="any"
                error={!!errors.faceValue}
                helperText={errors.faceValue?.message}
                fullWidth
                {...register("faceValue")}
              />
            </Grid>

            {errors.genericErrorMsg && (
              <Grid size={{ xs: 12 }}>
                <FormHelperText id="component-error-text">
                  {errors.genericErrorMsg?.message}
                </FormHelperText>
              </Grid>
            )}
          </Grid>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onDialogClose()} color="primary">
          Cancel
        </Button>
        {/*Note that type=submit for a HTML form*/}
        <Button
          type="submit"
          loading={saveMutation.isPending}
          loadingPosition="start"
          onClick={() => clearErrors()}
          startIcon={<SaveIcon />}
          variant="outlined"
        >
          {!dialogUpdateContent ? "Add" : "Edit"}
        </Button>
      </DialogActions>
    </form>
  );
}

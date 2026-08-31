import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
  IStockPostDtoSchema,
  IStockPutDto,
  IStockPutDtoSchema,
} from "../../types/api";
import { Grid } from "@mui/system";
import repoStocks from "../../repo/repoStocks";
import { AxiosError } from "axios";
import { Dialog } from "@mui/material";

interface IEditFormStockProps {
  onDialogClose: () => void;
  content?: IStock | null;
}

export default function EditFormStock({
  onDialogClose,
  content,
}: IEditFormStockProps) {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<IStockPutDto | IStockPostDto>({
    resolver: yupResolver(content ? IStockPutDtoSchema : IStockPostDtoSchema) as Resolver<IStockPutDto | IStockPostDto>,
    values: content
      ? {
        stockId: content.stockId,
        stockName: content.stockName,
        currency: content.currency,
        assetClass: content.assetClass,
        maturityDate: content.maturityDate ?? "",
        coupon: content.coupon,
        couponFreq: content.couponFreq,
        faceValue: content.faceValue,
        key_stockId: content.stockId,
        version: content.version,
      }
      : {
        stockId: "",
        stockName: "",
        currency: "",
        assetClass: "STOCK",
        maturityDate: "",
        coupon: null,
        couponFreq: null,
        faceValue: null,
        key_stockId: "",
        version: -1,
      },
  });

  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const saveMutation = useMutation({
    mutationFn: async (formData: IStockPutDto | IStockPostDto) => {
      const mutationQuery = content
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
    <Dialog open={true} aria-labelledby="form-dialog-title">
      <form onSubmit={handleSubmit(onDialogSubmit)}>
        <DialogTitle id="form-dialog-title">
          {!content ? "Add" : "Edit"} Stock
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 3 }}>
              <TextField
                id="stockId"
                label="Ticker Id"
                slotProps={{
                  input: { readOnly: !!content },
                }}
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
                type="text"
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
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    if (value === "INVALID_DATE") return "Please enter a valid date";
                    return dayjs(value, "YYYY-MM-DD", true).isValid() || "Invalid date format";
                  },
                }}
                render={({ field: { onChange, ref, value } }) => (
                  <DatePicker
                    label="Maturity Date"
                    format="YYYY-MM-DD"
                    value={value ? dayjs(value) : null}
                    onChange={(date) => {
                      if (date === null) {
                        onChange("");
                      } else if (date.isValid()) {
                        onChange(date.format("YYYY-MM-DD"));
                      } else {
                        onChange("INVALID_DATE");
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.maturityDate,
                        helperText: errors.maturityDate?.message,
                        inputRef: ref,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                id="coupon"
                label="Coupon"
                type="text"
                error={!!errors.coupon}
                helperText={errors.coupon?.message}
                fullWidth
                {...register("coupon", {
                  setValueAs: (value) => (value === "" || value === null ? null : Number(value)),
                })}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                id="couponFreq"
                label="Coupon Frequency"
                type="text"
                error={!!errors.couponFreq}
                helperText={errors.couponFreq?.message}
                fullWidth
                {...register("couponFreq", {
                  setValueAs: (value) => (value === "" || value === null ? null : Number(value)),
                })}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                id="faceValue"
                label="Face Value"
                type="text"
                error={!!errors.faceValue}
                helperText={errors.faceValue?.message}
                fullWidth
                {...register("faceValue", {
                  setValueAs: (value) => (value === "" || value === null ? null : Number(value)),
                })}
              />
            </Grid>

            {errors.genericErrorMsg && (
              <Grid size={{ xs: 12 }}>
                <FormHelperText error id="component-error-text">
                  {errors.genericErrorMsg?.message}
                </FormHelperText>
              </Grid>
            )}
          </Grid>
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
            startIcon={<SaveIcon />}
            variant="outlined"
          >
            {!content ? "Add" : "Edit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

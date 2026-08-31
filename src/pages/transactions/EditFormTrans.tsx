import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import utils from "../../utils/utils";
import { postSuccessMessage, postInfoMessage } from "../../redux/snackbarSlice";
import { Grid, FormControlLabel, Checkbox, Dialog } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { IApiActionResult, ITransactionGetDto, ITransactionPostDtoSchema, ITransactionPutDto, ITransactionPutDtoSchema } from "../../types/api";
import { ITransactionPostDto, txTypes } from "../../types/api";
import repoPortfolio from "../../repo/repoPortfolio";
import repoStockTransaction from "../../repo/repoStockTransaction";
import { AxiosError } from "axios";

interface IEditFormTransProps {
  onDialogClose: () => void;
  content: ITransactionGetDto | null;
  defaultPortfolioId?: string;
  defaultStockId?: string;
  isAllowClone: boolean;
}

export default function EditFormTrans({
  onDialogClose,
  content,
  defaultPortfolioId,
  defaultStockId,
  isAllowClone,
}: IEditFormTransProps) {
  const {
    control,
    register,
    watch,
    handleSubmit,
    setError,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ITransactionPostDto | ITransactionPutDto>({
    resolver: yupResolver(content ? ITransactionPutDtoSchema : ITransactionPostDtoSchema) as Resolver<
      ITransactionPostDto | ITransactionPutDto
    >,
    values: content
      ? {
        version: content.version,
        portfolioId: content.portfolioId,
        iden: content.iden,
        stockId: content.stockId,
        isTransfer: content.isTransfer,
        tranType: content.tranType,
        txCount: content.txCount,
        unitAmt: content.unitAmt,
        txAmount:
          content.unitAmt !== null && content.txCount !== null
            ? utils.round2Dec(content.unitAmt * content.txCount, 6)
            : null,
        txDate: content.txDate ?? dayjs().format("YYYY-MM-DD"),
        ytm: content.ytm,
        accruedInterest: content.accruedInterest,
        handlingFee: content.handlingFee,
        tax: content.tax,
        comment: content.comment,
      }
      : {
        version: -1,
        portfolioId: defaultPortfolioId ?? "",
        iden: -1,
        stockId: defaultStockId ?? "",
        isTransfer: false,
        tranType: "BUY",
        txCount: null,
        unitAmt: null,
        txAmount: null,
        txDate: dayjs().format("YYYY-MM-DD"),
        ytm: null,
        accruedInterest: null,
        handlingFee: null,
        tax: null,
        comment: "",
      },
  });
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const watchStockId = watch("stockId", "");
  const saveMutation = useMutation({
    mutationFn: async ({
      formData,
      isPost,
    }: {
      formData: ITransactionPostDto | ITransactionPutDto;
      isPost: boolean;
    }) => {
      const mutationQuery = isPost
        ? repoStockTransaction.Post()
        : repoStockTransaction.Put();
      return {
        response: await mutationQuery.requestFn(formData),
        invalidateQueryKeys: mutationQuery.invalidateQueryKeys,
      };
    },
    onSuccess: async ({ invalidateQueryKeys }) => {
      await Promise.all(
        invalidateQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
      onDialogClose();
      dispatch(postSuccessMessage(""));
    },
    onError: (error: AxiosError<IApiActionResult<ITransactionPostDto | ITransactionPutDto>>) => {
      utils.setFormErrorFromApiError(error, setError);
    },
  });

  const { data: posData } = useQuery({
    ...repoPortfolio.GetPositions({ portfolioId: defaultPortfolioId }),
    enabled: defaultPortfolioId !== undefined,
  });

  let openPosQty = null;
  if (posData !== undefined) {
    openPosQty = posData.find(
      (s) => s.stockId === (content?.stockId ?? watchStockId),
    )?.quantity;
  }

  const onDialogSubmit = async (data: ITransactionPostDto | ITransactionPutDto) => {
    const isPost = content === null || data.isClone === true;
    await saveMutation.mutateAsync({ formData: data, isPost });
  };

  return (
    <Dialog open={true} aria-labelledby="form-dialog-title">
      <form onSubmit={handleSubmit(onDialogSubmit)}>
        <DialogTitle id="form-dialog-title">
          {!content ? "Add" : "Edit"} Transaction
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12 }}>
              <input
                type="hidden"
                {...register("portfolioId")}
              ></input>
              <input
                type="hidden"
                {...register("iden")}
              ></input>
            </Grid>

            <Grid size={{ xs: 12 }}>
              {/*name: Form submit name | autoFocus: Focus when mount | type: HTML Type */}
              <TextField
                id="stockId"
                label="Ticker Id"
                slotProps={{
                  input: { readOnly: content !== null },
                }}
                type="text"
                error={Boolean(errors.stockId)}
                helperText={errors.stockId?.message}
                fullWidth
                {...register("stockId", { required: true })}
                autoFocus
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                id="txType"
                label="Type"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                error={Boolean(errors.tranType)}
                helperText={errors.tranType?.message}
                fullWidth
                {...register("tranType")}
              >
                {" "}
                {/* Not working with Material-UI MenuItem, need to use native*/}
                {txTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.display}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                id="txCount"
                label="Count"
                error={Boolean(errors.txCount)}
                helperText={errors.txCount?.message}
                fullWidth
                {...register("txCount", { required: true })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                id="txPrice"
                label="Price"
                error={Boolean(errors.unitAmt)}
                helperText={errors.unitAmt?.message}
                fullWidth
                {...register("unitAmt", { required: true })}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                id="txAmount"
                label="Amount (Ref Only)"
                error={Boolean(errors.txAmount)}
                helperText={errors.txAmount?.message}
                fullWidth
                {...register("txAmount")}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                control={control}
                name="txDate"
                render={({ field }) => (
                  <DatePicker
                    label="Transaction Date"
                    format="YYYY-MM-DD"
                    defaultValue={dayjs(field.value, "YYYY-MM-DD")}
                    slotProps={{
                      textField: {
                        helperText: errors.txDate?.message,
                      },
                    }}
                    onChange={(date) => {
                      if (date !== null && date.isValid()) {
                        field.onChange(date.format("YYYY-MM-DD"));
                      }
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="ytm"
                label="YTM"
                error={Boolean(errors.ytm)}
                helperText={errors.ytm?.message}
                fullWidth
                {...register("ytm")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="accruedInterest"
                label="Accrued Interest"
                error={Boolean(errors.accruedInterest)}
                helperText={errors.accruedInterest?.message}
                fullWidth
                {...register("accruedInterest")}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                id="handlingFee"
                label="Handling Fee"
                error={Boolean(errors.handlingFee)}
                helperText={errors.handlingFee?.message}
                fullWidth
                {...register("handlingFee")}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                id="tax"
                label="Tax"
                error={Boolean(errors.tax)}
                helperText={errors.tax?.message}
                fullWidth
                {...register("tax")}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="isTransfer"
                      defaultChecked={content?.isTransfer}
                      {...register("isTransfer")}
                    />
                  }
                  label="Is Transfer?"
                />
                {errors.isTransfer && (
                  <FormHelperText>
                    {errors.isTransfer?.message}
                  </FormHelperText>
                )}
              </FormGroup>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                id="comment"
                label="Comment"
                type="text"
                error={Boolean(errors.comment)}
                helperText={errors.comment?.message}
                fullWidth
                {...register("comment")}
              />
            </Grid>

            {openPosQty !== null && (
              <Grid size={{ xs: 12 }}>
                <FormHelperText error={false} id="component-info-text">
                  Open Position: {openPosQty}
                </FormHelperText>
              </Grid>
            )}

            {errors.genericErrorMsg && (
              <Grid size={{ xs: 12 }}>
                <FormHelperText id="component-error-text">
                  {errors.genericErrorMsg?.message}
                </FormHelperText>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: 3 }}>
          <Button
            onClick={() => {
              const formVals = getValues();
              if (
                !formVals.txAmount &&
                !!formVals.txCount &&
                !!formVals.unitAmt
              ) {
                setValue(
                  "txAmount",
                  utils.round2Dec(formVals.txCount * formVals.unitAmt, 6),
                );
              } else if (
                !!formVals.txAmount &&
                !formVals.txCount &&
                !!formVals.unitAmt
              ) {
                setValue(
                  "txCount",
                  utils.round2Dec(formVals.txAmount / formVals.unitAmt, 6),
                );
              } else if (
                !!formVals.txAmount &&
                !!formVals.txCount &&
                !formVals.unitAmt
              ) {
                setValue(
                  "unitAmt",
                  utils.round2Dec(formVals.txAmount / formVals.txCount, 6),
                );
              } else {
                dispatch(postInfoMessage(`No field is empty`));
              }
            }}
            color="primary"
          >
            Cal
          </Button>
          <Button onClick={() => onDialogClose()} color="primary">
            Cancel
          </Button>
          {/*Note that type=submit for a HTML form*/}
          {content !== null && isAllowClone && (
            <Button
              type="submit"
              loading={saveMutation.isPending}
              loadingPosition="start"
              onClick={() => {
                setValue("isClone", true);
              }}
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              Clone
            </Button>
          )}

          {/*content.iden === -1 when it is called from RealisedDividend Form*/}
          {content?.iden !== -1 && (
            <Button
              type="submit"
              loading={saveMutation.isPending}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
            >
              {!content ? "Add" : "Edit"}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

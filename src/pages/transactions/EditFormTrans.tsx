import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import { Controller, useForm } from "react-hook-form";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux'
import utils from '../../utils/utils';
import {
    postSuccessMessage,
    postInfoMessage,
} from '../../redux/snackbarSlice';
import { Grid, FormControlLabel, Checkbox, Dialog } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ITransactionGetDto } from "../../types/api";
import { ITransactionPostDto, txTypes } from "../../types/api";
import repoPortfolio from '../../repo/repoPortfolio';
import { IHookError } from '../../types/api';
import repoStockTransaction from '../../repo/repoStockTransaction';


interface IEditFormTransProps {
    onDialogClose: () => void;
    content: ITransactionGetDto | null;
    defaultPortfolioId?: string | undefined;
    defaultStockId?: string | undefined;
    isAllowClone: boolean;
}

export default function EditFormTrans({ onDialogClose, content, defaultPortfolioId, defaultStockId, isAllowClone }: IEditFormTransProps) {
    const { control, register, watch, handleSubmit, setError, clearErrors, getValues, setValue, formState: { errors } } = useForm<ITransactionPostDto>({
        defaultValues: {
            version: content?.version
        }});
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const watchStockId = watch("stockId", "")

    const { data: posData } = useQuery(
        {
            ...repoPortfolio.GetPositions({ portfolioId: defaultPortfolioId }),
            enabled: defaultPortfolioId !== undefined,
        }
    );

    let openPosQty = null;
    if (posData !== undefined) {
        openPosQty = posData.find((s) => s.stockId === (content?.stockId ?? watchStockId))?.quantity;
    }

    const onDialogSubmit = async (data: ITransactionPostDto) => {
        setIsSaving(true)

        const isPost = content === null || data.isClone;
        const response = await utils.requestWithToken(
            isPost ? 'POST' : 'PUT',
            (isPost ? repoStockTransaction.Post() : repoStockTransaction.Put()).baseUrl,
            data
        );

        setIsSaving(false)

        if (response.status !== 200) {
            const actionResult = await response.data;

            if (actionResult.hookErrors?.length > 0) {
                actionResult.hookErrors.forEach((hookError: IHookError<ITransactionPostDto>) => {
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
            (isPost ? repoStockTransaction.Post() : repoStockTransaction.Put()).invalidateQueryKeys.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey })
            });
            onDialogClose();
            dispatch(postSuccessMessage(""))
        }
    };

    return (
        <Dialog open={true} aria-labelledby="form-dialog-title">
            <form onSubmit={handleSubmit(onDialogSubmit)}>
                <DialogTitle id="form-dialog-title">{content === null ? "Add" : "Edit"} Transaction</DialogTitle>
                <DialogContent>
                    <FormControl error>
                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12 }}>
                                <input type="hidden" {...register('portfolioId')} value={defaultPortfolioId ? defaultPortfolioId : content?.portfolioId}></input>
                                <input type="hidden" {...register('iden')} value={content?.iden}></input>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                {/*name: Form submit name | autoFocus: Focus when mount | type: HTML Type */}
                                <TextField
                                    id="stockId"
                                    label="Ticker Id"
                                    slotProps={{
                                        input: { readOnly: content !== null }
                                    }}
                                    defaultValue={content?.stockId ?? defaultStockId}
                                    type="text"
                                    error={Boolean(errors.stockId)}
                                    helperText={errors.stockId?.message}
                                    fullWidth
                                    {...register("stockId", { required: true })}
                                    autoFocus />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <TextField
                                    select
                                    id="txType"
                                    label="Type"
                                    defaultValue={content === null ? "BUY" : content.tranType}
                                    slotProps={{
                                        select: {
                                            native: true,
                                        }
                                    }}
                                    error={Boolean(errors.tranType)}
                                    helperText={errors.tranType?.message}
                                    fullWidth
                                    {...register("tranType")}> {/* Not working with Material-UI MenuItem, need to use native*/}

                                    {
                                        txTypes.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.display}
                                            </option>
                                        ))
                                    }
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <Controller
                                    control={control}
                                    name="txCount"
                                    defaultValue={content ? content.txCount : null}
                                    render={({ field }) => (
                                        <TextField
                                            id="txCount"
                                            label="Count"
                                            value={field.value}
                                            type="any"
                                            error={Boolean(errors.txCount)}
                                            helperText={errors.txCount?.message}
                                            fullWidth
                                            {...register("txCount", { required: true })} />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <Controller
                                    control={control}
                                    name="unitAmt"
                                    defaultValue={content ? content.unitAmt : null}
                                    render={({ field }) => (
                                        <TextField
                                            id="txPrice"
                                            label="Price"
                                            value={field.value}
                                            type="any"
                                            error={Boolean(errors.unitAmt)}
                                            helperText={errors.unitAmt?.message}
                                            fullWidth
                                            {...register("unitAmt", { required: true })} />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 3 }}>
                                <Controller
                                    control={control}
                                    name="txAmount"
                                    defaultValue={
                                        content !== null &&
                                            content?.unitAmt !== null &&
                                            content?.txCount !== null ?
                                            content?.unitAmt * content?.txCount :
                                            null}
                                    render={({ field }) => (
                                        <TextField
                                            id="txAmount"
                                            label="Amount (Ref Only)"
                                            value={field.value}
                                            type="any"
                                            error={Boolean(errors.txAmount)}
                                            helperText={errors.txAmount?.message}
                                            fullWidth
                                            {...register("txAmount")} />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Controller
                                    control={control}
                                    name="txDate"
                                    defaultValue={content ? content.txDate : dayjs().format("YYYY-MM-DD")}
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
                                                    field.onChange(date.format('YYYY-MM-DD'));
                                                }
                                            }} />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    id="ytm"
                                    label="YTM"
                                    defaultValue={content?.ytm}
                                    type="any"
                                    error={Boolean(errors.ytm)}
                                    helperText={errors.ytm?.message}
                                    fullWidth
                                    {...register("ytm")} />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    id="accruedInterest"
                                    label="Accrued Interest"
                                    defaultValue={content?.accruedInterest}
                                    type="any"
                                    error={Boolean(errors.accruedInterest)}
                                    helperText={errors.accruedInterest?.message}
                                    fullWidth
                                    {...register("accruedInterest")} />
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    id="handlingFee"
                                    label="Handling Fee"
                                    defaultValue={content?.handlingFee}
                                    type="any"
                                    error={Boolean(errors.handlingFee)}
                                    helperText={errors.handlingFee?.message}
                                    fullWidth
                                    {...register("handlingFee")} />
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    id="tax"
                                    label="Tax"
                                    defaultValue={content?.tax}
                                    type="any"
                                    error={Boolean(errors.tax)}
                                    helperText={errors.tax?.message}
                                    fullWidth
                                    {...register("tax")} />
                            </Grid>

                            <Grid size={{ xs: 6 }}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={<Checkbox
                                            id="isTransfer"
                                            defaultChecked={content?.isTransfer}
                                            {...register("isTransfer")} />}
                                        label="Is Transfer?" />
                                    {errors.isTransfer && <FormHelperText>{errors.isTransfer?.message}</FormHelperText>}
                                </FormGroup>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    id="comment"
                                    label="Comment"
                                    defaultValue={content?.comment}
                                    type="text"
                                    error={Boolean(errors.comment)}
                                    helperText={errors.comment?.message}
                                    fullWidth
                                    {...register("comment")} />
                            </Grid>

                            {openPosQty !== null &&
                                <Grid size={{ xs: 12 }}>
                                    <FormHelperText error={false} id="component-info-text">Open Position: {openPosQty}</FormHelperText>
                                </Grid>
                            }

                            {errors.genericErrorMsg &&
                                <Grid size={{ xs: 12 }}>
                                    <FormHelperText id="component-error-text">{errors.genericErrorMsg?.message}</FormHelperText>
                                </Grid>
                            }

                        </Grid>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ padding: 3 }}>
                    <Button onClick={() => {
                        const formVals = getValues();
                        if (!formVals.txAmount && !!formVals.txCount && !!formVals.unitAmt) {
                            setValue("txAmount", utils.round2Dec(formVals.txCount * formVals.unitAmt, 6));
                        } else if (!!formVals.txAmount && !formVals.txCount && !!formVals.unitAmt) {
                            setValue("txCount", utils.round2Dec(formVals.txAmount / formVals.unitAmt, 6));
                        } else if (!!formVals.txAmount && !!formVals.txCount && !formVals.unitAmt) {
                            setValue("unitAmt", utils.round2Dec(formVals.txAmount / formVals.txCount, 6));
                        } else {
                            dispatch(postInfoMessage(`No field is empty`));
                        }

                    }
                    } color="primary">Cal</Button>
                    <Button onClick={() => onDialogClose()} color="primary">Cancel</Button>
                    {/*Note that type=submit for a HTML form*/}
                    {content !== null && isAllowClone &&
                        <Button
                            type="submit"
                            loading={isSaving}
                            loadingPosition="start"
                            onClick={
                                () => {
                                    setValue("isClone", true);
                                    clearErrors();
                                }
                            }
                            startIcon={<SaveIcon />}
                            variant='outlined'
                        >
                            Clone
                        </Button>}

                    {/*content.iden === -1 when it is called from RealisedDividend Form*/}
                    {content?.iden !== -1 &&
                        <Button
                            type="submit"
                            loading={isSaving}
                            loadingPosition="start"
                            onClick={() => clearErrors()}
                            startIcon={<SaveIcon />}
                            variant='outlined'
                        >
                            {content === null ? "Add" : "Edit"}
                        </Button>
                    }
                </DialogActions>
            </form>
        </Dialog>
    );
}
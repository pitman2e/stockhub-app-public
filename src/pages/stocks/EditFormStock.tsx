import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import TextField from '@mui/material/TextField';
import { Controller, useForm } from "react-hook-form";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux'
import utils from '../../utils/utils';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    postSuccessMessage,
} from '../../redux/snackbarSlice';
import { IHookError } from '../../types/api';
import { IStock } from '../../types/db';
import { IStockPostDto } from "../../types/api";
import { IStockPutDto } from "../../types/api";
import { Grid } from '@mui/system';
import repoStocks from '../../repo/repoStocks';

interface IEditFormStockProps {
    onDialogClose: () => void;
    dialogUpdateContent?: IStock | undefined | null;
}

export default function StockEditForm({ onDialogClose, dialogUpdateContent }: IEditFormStockProps) {
    const { control, register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<IStockPutDto | IStockPostDto>({
        defaultValues: {
            key_stockId: dialogUpdateContent?.stockId,
            version: dialogUpdateContent?.version
        }
    });
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();
    const baseDataAPI = 'api/Stocks/'
    const dispatch = useDispatch();

    const onDialogSubmit = async (data: IStockPutDto | IStockPostDto) => {
        setIsSaving(true)

        const response = await utils.requestWithToken(dialogUpdateContent ? 'PUT' : 'POST', baseDataAPI, data);

        setIsSaving(false)

        if (response.status !== 200) {
            const actionResult = await response.data;

            if (actionResult.hookErrors?.length > 0) {
                actionResult.hookErrors.forEach((hookError: IHookError<IStockPutDto | IStockPostDto>) => {
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
            queryClient.invalidateQueries({ queryKey: repoStocks.Get().invalidateQueryKey });
            onDialogClose();
            dispatch(postSuccessMessage(""))
        }
    };

    return (
        <form onSubmit={handleSubmit(onDialogSubmit)}>
            <DialogTitle id="form-dialog-title">{!dialogUpdateContent ? "Add" : "Edit"} Stock</DialogTitle>
            <DialogContent>
                <FormControl error>
                    <Grid container spacing={1.5}>
                        <Grid size={{ xs: 3 }}>
                            <TextField
                                id="stockId"
                                label="Ticker Id"
                                slotProps={{
                                    input: { readOnly: !!dialogUpdateContent }
                                }}
                                defaultValue={dialogUpdateContent?.stockId}
                                type="text"
                                error={!!errors.stockId}
                                helperText={errors.stockId?.message}
                                fullWidth
                                {...register("stockId", { required: true })}
                                autoFocus />
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
                                {...register("stockName", { required: true })} />
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
                                    }
                                }}
                                {...register("currency", { required: true })}>
                                <option value=""></option>
                                <option value="USD">USD</option>
                                <option value="HKD">HKD</option>
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
                                    }
                                }}
                                {...register("assetClass")}>
                                <option value="STOCK">Stock</option>
                                <option value="BOND">Bond</option>
                                <option value="MANUAL">Manual</option>
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
                                        defaultValue={field.value ? dayjs(field.value, "YYYY-MM-DD") : null}
                                        slotProps={{
                                            textField: {
                                                helperText: errors.maturityDate?.message,
                                            },
                                        }}
                                        onChange={(date) => {
                                            console.log(date)
                                            if (date && date.isValid()) {
                                                field.onChange(date.format('YYYY-MM-DD'));
                                            } else {
                                                field.onChange("");
                                            }
                                        }} />
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
                                {...register("coupon")} />
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
                                {...register("couponFreq")} />
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
                                {...register("faceValue")} />
                        </Grid>

                        {errors.genericErrorMsg &&
                            <Grid size={{ xs: 12 }}>
                                <FormHelperText id="component-error-text">{errors.genericErrorMsg?.message}</FormHelperText>
                            </Grid>
                        }

                    </Grid>
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
                    {!dialogUpdateContent ? "Add" : "Edit"}
                </Button>

            </DialogActions>
        </form >
    );
}

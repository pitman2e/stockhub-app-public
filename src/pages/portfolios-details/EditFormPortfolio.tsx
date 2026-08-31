import FormControl from "@mui/material/FormControl";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { Controller, type Resolver, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InferType, object, string } from "yup";
import { useEffect } from "react";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import { useDispatch } from "react-redux";
import * as utils from "../../utils/utils";
import { postSuccessMessage } from "../../redux/snackbarSlice";
import { currencies, IApiActionResult, IPortfolioPostDto, IPortfolioPostDtoSchema } from "../../types/api";
import { Checkbox, Dialog, FormControlLabel } from "@mui/material";
import { IStockSummary } from "../../types/api";
import { IStockPortfolio } from "../../types/db";
import repoPortfolio from "../../repo/repoPortfolio";
import ApiRequestAdapter from "../../adapters/apiRequestAdapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface IEditFormPortfolioProps {
  onDialogClose: () => void;
  data: IStockSummary | null;
  availablePortfolios: IStockPortfolio[];
}

const IEditFormPortfolioSchema = IPortfolioPostDtoSchema.concat(
  object({ selectedPortfolioId: string().defined() }),
);

type IEditFormPortfolioData = InferType<typeof IEditFormPortfolioSchema>;

function getDefaultValues(data: IStockSummary | null): IEditFormPortfolioData {
  return data ? {
    portfolioId: data.portfolio.portfolioId,
    portfolioName: data.portfolio.name,
    defaultCurrency: data.portfolio.defaultCurrency,
    priority: data.portfolio.priority,
    isVirtual: data.portfolio.isVirtual,
    version: data.portfolio.version,
    childPortfolioIds: data.childPortfolioIds ?? [],
    selectedPortfolioId: "",
  } : {
    portfolioId: "",
    portfolioName: "",
    defaultCurrency: "",
    priority: 0,
    isVirtual: false,
    version: -1,
    childPortfolioIds: [],
    selectedPortfolioId: "",
  };
}

export default function EditFormPortfolio({
  onDialogClose,
  data,
  availablePortfolios,
}: IEditFormPortfolioProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<IEditFormPortfolioData>({
    resolver: yupResolver(IEditFormPortfolioSchema) as Resolver<IEditFormPortfolioData>,
    defaultValues: getDefaultValues(data),
  });
  const isVirtual = useWatch({ control, name: "isVirtual" });
  const childPortfolioIds = useWatch({ control, name: "childPortfolioIds" }) ?? [];

  useEffect(() => {
    reset(getDefaultValues(data));
  }, [data, reset]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (formData: IPortfolioPostDto) => {
      const mutationQuery = ApiRequestAdapter.mutationOptions(data ? repoPortfolio.Put() : repoPortfolio.Post());
      return {
        response: await mutationQuery.requestFn(formData),
        invalidateQueryKey: mutationQuery.invalidateQueryKey,
      };
    },
    onSuccess: async ({ invalidateQueryKey }) => {
      await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      dispatch(postSuccessMessage(""));
      onDialogClose();
    },
    onError: (error: AxiosError<IApiActionResult>) => {
      utils.setFormErrorFromApiError(error, setError);
    },
  });

  const onDialogSubmit = async (formData: IEditFormPortfolioData) => {
    const { selectedPortfolioId: _selectedPortfolioId, ...portfolioData } = formData;
    await saveMutation.mutateAsync({
      ...portfolioData,
      childPortfolioIds: portfolioData.isVirtual ? portfolioData.childPortfolioIds : [],
    });
  };

  return (
    <Dialog open={true} aria-labelledby="form-dialog-title">
      <form onSubmit={handleSubmit(onDialogSubmit)}>
        <DialogTitle id="form-dialog-title">
          {!data ? "Add" : "Edit"} Portfolio
        </DialogTitle>
        <DialogContent>
          <FormControl error>
            <TextField
              autoFocus
              disabled={data !== null}
              margin="dense"
              id="portfolioId"
              label="Portfolio Id"
              error={!!errors.portfolioId}
              helperText={errors.portfolioId?.message}
              fullWidth
              {...register("portfolioId")}
            />

            <TextField
              margin="dense"
              id="portfolioName"
              label="Portfolio Name"
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
              error={!!errors.defaultCurrency}
              helperText={errors.defaultCurrency?.message}
              slotProps={{
                select: {
                  native: true,
                },
              }}
              {...register("defaultCurrency", { required: true })}
            >
              {" "}
              {/* Not working with Material-UI MenuItem, need to use native*/}
              <option value=""></option>
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.display}
                </option>
              ))}
            </TextField>

            <TextField
              margin="dense"
              id="priority"
              label="Sort Sequence"
              error={!!errors.priority}
              helperText={errors.priority?.message}
              fullWidth
              {...register("priority", {
                setValueAs: (value) => (value === "" || value === null ? null : Number(value)),
              })}
            />

            <Controller
              name="isVirtual"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={!!value}
                      onChange={(e) => onChange(e.target.checked)}
                    />
                  }
                  label="Is Virtual?"
                />
              )}
            />

            {isVirtual && (
              <>
                <Controller
                  name="selectedPortfolioId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      margin="dense"
                      id="childPortfolioToAdd"
                      label="Add Portfolio"
                      value={field.value}
                      onBlur={field.onBlur}
                      name={field.name}
                      inputRef={field.ref}
                      onChange={(event) => {
                        const childPortfolioId = event.target.value;
                        if (childPortfolioId) {
                          setValue(
                            "childPortfolioIds",
                            [...getValues("childPortfolioIds"), childPortfolioId],
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }
                        field.onChange("");
                      }}
                      slotProps={{ select: { native: true } }}
                    >
                      <option value=""></option>
                      {availablePortfolios
                        .filter((portfolio) => !portfolio.isVirtual)
                        .filter((portfolio) => portfolio.portfolioId !== data?.portfolio.portfolioId)
                        .filter((portfolio) => !childPortfolioIds.includes(portfolio.portfolioId))
                        .map((portfolio) => (
                          <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                            {portfolio.name}
                          </option>
                        ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="childPortfolioIds"
                  control={control}
                  render={({ field }) => (
                    <div>
                      {field.value.map((portfolioId) => {
                        const portfolio = availablePortfolios.find((item) => item.portfolioId === portfolioId);
                        return (
                          <Chip
                            key={portfolioId}
                            label={portfolio?.name ?? portfolioId}
                            onDelete={() => field.onChange(field.value.filter((id) => id !== portfolioId))}
                            sx={{ mr: 0.5, mt: 0.5 }}
                          />
                        );
                      })}
                    </div>
                  )}
                />
              </>
            )}

            {errors.isVirtual && (
              <FormHelperText>{errors.isVirtual?.message}</FormHelperText>
            )}

            <FormHelperText error id="component-error-text">
              {errors.genericErrorMsg?.message}
            </FormHelperText>
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
            {!data ? "Add" : "Edit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

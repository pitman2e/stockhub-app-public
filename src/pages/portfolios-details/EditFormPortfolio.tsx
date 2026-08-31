import FormControl from "@mui/material/FormControl";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import { useDispatch } from "react-redux";
import utils from "../../utils/utils";
import { postSuccessMessage } from "../../redux/snackbarSlice";
import { currencies, IPortfolioPostDto, IPortfolioPostDtoSchema } from "../../types/api";
import { Checkbox, Dialog, FormControlLabel } from "@mui/material";
import { IStockSummary } from "../../types/api";
import repoPortfolio from "../../repo/repoPortfolio";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface IEditFormPortfolioProps {
  onDialogClose: () => void;
  data: IStockSummary | null;
}

export default function EditFormPortfolio({
  onDialogClose,
  data,
}: IEditFormPortfolioProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<IPortfolioPostDto>({
    resolver: yupResolver(IPortfolioPostDtoSchema) as Resolver<IPortfolioPostDto>,
    defaultValues: data ? {
      portfolioId: data.portfolioId,
      portfolioName: data.portfolioName,
      defaultCurrency: data.portfolioCurrency,
      priority: data.priority,
      isVirtual: data.isVirtual,
      version: data.version,
    } : {
      portfolioId: "",
      portfolioName: "",
      defaultCurrency: "",
      priority: 0,
      isVirtual: false,
      version: -1,
    },
  });
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (formData: IPortfolioPostDto) => {
      const mutationQuery = data ? repoPortfolio.Put() : repoPortfolio.Post();
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
    onError: (error: AxiosError<any>) => {
      utils.setFormErrorFromApiError(error, setError);
    },
  });

  const onDialogSubmit = async (data: IPortfolioPostDto) => {
    await saveMutation.mutateAsync(data);
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
              {...register("priority")}
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

            {errors.isVirtual && (
              <FormHelperText>{errors.isVirtual?.message}</FormHelperText>
            )}

            <FormHelperText id="component-error-text">
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

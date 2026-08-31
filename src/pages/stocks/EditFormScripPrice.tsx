import FormControl from "@mui/material/FormControl";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import { type Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import { useDispatch } from "react-redux";
import utils from "../../utils/utils";
import { postSuccessMessage } from "../../redux/snackbarSlice";
import { IBaseDto, IStockDividend } from "../../types/db";
import { IDividendPutDto, IDividendPutDtoSchema } from "../../types/api";
import repoDividend from "../../repo/repoDividend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Dialog } from "@mui/material";

interface IEditFormScripPriceProps {
  onDialogClose: (data?: IDividendPutDto) => void;
  data: IStockDividend | null;
}

export default function EditFormScripPrice({
  onDialogClose,
  data,
}: IEditFormScripPriceProps) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IDividendPutDto & IBaseDto>({
    resolver: yupResolver(IDividendPutDtoSchema) as Resolver<IDividendPutDto & IBaseDto>,
  });
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (formData: IDividendPutDto & IBaseDto) => ({
      response: await repoDividend.Put().requestFn(formData),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: repoDividend.Get().invalidateQueryKey,
      });
      dispatch(postSuccessMessage(""));
      onDialogClose(saveMutation.variables);
    },
    onError: (error: AxiosError<any>) => {
      utils.setFormErrorFromApiError(error, setError);
    },
  });

  const onDialogSubmit = async (data: IDividendPutDto & IBaseDto) => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <Dialog open={true} aria-labelledby="form-dialog-title">
      <form onSubmit={handleSubmit(onDialogSubmit)}>
        <DialogTitle id="form-dialog-title">
          {!data ? "Add" : "Edit"} Scrip
        </DialogTitle>
        <DialogContent>
          <FormControl error>
            <input
              type="hidden"
              {...register("dividendId")}
              value={data?.dividendId ?? undefined}
            ></input>

            <TextField
              margin="dense"
              id="scripPrice"
              label="Scrip Conversion Price"
              defaultValue={data?.scripPrice}
              error={!!errors.scripPrice?.message}
              helperText={errors.scripPrice?.message}
              fullWidth
              {...register("scripPrice")}
            />

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

import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import utils from "../../utils/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import repoTags from "../../repo/repoTags";
import {
  DefaultErrorPlaceholder,
  DefaultPaper,
} from "../../components/DefaultComponents";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useDispatch } from "react-redux";
import {
  postErrorMessage,
  postSuccessMessage,
} from "../../redux/snackbarSlice";
import { useForm } from "react-hook-form";
import { ITagCsvPostDto } from "../../types/api";
import { AxiosError } from "axios";

interface IMTagsProps {
  category: string;
  onDialogClose: () => void;
}

export function MTags({ category, onDialogClose }: IMTagsProps) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: async (dto: ITagCsvPostDto) => {
      const postQuery = repoTags.Post();
      return {
        response: await postQuery.requestFn(dto),
        invalidateQueryKey: postQuery.invalidateQueryKey,
      };
    },
    onSuccess: async ({ invalidateQueryKey }) => {
      await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      dispatch(postSuccessMessage(""));
      onDialogClose();
    },
    onError: (error: AxiosError<any>) => {
      dispatch(postErrorMessage(utils.getApiErrorMessage(error)));
    },
  });
  const tagQuery = repoTags.Get({ category });
  const { data, isError, isPending, isSuccess, error } = useQuery(tagQuery);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ITagCsvPostDto>({
    values: {
      category: category,
      csv: data ?? "",
    },
  });

  const onDialogSubmit = async (data: ITagCsvPostDto) => {
    await saveMutation.mutateAsync(data);
  };

  return (
    //Using slotProps.paper to turn the Paper component into the <form> avoids long layout issues
    <Dialog
      open={true}
      slotProps={{
        paper: {
          component: "form",
          onSubmit: handleSubmit(onDialogSubmit),
          sx: { minWidth: 600 },
        },
      }}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">
        {!data ? "Add" : "Edit"} {"Tags " + category}
      </DialogTitle>

      {isPending && <DefaultPaper>Loading</DefaultPaper>}
      {isError && (
        <DefaultPaper>
          <DefaultErrorPlaceholder errorMsg={utils.getErrorMessage(error)} />
        </DefaultPaper>
      )}
      {isSuccess && (
        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
              <TextField id="csv" fullWidth multiline {...register("csv")} />
            </Grid>
          </Grid>
        </DialogContent>
      )}

      <DialogActions>
        {isSuccess && (
          <Button
            type="submit"
            loading={saveMutation.isPending}
            aria-label="edit"
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        )}
        <Button
          variant="outlined"
          aria-label="cancel"
          color="primary"
          onClick={() => {
            onDialogClose();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

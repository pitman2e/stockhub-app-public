import React from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import utils from '../../utils/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import repoTags from '../../repo/repoTags';
import { DefaultErrorPlaceholder, DefaultPaper } from '../../components/DefaultComponents';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useDispatch } from 'react-redux'
import {
  postErrorMessage,
  postSuccessMessage,
} from '../../redux/snackbarSlice';

interface IMTagsProps {
  category: string | null,
  onDialogClose: () => void;
}

export function MTags({ category, onDialogClose }: IMTagsProps) {
  const dispatch = useDispatch();
  const [csv, setCsv] = React.useState('');
  const queryClient = useQueryClient();
  const tagQuery = repoTags.Get({ category });
  const { data, isError, isPending, isSuccess, error } = useQuery(tagQuery);

  return (
    <Dialog slotProps={{
      paper: { sx: { minWidth: 600 } }
    }}
      open={true} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{data === null ? "Add" : "Edit"} {"Tags " + category}</DialogTitle>

      {isPending && <DefaultPaper>Loading</DefaultPaper>}
      {isError && <DefaultPaper><DefaultErrorPlaceholder errorMsg={utils.getErrorMessage(error)} /></DefaultPaper>}
      {isSuccess &&
        <DialogContent>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12 }}>
              <TextField
                id='csv'
                fullWidth
                multiline
                defaultValue={data}
                onChange={(event) => {
                  setCsv(event.target.value);
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
      }

      <DialogActions>
        {isSuccess &&
          <Button
            variant="contained"
            aria-label="edit"
            color="primary"
            onClick={async () => {
              const dto = {
                category: category,
                csv: csv,
              };

              const postQuery = repoTags.Post();
              const response = await utils.requestWithToken('POST', postQuery.baseUrl, dto);
              if (response.status === 200) {
                dispatch(postSuccessMessage(""))
                queryClient.invalidateQueries({ queryKey: postQuery.invalidateQueryKey });
                onDialogClose()
              } else {
                const responseJson = await response.data;
                dispatch(postErrorMessage(responseJson.message))
              }
            }}>
            Save
          </Button>
        }
        <Button
          variant="outlined"
          aria-label="cancel"
          color="primary"
          onClick={() => {
            onDialogClose();
          }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
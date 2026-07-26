import React from 'react';
import Grid from '@mui/material/Grid';
import utils from '../../utils/utils';
import { DefaultHeader, DefaultContainer } from '../../components/DefaultComponents';
import { DefaultPaper } from '../../components/DefaultComponents';
import { Button, Stack } from '@mui/material';
import { useDispatch } from 'react-redux'
import {
  postErrorMessage,
  postSuccessMessage,
} from '../../redux/snackbarSlice';
import { repoAdmin } from '../../repo/repoAdmin';
import { repoScheduledJobs } from '../../repo/repoScheduledJobs';

export function MDataAdministration() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    document.title = utils.getDocumentTitle("Data Administration");
  })

  return (
    <DefaultContainer >
      <DefaultHeader title={"Administration"} />

      <DefaultPaper>
        <Stack spacing={1}>
          <Grid>
            <Button
              variant="outlined"
              aria-label="edit"
              color="primary"
              onClick={async () => {
                try {
                  const response = await utils.requestWithToken('GET', repoScheduledJobs.CrawlStockPrice_OnDemand().url);
                  if (response.status === 200) {
                    dispatch(postSuccessMessage(""))
                  } else {
                    const responseJson = await response.data;
                    dispatch(postErrorMessage(responseJson.message))
                  }
                } catch (ex: unknown) {
                  if (ex instanceof Error) {
                    dispatch(postErrorMessage(ex.message))
                  }
                }
              }}>
              Crawl Stock Price (On Demand)
            </Button>
          </Grid>

          <Grid>
            <Button
              variant="outlined"
              aria-label="edit"
              color="primary"
              onClick={async () => {
                try {
                  const response = await utils.requestWithToken('GET', repoAdmin.CrawlStockPrice_Minutely().url);
                  if (response.status === 200) {
                    dispatch(postSuccessMessage(""))
                  } else {
                    const responseJson = await response.data;
                    dispatch(postErrorMessage(responseJson.message))
                  }
                } catch (ex) {
                  if (ex instanceof Error) {
                    dispatch(postErrorMessage(ex.message))
                  }
                }
              }}>
              Crawl Stock Price (Minutely)
            </Button>
          </Grid>

          <Grid>
            <Button
              variant="outlined"
              aria-label="edit"
              color="primary"
              onClick={async () => {
                try {
                  const response = await utils.requestWithToken('GET', repoScheduledJobs.RecalculateDivPayAdjustment().url);
                  if (response.status === 200) {
                    dispatch(postSuccessMessage(""))
                  } else {
                    const responseJson = await response.data;
                    dispatch(postErrorMessage(responseJson.message))
                  }
                } catch (ex) {
                  if (ex instanceof Error) {
                    dispatch(postErrorMessage(ex.message))
                  }
                }
              }}>
              Recalculate Dividend YoY
            </Button>
          </Grid>

          <Grid>
            <Button
              variant="outlined"
              aria-label="edit"
              color="primary"
              onClick={async () => {
                try {
                  const response = await utils.requestWithToken('GET', repoScheduledJobs.UpdatePositionDb().url);
                  if (response.status === 200) {
                    dispatch(postSuccessMessage(""))
                  } else {
                    const responseJson = await response.data;
                    dispatch(postErrorMessage(responseJson.message))
                  }
                } catch (ex) {
                  if (ex instanceof Error) {
                    dispatch(postErrorMessage(ex.message))
                  }
                }
              }}>
              Update Stock Position Db
            </Button>
          </Grid>

          <Grid>
            <Button
              variant="outlined"
              aria-label="edit"
              color="primary"
              onClick={async () => {
                try {
                  const response = await utils.requestWithToken('GET', repoAdmin.CrawlStockDividend().url);
                  if (response.status === 200) {
                    dispatch(postSuccessMessage(""))
                  } else {
                    const responseJson = await response.data;
                    dispatch(postErrorMessage(responseJson.message))
                  }
                } catch (ex) {
                  if (ex instanceof Error) {
                    dispatch(postErrorMessage(ex.message))
                  }
                }
              }}>
              Crawl Stock Dividend
            </Button>
          </Grid>
        </Stack>
      </DefaultPaper>
    </DefaultContainer>
  );
}
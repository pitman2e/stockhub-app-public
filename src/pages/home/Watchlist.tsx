import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import TextField from "@mui/material/TextField";
import utils from "../../utils/utils";
import Skeleton from "@mui/material/Skeleton";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  DefaultErrorPlaceholder,
  DefaultLinearProgress,
  DefaultPaper,
} from "../../components/DefaultComponents";
import ImminentErrorIcon from "../../components/ImminentErrorIcon";
import ConfirmationDialogWrapper from "../../components/ConfirmationDialogWrapper";
import StockTickerLink from "../../components/StockTickerLink";
import WatchlistChart from "./WatchlistChart";
import { ErrorBoundary } from "react-error-boundary";
import repoWatchlist from "../../repo/repoWatchlist";
import { AxiosError } from "axios";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { IStockMovements, IWatchlistPostDto } from "../../types/api";

const tableFeaturesConfig = tableFeatures({});
const columnHelper = createColumnHelper<
  typeof tableFeaturesConfig,
  IStockMovements["watchlists"][number]
>();

const sxTableBodyHidLtRow = {
  "& tr:last-child > td": {
    borderBottom: 0,
  },
};

const sxSkeletonFlexReverse = {
  display: "flex",
  flexDirection: "row-reverse",
};

export default function Watchlist() {
  const [isModifyEnabled, setIsModifyEnabled] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<IWatchlistPostDto>();

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async ({ stockId }: { stockId: string }) => {
      const deleteQuery = repoWatchlist.Delete({ stockId });
      return {
        response: await deleteQuery.requestFn(),
        invalidateQueryKey: deleteQuery.invalidateQueryKey,
      };
    },
    onSuccess: async ({ invalidateQueryKey }) => {
      await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
    },
  });

  const postMutation = useMutation({
    mutationFn: async ({ stockId, priority }: { stockId: string; priority: number }) => {
      const postQuery = repoWatchlist.Post({ stockId, priority });
      return {
        response: await postQuery.requestFn(),
        invalidateQueryKey: postQuery.invalidateQueryKey,
      };
    },
    onSuccess: async ({ invalidateQueryKey }) => {
      await queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      reset();
    },
    onError: (
      error: AxiosError<{ hookErrors?: { fieldName: string; message: string }[]; message?: string }>,
    ) => {
      const actionResult = error.response?.data;
      const stockError = actionResult?.hookErrors?.find(
        (hookError) => hookError.fieldName.toLowerCase() === "stockid",
      );

      setError("stockId", {
        type: "manual",
        message:
          stockError?.message ??
          actionResult?.message ??
          error.message ??
          "Server rejected input. Please verify",
      });
    },
  });

  const { isLoading, isError, data, isFetching } = useQuery({
    ...repoWatchlist.Get({ topCnt: 6 }),
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });

  if (isError && data === undefined) {
    return (
      <DefaultPaper>
        <DefaultErrorPlaceholder />
      </DefaultPaper>
    );
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <>
            <StockTickerLink stockId={row.original.stockId} />
            <Typography
              sx={{ display: { xs: "none", md: "block" } }}
              variant="caption"
              component="p"
            >
              {row.original.stockName}
            </Typography>
          </>
        ),
      }),
      columnHelper.display({
        id: "chart",
        header: "",
        cell: ({ row }) => (
          <ErrorBoundary fallback={<></>}>
            <WatchlistChart stockId={row.original.stockId} />
          </ErrorBoundary>
        ),
      }),
      columnHelper.display({
        id: "change",
        header: "Change",
        meta: {
          align: "right",
          getCellSx: (row) => ({
            ...utils.getColorClass(row.priceChange),
            width: "0.1%",
          })
        },
        cell: ({ row }) => (
          <>
            <Typography variant="body1" component="p">
              {utils.getSignedDecimal(row.original.priceChangePercentage, 2)}%
            </Typography>
            <Typography variant="caption" component="p">
              {row.original.price.toFixed(2)} (
              {utils.getSignedDecimal(row.original.priceChange, 2)})
            </Typography>
          </>
        ),
      }),
      ...(isModifyEnabled
        ? [
          columnHelper.display({
            id: "action",
            header: "Action",
            meta: { align: "right" },
            cell: ({ row }) => (
              <ConfirmationDialogWrapper
                WrappingComponent={(props) => (
                  <IconButton size="small" aria-label="delete" {...props}>
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                )}
                title="Confirmation"
                description={`Are you sure you want to remove ${row.original.stockName} from your watchlist?`}
                onDialogConfirm={async () => {
                  await deleteMutation.mutateAsync({
                    stockId: row.original.stockId,
                  });
                }}
              />
            ),
          }),
        ]
        : []),
    ],
    [isModifyEnabled, deleteMutation.mutateAsync],
  );

  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data: data?.watchlists ?? [],
  });

  const onAddStockSubmit = (formData: IWatchlistPostDto) => {
    postMutation.mutate({
      stockId: formData.stockId,
      priority: (data?.watchlists.length ?? 0) * 10 + 1,
    });
  };

  return (
    <>
      {isFetching && <DefaultLinearProgress />}
      <Paper>
        <Grid container sx={{ padding: 2, justifyContent: "space-between" }}>
          <Grid>
            <Typography variant="h6">
              Watchlist {isError && <ImminentErrorIcon />}
            </Typography>
          </Grid>
          <Grid>
            <IconButton
              size="small"
              onClick={() => {
                setIsModifyEnabled((enabled) => !enabled);
                clearErrors();
                reset();
              }}>
              {isModifyEnabled ?
                <LockOpenIcon fontSize="inherit" /> :
                <LockIcon fontSize="inherit" />}
            </IconButton>
          </Grid>
        </Grid>

        <Grid container>
          <TableContainer>
            <Table size="small" aria-label="watchlist-table">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        align={header.column.columnDef.meta?.align}
                      >
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody sx={sxTableBodyHidLtRow}>
                {isLoading &&
                  [...Array(3).keys()].map((i) => (
                    <TableRow key={i}>
                      <TableCell scope="row">
                        <Typography variant="body2" component="p">
                          <Skeleton width="30%" />
                        </Typography>
                        <Typography variant="caption" component="p">
                          <Skeleton width="60%" />
                        </Typography>
                      </TableCell>
                      <TableCell scope="row" />
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          component="p"
                          sx={sxSkeletonFlexReverse}
                        >
                          <Skeleton sx={{ width: "3em", align: "right" }} />
                        </Typography>
                        <Typography
                          variant="caption"
                          component="p"
                          sx={sxSkeletonFlexReverse}
                        >
                          <Skeleton sx={{ width: "7em", align: "right" }} />
                        </Typography>
                      </TableCell>
                      {isModifyEnabled && <TableCell />}
                    </TableRow>
                  ))}

                {!isLoading &&
                  data !== undefined &&
                  table.getRowModel().rows.map((tableRow) => {

                    return (
                      <TableRow hover key={tableRow.id}>
                        {tableRow.getAllCells().map((cell) => {
                          const meta = cell.column.columnDef.meta;

                          return (
                            <TableCell
                              key={cell.id}
                              align={meta?.align}
                              sx={meta?.getCellSx?.(tableRow.original)}
                            >
                              <table.FlexRender cell={cell} />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}

                {isModifyEnabled && (
                  <TableRow>
                    <TableCell>
                      <TextField
                        size="small"
                        label="Stock"
                        variant="outlined"
                        error={Boolean(errors.stockId)}
                        helperText={errors.stockId?.message}
                        disabled={postMutation.isPending}
                        {...register("stockId", { required: true })}
                      />
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell align="right">
                      <IconButton
                        disabled={postMutation.isPending}
                        size="small"
                        onClick={handleSubmit(onAddStockSubmit)}
                      >
                        <SaveIcon fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Paper >
    </>
  );
}
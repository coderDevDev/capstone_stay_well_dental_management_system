import React from 'react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
  useSortBy,
  usePagination
} from 'react-table';
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

import { Button, PageButton } from './shared/Button';
import { classNames } from './shared/Utils';
import { SortIcon, SortUpIcon, SortDownIcon } from './shared/Icons';

import QRCode from 'react-qr-code';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
// Define a default UI for filtering
import { DateRangePicker } from 'react-date-range';

import { CSVLink } from 'react-csv';
export const Filter = ({ column }) => {
  return (
    <div style={{ marginTop: 5 }}>
      {column.canFilter && column.render('Filter')}
    </div>
  );
};

export const DefaultColumnFilter = ({
  column: {
    filterValue,
    setFilter,
    preFilteredRows: { length }
  }
}) => {
  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined);
      }}
      className="mt-2 p-2 rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-100 border-2 border-slate-300 h-50"
      placeholder={`Search`}></input>
  );
};

export const DateColumnFilter = ({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  });

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <>
      <span
        className="fa-solid fa-filter mt-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}></span>
      {isOpen && (
        <div ref={ref} className="">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <DateRangePicker
              className="shadow-lg left"
              ranges={[selectionRange]}
              onChange={ranges => {
                let { startDate, endDate, selection } = ranges.selection;

                let dateStart = startDate;

                setFilter((old = []) => [
                  dateStart ? new Date(startDate) : undefined,
                  endDate ? new Date(endDate) : undefined
                ]);

                let selected = {
                  startDate: new Date(startDate),
                  endDate: new Date(endDate),
                  key: 'selection'
                };
                setSelectionRange(selected);

                if (startDate !== endDate) {
                  setIsOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

// export const SelectColumnFilter = ({
//   column: { filterValue, setFilter, preFilteredRows, id }
// }) => {
//   const options = React.useMemo(() => {
//     const options = new Set();
//     preFilteredRows.forEach(row => {
//       options.add(row.values[id]);
//     });
//     return [...options.values()];
//   }, [id, preFilteredRows]);

//   return (
//     <select
//       id="custom-select"
//       type="select"
//       value={filterValue}
//       onChange={e => {
//         setFilter(e.target.value || undefined);
//       }}>
//       <option value="">Todos</option>
//       {options.map(option => (
//         <option key={option} value={option}>
//           {option}
//         </option>
//       ))}
//     </select>
//   );
// };

export function dateBetweenFilterFn(rows, id, dateFilterValues) {
  let filterValues = dateFilterValues.sort(function (a, b) {
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(a) - new Date(b);
  });

  console.log({ filterValues });
  let sd = filterValues[0] ? Date.parse(filterValues[0]) : undefined;
  let ed = filterValues[1] ? Date.parse(filterValues[1]) : undefined;

  if (sd === ed) {
    ed = filterValues[0].setDate(filterValues[0].getDate() + 1);

    console.log({ ed });
  }

  console.log({ sd, ed });

  if (ed || sd) {
    return rows.filter(r => {
      const cellDate = r.values[id];

      // console.log({ cellDate });

      return sd <= cellDate && ed >= cellDate;
    });
    return rows;
  } else {
    return rows;
  }
}

export function DateRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length
      ? new Date(preFilteredRows[0].values[id])
      : new Date(0);
    let max = preFilteredRows.length
      ? new Date(preFilteredRows[0].values[id])
      : new Date(0);

    preFilteredRows.forEach(row => {
      const rowDate = new Date(row.values[id]);

      min = rowDate <= min ? rowDate : min;
      max = rowDate >= max ? rowDate : max;
    });

    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div>
      <input
        //min={min.toISOString().slice(0, 10)}
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [val ? val : undefined, old[1]]);
        }}
        type="date"
        value={filterValue[0] || ''}
      />
      {' to '}
      <input
        //max={max.toISOString().slice(0, 10)}
        onChange={e => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? val.concat('T23:59:59.999Z') : undefined
          ]);
        }}
        type="date"
        value={filterValue[1]?.slice(0, 10) || ''}
      />
    </div>
  );
}

function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  searchField = ''
}) {
  const count = preGlobalFilteredRows.length;
  // const [value, setValue] = React.useState(globalFilter);
  // const onChange = useAsyncDebounce(value => {
  //   setGlobalFilter(value);
  // }, 200);

  React.useEffect(() => {
    // props.dispatch({ type: actions.resetPage })
  }, [globalFilter]);

  return (
    <div className="flex hidden-print">
      <label className="flex gap-x-2 items-baseline p-2">
        <span className="text-gray-700">Search: </span>
        <input
          type="text"
          className="p-2 rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 w-100 border-2 border-slate-300 h-90"
          value={globalFilter || ''}
          onChange={e => {
            setGlobalFilter(e.target.value);
          }}
          // placeholder={`${count}`}
          name={searchField || `Code name`}
        />
      </label>
    </div>
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render }
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach(row => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // // Render a multi-select box
  // const appSettings = useSelector(state => state.appSettings);
  // let { codeTypeList, packageList } = appSettings;

  return (
    <div className="flex w-full">
      {/* <span className="text-gray-700">{render('Header')}: </span> */}
      <select
        className="w-full p-2 mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 border-2 border-slate-300 text-sm"
        name={id}
        id={id}
        value={filterValue}
        onChange={e => {
          setFilter(e.target.value || undefined);
        }}>
        <option value="">All</option>
        {[].map((option, i) => {
          let pt = [].find(p => {
            return p.name === option;
          });

          let value = option;
          return (
            <option key={i} value={option}>
              {(pt && pt.displayName) || option}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function StatusPill({ value }) {
  const status = value ? value.toLowerCase() : 'unknown';

  return (
    <span
      className={classNames(
        'px-3 py-1 uppercase leading-wide font-bold text-xs rounded-full shadow-sm',
        status.startsWith('available') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('inactive') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('used') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('available') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('pending') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('approve') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('hold') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('complete') ? 'bg-lime-100 text-lime-800' : null,
        status.startsWith('unhold') ? 'bg-lime-100 text-lime-800' : null,
        status.startsWith('free_slot') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('partially_paid') ? 'bg-yellow-100 text-yellow-800' : null,
        status.startsWith('paid') ? 'bg-green-100 text-green-800' : null,
        status.startsWith('overdue') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('rejected') ? 'bg-red-100 text-red-800' : null,
        status.startsWith('in_progress') ? 'bg-orange-100 text-orange-800' : null,
        status.startsWith('payment_for_approval') ? 'bg-yellow-100 text-yellow-800' : null,
      )}>
      {status}
    </span>
  );
}

export function DateCell({ value }) {
  let date = value ? format(value, 'MMM dd, yyyy hh:mm:ss a') : 'N/A';

  return <span className="text-sm text-gray-500">{date}</span>;
}

export function AvatarCell({ value, column, row }) {
  return (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10">
        {value && (
          <QRCode
            value={value}
            style={{
              height: 'auto',
              maxWidth: '100%',
              width: '100%'
            }}
          />
        )}
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">
          {row.original[column.emailAccessor]}
        </div>
      </div>
    </div>
  );
}

function Table({ columns, data, searchField }) {
  // Use the state and functions returned from useTable to build your UI

  const {
    rows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page

    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,

    state,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
    footerGroups
  } = useTable(
    {
      columns,
      data,
      searchField
    },

    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy,
    usePagination // new,
  );

  // Render the UI for your table

  function getHeader(column) {
    if (column.totalHeaderCount === 1 || !column.totalHeaderCount) {
      return [
        {
          value: column.Header,
          type: 'string'
        }
      ];
    } else {
      const span = [...Array(column.totalHeaderCount - 1)].map(x => ({
        value: '',
        type: 'string'
      }));
      return [
        {
          value: column.Header,
          type: 'string'
        },
        ...span
      ];
    }
  }

  // let csvData = rows.map(current => {
  //   let entry = current.values;

  //   return Object.keys(entry).reduce((acc, key) => {
  //     let finalValue = entry[key];

  //     let mydate = new Date(finalValue).getTime();

  //     var startTime = new Date('1/1/1970').getTime() * -1;

  //     if (mydate > startTime) {
  //       finalValue = format(finalValue, 'MMM dd, yyyy hh:mm:ss a');
  //     }

  //     if (!finalValue) {
  //       return {
  //         ...acc
  //       };
  //     } else {
  //       return {
  //         ...acc,
  //         [key]: finalValue
  //       };
  //     }
  //   }, []);
  // });

  let csvData = rows.map(current => {
    let entry = current.values;

    return Object.keys(entry).reduce((acc, key) => {
      return {
        ...acc,
        [key]: entry[key]
      };
    }, []);
  });

  // console.log({ rows });

  let dataSet = [];

  headerGroups.forEach(headerGroup => {
    const headerRow = [];
    if (headerGroup.headers) {
      headerGroup.headers.forEach(column => {
        headerRow.push(
          ...getHeader(column)
            // .filter(d => {
            //   return d.value !== 'Action' || d.value !== 'Actions';
            // })
            .map(h => {
              return h.value;
            })
        );
      });
    }

    dataSet.push(
      headerRow.filter(v => !['Action', 'Actions', 'Income Type'].includes(v))
    );
  });

  // FILTERED ROWS

  if (rows.length > 0) {
    rows.forEach(row => {
      const dataRow = [];

      Object.values(row.values).forEach(value => {
        // check value type

        let finalValue = value;

        try {
          let mydate = new Date(finalValue).getTime();

          var startTime = new Date('1/1/1970').getTime() * -1;

          if (mydate > startTime) {
            dataRow.push(format(finalValue, 'MMM dd, yyyy hh:mm:ss a'));
          } else {
            dataRow.push(finalValue);
          }
        } catch (error) {
          // dataRow.push(finalValue);
        }

        // if (!isDate(parseISO(mydate)) || !isValid(parseISO(mydate))) {
        //   console.log({ finalValue });
        //   // dataRow.push(format(validDate, 'MMM dd, yyyy hh:mm:ss a'));
        // } else {
        //   dataRow.push(finalValue);
        // }
      });

      dataSet.push(dataRow.filter(v => !!v));
    });
  } else {
    dataSet.push([
      {
        value: 'No data'
      }
    ]);
  }

  return (
    <>
      <div className="sm:flex sm:gap-x-2 d-flex flex-row justify-between hidden-print">
        {/* <div
          tabIndex={0}
          role="button"
          className="btn m-1 bg-yellow-500 text-white btn-sm">
          {' '}
          <i class="fa-solid fa-file-export"></i>
          <CSVLink className="downloadbtn" filename="report.csv" data={dataSet}>
            Export
          </CSVLink>
        </div> */}
        <div></div>
        <GlobalFilter
          preGlobalFilteredRows={preGlobalFilteredRows}
          globalFilter={state.globalFilter}
          setGlobalFilter={setGlobalFilter}
          searchField={searchField}
        />
        {/* {headerGroups.map(headerGroup =>
          headerGroup.headers.map(column =>
            column.Filter ? (
              <div className="mt-2 sm:mt-0" key={column.id}>
                {column.render('Filter')}
              </div>
            ) : null
          )
        )} */}
      </div>
      {/* table */}
      <div className="mt-2 flex flex-col p-0">
        <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8 ">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table
                {...getTableProps()}
                className="w-full divide-y divide-gray-200 table-sm z-10">
                <thead className="bg-gray-50">
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => {
                        // Add the sorting props to control sorting. For this example
                        // we can add them into the header props

                        // let columnsArray = [
                        //   'Requested Amount',
                        //   'Total Deduction',
                        //   'Withdrawable Amount'
                        // ];

                        // let hasCheck = columnsArray.includes(column.Header);

                        // if (hasCheck) {
                        //   {
                        //     column.render('Footer');
                        //   }
                        // }
                        return (
                          <th
                            scope="col"
                            className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div
                              className="flex items-center justify-between"
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}>
                              {column.render('Header')}
                              {/* {column.render('Footer')} */}
                              {/* Add a sort direction indicator */}
                              <span>
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <SortDownIcon className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <SortUpIcon className="w-4 h-4 text-gray-400" />
                                  )
                                ) : (
                                  <SortIcon className="w-4 h-4 text-gray-400 " />
                                )}
                              </span>

                              {/* <span>
                              <SortIcon className="w-4 h-4 text-gray-400 " />
                            </span> */}
                            </div>
                            <div className="">
                              <div>

                                {column.canFilter && column.Filter
                                  ? column.render('Filter')
                                  : null}
                              </div>
                              {/* <span>
                              <SortIcon className="w-4 h-4 text-gray-400 " />
                            </span> */}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="bg-white divide-y divide-gray-200">

                  {
                    page.length === 0 && <tr>
                      <td colSpan="5" className="text-center py-4">
                        <span>
                          No data available
                        </span>

                      </td>
                    </tr>
                  }
                  {page.map((row, i) => {
                    // new
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-6 py-4 whitespace-nowrap"
                              role="cell">
                              {cell.column.Cell.name === 'defaultRenderer' ? (
                                <div className="text-sm text-gray-500">
                                  {cell.render('Cell')}
                                </div>
                              ) : (
                                cell.render('Cell')
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  {footerGroups.map(group => (
                    <tr {...group.getFooterGroupProps()}>
                      {group.headers.map(column => (
                        <td {...column.getFooterProps()}>
                          {column.render('Footer')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Pagination */}
      <div className="py-3 flex items-center justify-between ">
        <div className="flex-1 flex justify-between sm:hidden hidden-print">
          <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
            Previous
          </Button>
          <Button onClick={() => nextPage()} disabled={!canNextPage}>
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between hidden-print">
          <div className="flex gap-x-2 items-baseline hidden-print">
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{state.pageIndex + 1}</span> of{' '}
              <span className="font-medium">{pageOptions.length}</span>
            </span>
            <label>
              <span className="sr-only">Items Per Page</span>
              <select
                className="p-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={state.pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                }}>
                {[5, 10, 20].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px hidden-print"
              aria-label="Pagination">
              <PageButton
                className="rounded-l-md"
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}>
                <span className="sr-only">First</span>
                <ChevronDoubleLeftIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>
              <PageButton
                onClick={() => previousPage()}
                disabled={!canPreviousPage}>
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>
              <PageButton onClick={() => nextPage()} disabled={!canNextPage}>
                <span className="sr-only">Next</span>
                <ChevronRightIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>
              <PageButton
                className="rounded-r-md"
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}>
                <span className="sr-only">Last</span>
                <ChevronDoubleRightIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </PageButton>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default Table;

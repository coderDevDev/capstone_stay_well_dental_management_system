import TitleCard from '../../../components/Cards/TitleCard';

import { format, formatDistance, formatRelative, subDays } from 'date-fns';

import axios from 'axios';

import { formatAmount } from '../helpers/currencyFormat';

const userSourceData = [
  { source: Date.now(), count: '600', conversionPercent: 10.2 },
  { source: Date.now(), count: '600', conversionPercent: 10.2 },
  { source: Date.now(), count: '600', conversionPercent: 10.2 }
];

function UserChannels({ dashboardData, getDashboardStats }) {
  let directRefferalList = dashboardData.binaryIncome?.directRefferalList;

  let typeOf = {
    DIRECT_SPONSORSHIP_SALES_MATCH: 'Direct sponsorship sales',
    GIFT_CHEQUE: 'Gift Cheque',
    MATCH_SALES: 'Match Sales',
    DIRECT_REFERRAL: 'Direct Referral'
  };

  return (
    <TitleCard title={'Binary Income Transaction(s)'}>
      {/** Table Data */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {/* <th>#</th> */}

              <th>Details</th>
              <th className="normal-case">Timestamp</th>
              <th className="normal-case">Source</th>
            </tr>
          </thead>
          <tbody>
            {(directRefferalList || []).length === 0 && (
              <tr>
                <td className="text-center font-bold ml-4">No Data</td>
              </tr>
            )}
            {(directRefferalList || []).map((u, k) => {
              let type = u.codeType ? u.codeType : '';
              return (
                <tr key={k}>
                  {/* <th>{k + 1}</th> */}
                  {/* <th>
                    <p className="font-normal d-flex">{u.type}</p>
                  </th> */}
                  <th>
                    <p className="italic font-normal">
                      You have received{' '}
                      <span className="font-bold text-green-500">
                        {formatAmount(u.amountInPhp)}{' '}
                      </span>{' '}
                      -
                      <span className="font-bold text-slate-700">
                        {typeOf[u.type]}
                      </span>
                      <span className="font-bold text-slate-500">
                        -{' '}
                        {u.relatedEntityID.constructor === String &&
                          u.relatedEntityID}
                      </span>{' '}
                    </p>
                  </th>
                  <td>
                    {u.dateTimeAdded &&
                      format(u.dateTimeAdded, 'MMM dd, yyyy hh:mm:ss a')}
                  </td>
                  <td>{u.userName}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <dialog id="viewIncomeSales" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Transaction Details</h3>
          <div className="divider" />
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Downline(A)</th>
                  <th>Downline(B)</th>
                  <th>Amount Received</th>
                  <th>Income Type</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                <tr>
                  <th>1</th>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </TitleCard>
  );
}

export default UserChannels;

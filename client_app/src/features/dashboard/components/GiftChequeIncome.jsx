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
  let giftChequeList = dashboardData.giftChequeIncome?.giftChequeList;

  let typeOf = {
    DIRECT_SPONSORSHIP_SALES_MATCH: 'Direct sponsorship sales',
    GIFT_CHEQUE: 'Gift Cheque',
    MATCH_SALES: 'Match Sales',
    DIRECT_REFERRAL: 'Direct Referral'
  };
  return (
    <TitleCard title={'Gift Cheque Transaction(s)'}>
      {/** Table Data */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {/* <th>#</th> */}

              <th>Details</th>
              <th className="normal-case">Timestamp</th>
              {/* <th className="normal-case">Action</th> */}
            </tr>
          </thead>
          <tbody>
            {(giftChequeList || []).length === 0 && (
              <tr>
                <td className="text-center font-bold ml-4">No Data</td>
              </tr>
            )}
            {(giftChequeList || []).map((u, k) => {
              let type = u.codeType ? u.codeType : '';
              return (
                <tr key={k}>
                  {/* <th>{k + 1}</th> */}

                  <th>
                    <p className="italic font-normal">
                      You have received{' '}
                      <span className="font-bold text-green-500">
                        {formatAmount(u.amountInPhp)}
                      </span>
                    </p>
                  </th>
                  <td>{format(u.dateTimeAdded, 'MMM dd, yyyy hh:mm:ss a')}</td>
                  {/* <td>
                    <button className="btn btn-sm">View</button>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TitleCard>
  );
}

export default UserChannels;

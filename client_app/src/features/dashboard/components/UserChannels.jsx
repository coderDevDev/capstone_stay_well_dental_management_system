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
  let dailyList = dashboardData.dailyBonus?.dailyBonusList[0]?.dateList;

  let selected = dashboardData.dailyBonus?.dailyBonusList;
  if (dailyList) {
    dailyList = JSON.parse(dailyList);
  }

  return (
    <TitleCard title={'Reward List'}>
      {/** Table Data */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th className="normal-case">Date</th>
              <th className="normal-case">Amount</th>
              <th className="normal-case">Action</th>
            </tr>
          </thead>
          <tbody>
            {(dailyList || []).length === 0 && (
              <tr>
                <td className="text-center font-bold ml-4">No Data</td>
              </tr>
            )}
            {(dailyList || [])
              .sort(function (a, b) {
                return new Date(b.dateIdentifier) - new Date(a.dateIdentifier);
              })
              .map((u, k) => {
                let isAlreadyRecieved = u.isRecieved;
                let tDate = new Date(u.dateIdentifier).getTime();
                return (
                  <tr key={k}>
                    <td>{format(tDate, 'MMM dd, yyyy')}</td>
                    <td> {formatAmount(u.amountInPhp)}</td>
                    <td>
                      {isAlreadyRecieved && (
                        <span className="text-green-500 font-bold">
                          <i class="fa-solid fa-plus mr-2"></i>
                          {formatAmount(u.amountInPhp)}
                        </span>
                      )}

                      {!isAlreadyRecieved && (
                        <button
                          className="btn btn-sm"
                          disabled={isAlreadyRecieved}
                          onClick={async () => {
                            if (isAlreadyRecieved) {
                              return true;
                            }
                            let newData = dailyList.map(d => {
                              if (d.dateIdentifier === u.dateIdentifier) {
                                d.isRecieved = true;
                                d.dateTimeRecieved = Date.now();
                              }

                              return d;
                            });

                            let res = await axios({
                              method: 'POST',
                              url: 'transaction/recievedDailyBonus',
                              data: {
                                ID: selected[0].ID,
                                newData
                              }
                            });
                            getDashboardStats();
                          }}>
                          <i class="fa-regular fa-thumbs-up"></i>
                          Receive
                        </button>
                      )}
                    </td>
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

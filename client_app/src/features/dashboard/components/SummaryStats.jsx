import { formatAmount } from '../helpers/currencyFormat';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
function AmountStats({
  totalAmount,
  title,
  icon,
  showModal,
  type,
  color = 'blue',
  data
}) {
  return (
    <div
      className={`stats bg-slate-100 shadow-lg 
      border-t-4 border-${color}-500`}>
      <div className="stat ">
        {/* <div className="stat-figure dark:text-slate-300 text-primary -mt-10 ">
          {icon}
        </div> */}
        <div className="stat-title font-bold uppercase ">{title}</div>

        {/* <div className="stat-value mt-4"> {totalAmount}</div> */}

        <div className="my-4 divider mt-5" />

        {type === 'WFA' && (
          <div className="stats shadow-lg  bg-slate-100  shadow">
            <div className="stat">
              <div className="stat-figure invisible md:visible"></div>
              <div className="stat-title">Normal</div>
              <div className="stat-value">{data?.NormalWeight.length}</div>
            </div>

            <div className="stat">
              <div className="stat-figure invisible md:visible"></div>
              <div className="stat-title">Overweight</div>
              <div className="stat-value">
                {data?.OverweightChildren.length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-figure invisible md:visible"></div>
              <div className="stat-title">Underweight</div>
              <div className="stat-value">
                {data?.UnderWeightChildren.length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-figure invisible md:visible"></div>
              <div className="stat-title">Obese</div>
              <div className="stat-value">{data?.Obese.length}</div>
            </div>
          </div>
        )}

        {type === 'HFA' && (
          <div className="stats shadow-lg  bg-slate-100  shadow">
            <div className="stat">
              <div className="stat-figure invisible md:visible"></div>
              <div className="stat-title">Stunted</div>
              <div className="stat-value">{data?.Stunted.length}</div>
            </div>

            <div className="stat">
              <div className="stat-figure invisible md:visible"></div>
              <div className="stat-title">Severely Stunted</div>
              <div className="stat-value">{data?.SeverelyStunted.length}</div>
            </div>
          </div>
        )}

        {/* <div>
          <div className="flex justify-end">
            <div className="tooltip" data-tip="View Details">
              <div
                className="shadow-xl rounded-lg p-2 cursor-pointer"
                onClick={() => {}}>
                <span className="fa-solid fa-eye fa-1xl text-yellow-500 ml-0"></span>
                <span className="ml-2 font-bold text-neutral-600 text-sm">
                  Details
                </span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default AmountStats;

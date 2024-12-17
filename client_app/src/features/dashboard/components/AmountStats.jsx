import { formatAmount } from '../helpers/currencyFormat';
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';
function AmountStats({
  totalAmount,
  title,
  icon,
  showModal,
  type,
  color = 'blue'
}) {
  return (
    <div
      className={`stats bg-slate-100 shadow-lg 
      border-t-4 border-${color}-500`}>
      <div className="stat ">
        <div className="stat-figure dark:text-slate-300 text-primary -mt-10 ">
          {icon}
        </div>
        <div className="stat-title font-bold uppercase">{title}</div>

        <div className="stat-value mt-4"> {totalAmount}</div>

        <div className="my-4 divider mt-10" />

        <div>
          <div className="flex justify-end">
            {/* <div className="tooltip" data-tip="View Details">
              <div
                className="shadow-xl rounded-lg p-2 cursor-pointer"
                onClick={() => {}}>
                <span className="fa-solid fa-eye fa-1xl text-yellow-500 ml-0"></span>
                <span className="ml-2 font-bold text-neutral-600 text-sm">
                  Details
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AmountStats;

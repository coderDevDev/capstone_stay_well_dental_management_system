function DashboardStats({ title, icon, value, description, colorIndex }) {
  const COLORS = ['primary', 'primary'];

  const getDescStyle = () => {
    if (description.includes('↗︎'))
      return 'font-bold text-green-700 dark:text-green-300';
    else if (description.includes('↙'))
      return 'font-bold text-rose-500 dark:text-red-400';
    else return '';
  };

  return (
    <div className="stats shadow-lg ">
      <div className="stat ">
        <div className={`stat-figure dark:text-slate-300 text-green-500`}>
          {icon}
        </div>
        <div className="text-slate-600 font-md">{title}</div>
        <div
          className={`text-4xl dark:text-slate-300 text-green-500 font-medium`}>
          {value}
        </div>
        <div className={'stat-desc  ' + getDescStyle()}>{description}</div>
      </div>
    </div>
  );
}

export default DashboardStats;

function Subtitle({ styleClass, children }) {
  return (
    <div
      className={`text-xl font-semibold ${styleClass} text-slate-600 font-bold`}>
      {children}
    </div>
  );
}

export default Subtitle;

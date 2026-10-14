const LoadingButton = ({
  loading = false,
  loadingText = "Loading",
  children,
  className = "",
  ...rest
}) => (
  <button
    type="submit"
    disabled={loading}
    aria-busy={loading}
    className={`lb-btn${loading ? " lb-loading" : ""} w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.25)] transition hover:bg-blue-500 disabled:cursor-wait ${className}`}
    {...rest}
  >
    <span className="lb-label">
      {loading ? (
        <>
          {loadingText}
          <span className="lb-dot">.</span>
          <span className="lb-dot">.</span>
          <span className="lb-dot">.</span>
        </>
      ) : (
        children
      )}
    </span>
  </button>
);

export default LoadingButton;

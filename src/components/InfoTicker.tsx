const tickerItems = [
  "Find your fit",
  "Explore activewear",
  "Shop event collections",
  "Browse product categories",
  "New drops coming soon",
];

const InfoTicker = () => {
  return (
    <section className="w-full overflow-hidden bg-black" aria-label="Allwear updates">
      <div className="ticker-track">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <span key={`${item}-${index}`} className="ticker-item">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};

export default InfoTicker;
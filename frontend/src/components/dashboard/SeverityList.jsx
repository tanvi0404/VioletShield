const items = [
  {
    label: "Critical",
    colour: "text-red-500",
    value: 1,
  },
  {
    label: "High",
    colour: "text-orange-400",
    value: 2,
  },
  {
    label: "Medium",
    colour: "text-yellow-400",
    value: 4,
  },
  {
    label: "Low",
    colour: "text-green-400",
    value: 7,
  },
];

const SeverityList = () => {
  return (
    <div className="space-y-4">

      <h3 className="text-lg font-semibold text-white">
        Severity
      </h3>

      {items.map((item) => (
        <div
          key={item.label}
          className="flex justify-between"
        >
          <span className={item.colour}>
            {item.label}
          </span>

          <span className="font-bold text-white">
            {item.value}
          </span>
        </div>
      ))}

    </div>
  );
};

export default SeverityList;
import React from "react";

const StatsCard = ({ title, value, icon, color = "blue" }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-500",
      iconBg: "bg-blue-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-500",
      iconBg: "bg-green-100",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-500",
      iconBg: "bg-red-100",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-500",
      iconBg: "bg-yellow-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-500",
      iconBg: "bg-purple-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-500",
      iconBg: "bg-indigo-100",
    },
  };

  const classes = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`${classes.bg} rounded-lg shadow p-6 flex items-center`}>
      <div className={`${classes.iconBg} rounded-full p-3 mr-4`}>
        <span className={classes.text}>{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;

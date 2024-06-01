import React from 'react';
import Chart from 'react-apexcharts';

const ProgressChart = ({ percentage, label = "Progression", color = '#1D7C55', height = 350 }) => {
  const options = {
    chart: {
      height: height,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '22px',
          },
          value: {
            show: true,
            fontSize: '16px',
            formatter: function (val) {
              return val + '%';
            },
          },
        },
        track: {
          background: '#f0f0f0', // Couleur de fond de la piste
        },
      },
    },
    colors: [color],
    labels: [label],
  };

  const series = [percentage];

  return (
    <Chart options={options} series={series} type="radialBar" height={350} />
  );
};

export default ProgressChart;
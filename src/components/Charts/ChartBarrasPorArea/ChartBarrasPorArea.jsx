import React from 'react';
import Chart from 'react-apexcharts';

export const ChartBarrasPorArea = ({ data }) => {
    const chartOptions = {
        options: {
            chart: {
                id: 'bar-chart-area',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                zoom: {
                    enabled: true,
                    type: 'x',  // Zoom solo en el eje X
                    autoScaleYaxis: true  // Escala automáticamente el eje Y
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '20%',
                    endingShape: 'rounded'
                },
            },
            dataLabels: {
                enabled: true
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: data.map(item => item.area),
                title: {
                    text: 'Área'
                }
            },
            yaxis: {
                title: {
                    text: 'Cantidad de Personas'
                },
                labels: {
                    formatter: function(val) {
                        return Math.round(val); // Redondea los valores a enteros
                    }
                },
                tickAmount: 'dataPoints' // Ajusta la cantidad de ticks al número de puntos de datos
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val + " eventos"
                    }
                }
            }
        },
        series: [
            {
                name: 'Entrada',
                data: data.map(item => item.entrada)
            },
            {
                name: 'Salida',
                data: data.map(item => item.salida)
            }
        ]
    };

    return (
        <div>
            <Chart
                options={chartOptions.options}
                series={chartOptions.series}
                type="bar"
                height={350}
               
            />
        </div>
    );
};
import React from 'react';
import Chart from 'react-apexcharts';

export const ChartBarras = ({ data }) => {
    // Define una lista de colores para las barras
    const colors = ['#008FFB', '#1A2942', '#3BC0C3', '#775DD0', '#FEB019', '#00D9E9', '#FF66C4'];

    const chartOptions = {
        options: {
            chart: {
                id: 'basic-bar',
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
                    columnWidth: '40%',
                    endingShape: 'rounded',
                    distributed: true  // Asegura que cada barra puede tener un color diferente
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
                categories: data.map(item => item.category),
                title: {
                    text: 'Tipo de Evento'
                }
            },
            yaxis: {
                title: {
                    text: 'Cantidad'
                },
                labels: {
                    formatter: function (val) {
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
            },
            colors: colors  // Utiliza la lista de colores definida
        },
        series: [
            {
                name: 'Eventos',
                data: data.map(item => item.value)
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
                width={350}
            />
        </div>
    );
};

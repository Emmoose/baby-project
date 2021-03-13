<template>
  <div id="baby-date-chart" class="chart">
    <apexchart
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>
<script>
import moment from "moment";

export default {
  name: "BabyDateChart",
  props: {
    dataSent: Array,
    graphTitle: String,
    yourGuess: String
  },

  computed: {
    series() {
      return [
        {
          data: this.dataSent[1]
        }
      ];
    },
    chartOptions() {
      return {
        chart: {
          id: "baby-date-chart",
          toolbar: {
            show: false
          }
        },
        annotations: {
          points: [
            {
              x: this.yourGuess != "" ? this.yourGuess : undefined,
              seriesIndex: 0,
              label: {
                borderColor: "#34495E",
                offsetY: 0,
                style: {
                  color: "#34495E",
                  background: "#f1f8e9"
                },
                text: "Din är här!"
              }
            }
          ]
        },
        legend: {
          show: false
        },
        xaxis: {
          labels: {
            formatter: function(timestamp) {
              return moment(timestamp).format("D/M");
            }
          },
          categories: this.dataSent[0]
        },
        yaxis: {
          title: {
            text: "Antal gissningar",
            style: {
              fontSize: "12px",
              fontFamily: "Open Sans"
            }
          },
          labels: {
            formatter: value => Math.floor(value)
          }
        },
        grid: {
          row: {
            colors: ["#fff", "#f2f2f2"]
          }
        },
        colors: ["#91b352"],
        fill: {
          type: "gradient",
          gradient: {
            shade: "light",
            type: "horizontal",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.85,
            opacityTo: 0.85,
            stops: [50, 0, 100]
          }
        }
      };
    }
  }
};
</script>

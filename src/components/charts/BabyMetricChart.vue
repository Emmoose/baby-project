<template>
  <div class="baby-metric-chart">
    <apexchart type="line" :options="options" :series="series"> </apexchart>
  </div>
</template>
<script>
import moment from "moment";
export default {
  name: "HelloWorld",
  props: {
    data: Array,
    graphTitle: String
  },

  computed: {
    series() {
      return [
        {
          name: this.graphLabel,
          data: this.data
        }
      ];
    },
    options() {
      return {
        chart: {
          id: "vuechart-example",
          toolbar: {
            show: false
          }
        },
        markers: {
          size: 6
        },
        stroke: {
          width: 2
        },
        grid: {
          row: {
            colors: ["#fff", "#f2f2f2"]
          }
        },
        yaxis: {
          title: {
            text: this.graphTitle,
            style: {
              fontSize: "12px",
              fontFamily: "Open Sans"
            }
          }
        },
        xaxis: {
          type: "datetime",
          labels: {
            formatter: function(timestamp) {
              return moment(timestamp).format("D/M");
            }
          }
        },
        colors: ["#91b352"]
      };
    }
  }
};
</script>

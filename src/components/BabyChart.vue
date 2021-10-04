<template>
  <div class="growth-chart card">
    <h1 class="growth-chart__header">Ingrids tillväxt</h1>
    <canvas
      class="growth-chart__canvas"
      id="graph"
      v-bind:width="graphWidth"
      v-bind:height="graphHeight"
    ></canvas>
    <div class="growth-table">
      <div class="growth-table__header">
        <div class="growth-table__info-column">Datum</div>
        <div class="growth-table__data-column">Vikt (g)</div>
        <div class="growth-table__data-column">Längd (cm)</div>
      </div>
      <div
        class="growth-table__row"
        v-for="(data, index) in babyData"
        v-bind:key="data.timeStamp"
      >
        <div class="growth-table__info-column">
          {{ data.timeStamp | formatDateTable }}
        </div>
        <div
          v-on:mouseover="showDataPoint('weight', index)"
          v-on:mouseleave="clearDataPoint()"
          class="growth-table__data-column data"
        >
          {{ data.weight }}
        </div>
        <div
          v-on:mouseover="showDataPoint('height', index)"
          v-on:mouseleave="clearDataPoint()"
          class="growth-table__data-column data"
        >
          {{ data.height }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from "@/utility/debounce";
import calcDateRangeMixin from "@/mixins/calcDateRangeMixin";
import { mapState } from "vuex";

export default {
  mixins: [calcDateRangeMixin],
  data() {
    return {
      vueCanvas: null,
      xAxisLabels: [],
      xPadding: 40,
      yPadding: 50,
      graphHeight: 600,
      graphWidth: 800,
      circleRadius: 20,
      maxTimeStamp: null,
      minTimeStamp: null,
      maxHeight: null,
      maxWeight: null,
      minHeight: null,
      minWeight: null,
      colors: {
        table1: "#ECECEC",
        table2: "#F5F5F5",
        data1: "#1D2951",
        data2: "#da532c",
        dark: "black"
      }
    };
  },

  props: {
    location: String
  },

  methods: {
    getXPixel(val) {
      var valSend =
        ((this.graphWidth - this.xPadding * 2) /
          (this.maxTimeStamp - this.minTimeStamp)) *
          (val - this.minTimeStamp) +
        this.xPadding * 1.5;
      return valSend;
    },

    getYWeightPixel(val) {
      val = val - this.minWeight;

      return (
        this.graphHeight -
        ((this.graphHeight - this.yPadding) /
          (this.maxWeight - this.minWeight)) *
          val -
        this.yPadding
      );
    },

    getYHeightPixel(val) {
      val = val - this.minHeight;

      return (
        this.graphHeight -
        ((this.graphHeight - this.yPadding) /
          (this.maxHeight - this.minHeight)) *
          val -
        this.yPadding
      );
    },

    drawLineChart(heightIndex = null, weightIndex = null) {
      this.updateCanvasSize();

      // Set vue data to canvas object
      this.vueCanvas = document.getElementById("graph").getContext("2d");
      this.vueCanvas.clearRect(0, 0, this.graphWidth, this.graphHeight); // Clear canvas if animating

      // Set up line stroke properties
      this.vueCanvas.lineWidth = 1;
      this.vueCanvas.strokeStyle = "FFF";
      this.vueCanvas.font = "8pt Open sans";
      this.vueCanvas.textAlign = "center";

      // Draw columns - alternativ colors
      this.vueCanvas.beginPath();
      this.vueCanvas.fillStyle = this.colors.table1;
      this.vueCanvas.fillRect(
        this.xPadding,
        0,
        this.getXPixel(this.xAxisLabels[0].timeStamp) - this.xPadding,
        this.graphHeight - this.yPadding
      );

      // Draw middle columns
      var index = 0;
      for (index = 1; index < this.xAxisLabels.length; index++) {
        this.vueCanvas.fillStyle =
          index % 2 == 0 ? this.colors.table1 : this.colors.table2;
        this.vueCanvas.fillRect(
          this.getXPixel(this.xAxisLabels[index - 1].timeStamp),
          0,
          this.getXPixel(this.xAxisLabels[index].timeStamp) -
            this.getXPixel(this.xAxisLabels[index - 1].timeStamp),
          this.graphHeight - this.yPadding
        );
      }

      // Draw last column
      this.vueCanvas.fillStyle =
        index % 2 == 0 ? this.colors.table1 : this.colors.table2;
      this.vueCanvas.fillRect(
        this.getXPixel(this.xAxisLabels[6].timeStamp),
        0,
        this.getXPixel(this.maxTimeStamp) -
          this.getXPixel(this.xAxisLabels[6].timeStamp) -
          this.xPadding / 2,
        this.graphHeight - this.yPadding
      );
      // End - drawing columns

      // Draw labels X-axis values (dates)
      this.vueCanvas.fillStyle = this.colors.dark;
      for (let i = 0; i < this.xAxisLabels.length; i++) {
        this.vueCanvas.fillText(
          this.xAxisLabels[i].monthName,
          this.getXPixel(this.xAxisLabels[i].timeStamp),
          this.graphHeight - this.yPadding + 20
        );
      }

      // Draw labels on left Y-axis (weight)
      this.vueCanvas.textAlign = "right";
      this.vueCanvas.textBaseline = "middle";
      this.vueCanvas.fillStyle = this.colors.data1;
      for (let i = this.minWeight; i < this.maxWeight; i += 400) {
        this.vueCanvas.fillText(i, this.xPadding - 10, this.getYWeightPixel(i));
      }

      // Draw labels on right Y-axis (heights)
      this.vueCanvas.textAlign = "left";
      this.vueCanvas.textBaseline = "middle";
      this.vueCanvas.fillStyle = this.colors.data2;
      for (let i = this.minHeight; i < this.maxHeight; i += 2) {
        this.vueCanvas.fillText(
          i,
          this.graphWidth - this.xPadding + 10,
          this.getYHeightPixel(i)
        );
      }

      // Draw legend
      this.vueCanvas.save();
      this.vueCanvas.font = "12px Open sans";

      this.vueCanvas.fillStyle = this.colors.data1;
      this.vueCanvas.strokeStyle = this.colors.data1;
      this.vueCanvas.fillText("Vikt (g)", 64, 20);
      this.vueCanvas.beginPath();
      this.vueCanvas.lineWidth = 4;
      this.vueCanvas.moveTo(130, 20);
      this.vueCanvas.lineTo(160, 20);
      this.vueCanvas.stroke();

      this.vueCanvas.fillStyle = this.colors.data2;
      this.vueCanvas.strokeStyle = this.colors.data2;
      this.vueCanvas.fillText("Längd (cm)", 64, 40);
      this.vueCanvas.beginPath();
      this.vueCanvas.moveTo(130, 40);
      this.vueCanvas.lineTo(160, 40);
      this.vueCanvas.stroke();
      this.vueCanvas.restore();

      // Draw graph - 1 Height
      this.vueCanvas.strokeStyle = this.colors.data1;
      this.vueCanvas.beginPath();
      this.vueCanvas.moveTo(
        this.getXPixel(this.minTimeStamp),
        this.getYWeightPixel(this.babyData[0].weight)
      );

      for (let i = 1; i < this.babyData.length; i++) {
        if (this.babyData[i].weight) {
          // Incase empty datapoint
          this.vueCanvas.lineTo(
            this.getXPixel(this.babyData[i].timeStamp),
            this.getYWeightPixel(this.babyData[i].weight)
          );
        }
      }
      this.vueCanvas.stroke();

      // Draw graph - 2 Weight
      this.vueCanvas.strokeStyle = this.colors.data2;

      this.vueCanvas.beginPath();
      this.vueCanvas.moveTo(
        this.getXPixel(this.minTimeStamp),
        this.getYHeightPixel(this.babyData[0].height)
      );

      for (let i = 1; i < this.babyData.length; i++) {
        if (this.babyData[i].height) {
          // Incase empty datapoint
          this.vueCanvas.lineTo(
            this.getXPixel(this.babyData[i].timeStamp),
            this.getYHeightPixel(this.babyData[i].height)
          );
        }
      }

      this.vueCanvas.stroke();
      // Draw hightlight dots on datapoints
      this.vueCanvas.fillStyle = this.colors.dark;

      // For weight
      for (let i = 0; i < this.babyData.length; i++) {
        if (this.babyData[i].weight) {
          var radius1 =
            weightIndex == i ? this.circleRadius * 3 : this.circleRadius;

          this.vueCanvas.beginPath();
          this.vueCanvas.arc(
            this.getXPixel(this.babyData[i].timeStamp),
            this.getYWeightPixel(this.babyData[i].weight),
            radius1,
            0,
            Math.PI * 2,
            true
          );
          this.vueCanvas.fill();
        }
      }

      // For height
      for (let i = 0; i < this.babyData.length; i++) {
        if (this.babyData[i].height) {
          var radius2 =
            heightIndex == i ? this.circleRadius * 3 : this.circleRadius;

          this.vueCanvas.beginPath();
          this.vueCanvas.arc(
            this.getXPixel(this.babyData[i].timeStamp),
            this.getYHeightPixel(this.babyData[i].height),
            radius2,
            0,
            Math.PI * 2,
            true
          );
          this.vueCanvas.fill();
        }
      }
    },

    updateCanvasSize() {
      if (window.innerWidth > 991) {
        this.graphHeight = 600;
        this.graphWidth = 800;
        this.circleRadius = 6;
      } else if (window.innerWidth > 737) {
        this.graphHeight = 350;
        this.graphWidth = 600;
        this.circleRadius = 4;
      } else {
        this.graphHeight = 200;
        this.graphWidth = 360;
        this.circleRadius = 3;
      }
    },

    formatData() {
      var tempMaxWeight, tempMinWeight, tempMaxHeight, tempMinHeight;

      this.maxTimeStamp =
        Math.max(...this.babyData.map(data => data.timeStamp)) + 1000000000;

      this.minTimeStamp = Math.min(
        ...this.babyData.map(data => data.timeStamp)
      );

      tempMaxWeight = Math.max(
        ...this.babyData.filter(data => data.weight).map(data => data.weight)
      );

      // Calculates nearest even 100 above max
      this.maxWeight = tempMaxWeight + (200 - (tempMaxWeight % 100));

      tempMinWeight = Math.min(
        ...this.babyData.filter(data => data.weight).map(data => data.weight)
      );

      // Calculates nearest even 100 below min
      this.minWeight = tempMinWeight - (100 + (tempMinWeight % 100));

      tempMaxHeight = Math.max(
        ...this.babyData.filter(data => data.height).map(data => data.height)
      );

      // Calculates nearest even 1 above max
      this.maxHeight = tempMaxHeight + (1 - (tempMaxHeight % 1));

      tempMinHeight = Math.min(
        ...this.babyData.filter(data => data.height).map(data => data.height)
      );

      // Calculates nearest even 10 below min
      this.minHeight = tempMinHeight - (1 + (tempMinHeight % 1));

      this.createMonthLabels(this.minTimeStamp, this.maxTimeStamp); //DELETE ONLY FOR TESTING
    },

    onResize() {
      if (this.babyData.length > 0) {
        this.drawLineChart();
      }
    },

    showDataPoint(type, index) {
      if (type == "height") {
        this.drawLineChart(index, null);
      } else if (type == "weight") {
        this.drawLineChart(null, index);
      }
    },

    clearDataPoint() {
      this.drawLineChart();
    }
  },
  watch: {
    "$store.state.babyData": function() {
      this.formatData();
      this.xAxisLabels = this.createMonthLabels(
        this.minTimeStamp,
        this.maxTimeStamp
      );
      this.drawLineChart();
    }
  },
  computed: {
    ...mapState(["babyData"])
  },
  mounted() {
    if (this.babyData.length) {
      this.formatData();
      this.xAxisLabels = this.createMonthLabels(
        this.minTimeStamp,
        this.maxTimeStamp
      );
      this.drawLineChart();
    } else {
      this.$store.dispatch("fetchChartDataPoints");
    }
    this.$store.dispatch("fetchChartDataPoints");
    window.addEventListener("resize", debounce(this.onResize, 16));
    window.dispatchEvent(new Event("resize")); // This need to be here, not completely sure why
  },
  destroyed() {
    window.removeEventListener("resize", this.onResize, true);
  }
};
</script>
<style lang="less" src="../assets/less/components/_BabyChart.less" scoped />

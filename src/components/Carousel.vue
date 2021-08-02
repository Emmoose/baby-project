<template>
  <div class="carousel">
    <div class="carousel__wrapper" ref="carousel__wrapper">
      <div
        ref="carousel__inner"
        class="carousel__inner"
        :style="{
          transform: `translate(${currentOffset}px, 0)`,
          transition: dragging ? 'none' : '0.5s ease transform',
          'ms-flex-preferred-size': `${carouselWidth}px`,
          'webkit-flex-basis': `${carouselWidth}px`,
          'flex-basis': `${carouselWidth}px`,
          visibility: carouselWidth ? 'visible' : 'hidden'
        }"
      >
        <div
          class="carousel__slide"
          tabindex="-1"
          role="tabpanel"
          v-for="(image, index) in imageList"
          v-bind:key="index"
        >
          <img :src="image" />
        </div>
      </div>
    </div>

    <div class="carousel__navigation">
      <div v-if="listLength > 1" class="carousel__number">
        {{ `Bild ${currentPage + 1} / ${listLength}` }}
      </div>
      <button
        type="button"
        aria-label="Previous page"
        :tabindex="currentPage > 0 ? 0 : -1"
        class="carousel__button"
        v-on:click.prevent="advancePage('backward')"
        v-bind:class="{
          'carousel__button--disabled': !currentPage > 0
        }"
      >
        Tidigare
      </button>

      <div v-show="listLength > 1">
        <div class="carousel__dot-container" role="tablist">
          <button
            v-for="(page, index) in listLength"
            :key="`${page}_${index}`"
            class="carousel__dot"
            aria-hidden="false"
            role="tab"
            :aria-selected="isCurrentDot(index) ? 'true' : 'false'"
            v-bind:class="{ 'carousel__dot--active': isCurrentDot(index) }"
            v-on:click="goToPage(index)"
          ></button>
        </div>
      </div>

      <button
        type="button"
        aria-label="Next page"
        :tabindex="offset < maxOffset ? 0 : -1"
        class="carousel__button"
        v-on:click.prevent="advancePage('forward')"
        v-bind:class="{
          'carousel__button--disabled': !(offset < maxOffset)
        }"
      >
        Nästa
      </button>
    </div>
  </div>
</template>
<script>
import debounce from "./carousel/debounce";

export default {
  name: "carousel",
  props: {
    imageList: Array,
    listLength: {
      type: Number,
      default: 0
    }
  },

  beforeUpdate() {
    this.computeCarouselWidth();
  },

  data() {
    return {
      browserWidth: null,
      carouselWidth: 0,
      currentPage: 0,
      dragging: false,
      dragOffset: 0,
      dragStartY: 0,
      dragStartX: 0,
      isTouch: typeof window !== "undefined" && "ontouchstart" in window,
      offset: 0,
      refreshRate: 16,
      minSwipeDistance: 8,
      resistanceCoef: 2
    };
  },
  computed: {
    /**
     * The horizontal distance the inner wrapper is offset while navigating.
     * @return {Number} Pixel value of offset to apply
     */
    currentOffset() {
      if (!(this.listLength > 1)) {
        return 0;
      } else {
        return (this.offset + this.dragOffset) * -1;
      }
    },

    /**
     * Maximum offset the carousel can slide
     * Considering the spacePadding
     * @return {Number}
     */
    maxOffset() {
      return Math.max(this.carouselWidth * (this.listLength - 1), 0);
    }
  },
  methods: {
    /**
     * @return {Number} The index of the next page
     * */
    getNextPage() {
      if (this.currentPage < this.listLength - 1) {
        return this.currentPage + 1;
      }
      return 0;
    },
    /**
     * @return {Number} The index of the previous page
     * */
    getPreviousPage() {
      if (this.currentPage > 0) {
        return this.currentPage - 1;
      }
      return this.listLength - 1;
    },
    /**
     * Increase/decrease the current page value
     * @param  {String} direction (Optional) The direction to advance
     */
    advancePage(direction) {
      if (direction && direction === "backward" && this.currentPage > 0) {
        this.goToPage(this.getPreviousPage());
      } else if (
        (!direction || (direction && direction !== "backward")) &&
        this.offset < this.maxOffset
      ) {
        this.goToPage(this.getNextPage());
      }
    },

    /**
     * Get the current browser viewport width
     * @return {Number} Browser"s width in pixels
     */
    getBrowserWidth() {
      this.browserWidth = window.innerWidth;
      return this.browserWidth;
    },
    /**
     * Get the width of the carousel DOM element
     * @return {Number} Width of the carousel in pixels
     */
    getCarouselWidth() {
      let carouselInnerElements = this.$el.getElementsByClassName(
        "carousel__inner"
      );

      if (carouselInnerElements[0].clientWidth > 0) {
        this.carouselWidth = carouselInnerElements[0].clientWidth || 0;
      }

      return this.carouselWidth;
    },

    /**
     * Set the current page to a specific value
     * This function will only apply the change if the value is within the carousel bounds
     * for carousel scrolling per page.
     * @param  {Number} page The value of the new page number
     */
    goToPage(page) {
      if (page >= 0 && page <= this.listLength) {
        this.offset = Math.min(this.carouselWidth * page, this.maxOffset);
        this.currentPage = page;
      }
    },
    /**
     * Trigger actions when mouse is pressed
     * @param  {Object} e The event object
     */
    /* istanbul ignore next */
    onStart(e) {
      // detect right click
      if (e.button == 2) {
        return;
      }

      document.addEventListener(
        this.isTouch ? "touchend" : "mouseup",
        this.onEnd,
        true
      );

      document.addEventListener(
        this.isTouch ? "touchmove" : "mousemove",
        this.onDrag,
        true
      );

      this.startTime = e.timeStamp;

      this.dragging = true;
      this.dragStartX = this.isTouch ? e.touches[0].clientX : e.clientX;
      this.dragStartY = this.isTouch ? e.touches[0].clientY : e.clientY;
    },
    /**
     * Trigger actions when mouse is released
     * @param  {Object} e The event object
     */

    onEnd(e) {
      // compute the momemtum speed
      const eventPosX = this.isTouch ? e.changedTouches[0].clientX : e.clientX;
      const deltaX = this.dragStartX - eventPosX;

      if (deltaX == 0) {
        this.$emit("liked-story");
      }

      if (Math.abs(deltaX) >= this.minSwipeDistance) {
        this.dragOffset =
          this.dragOffset + Math.sign(deltaX) * (this.carouselWidth / 2);
      }

      this.offset += this.dragOffset;
      this.dragOffset = 0;
      this.dragging = false;

      this.render();

      // clear events listeners
      document.removeEventListener(
        this.isTouch ? "touchend" : "mouseup",
        this.onEnd,
        true
      );
      document.removeEventListener(
        this.isTouch ? "touchmove" : "mousemove",
        this.onDrag,
        true
      );
    },
    /**
     * Trigger actions when mouse is pressed and then moved (mouse drag)
     * @param  {Object} e The event object
     */
    onDrag(e) {
      const eventPosX = this.isTouch ? e.touches[0].clientX : e.clientX;
      const eventPosY = this.isTouch ? e.touches[0].clientY : e.clientY;
      const newOffsetX = this.dragStartX - eventPosX;
      const newOffsetY = this.dragStartY - eventPosY;

      // if it is a touch device, check if we are below the min swipe threshold
      // (if user scroll the page on the component)
      if (this.isTouch && Math.abs(newOffsetX) < Math.abs(newOffsetY)) {
        return;
      }

      e.stopImmediatePropagation();

      this.dragOffset = newOffsetX;
      const nextOffset = this.offset + this.dragOffset;

      if (nextOffset < 0) {
        this.dragOffset = -Math.sqrt(-this.resistanceCoef * this.dragOffset);
      } else if (nextOffset > this.maxOffset) {
        this.dragOffset = Math.sqrt(this.resistanceCoef * this.dragOffset);
      }
    },

    onResize() {
      this.computeCarouselWidth();

      this.dragging = true; // force a dragging to disable animation
      this.render();
      // clear dragging after refresh rate
      setTimeout(() => {
        this.dragging = false;
      }, this.refreshRate);
    },
    render() {
      // lock offset to either the nearest page, or to the last slide
      this.offset =
        this.carouselWidth * Math.round(this.offset / this.carouselWidth);

      // clamp the offset between 0 -> maxOffset
      this.offset = Math.max(0, Math.min(this.offset, this.maxOffset));

      // update the current page
      this.currentPage = Math.round(this.offset / this.carouselWidth);
    },
    /**
     * Re-compute the width of the carousel
     */
    computeCarouselWidth() {
      this.getBrowserWidth();
      this.getCarouselWidth();
    },

    isCurrentDot(index) {
      return index === this.currentPage;
    }
  },
  mounted() {
    let slides = this.$el.getElementsByClassName("carousel__slide");

    for (let index = 0; index < slides.length; index++) {
      slides[index].addEventListener("dragstart", e => e.preventDefault());
    }

    window.addEventListener(
      "resize",
      debounce(this.onResize, this.refreshRate)
    );

    this.$refs["carousel__wrapper"].addEventListener(
      this.isTouch ? "touchstart" : "mousedown",
      this.onStart
    );

    this.computeCarouselWidth();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.getBrowserWidth);
    this.$refs["carousel__wrapper"].removeEventListener(
      this.isTouch ? "touchstart" : "mousedown",
      this.onStart
    );
  }
};
</script>
<style lang="less" src="../assets/less/components/_Carousel.less" scoped />

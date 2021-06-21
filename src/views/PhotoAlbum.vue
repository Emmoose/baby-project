<template>
  <div class="photo-album-view page-wrapper">
    <div
      class="album-links"
      v-bind:class="{
        'album-links--active': showDateMenu
      }"
    >
      <ul class="album-links__list">
        <li
          class="album-links__list-item"
          v-for="date in firstOfMonthDates"
          :key="date"
        >
          <a
            class="album-links__link"
            v-bind:class="{
              'album-links__link--observed': date == currentObservedMonth
            }"
            href=""
            @click.prevent="goToSpecificMonth(date)"
            >{{ date | yearAndMonth }}</a
          >
        </li>
      </ul>
      <div class="album-links__tab" @click="toggleDateMenu">
        <img
          class="album-links__svg-icon"
          v-bind:class="{
            'album-links__svg-icon--active': showDateMenu
          }"
          src="@/assets/svg-icons/right-arrow.svg"
        />
      </div>
    </div>
    <div id="image-album" class="image-album" ref="imagealbum">
      <ul class="image-list">
        <Photo
          v-for="image in allImageUrls"
          :key="image.id"
          v-bind:image-data="image"
          v-bind:location="image.location"
          v-bind:image-url="image.url"
          v-bind:created-on="image.createdOn"
          @open="openLargeImage(image.url)"
        ></Photo>
      </ul>
    </div>
    <div
      v-if="showLargeImage"
      @click="closeLargeImage()"
      class="image-popup"
      :class="showLargeImage ? 'image-popup--show' : ''"
    >
      <img class="image-popup__image card" :src="largeImageUrl" />
    </div>
  </div>
</template>

<script>
import Photo from "@/components/Photo";
import { mapState } from "vuex";

export default {
  title: "babyGram - Fotoalbum",
  components: {
    Photo
  },
  data() {
    return {
      largeImageUrl: "",
      showLargeImage: false,
      firstOfMonthDates: [],
      timerId: null,
      currentObservedMonth: null,
      timeStampTwoRangesTop: null,
      timeStampTwoRangesBottom: null,
      showDateMenu: false
    };
  },

  computed: {
    ...mapState([
      "allImageUrls",
      "loadMoreImages",
      "lastLoadedImageUrl",
      "scrollToDate",
      "loadedLastImages"
    ])
  },
  methods: {
    toggleDateMenu() {
      this.showDateMenu = !this.showDateMenu;
    },

    openLargeImage(imageUrl) {
      // Only allow in desktop
      if (window.innerWidth > 991) {
        this.largeImageUrl = imageUrl;
        this.showLargeImage = true;
      }
    },

    closeLargeImage() {
      // Only allow in desktop
      if (window.innerWidth > 991) {
        this.showLargeImage = false;
        this.largeImageUrl = "";
      }
    },

    // Go to month if its loaded already
    // If not fetch that month
    // wich will then be picked up by setupPeriodicallyCheckImages()

    /* eslint-disable */
    goToSpecificMonth(month) {
      const element = document.querySelectorAll(`[data-anchor='${month}']`);
      
      if (element.length > 0) {
        const distance = element[0].getBoundingClientRect().top;
          window.scroll({
            top: distance,
            behavior: "smooth"
          });

      } else {
        this.$store.dispatch("fetchImageLinksTimeStamp", month);
      }

      // Close menu on click if mobile
      if (window.innerWidth < 991) {
        this.showDateMenu = false;
      }
    },

    // Set up Interval to:
    // - Scroll to a new month if scrollToDate is set,
    // - Check if images should be loaded at end
    // - If images should not be loaded at end check if images should be loaded middle
    setupPeriodicallyCheckImages() {
      this.timerId = setInterval(() => {
        // Check if need to scroll to new section

        if (this.scrollToDate) {
          console.log(this.scrollToDate);
          const element = document.querySelectorAll(
            `[data-anchor='${this.scrollToDate}']`
          )[0];

          const distance = element.getBoundingClientRect().top;
          window.scroll({
            top: distance,
            behavior: "smooth"
          });

          this.$store.dispatch("updateScrollToDate", null);
        }

        var foundTwoRanges = this.checkImagesInView();

        let bottomOfWindow =
          Math.max(
            window.pageYOffset,
            document.documentElement.scrollTop,
            document.body.scrollTop
          ) +
            window.innerHeight +
            800 >
          document.documentElement.offsetHeight;

        // Check if scrollbar is visible and device is not mobile,
        // If device is mobile checking scrollbar is not needed
        var isDesktopWithoutScrollBarOrMobile =
          !(window.innerWidth > document.documentElement.clientWidth) &&
          !/Mobi|Android/i.test(navigator.userAgent);

        if (
          (isDesktopWithoutScrollBarOrMobile || bottomOfWindow) &&
          this.loadMoreImages &&
          !this.loadedLastImages
        ) {
          this.$store.dispatch("fetchImageLinksTimeStamp");

          // Check if should load more because two ranges are in viewport
        } else if (this.loadMoreImages && foundTwoRanges) {
          this.$store.dispatch("fetchImageLinksTimeStampMiddle", {
            timeStampTopView: this.timeStampTwoRangesTop * 1000,
            timeStampBottomView: this.timeStampTwoRangesBottom * 1000
          });
        }
      }, 500); 
    },

    // Check timepstamp of images in viewPort to:
    // - Update currently observed Month in men
    // - Check if both end of range (last) and beginning
    //   of new range is in view, if so set foundTwoRanges = true
    checkImagesInView() {
      const dataLocations = document.querySelectorAll("[data-anchor]");
      var foundTop,
        foundBottom,
        foundObserved,
        foundTwoRanges = false;


      for (let index = 0; index < dataLocations.length; index++) {
        const element = dataLocations[index];

        if (
          element.getBoundingClientRect().y > 0 &&
          element.getBoundingClientRect().y < 450 &&
          !foundObserved
        ) {
          this.currentObservedMonth = element.dataset.anchor;
          foundObserved = true;
        }

        if (
          element.getBoundingClientRect().y > 0 &&
          element.getBoundingClientRect().y < window.innerHeight
        ) {
          if (element.dataset.location == "last") {
            foundTop = element.dataset.date;
          } else if (element.dataset.location == "first") {
            foundBottom = element.dataset.date;
          }

          if (foundTop && foundBottom) {
            this.timeStampTwoRangesTop = foundTop;
            this.timeStampTwoRangesBottom = foundBottom;
            foundTwoRanges = true;
          }
        }
        // Break out of loop is we are below vieport
        if (element.getBoundingClientRect().y > window.innerHeight) {
          break;
        }
      }

      return foundTwoRanges;
    }
  },

  mounted() {
    this.$store.dispatch("fetchImageLinksTimeStamp");
    this.setupPeriodicallyCheckImages();

    // Set up array for dates containing first of all months between 2021-02-01
    // and today
    const startTime = new Date("2021-02-01"),
      today = new Date(),
      dates = [],
      numberMonths =
        today.getMonth() -
        startTime.getMonth() +
        12 * (today.getFullYear() - startTime.getFullYear());

    var month = 2,
      year = 21;
    for (let index = 0; index < numberMonths; index++) {
      month++;
      dates.push(`20${year}-${String(month).padStart('2', 0)}`);

      if (month % 12 == 0) {
        year++;
        month = 0;
      }
    }
    
    this.firstOfMonthDates = dates.reverse();
  },
  beforeDestroy() {
    clearInterval(this.timerId);
  }
};
</script>

<style lang="less" src="../assets/less/views/_PhotoAlbum.less" scoped />

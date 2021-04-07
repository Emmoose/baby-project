<template>
  <div class="manage-content-view page-wrapper">
    <div class="create-story  card">
      <h3 class="create-story__header">
        {{ editMode ? "Redigera bebishistoria" : "Skapa bebishistoria" }}
      </h3>
      <p class="create-story__info">
        Ladda upp en historia med bilder och text.
      </p>
      <input
        class="create-story__file-uploader"
        type="file"
        ref="input1"
        @change="previewImage"
        accept="image/*"
      />

      <ul class="image-list" v-if="showImages">
        <li
          class="image-list__item"
          v-for="(image, index) in imageUrls"
          v-bind:key="index"
        >
          <h4 class="image-list__header">{{ `Image - ${index + 1}` }}</h4>
          <div class="image-list__preview">
            <div class="image-list__image-container">
              <button class="icon-trash" @click="deleteImage(index)">
                <div class="icon-trash__trash-lid"></div>
                <div class="icon-trash__trash-container"></div>
                <div class="icon-trash__trash-line-1"></div>
                <div class="icon-trash__trash-line-2"></div>
                <div class="icon-trash__trash-line-3"></div>
              </button>
              <img class="image-list__image" :src="image" />
            </div>
            <div
              v-if="showMoveButtons"
              class="image-list__move-button-container"
            >
              <button
                v-if="index !== 0"
                class="image-list__move-button image-list__move-button--up  button"
                @click="moveImage(index, -1)"
              ></button>
              <button
                v-if="index + 1 !== imageUrls.length"
                class="image-list__move-button image-list__move-button--down button"
                @click="moveImage(index, 1)"
              ></button>
            </div>
          </div>
        </li>
      </ul>
      <div class="create-story__upload-container">
        <div class="create-story__image-placeholder">
          {{ imageData === null ? "Image placeholder" : "Fler bilder" }}
        </div>
        <button
          class="create-story__upload-image button"
          v-bind:class="{
            'create-story__upload-image--plus-sign': imageUrls.length != 0
          }"
          @click="click1"
        >
          {{ imageUrls.length == 0 ? "Ladda upp bild" : "+" }}
        </button>
      </div>
      <form action="">
        <textarea
          type="text"
          placeholder="Lägg till text (ej krav)"
          v-model="story"
          label="Story here"
        />
      </form>
      <button
        v-if="!editMode"
        :disabled="imageData == null"
        class="create-story__publish-story button"
        @click="createStory"
      >
        Publicera
      </button>
      <button
        v-if="editMode"
        :disabled="!showImages"
        class="create-story__publish-story button"
        @click="updateStory"
      >
        Uppdatera
      </button>
    </div>
    <div class="create-metric card">
      <h3 class="create-metric__header">Lägg till bebisdata</h3>
      <p class="create-metric__info">
        Ladda upp bebisvikt eller längd som visas under bebisdata.
      </p>
      <form v-on:submit.prevent class="create-metric__weight-form" action="">
        <div class="create-metric__input-container">
          <input
            class="input-field create-metric__input"
            name="length"
            type="number"
            v-model.number="weight"
            placeholder="vikt (in g)"
          />
          <input v-model="weightDate" type="date" class="input-field" />
        </div>
        <button
          :disabled="weight == null || weightDate == ''"
          class="create-metric__upload-button button"
          @click="addWeightDataPoint"
        >
          Lägg till vikt
        </button>
      </form>
      <form v-on:submit.prevent class="create-metric__height-form" action="">
        <div class="create-metric__input-container">
          <input
            class="input-field create-metric__input"
            name="height"
            type="number"
            v-model.number="height"
            placeholder="längd (in cm)"
          />
          <input v-model="heightDate" type="date" class="input-field" />
        </div>
        <button
          :disabled="height == null || heightDate == ''"
          class="create-metric__upload-button  button"
          @click="addHeightDataPoint"
        >
          Lägg till längd
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import * as fb from "../firebase";
import imageCompression from "browser-image-compression";
import { mapState } from "vuex";

export default {
  title: "BabyGram - Skapa innehåll",
  data() {
    return {
      story: "",
      pickedBaby: "0", // Harcoded for now
      imageUrls: [],
      referenceImages: [],
      editMode: false,
      imageData: null,
      showImages: false,
      height: null,
      heightDate: "",
      weight: null,
      weightDate: ""
    };
  },
  computed: {
    ...mapState(["editStory"]),
    showMoveButtons() {
      return this.imageUrls.length > 1;
    }
  },

  methods: {
    click1() {
      this.$refs.input1.click();
    },

    async previewImage(event) {
      this.imageData = null;
      this.uploadValue = 0;
      this.imageData = event.target.files[0];
      // Compress images to max of 0.5 MB
      const options = {
        maxSizeMB: 0.5
      };

      const compressedFile = await imageCompression(this.imageData, options);
      this.imageData = compressedFile;

      const input = this.$refs.input1;
      input.type = "text";
      input.type = "file";

      this.onUpload();
      this.showImages = true;
    },

    onUpload() {
      const endKey = Math.random()
        .toString(36)
        .substr(2, 20);
      const newImageName =
        this.imageData.name.substring(0, this.imageData.name.lastIndexOf(".")) +
        endKey +
        this.imageData.name.substring(this.imageData.name.lastIndexOf("."));
      const storageRef = firebase
        .storage()
        .ref(newImageName)
        .put(this.imageData);
      storageRef.on(
        `state_changed`,
        snapshot => {
          this.uploadValue =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        error => {
          console.log(error.message);
        },
        () => {
          this.uploadValue = 100;
          storageRef.snapshot.ref.getDownloadURL().then(url => {
            this.imageUrls.push(url);
            this.referenceImages.push(newImageName);
          });
        }
      );
    },
    async createStory() {
      this.$store.dispatch("createStory", {
        createdOn: new Date(),
        image: this.imageUrls,
        referenceImages: this.referenceImages,
        story: this.story,
        userName: this.$store.state.userProfile.name,
        userId: this.$store.state.userProfile.userId,
        likes: [],
        pickedBaby: this.pickedBaby
      });

      this.imageUrls.forEach(imageUrl => {
        this.$store.dispatch("addImageLink", {
          createdOn: new Date(),
          url: imageUrl
        });
      });

      this.imageUrls = [];
      this.story = "";

      this.$router.push("/");
    },

    deleteImage(index) {
      firebase
        .storage()
        .ref(this.referenceImages[index])
        .delete();

      this.referenceImages = this.referenceImages.filter(
        ref => ref != this.referenceImages[index]
      );

      this.imageUrls = this.imageUrls.filter(
        ref => ref != this.imageUrls[index]
      );
    },

    moveImage(index, direction) {
      var to = index + direction;
      var tempReferenceImages = this.referenceImages.slice();
      var tempImageUrls = this.imageUrls.slice();
      tempReferenceImages
        .splice(to, 0, tempReferenceImages.splice(index, 1)[0])
        .slice();

      tempImageUrls.splice(to, 0, tempImageUrls.splice(index, 1)[0]).slice();

      this.imageUrls = tempImageUrls;
      this.referenceImages = tempReferenceImages;
    },

    async updateStory() {
      var payload = {
        image: this.imageUrls,
        story: this.story,
        pickedBaby: this.pickedBaby,
        referenceImages: this.referenceImages,
        userName: this.$store.state.userProfile.name,
        storyId: this.editStory.storyId
      };

      this.$store.dispatch("updateStory", payload);

      this.editMode = false;
      this.story = "";
      this.imageUrls = [];
      this.$router.push("/");
    },

    async addHeightDataPoint() {
      var tempDate = new Date(this.heightDate);

      this.$store.dispatch("addHeightDataPoints", {
        createdOn: tempDate.getTime(),
        height: this.height
      });

      this.height = null;
      this.heightDate = "";
      this.showImages = false;
      this.$router.push("/data");
    },

    async addWeightDataPoint() {
      var tempDate = new Date(this.weightDate);

      this.$store.dispatch("addHeightDataPoint", {
        createdOn: tempDate.getTime(),
        weight: this.weight
      });

      this.weight = null;
      this.weightDate = "";
      this.showImages = false;
      this.$router.push("/data");
    },

    async loadStoryToEdit() {
      const doc = await fb.storiesContentCollection
        .doc(this.editStory.storyId)
        .get();

      this.story = doc.data().story;
      this.pickedBaby = doc.data().pickedBaby;
      this.imageUrls = doc.data().image.slice();
      this.referenceImages = doc.data().referenceImages.slice();

      this.showImages = true;
    }
  },

  mounted() {
    if (this.editStory.editMode) {
      this.editMode = true;
      this.loadStoryToEdit();
    }
  }
};
</script>
<style lang="less" src="../assets/less/views/_ManageContent.less" scoped />

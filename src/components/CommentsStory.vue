<template>
  <div class="comment-story">
    <div class="show-comments__comments-status">
      <div class="show-comments__like-text">
        <div class="show-comments__wrapper">
          <button
            aria-label="show comments"
            @click="likeStory"
            class="show-comments__like-button"
          >
            <img
              alt="Unlike story"
              class="show-comments__svg-heart"
              v-bind:class="{
                'show-comments__svg-heart--animate': animateLike
              }"
              v-if="userLikedPost"
              src="@/assets/svg-icons/stories__heart-fill.svg"
            />
            <img
              alt="Like story"
              class="show-comments__svg-heart"
              v-bind:class="{
                'show-comments__svg-heart--animate': animateLike
              }"
              v-if="!userLikedPost"
              src="@/assets/svg-icons/stories__heart-outline.svg"
            />
          </button>
          <span v-show="likes.length > 0" class="show-comments__total-number"
            >Gillat av {{ this.likedText }}</span
          >
        </div>
        <a
          class="show-comments__link"
          @click="toggleShowWhoLiked"
          v-show="likes.length > 1"
        >
          och flera
        </a>
      </div>
      <a
        class="show-comments__comments-link"
        @click.prevent="toggleShowComments"
        >Kommentera {{ numberOfComments > 0 ? `(${numberOfComments})` : "" }}</a
      >
    </div>
    <div v-if="showComments">
      <ul class="comments-list">
        <li
          class="comments-list__items"
          v-for="comment in storiesComments[storyId]"
          :key="comment.id"
        >
          <div
            class="comments-list__comment-textbox"
            v-bind:class="{
              'comments-list__comment-textbox--current-users':
                comment.userId == userId
            }"
          >
            <div class="comments-list__comment-username">
              {{ comment.userName }}
            </div>
            <div class="comment">
              <span>{{ comment.content }}</span>
            </div>

            <img
              v-if="comment.userId == userId"
              @click="deleteComment(comment)"
              class="comments-list__svg-remove"
              src="@/assets/svg-icons/remove.svg"
            />
          </div>
        </li>
      </ul>
      <form class="create-comment" @submit.prevent>
        <textarea
          rows="1"
          data-min-rows="3"
          ref="textareaComment"
          class="create-comment__textarea"
          v-model.trim="comment"
          v-on:keydown="handleInputComment"
          placeholder="Skriv en kommentar..."
        ></textarea>
      </form>
    </div>
    <Modal v-if="showWhoLiked" @close="toggleShowWhoLiked()"
      ><ShowWhoLiked v-bind:likes="likes"
    /></Modal>
  </div>
</template>

<script>
import Modal from "@/components/Modal";
import ShowWhoLiked from "@/components/ShowWhoLiked";

import { auth } from "@/firebase";
import { mapState } from "vuex";

export default {
  components: {
    Modal,
    ShowWhoLiked
  },
  props: {
    storyId: String,
    likes: Array
  },
  data() {
    return {
      comment: "",
      dynamicHeight: 44,
      showComments: false,
      userId: auth.currentUser.uid,
      showWhoLiked: false,
      animateLike: false
    };
  },
  computed: {
    ...mapState(["storiesComments"]),
    numberOfComments() {
      if (this.$store.state.storiesComments[this.storyId] != undefined) {
        return this.$store.state.storiesComments[this.storyId].length;
      }
      return 0;
    },
    likedText() {
      if (this.likes.length == 0) {
        return "";
      }

      var likesSorted = [...this.likes].sort((a, b) =>
        a.time > b.time ? 1 : -1
      );

      return likesSorted[0].name;
    },
    userLikedPost() {
      return this.likes.some(like => like.userId == auth.currentUser.uid);
    }
  },
  methods: {
    toggleShowWhoLiked() {
      this.showWhoLiked = !this.showWhoLiked;
    },
    deleteComment(comment) {
      this.$store.dispatch("deleteComment", comment);
    },

    handleInputComment(event) {
      if (event.keyCode != 13) {
        this.$refs.textareaComment.rows = 1;
        this.$refs.textareaComment.rows = Math.ceil(
          (this.$refs.textareaComment.scrollHeight - 30) / 16
        );
      }

      if (event.keyCode === 13 && this.comment != "") {
        // Create comment object
        var comments = {
          createdOn: new Date(),
          content: this.comment,
          storyId: this.storyId,
          userId: auth.currentUser.uid,
          userName: this.$store.state.userProfile.name
        };

        this.$store.dispatch("postComment", comments);

        this.comment = "";
        this.$refs.textareaComment.rows = 1;
        this.$refs.textareaComment.blur();
      }
    },

    toggleShowComments() {
      this.showComments = !this.showComments;
    },

    likeStory() {
      this.animateLike = true;
      setTimeout(() => (this.animateLike = false), 100);
      this.$store.dispatch("postLikesStory", this.storyId);
    }
  },

  mounted() {
    this.$store.dispatch("subscribeLikes", this.storyId);
    this.$store.dispatch("subscribeComments", this.storyId);
  }
};
</script>
<style lang="less" src="../assets/less/components/_CommentsStory.less" scoped />

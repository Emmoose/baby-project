<template>
  <div class="comment-story">
    <div class="show-comments__comments-status">
      <button @click="likeStory" class="show-comments__like-button">
        <img
          v-if="userLikedPost"
          src="@/assets/svg-icons/stories__heart-fill.svg"
        />
        <img
          v-if="!userLikedPost"
          src="@/assets/svg-icons/stories__heart-outline.svg"
        />
      </button>
      <a class="show-comments__total-number" @click="likeStory">{{
        likes.length > 0 ? `(${likes.length})` : "Gilla"
      }}</a>

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
            <div
              v-if="comment.userId == userId"
              @click="deleteComment(comment)"
              class="comments-list__comment-delete"
            >
              X
            </div>
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
  </div>
</template>

<script>
import { auth } from "@/firebase";
import { mapState } from "vuex";

export default {
  props: {
    storyId: String,
    likes: Array
  },
  data() {
    return {
      comment: "",
      dynamicHeight: 44,
      showComments: false,
      userId: auth.currentUser.uid
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
    userLikedPost() {
      return this.likes.includes(auth.currentUser.uid);
    }
  },
  methods: {
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
      this.$store.dispatch("postLikesStory", this.storyId);
    }
  },

  mounted() {
    this.$store.dispatch("fetchComments", this.storyId);
  }
};
</script>
<style lang="less" src="../assets/less/components/_CommentsStory.less" scoped />

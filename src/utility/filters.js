import Vue from "vue";

const months = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "agusti",
  "september",
  "oktober",
  "november",
  "december"
];

Vue.filter("formatDate", val => {
  var tempDate = new Date(val.seconds * 1000);
  return `${tempDate.getDate()} ${
    months[tempDate.getMonth()]
  } ${tempDate.getFullYear()}`;
});

Vue.filter("yearAndMonth", val => {
  if (!val) {
    return "-";
  }
  var tempDate = new Date(val);
  return `${months[tempDate.getMonth()]} ${tempDate.getFullYear()}`;
});

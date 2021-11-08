import Vue from "vue";
import config from "./config";

Vue.filter("formatDate", val => {
  var tempDate = new Date(val.seconds * 1000);
  return `${tempDate.getDate()} ${
    config.months[tempDate.getMonth()]
  } ${tempDate.getFullYear()}`;
});

Vue.filter("formatDateTable", val => {
  var tempDate = new Date(val);
  return `${tempDate.getDate()} ${
    config.months[tempDate.getMonth()]
  } ${tempDate.getFullYear()}`;
});

Vue.filter("yearAndMonth", val => {
  if (!val) {
    return "-";
  }
  var tempDate = new Date(val);
  return `${config.months[tempDate.getMonth()]} ${tempDate.getFullYear()}`;
});

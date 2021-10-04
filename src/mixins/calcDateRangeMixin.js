import config from "@/utility/config";

export default {
  methods: {
    createMonthLabels(minTimeStamp, maxTimeStamp) {
      var currentDate,
        firstDate = new Date(minTimeStamp),
        lastDate = maxTimeStamp ? new Date(maxTimeStamp) : new Date(), // Use Today if maxTimeStamp not set
        startingYear = parseInt(
          firstDate
            .getFullYear()
            .toString()
            .substr(2, 4)
        ),
        monthNumber = firstDate.getMonth() + 1; //Add one since month is zero index based

      const dates = [],
        numberMonths =
          lastDate.getMonth() -
          firstDate.getMonth() +
          12 * (lastDate.getFullYear() - firstDate.getFullYear());

      for (let index = 0; index < numberMonths; index++) {
        monthNumber++;
        currentDate = new Date(
          `20${startingYear}-${String(monthNumber).padStart("2", 0)}`
        );
        dates.push({
          timeStamp: currentDate.getTime(),
          monthName: config.monthsShort[currentDate.getMonth()],
          monthText: `20${startingYear}-${String(monthNumber).padStart("2", 0)}`
        });

        if (monthNumber % 12 == 0) {
          startingYear++;
          monthNumber = 0;
        }
      }

      return dates;
    }
  }
};

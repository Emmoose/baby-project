// TO FIX
// CHECK ALL EVEN RANGES
// MAKE SURE NOT DEPENDENT ON EACH OTHER? RIGHT NOW THEY ARE

export default {
  // LinkHead - top of LinkedList - format next: object|null, startTime: time|null , time|null}
  linkedHead: null,
  // LinkEnd - end of LinkedList - format next: null, startTime: time|null , time|null}
  linkEnd: null,

  //
  // Check if value is at the end of ImageRanges
  // paramenter - value
  // returns - boolean
  //
  IsValueAtEnd: function(value) {
    //THIS CAN BE REFACTORED INTO ONE LINE
    if (this.linkedHead != null) {
      return this.linkEnd.endTime > value;
    } else {
      return false;
    }
  },

  //
  // Check if two values are if different ranges next to each other
  // paramenter - startTime1, endTime
  // return object { inView: boolean, endTimeTopRange: null|number }
  //
  areTwoRegionsInView: function(firstTime, secondTime) {
    // if (firstTime < secondTime) {
    //   throw "firstTime must be larger than secondTime!";
    // }

    var linkedTemp = this.linkedHead,
      data = { inView: false, endTimeTopRange: null };

    while (linkedTemp != null) {
      if (
        linkedTemp.startTime >= firstTime &&
        linkedTemp.endTime <= firstTime &&
        linkedTemp.next &&
        linkedTemp.next.startTime >= secondTime &&
        linkedTemp.next.endTime <= secondTime
      ) {
        data.inView = true;
        data.endTimeTopRange = linkedTemp.endTime;
        break;
      }

      linkedTemp = linkedTemp.next;
    }

    return data;
  },

  //
  // Adds a time range to imageRanges, merges with existing ranges if necessary
  // paramenter - startTime1, endTime
  //
  addTimeRange: function(startTime, endTime) {
    if (endTime > startTime) {
      console.log("TEMP ERROR MSG");
      this.printRange();
      console.log("startTime", startTime);
      console.log("endTime", endTime);
      throw "StartTime must be larger than endTime!";
    }

    // CAN I REFACTOR OUT THIS IF? WITH RETURN STATEMENT?
    if (this.linkedHead == null) {
      this.linkedHead = this.linkEnd = {
        startTime: startTime,
        endTime: endTime,
        next: null
      };
    } else {
      var linkedTemp = this.linkedHead;
      while (linkedTemp != null) {
        // Append new range to end
        if (linkedTemp.endTime - 1 > startTime && linkedTemp.next == null) {
          // console.log("Append to range");
          linkedTemp.next = this.linkEnd = {
            startTime: startTime,
            endTime: endTime,
            next: null
          };
          break;
        }

        // CASE - endTime is before current range
        if (linkedTemp.startTime + 1 < endTime) {
          // console.log("CASE - endTime is before current range");
          var tempHead = this.linkedHead;
          this.linkedHead = {
            startTime: startTime,
            endTime: endTime,
            next: tempHead
          };
          break;
        }

        // Inset new range into ranges
        if (
          linkedTemp.endTime - 1 > startTime &&
          linkedTemp.next.startTime < endTime
        ) {
          // console.log("Insert into range");
          var nexTemp = linkedTemp.next;
          linkedTemp.next = {
            startTime: startTime,
            endTime: endTime,
            next: nexTemp
          };
          break;
        }

        // Merge existing ranges

        if (linkedTemp.endTime - 1 <= startTime) {
          // console.log("In here");
          var innerLinkedTemp = linkedTemp;

          while (innerLinkedTemp != null) {
            // CASE - endTime is larger than startTime of current range
            if (innerLinkedTemp.startTime + 1 < endTime) {
              // console.log(
              //   "CASE - endTime is  larger than startTime of current range"
              // );
              linkedTemp.endTime = endTime;
              linkedTemp.startTime =
                startTime > linkedTemp.startTime
                  ? startTime
                  : linkedTemp.startTime;
              linkedTemp.next = innerLinkedTemp;
              // If merge resulted in only one item left, set that to linkEnd
              if (this.linkedHead.next == null) {
                this.linkEnd = this.linkedHead;
              }
              break;
            }

            // CASE - endTime is withing current range
            if (
              innerLinkedTemp.startTime + 1 >= endTime &&
              innerLinkedTemp.endTime <= endTime
            ) {
              // console.log("CASE - endTime is withing current range");
              linkedTemp.endTime = innerLinkedTemp.endTime;
              linkedTemp.startTime =
                startTime > linkedTemp.startTime
                  ? startTime
                  : linkedTemp.startTime;
              linkedTemp.next = innerLinkedTemp.next;
              // If merge resulted in only one item left, set that to linkEnd
              if (this.linkedHead.next == null) {
                this.linkEnd = this.linkedHead;
              }
              break;
            }

            if (
              innerLinkedTemp.endTime > endTime &&
              innerLinkedTemp.next == null
            ) {
              // console.log("At end of range");
              linkedTemp.endTime = endTime;
              linkedTemp.startTime =
                startTime > linkedTemp.startTime
                  ? startTime
                  : linkedTemp.startTime;
              linkedTemp.next = null;
              this.linkEnd = linkedTemp;
              break;
            }

            innerLinkedTemp = innerLinkedTemp.next;
          }
          break;
        }

        linkedTemp = linkedTemp.next;
      }
    }
  },

  //
  // Print formated version of LinkedList
  //
  printRange: function() {
    var linkedTemp = this.linkedHead;
    console.log("Ranges are:");
    while (linkedTemp != null) {
      console.log(linkedTemp);

      linkedTemp = linkedTemp.next;
    }
    console.log("End range is:");
    console.log(this.linkEnd);
  },

  //
  // Get endTime LinkEnd in LinkedList
  // return object|null
  //
  getEndValue: function() {
    return this.linkEnd ? this.linkEnd.endTime : null;
  },

  //
  // Check is link is empty
  // return boolean
  //
  isListEmpty: function() {
    return this.linkedHead == null;
  }
};

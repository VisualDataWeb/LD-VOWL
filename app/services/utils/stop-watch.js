'use strict';

stopWatch.$inject = ['$log'];

function stopWatch($log) {

  /* jshint validthis: true */
  var that = this;

  that.round = 1;
  that.lastStart = null;
  that.deltas = [];

  that.start = function () {
    that.lastStart = new Date();
    that.round = 1;
    $log.warn('[Stop Watch] Started!');
  };

  that.stop = function () {
    if (that.lastStart !== null) {
      let stopTime = new Date();
      let delta = ((stopTime.getTime() - that.lastStart.getTime()) / 1000);
      $log.warn(`[Stop Watch] Round ${that.round}: ${delta} seconds.`);
      that.round++;
      that.deltas.push(delta);
    } else {
      $log.warn('[Stop Watch] has not been started!');
    }
  };

}

export default stopWatch;

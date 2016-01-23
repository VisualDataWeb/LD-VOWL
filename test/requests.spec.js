import app from '../app/app';

describe('Service: Requests', function () {

  let requestsService;

  beforeEach(angular.mock.module(app.name));

  beforeEach(angular.mock.inject(function(Requests) {
    requestsService = Requests;
    requestsService.incPendingRequests();
  }));

  it('should exist', function() {
    expect(requestsService).toBeDefined();
  });

  it('should return number of pending requests', function () {
    expect(requestsService.getPendingRequests()).toBe(1);
  });

  it('should be possible to increase the number of pending requests', function () {
    expect(requestsService.getPendingRequests()).toBe(1);
    requestsService.incPendingRequests();
    expect(requestsService.getPendingRequests()).toBe(2);
  });

  it('should be possible to decrease the number of pending requests', function () {
    expect(requestsService.getPendingRequests()).toBe(1);
    requestsService.decPendingRequests();
    expect(requestsService.getPendingRequests()).toBe(0);
  });

  it('should NOT be possible to decrease the number of pending requests below 0', function () {
    expect(requestsService.getPendingRequests()).toBe(1);
    requestsService.decPendingRequests();
    expect(requestsService.getPendingRequests()).toBe(0);
    requestsService.decPendingRequests();
    expect(requestsService.getPendingRequests()).toBe(0);
  });

  it('should return number of successful requests', function () {
    expect(requestsService.getSuccessfulRequests()).toBe(0);
  });

  it('should be possible to increase the number of successful requests', function () {
    expect(requestsService.getSuccessfulRequests()).toBe(0);
    requestsService.incSuccessfulRequests();
    expect(requestsService.getSuccessfulRequests()).toBe(1);
  });

  it('should return number of failed requests', function () {
    expect(requestsService.getFailedRequests()).toBe(0);
  });

  it('should be possible to increase the number of failed requests', function () {
    expect(requestsService.getFailedRequests()).toBe(0);
    requestsService.incFailedRequests();
    expect(requestsService.getFailedRequests()).toBe(1);
  });

});

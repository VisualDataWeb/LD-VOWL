import angular from 'angular';

import extractors from './extractors/extractors.module';
import model from './model/model.module';
import requests from './requests/requests.module';
import utils from './utils/utils.module';

import endpoints from './endpoints.srv';

export default angular.module('services', [extractors, model, requests, utils])
                      .service('Endpoints', endpoints)
                      .name;

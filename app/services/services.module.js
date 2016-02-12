import angular from 'angular';

import extractors from './extractors/index';
import model from './model/index';
import requests from './requests/requests.module';
import utils from './utils/utils.module';

export default angular.module('services', [extractors, model, requests, utils])
                      .name;

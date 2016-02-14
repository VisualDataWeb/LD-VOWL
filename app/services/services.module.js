import angular from 'angular';

import extractors from './extractors/extractors.module';
import model from './model/model.module';
import requests from './requests/requests.module';
import utils from './utils/utils.module';

export default angular.module('services', [extractors, model, requests, utils])
                      .name;

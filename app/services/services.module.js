import angular from 'angular';

import extractors from './extractors/extractors.module';
import model from './model/model.module';
import requests from './requests/requests.module';
import utils from './utils/utils.module';
import links from './links.srv';
import storage from './storage.srv';

import endpoints from './endpoints.srv';

export default angular.module('services', [extractors.name, model.name, requests.name, utils.name])
                      .service('Endpoints', endpoints)
                      .service('Links', links)
                      .service('Storage', storage);

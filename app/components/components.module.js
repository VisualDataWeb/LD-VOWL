import angular from 'angular';

import graph from './graph/graph.module';
import header from './header/header.module';
import settings from './settings/settings.module';
import sidebar from './sidebar/sidebar.module';
import start from './start/start.module';
import about from './about/about.module';

export default angular.module('components', [graph.name, 
                                              header.name, 
                                              settings.name,
                                              sidebar.name,
                                              start.name,
                                              about.name]);

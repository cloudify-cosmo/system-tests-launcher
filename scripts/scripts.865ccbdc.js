"use strict";!function(){var a={qbWebEndpoint:"http://192.168.9.18:8810",qbRestEndpoint:"http://192.168.41.175:9000/rest",suitesYAMLURLPrefix:"https://api.github.com/repos/cloudify-cosmo/cloudify-system-tests/contents/suites/suites/suites.yaml?ref=",defaultQbConfiguration:"root/cosmo/master/Tests/CoreSystemTests",defaultSuitesYAMLBranch:"master"};angular.module("app",["app.service.focus","app.service.searcher","app.service.descriptorBuilder","app.service.suitesYAMLLoader","app.service.suitesYAMLProcessor","app.service.quickbuildLauncher","app.directive.keys","app.directive.items"]).value("appConstants",a)}(),angular.module("app.service.focus",[]).factory("focus",["$timeout",function(a){return function(b,c){a(function(){var a=document.getElementById(b);a&&(a.focus(),c&&a.blur())})}}]),angular.module("app.service.searcher",[]).factory("searcher",function(){var a=function(a,b){this.patterns=a.split(" ")};a.prototype.search=function(a){var b=_.map(this.patterns,function(b){return a.indexOf(b)}),c=_.all(b,function(a){return a>-1}),d=_.reduce(b,function(a,b){return a+b},0);return{isMatch:c,score:d}};var b=function(b){return new Fuse(b,{keys:["name"],searchFn:a})};return{newSearcher:b}}),angular.module("app.service.descriptorBuilder",[]).factory("descriptorBuilder",function(){var a=function(a,b){var c=_.map(a,function(a){return a.name});return _.forEach(b,function(a){var b=_.map(a.tests,function(a){return a.name}).join(","),d=a.handlerConfiguration.name;c.push(b+"@"+d)}),c.join("#")};return{build:a}}),angular.module("app.service.suitesYAMLLoader",[]).factory("suitesYAMLLoader",["$log","$http","$q",function(a,b,c){var d=function(d){return c(function(c,e){b.get(d).then(function(a){var b;b=a.data.content?Base64.decode(a.data.content):a.data;var d=jsyaml.load(b);c(d)},function(b){a.error("Unable to fetch "+d),e&&e(b)})})};return{load:d}}]),angular.module("app.service.suitesYAMLProcessor",[]).factory("suitesYAMLProcessor",function(){var a=function(a){return _.map(a,function(a,b){return a.name=b,a})},b=function(a){return{name:a,selected:!1,tests:["cloudify-system-tests/"+a],type:"test"}},c=function(b){var c=b.handler_configurations,d=b.test_suites,e=_.map(a(c),function(a){return a.env=a.env||a.handler,a.type="configuration",a.selected=!1,a}),f=_.map(a(b.tests),function(a){a.type="test",a.selected=!1;var b="cloudify-system-tests";return a.external&&(b=a.external.repo),a.tests=_.map(a.tests,function(a){return b+"/"+a}),a}),g=_.map(a(d),function(a){a.handlerConfiguration=a.handler_configuration,delete a.handler_configuration;var b=c[a.handlerConfiguration];return b&&(a.env=b.env),a.type="suite",a.tests=_.flatten(_.map(a.tests,function(a){var b=_.find(f,function(b){return a===b.name});return b?b.tests:"cloudify-system-tests/"+a})),a});return{configurations:e,suites:g,tests:f}};return{createTestObject:b,process:c}}),angular.module("app.service.quickbuildLauncher",[]).factory("quickbuildLauncher",["$http","$log","$window",function(a,b,c){var d=function(d,e,f,g,h){var i=e+"/ids?configuration_path="+f;a.get(i).then(function(i){b.info("requesting build for configuration id: "+i.data);var j=i.data,k=[{key:"system_tests_branch",val:g},{key:"system_tests_descriptor",val:h}],l=_.map(k,function(a){return"<entry><string>"+a.key+"</string><string>"+a.val+"</string></entry>"}).join(""),m="<com.pmease.quickbuild.BuildRequest><configurationId>"+j+"</configurationId><respectBuildCondition>true</respectBuildCondition><variables>"+l+"</variables></com.pmease.quickbuild.BuildRequest>",n=e+"/build_requests";a({url:n,method:"POST",withCredentials:!0,data:m}).then(function(a){c.location.assign(d+"/overview/"+j)},function(a){b.error("Failed launching configuration "+f)})},function(a){b.error("Failed getting configuration id for "+f)})};return{launch:d}}]),function(){var a=function(a,b){return function(){var c=function(c,d,e){d.on("keydown keypress",function(d){d.which===a&&(c.$apply(function(){c.$eval(b(e),{event:d})}),d.preventDefault())})};return{link:c}}};angular.module("app.directive.keys",["app.service.focus","cfp.hotkeys"]).directive("stlEnter",a(13,function(a){return a.stlEnter})).directive("stlEscape",a(27,function(a){return a.stlEscape})).directive("stlHotKeys",["hotkeys","focus",function(a,b){var c=function(c){var d=c,e=function(a){return function(c){b(a),c.preventDefault()}},f=function(a,b){return function(c){d.startSearch(d[a].all,b),c.preventDefault()}};a.bindTo(d).add({combo:"a c",description:"Apply Custom Suite",callback:d.applyCustom}).add({combo:"l l",description:"Launch Configuration in QuickBuild",callback:d.launchConfiguration}).add({combo:"r r",description:"Reset",callback:d.reset}).add({combo:"d o",description:"Descriptor Overview",callback:d.descriptorOverview}).add({combo:"f b",description:"Focus Branch",callback:e("branch_input")}).add({combo:"f q",description:"Focus QuickBuild Configuration",callback:e("configuration_input")}).add({combo:"f t",description:"Focus Custom Tests",callback:e("custom_tests_input")}).add({combo:"f d",description:"Focus Descriptor",callback:e("descriptor")}).add({combo:"s s",description:"Select Suite",callback:f("suites","Select Suite")}).add({combo:"s c",description:"Select Configuration",callback:f("configurations","Select Configuration")}).add({combo:"s t",description:"Select Test",callback:f("tests","Select Test")})};return{restrict:"A",link:c}}])}(),angular.module("app.directive.items",[]).directive("stlItems",function(){var a=function(a){a.overview=a.$parent.overview,a.calculate=a.$parent.calculate};return{restrict:"E",link:a,scope:{items:"=",type:"@input"},templateUrl:"views/items.html"}}),angular.module("app").controller("SystemTestsController",["$http","$scope","$log","$timeout","appConstants","focus","searcher","descriptorBuilder","suitesYAMLLoader","suitesYAMLProcessor","quickbuildLauncher",function(a,b,c,d,e,f,g,h,i,j,k){var l=function(){b.searchInput="",b.searchInputListenerUnregister=null,b.searchResult=[],b.searchLabel="",b.searchSelection=null,b.searchShown=!1};b.reset=function(){b.applyCustomDisabled=!0,b.launchConfigurationDisabled=!0,b.suites.selected=[],b.customSuites=[],b.descriptor="",b.descriptorOverviewShown=!1,b.currentCustom={tests:[]},b.currentCustomTests="",b.configurations.all&&_.forEach(b.configurations.all,function(a){a.selected=!1}),b.tests.all&&_.forEach(b.tests.all,function(a){a.selected=!1}),l()},b.branch=e.defaultSuitesYAMLBranch,b.configuration=e.defaultQbConfiguration,b.configurations={},b.tests={},b.suites={},b.reset(),b.addCustomTests=function(){var a,c=_.map(b.tests.all,function(a){return a.name});a=_.uniq(b.currentCustomTests.split(",")),a=_.filter(a,function(a){return!_.contains(c,a)}),a=_.map(a,j.createTestObject),b.tests.all=b.tests.all.concat(a),b.currentCustomTests="",m()},b.calculate=function(a){"suite"===a.type?(b.suites.selected.push(a),b.overview(a,!1)):"configuration"===a.type?(b.currentCustom.handlerConfiguration=a,_.forEach(b.configurations.all,function(a){a.selected=!1}),a.selected=!0):"test"===a.type&&(a.selected?(a.selected=!1,_.remove(b.currentCustom.tests,function(b){return b.name===a.name})):(a.selected=!0,b.currentCustom.tests.push(a))),m()};var m=function(){b.descriptor=h.build(b.suites.selected,b.customSuites),b.applyCustomDisabled=0===b.currentCustom.tests.length||!b.currentCustom.handlerConfiguration,b.launchConfigurationDisabled=0===b.branch.length||0===b.descriptor.length};b.overview=function(a,c){c?(b.descriptorOverviewShown=!1,a.overviewShown=!0):a.overviewShown=!1},b.descriptorOverview=function(){b.descriptorOverviewShown=!b.descriptorOverviewShown},b.applyCustom=function(){b.applyCustomDisabled||(b.customSuites.push(b.currentCustom),b.overview(b.currentCustom.handlerConfiguration,!1),_.forEach(b.currentCustom.tests,function(a){b.overview(a,!1)}),b.currentCustom={tests:[]},m())},b.loadSuitesYAML=function(){var a=e.suitesYAMLURLPrefix+b.branch;i.load(a).then(n)};var n=function(a){var c=j.process(a);b.configurations.all=c.configurations,b.tests.all=c.tests,b.suites.all=c.suites,b.reset()};b.launchConfiguration=function(){b.launchConfigurationDisabled||k.launch(e.qbWebEndpoint,e.qbRestEndpoint,b.configuration,b.branch,b.descriptor)},b.loadSuitesYAML(),b.loseFocus=function(){f("descriptor",!0)},b.startSearch=function(a,c){b.searcher=g.newSearcher(a),b.searchLabel=c,b.searchShown=!0,b.searchInput="",b.searchInputListenerUnregister&&b.searchInputListenerUnregister(),b.searchInputListenerUnregister=b.$watch("searchInput",function(){b.searchResult=b.searcher.search(b.searchInput),b.searchResult.length>0&&(b.searchSelection=b.searchResult[0])}),d(function(){f("search_input")})},b.endSearch=function(a){a&&b.searchSelection&&b.calculate(b.searchSelection),b.searchInputListenerUnregister(),l()}}]);
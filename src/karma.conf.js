module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: [ 'jasmine', '@angular-devkit/build-angular' ],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        random: false,
        failSpecWithNoExpectations: true
      },
      clearContext: true
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/grappa-test-app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text' },
        { type: 'lcovonly' },
        { type: 'text-summary' }
      ]
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: [ 'progress', 'kjhtml' ],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: 1,
    autoWatch: false,
    restartOnFileChange: true,
    browsers: [ 'ChromeHeadlessCustom' ],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        flags: [ '--no-sandbox' ]
      }
    },
    singleRun: true
  });
};

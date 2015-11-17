namespace('sys.bundle');

sys.bundle.Service = (function() {
  Service.$inject = ['$q', 'sys.filesystem', '$http'];

  Service.bundleDescriptionFile = 'bundleDescription.json';

  function Service(q, filesystem, http) {
    this.q = q;
    this.filesystem = filesystem;
    this.http = http;
  }

  Service.prototype.install = function(bundleDescription) {
    var deferred, filterFiles, fs;
    deferred = this.q.defer();
    if (bundleDescription == null) {
      deferred.reject('no bundle description for installation');
      return deferred.promise;
    }
    fs = this.filesystem;
    filterFiles = function(files) {
      var file, i, len, results;
      results = [];
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        if (!file.filename.endsWith('/')) {
          results.push(file);
        }
      }
      return results;
    };
    MultiFile.load(bundleDescription.url, function() {
      var asyncTasks, file, i, len, onError, onSuccess, processFile, ref;
      this.files = filterFiles(this.files);
      asyncTasks = this.files.length + 1;
      onSuccess = function() {
        --asyncTasks;
        if (asyncTasks <= 0) {
          return deferred.resolve('ok');
        }
      };
      onError = function(error) {
        return deferred.reject('Error #{error}');
      };
      processFile = function(file) {
        return fs.saveAsBinary(file.filename, file.data, {
          success: onSuccess,
          error: onError
        });
      };
      ref = this.files;
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        processFile(file);
      }
      return fs.saveAsText(sys.bundle.Service.bundleDescriptionFile, JSON.stringify(bundleDescription), {
        success: onSuccess,
        error: onError
      });
    });
    return deferred.promise;
  };

  Service.prototype.list = function() {
    return this.http.get('/all-bundles.json');
  };

  return Service;

})();

namespace('ru.check.please.home');

ru.check.please.home.Service = (function() {
  Service.$inject = ['$state', '$ionicModal', '$timeout', '$rootScope', 'ru.diag.pro.pinpad.stateName', 'ru.diag.pro.printer.stateName', 'ru.diag.pro.touchscreen.stateName', 'ru.diag.pro.dispenser.stateName', 'ru.diag.pro.cardreader.stateName'];

  function Service(state, ionicModal, timeout, rootScope, pinpadStateName, printerStateName, touchscreenStateName, dispenserStateName, cardreaderStateName) {
    var template;
    this.state = state;
    this.timeout = timeout;
    this.pinpadStateName = pinpadStateName;
    this.printerStateName = printerStateName;
    this.touchscreenStateName = touchscreenStateName;
    this.dispenserStateName = dispenserStateName;
    this.cardreaderStateName = cardreaderStateName;
    this.scope = rootScope.$new(true);
    this.scope.device = ' ';
    this.scope.imageForDev = function(dev) {
      if (dev === 'Диспенсер' || dev === 'Кардридер' || dev === 'Принтер') {
        return "img/scan-" + dev + ".jpg";
      }
      return "img/scan-.jpg";
    };
    template = '<ion-modal-view style="background-color: white; left: 0; top: 0; height: 100%; width: 100%">\n<div style="margin: auto; position: absolute; top: 0; left: 0; bottom: 0; right: 0; text-align: center; width: 261px; height: 412px;">\n  <ion-spinner></ion-spinner>\n  <img ng-show="fullScan" style="width: 261px; height: 412px;" ng-src="{{imageForDev(device)}}">\n  <div ng-show="device">{{device}}</div>\n</div>\n</ion-modal-view>';
    this.waitingModal = ionicModal.fromTemplate(template, {
      hardwareBackButtonClose: false,
      backdropClickToClose: false,
      scope: this.scope,
      animation: 'popup'
    });
  }

  Service.prototype.showWaitingModal = function(newDevice) {
    if (newDevice != null) {
      this.scope.device = newDevice;
    }
    return this.waitingModal.show();
  };

  Service.prototype.hideWaitingModal = function() {
    this.scope.fullScan = false;
    return this.waitingModal.hide();
  };

  Service.prototype.waitForFullScan = function() {
    this.scope.fullScan = true;
    return this.showWaitingModal().then((function(_this) {
      return function() {
        return _this.scanCardreader();
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.scanDispenser();
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.scanPinpad();
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.scanPrinter();
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.scanTouchscreen();
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.hideWaitingModal();
      };
    })(this)).then((function(_this) {
      return function() {
        var currentState, i, len, ref, results;
        ref = _this.state.get();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          currentState = ref[i];
          if (currentState.deviceState != null) {
            results.push(currentState);
          }
        }
        return results;
      };
    })(this));
  };

  Service.prototype.scanCardreader = function() {
    return this._udateErrorCodes(this.cardreaderStateName, []);
  };

  Service.prototype.scanDispenser = function() {
    return this._udateErrorCodes(this.dispenserStateName, [ru.diag.pro.error.codes.dispenser.motorSpeedError]);
  };

  Service.prototype.scanPinpad = function() {
    return this._udateErrorCodes(this.pinpadStateName, []);
  };

  Service.prototype.scanPrinter = function() {
    return this._udateErrorCodes(this.printerStateName, [ru.diag.pro.error.codes.printer.paperNearEnd]);
  };

  Service.prototype.scanTouchscreen = function() {
    return this._udateErrorCodes(this.touchscreenStateName, []);
  };

  Service.prototype._udateErrorCodes = function(stateName, codes) {
    var deviceState;
    deviceState = this.state.get(stateName).deviceState;
    this.scope.device = deviceState.name;
    this.scope.$applyAsync();
    return this.timeout(1000).then((function(_this) {
      return function() {
        return deviceState.errorCodes = codes;
      };
    })(this));
  };

  return Service;

})();

namespace('ru.diag.pro.cardreader');

ru.diag.pro.cardreader.Service = (function() {
  Service.$inject = ['$state', '$timeout', 'ru.diag.pro.cardreader.stateName'];

  function Service(state, timeout, printerStateName) {
    this.timeout = timeout;
    this.printerStateName = printerStateName;
    this.deviceState = state.get(this.printerStateName).deviceState;
  }

  Service.prototype.deviceName = function() {
    return this.deviceState.name;
  };

  Service.prototype.scan = function() {
    return this._udateErrorCodes(this.printerStateName, []);
  };

  Service.prototype._udateErrorCodes = function(stateName, codes) {
    return this.timeout(100).then((function(_this) {
      return function() {
        return _this.deviceState.errorCodes = codes;
      };
    })(this));
  };

  return Service;

})();

namespace('ru.diag.pro.printer');

ru.diag.pro.printer.Service = (function() {
  Service.$inject = ['$state', '$timeout', 'ru.diag.pro.printer.stateName'];

  function Service(state, timeout, printerStateName) {
    this.timeout = timeout;
    this.printerStateName = printerStateName;
    this.deviceState = state.get(this.printerStateName).deviceState;
  }

  Service.prototype.deviceName = function() {
    return this.deviceState.name;
  };

  Service.prototype.scan = function() {
    return this._udateErrorCodes(this.printerStateName, [ru.diag.pro.error.codes.printer.paperNearEnd]);
  };

  Service.prototype._udateErrorCodes = function(stateName, codes) {
    return this.timeout(100).then((function(_this) {
      return function() {
        return _this.deviceState.errorCodes = codes;
      };
    })(this));
  };

  return Service;

})();

namespace('ru.diag.pro.pinpad');

ru.diag.pro.pinpad.Service = (function() {
  Service.$inject = [];

  function Service() {}

  return Service;

})();

namespace('ru.diag.pro.touchscreen');

ru.diag.pro.touchscreen.Service = (function() {
  Service.$inject = [];

  function Service() {}

  return Service;

})();

namespace('ru.diag.pro.dispenser');

ru.diag.pro.dispenser.Service = (function() {
  Service.$inject = [];

  function Service() {}

  return Service;

})();

namespace('sys.bundle');

sys.bundle.Controller = (function() {
  Controller.$inject = ['$http'];

  function Controller(http) {
    this.http = http;
  }

  return Controller;

})();

var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

namespace('ru.check.please.home');

ru.check.please.home.Controller = (function() {
  Controller.$inject = ['$scope', '$ionicPopup', 'ru.check.please.home.Service', 'ru.diag.pro.error.codes.device.isCriticalError', 'ru.diag.pro.error.codes.device.isWarningError'];

  function Controller(scope, ionicPopup, homeService, isCriticalError, isWarningError) {
    this.scope = scope;
    this.ionicPopup = ionicPopup;
    this.homeService = homeService;
    this.isCriticalError = isCriticalError;
    this.isWarningError = isWarningError;
    this.scanned = false;
  }

  Controller.prototype.scanDevices = function() {
    this.scanned = false;
    return this.ionicPopup.alert({
      title: 'Сканирование',
      subTitle: 'Сейчас будет произведена диагностика узлов банкомата'
    }).then((function(_this) {
      return function() {
        return _this.homeService.waitForFullScan().then(function(state) {
          _this.devicesState = state;
          _this.bankomatModel = 'NCR Personas 5887';
          return _this.scanned = true;
        });
      };
    })(this));
  };

  Controller.prototype._errorsGroup = function(errors, errorsGroup) {
    var error, i, len, results;
    results = [];
    for (i = 0, len = errors.length; i < len; i++) {
      error = errors[i];
      if (indexOf.call(errorsGroup, error) >= 0) {
        results.push(error);
      }
    }
    return results;
  };

  Controller.prototype.criticalErrorsCount = function(state) {
    var errorCode, i, len, ref, ref1, result;
    result = 0;
    ref1 = (state != null ? (ref = state.deviceState) != null ? ref.errorCodes : void 0 : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      errorCode = ref1[i];
      if (this.isCriticalError(errorCode)) {
        result++;
      }
    }
    return result;
  };

  Controller.prototype.warningErrorsCount = function(state) {
    var errorCode, i, len, ref, ref1, result;
    result = 0;
    ref1 = (state != null ? (ref = state.deviceState) != null ? ref.errorCodes : void 0 : void 0) || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      errorCode = ref1[i];
      if (this.isWarningError(errorCode)) {
        result++;
      }
    }
    return result;
  };

  Controller.prototype.statesWithWarningErrors = function() {
    var i, len, ref, result, state;
    result = [];
    if (!this.devicesState) {
      return result;
    }
    ref = this.devicesState;
    for (i = 0, len = ref.length; i < len; i++) {
      state = ref[i];
      if (this.warningErrorsCount(state) > 0) {
        result.push(state);
      }
    }
    return result;
  };

  Controller.prototype.statesWithCriticalErrors = function() {
    var i, len, ref, result, state;
    result = [];
    if (!this.devicesState) {
      return result;
    }
    ref = this.devicesState;
    for (i = 0, len = ref.length; i < len; i++) {
      state = ref[i];
      if (this.criticalErrorsCount(state) > 0) {
        result.push(state);
      }
    }
    return result;
  };

  Controller.prototype.statesWithoutErrors = function() {
    var state;
    if (!this.devicesState) {
      return [];
    }
    return ((function() {
      var i, len, ref, ref1, ref2, results;
      ref = this.devicesState;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        state = ref[i];
        if ((state != null ? (ref1 = state.deviceState) != null ? (ref2 = ref1.errorCodes) != null ? ref2.length : void 0 : void 0 : void 0) === 0) {
          results.push(state);
        }
      }
      return results;
    }).call(this)) || [];
  };

  Controller.prototype.errorsShortDesc = function(errorCodes) {
    var ref;
    if (!((errorCodes != null ? errorCodes.length : void 0) > 0)) {
      return;
    }
    if (ref = ru.diag.pro.error.codes.dispenser.motorSpeedError, indexOf.call(errorCodes, ref) >= 0) {
      return 'ошибка скорости главного мотора диспенсера';
    }
  };

  Controller.prototype.warningsShortDesc = function(errorCodes) {
    var ref;
    if (!((errorCodes != null ? errorCodes.length : void 0) > 0)) {
      return;
    }
    if (ref = ru.diag.pro.error.codes.printer.paperNearEnd, indexOf.call(errorCodes, ref) >= 0) {
      return 'бумага скоро закончится';
    }
  };

  return Controller;

})();

namespace('ru.diag.pro.cardreader');

ru.diag.pro.cardreader.Controller = (function() {
  Controller.$inject = ['$scope', 'ru.check.please.home.Service', 'ru.diag.pro.cardreader.Service', '$ionicModal', '$ionicScrollDelegate'];

  function Controller(scope, homeService, service, ionicModal, scrollDelegate) {
    this.homeService = homeService;
    this.service = service;
    scope.closeHelper = (function(_this) {
      return function() {
        return _this.helperModal.hide();
      };
    })(this);
    scope.closeKnowlege = (function(_this) {
      return function() {
        return _this.knowlegeModal.hide();
      };
    })(this);
    scope.scrollUp = (function(_this) {
      return function(delegate) {
        return scrollDelegate.$getByHandle(delegate).scrollBy(0, -40);
      };
    })(this);
    scope.scrollDown = (function(_this) {
      return function(delegate) {
        return scrollDelegate.$getByHandle(delegate).scrollBy(0, 40);
      };
    })(this);
    ionicModal.fromTemplateUrl('templates/cardreader-helper-template.html', {
      scope: scope
    }).then((function(_this) {
      return function(ctrlr) {
        return _this.helperModal = ctrlr;
      };
    })(this));
    scope.$on('$destroy', (function(_this) {
      return function() {
        var ref, ref1;
        if ((ref = _this.helperModal) != null) {
          ref.remove();
        }
        return (ref1 = _this.knowlegeModal) != null ? ref1.remove() : void 0;
      };
    })(this));
    ionicModal.fromTemplateUrl('templates/cardreader-helper-knowlege-template.html', {
      scope: scope
    }).then((function(_this) {
      return function(ctrlr) {
        return _this.knowlegeModal = ctrlr;
      };
    })(this));
  }

  Controller.prototype.scan = function() {
    return this.homeService.showWaitingModal(this.service.deviceName()).then((function(_this) {
      return function() {
        return _this.service.scan()["finally"](function() {
          return _this.homeService.hideWaitingModal();
        });
      };
    })(this));
  };

  Controller.prototype.openHelper = function() {
    return this.helperModal.show();
  };

  Controller.prototype.openKnowlege = function() {
    return this.knowlegeModal.show();
  };

  return Controller;

})();

namespace('ru.diag.pro.printer');

ru.diag.pro.printer.Controller = (function() {
  Controller.$inject = ['$scope', 'ru.check.please.home.Service', 'ru.diag.pro.printer.Service', '$ionicModal', '$ionicScrollDelegate'];

  function Controller(scope, homeService, printerService, ionicModal, scrollDelegate) {
    this.homeService = homeService;
    this.printerService = printerService;
    scope.closeHelper = (function(_this) {
      return function() {
        return _this.helperModal.hide();
      };
    })(this);
    scope.closeKnowlege = (function(_this) {
      return function() {
        return _this.knowlegeModal.hide();
      };
    })(this);
    scope.scrollUp = (function(_this) {
      return function(delegate) {
        return scrollDelegate.$getByHandle(delegate).scrollBy(0, -40);
      };
    })(this);
    scope.scrollDown = (function(_this) {
      return function(delegate) {
        return scrollDelegate.$getByHandle(delegate).scrollBy(0, 40);
      };
    })(this);
    ionicModal.fromTemplateUrl('templates/printer-helper-template.html', {
      scope: scope
    }).then((function(_this) {
      return function(ctrlr) {
        return _this.helperModal = ctrlr;
      };
    })(this));
    scope.$on('$destroy', (function(_this) {
      return function() {
        var ref, ref1;
        if ((ref = _this.helperModal) != null) {
          ref.remove();
        }
        return (ref1 = _this.knowlegeModal) != null ? ref1.remove() : void 0;
      };
    })(this));
    ionicModal.fromTemplateUrl('templates/printer-helper-knowlege-template.html', {
      scope: scope
    }).then((function(_this) {
      return function(ctrlr) {
        return _this.knowlegeModal = ctrlr;
      };
    })(this));
  }

  Controller.prototype.scan = function() {
    return this.homeService.showWaitingModal(this.printerService.deviceName()).then((function(_this) {
      return function() {
        return _this.printerService.scan()["finally"](function() {
          return _this.homeService.hideWaitingModal();
        });
      };
    })(this));
  };

  Controller.prototype.openHelper = function() {
    return this.helperModal.show();
  };

  Controller.prototype.openKnowlege = function() {
    return this.knowlegeModal.show();
  };

  return Controller;

})();

namespace('ru.diag.pro.pinpad');

ru.diag.pro.pinpad.Controller = (function() {
  Controller.$inject = [];

  function Controller() {}

  return Controller;

})();

namespace('ru.diag.pro.touchscreen');

ru.diag.pro.touchscreen.Controller = (function() {
  Controller.$inject = [];

  function Controller() {}

  return Controller;

})();

namespace('ru.diag.pro.dispenser');

ru.diag.pro.dispenser.Controller = (function() {
  Controller.$inject = [];

  function Controller() {}

  return Controller;

})();

namespace('sys.bundle');

angular.module(['sys.bundle', '1.0.0'], ['ionic']).service('sys.bundle.Service', sys.bundle.Service).controller('sys.bundle.Controller', sys.bundle.Controller);

namespace('ru.check.please.home');

angular.module(['ru.check.please.home', '1.0.0'], ['ionic', 'sys.menu', 'sys.bundle', 'ru.diag.pro.error.codes', 'ru.diag.pro.cardreader', 'ru.diag.pro.printer', 'ru.diag.pro.pinpad', 'ru.diag.pro.touchscreen', 'ru.diag.pro.dispenser']).config([
  '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    return $stateProvider.state('menu.home', {
      url: '/home',
      showInSideMenu: true,
      order: 10,
      title: 'Информация',
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/home.html';
          },
          controller: 'ru.check.please.home.Controller as controller'
        }
      }
    });
  }
]).service('ru.check.please.home.Service', ru.check.please.home.Service).controller('ru.check.please.home.Controller', ru.check.please.home.Controller).run(['$log', 'sys.auth.basic.Service', function(log, httpService) {}]);

namespace('ru.diag.pro.cardreader');

namespace('ru.diag.pro.cardreader.management');

angular.module(['ru.diag.pro.cardreader', '1.0.0'], ['ionic', 'sys.menu', 'sys.bundle']).constant('ru.diag.pro.cardreader.stateName', 'menu.cardreader').service('ru.diag.pro.cardreader.Service', ru.diag.pro.cardreader.Service).config([
  '$stateProvider', '$urlRouterProvider', 'ru.diag.pro.cardreader.stateName', function($stateProvider, $urlRouterProvider, stateName) {
    var deviceState;
    deviceState = {
      name: 'Кардридер'
    };
    $stateProvider.state(stateName, {
      url: '/cardreader',
      showInSideMenu: true,
      order: 30,
      title: 'Кардридер',
      deviceState: deviceState,
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/cardreader-template.html';
          },
          controller: 'ru.diag.pro.cardreader.Controller as controller'
        }
      }
    });
    return $stateProvider.state(stateName + "-management", {
      url: '/cardreader-management',
      showInSideMenu: false,
      title: 'Управление кардридером',
      deviceState: deviceState,
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/cardreader-management-template.html';
          }
        }
      }
    });
  }
]).controller('ru.diag.pro.cardreader.Controller', ru.diag.pro.cardreader.Controller);

namespace('ru.diag.pro.printer');

angular.module(['ru.diag.pro.printer', '1.0.0'], ['ionic', 'sys.menu', 'sys.bundle', 'ru.diag.pro.error.codes']).constant('ru.diag.pro.printer.stateName', 'menu.printer').service('ru.diag.pro.printer.Service', ru.diag.pro.printer.Service).config([
  '$stateProvider', '$urlRouterProvider', 'ru.diag.pro.printer.stateName', function($stateProvider, $urlRouterProvider, stateName) {
    return $stateProvider.state(stateName, {
      url: '/printer',
      showInSideMenu: true,
      order: 20,
      title: 'Принтер',
      deviceState: {
        name: 'Принтер'
      },
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/printer-template.html';
          },
          controller: 'ru.diag.pro.printer.Controller as controller'
        }
      },
      resolve: {
        orderParams: [
          'ru.diag.pro.printer.Service', function(service) {
            return {
              mainService: service
            };
          }
        ]
      }
    });
  }
]).controller('ru.diag.pro.printer.Controller', ru.diag.pro.printer.Controller);

namespace('ru.diag.pro.pinpad');

angular.module(['ru.diag.pro.pinpad', '1.0.0'], ['ionic', 'sys.menu', 'sys.bundle']).constant('ru.diag.pro.pinpad.stateName', 'menu.pinpad').service('ru.diag.pro.pinpad.Service', ru.diag.pro.pinpad.Service).config([
  '$stateProvider', '$urlRouterProvider', 'ru.diag.pro.pinpad.stateName', function($stateProvider, $urlRouterProvider, stateName) {
    return $stateProvider.state(stateName, {
      url: '/pinpad',
      showInSideMenu: true,
      title: 'BNA',
      order: 50,
      deviceState: {
        name: 'BNA'
      },
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/pinpad-template.html';
          },
          controller: 'ru.diag.pro.pinpad.Controller as controller'
        }
      },
      resolve: {
        orderParams: [
          'ru.diag.pro.pinpad.Service', function(service) {
            return {
              mainService: service
            };
          }
        ]
      }
    });
  }
]).controller('ru.diag.pro.pinpad.Controller', ru.diag.pro.pinpad.Controller);

namespace('ru.diag.pro.touchscreen');

angular.module(['ru.diag.pro.touchscreen', '1.0.0'], ['ionic', 'sys.menu', 'sys.bundle']).constant('ru.diag.pro.touchscreen.stateName', 'menu.touchscreen').service('ru.diag.pro.touchscreen.Service', ru.diag.pro.touchscreen.Service).config([
  '$stateProvider', '$urlRouterProvider', 'ru.diag.pro.touchscreen.stateName', function($stateProvider, $urlRouterProvider, stateName) {
    return $stateProvider.state(stateName, {
      url: '/touchscreen',
      showInSideMenu: true,
      order: 70,
      title: 'Тачскрин',
      deviceState: {
        name: 'Тачскрин'
      },
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/touchscreen-template.html';
          },
          controller: 'ru.diag.pro.touchscreen.Controller as controller'
        }
      },
      resolve: {
        orderParams: [
          'ru.diag.pro.touchscreen.Service', function(service) {
            return {
              mainService: service
            };
          }
        ]
      }
    });
  }
]).controller('ru.diag.pro.touchscreen.Controller', ru.diag.pro.touchscreen.Controller);

namespace('ru.diag.pro.dispenser');

angular.module(['ru.diag.pro.dispenser', '1.0.0'], ['ionic', 'sys.menu', 'sys.bundle']).constant('ru.diag.pro.dispenser.stateName', 'menu.dispenser').service('ru.diag.pro.dispenser.Service', ru.diag.pro.dispenser.Service).config([
  '$stateProvider', '$urlRouterProvider', 'ru.diag.pro.dispenser.stateName', function($stateProvider, $urlRouterProvider, stateName) {
    return $stateProvider.state(stateName, {
      url: '/dispenser',
      showInSideMenu: true,
      order: 40,
      title: 'Диспенсер',
      deviceState: {
        name: 'Диспенсер'
      },
      views: {
        'menuContent': {
          templateUrl: function($stateParams) {
            return 'templates/dispenser-template.html';
          },
          controller: 'ru.diag.pro.dispenser.Controller as controller'
        }
      },
      resolve: {
        orderParams: [
          'ru.diag.pro.dispenser.Service', function(service) {
            return {
              mainService: service
            };
          }
        ]
      }
    });
  }
]).controller('ru.diag.pro.dispenser.Controller', ru.diag.pro.dispenser.Controller);

var k, ref, v,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

namespace('ru.diag.pro.error.codes');

ru.diag.pro.error.codes.connection = {
  noDevice: 10
};

ru.diag.pro.error.codes.connectionErrorCodes = (function() {
  var ref, results;
  ref = ru.diag.pro.error.codes.connection;
  results = [];
  for (k in ref) {
    v = ref[k];
    results.push(v);
  }
  return results;
})();

ru.diag.pro.error.codes.dispenser = {
  motorSpeedError: 40
};

ru.diag.pro.error.codes.printer = {
  noPaper: 20,
  paperNearEnd: 30
};

ru.diag.pro.error.codes.warningErrorCodes = [ru.diag.pro.error.codes.printer.paperNearEnd];

(ref = ru.diag.pro.error.codes.warningErrorCodes).push.apply(ref, ru.diag.pro.error.codes.connectionErrorCodes);

angular.module(['ru.diag.pro.error.codes', '1.0.0'], []).constant('ru.diag.pro.error.codes.connection', ru.diag.pro.error.codes.connection).constant('ru.diag.pro.error.codes.printer', ru.diag.pro.error.codes.printer).constant('ru.diag.pro.error.codes.device.isCriticalError', function(errorCode) {
  if (errorCode == null) {
    return false;
  }
  return indexOf.call(ru.diag.pro.error.codes.warningErrorCodes, errorCode) < 0;
}).constant('ru.diag.pro.error.codes.device.isWarningError', function(errorCode) {
  if (errorCode == null) {
    return false;
  }
  return indexOf.call(ru.diag.pro.error.codes.warningErrorCodes, errorCode) >= 0;
});

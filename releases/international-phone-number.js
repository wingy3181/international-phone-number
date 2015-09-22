(function() {
  "use strict";
  angular.module("internationalPhoneNumber", []).constant('ipnConfig', {
    allowExtensions: false,
    autoFormat: true,
    autoHideDialCode: true,
    autoPlaceholder: true,
    customPlaceholder: null,
    defaultCountry: "",
    geoIpLookup: null,
    nationalMode: true,
    numberType: "MOBILE",
    onlyCountries: void 0,
    preferredCountries: ['us', 'gb'],
    utilsScript: ""
  }).directive('internationalPhoneNumber', [
    '$timeout', 'ipnConfig', function($timeout, ipnConfig) {
      return {
        restrict: 'A',
        require: '^ngModel',
        scope: {
          ngModel: '='
        },
        link: function(scope, element, attrs, ctrl) {
          var handleWhatsSupposedToBeAnArray, hasNotEnteredNumber, isValidNumber, options, read, watchOnce;
          if (ctrl) {
            if (element.val() !== '') {
              $timeout(function() {
                element.intlTelInput('setNumber', element.val());
                if (hasNotEnteredNumber(element.val())) {
                  return ctrl.$setViewValue('');
                } else {
                  return ctrl.$setViewValue(element.val());
                }
              }, 0);
            }
          }
          read = function() {
            if (hasNotEnteredNumber(element.val())) {
              return ctrl.$setViewValue('');
            } else {
              return ctrl.$setViewValue(element.val());
            }
          };
          handleWhatsSupposedToBeAnArray = function(value) {
            if (value instanceof Array) {
              return value;
            } else {
              return value.toString().replace(/[ ]/g, '').split(',');
            }
          };
          isValidNumber = function(value) {
            if (hasNotEnteredNumber(value)) {
              return true;
            }
            return element.intlTelInput("isValidNumber");
          };
          hasNotEnteredNumber = function(value) {
            var selectedCountry;
            selectedCountry = element.intlTelInput('getSelectedCountryData');
            return !value || (selectedCountry && ("+" + selectedCountry.dialCode + " ") === value);
          };
          options = angular.copy(ipnConfig);
          angular.forEach(options, function(value, key) {
            var option;
            if (!(attrs.hasOwnProperty(key) && angular.isDefined(attrs[key]))) {
              return;
            }
            option = attrs[key];
            if (key === 'preferredCountries') {
              return options.preferredCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (key === 'onlyCountries') {
              return options.onlyCountries = handleWhatsSupposedToBeAnArray(option);
            } else if (typeof value === "boolean") {
              return options[key] = option === "true";
            } else {
              return options[key] = option;
            }
          });
          watchOnce = scope.$watch('ngModel', function(newValue) {
            return scope.$$postDigest(function() {
              if (newValue !== null && newValue !== void 0 && newValue.length > 0) {
                if (newValue[0] !== '+') {
                  newValue = '+' + newValue;
                }
                element.val(newValue);
              }
              element.intlTelInput(options);
              if (!(attrs.skipUtilScriptDownload !== void 0 || options.utilsScript)) {
                element.intlTelInput('loadUtils', '/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js');
              }
              return watchOnce();
            });
          });
          ctrl.$formatters.push(function(value) {
            if (!value) {
              return value;
            }
            element.intlTelInput('setNumber', value);
            return element.val();
          });
          ctrl.$parsers.push(function(value) {
            if (!value) {
              ctrl.$setValidity('internationalPhoneNumber', true);
              return value;
            }
            if (ctrl.$validators) {
              return value.replace(/[^\d]/g, '');
            } else if (isValidNumber(value)) {
              ctrl.$setValidity('internationalPhoneNumber', true);
              if (hasNotEnteredNumber(value)) {
                return '';
              } else {
                return value.replace(/[^\d]/g, '');
              }
            } else {
              ctrl.$setValidity('internationalPhoneNumber', false);
              return void 0;
            }
          });
          if (ctrl.$validators) {
            ctrl.$validators.internationalPhoneNumber = isValidNumber;
          }
          element.on('blur keyup change', function(event) {
            return scope.$apply(read);
          });
          return element.on('$destroy', function() {
            element.intlTelInput('destroy');
            return element.off('blur keyup change');
          });
        }
      };
    }
  ]);

}).call(this);

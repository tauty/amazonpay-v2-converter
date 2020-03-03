/** override v1 OffAmazonPayments */
var OffAmazonPayments = (function () {
  // button
  var amznBtnId;
  var merchantId;
  var returnURL;
  amazon.Login = (function () {
    var returnURL;
    return {
      authorize: function (loginOptions, url) {
        this.returnURL = url;
      },
      getReturnURL: function () {
        return this.returnURL;
      },
    };
  }) ();
  // widgets
  var walletElmId;
  var addressBookElmId;
  return {
    Button: function (id, mid, obj) {
      this.amznBtnId = id;
      this.merchantId = mid;
      obj.authorization ();
    },
    getBtnElmId: function () {
      return '#' + this.amznBtnId;
    },
    getMerchantId: function () {
      return this.merchantId;
    },
    Widgets: {
      Wallet: function (obj) {
        return {
          bind: function (id) {
            OffAmazonPayments.Widgets.setWalletElmId (id);
          },
          getElmId: function () {
            return this.walletElmId;
          },
        };
      },
      setWalletElmId: function (id) {
        this.walletElmId = id;
      },
      getWalletElmId: function () {
        return this.walletElmId;
      },
      AddressBook: function (obj) {
        return {
          bind: function (id) {
            OffAmazonPayments.Widgets.setAddressElmId (id);
            this.executeReady ();
          },
          getElmId: function () {
            return this.addressBookElmId;
          },
          executeReady: function () {
            obj.onReady ({
              getAmazonOrderReferenceId: function () {},
            });
          },
        };
      },
      setAddressElmId: function (id) {
        this.addressBookElmId = id;
      },
      getAddressElmId: function () {
        return this.addressBookElmId;
      },
    },
  };
}) ();

/** v1->v2 converter */
var amazonpayV2Converter = (function () {
  // It is possible to use Object.assign on IE to use this function.
  if (!Object.assign) {
    Object.defineProperty (Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function (target) {
        if (target === undefined || target === null) {
          throw new TypeError ('Cannot convert first argument to object');
        }
        var to = Object (target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
          nextSource = Object (nextSource);
          var keysArray = Object.keys (Object (nextSource));
          for (
            var nextIndex = 0, len = keysArray.length;
            nextIndex < len;
            nextIndex++
          ) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor (nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      },
    });
  }

  // generate node
  function createNode (elem) {
    var element = !!elem && elem.nodeType === 1
      ? elem
      : elem.match (/polygon|svg/)
          ? document.createElementNS ('http://www.w3.org/2000/svg', elem)
          : document.createElement (elem);
    element.styles = function (styleJson) {
      Object.assign (element.style, styleJson);
      return element;
    };
    element.attrs = function (attrJson) {
      for (var attr in attrJson) {
        var value = attrJson[attr];
        if (/^on[A-Z]/.test (attr)) {
          var eventName = attr.slice (2).toLocaleLowerCase ();
          element.addEventListener (eventName, value);
        } else {
          element.setAttribute (attr, value);
        }
      }
      return element;
    };
    element.parts = function () {
      if (arguments && arguments.length > 0) {
        for (var i = 0, len = arguments.length; i < len; ++i) {
          element.appendChild (arguments[i]);
        }
      }
      return element;
    };
    element.text = function (str) {
      if (element.innerText !== undefined) {
        element.innerText = str;
      } else if (element.textContent !== undefined) {
        element.textContent = str;
      }
      return element;
    };
    return element;
  }

  // post request
  var post = (function () {
    var url;
    var request;
    var success;
    var error;
    return {
      url: function (url) {
        this.url = url;
        return this;
      },
      request: function (obj) {
        this.request = obj;
        return this;
      },
      success: function (func) {
        this.success = func;
        return this;
      },
      error: function (func) {
        this.error = func;
        return this;
      },
      exec: function () {
        if (!this.url) throw new Error ('Please set url(url)');
        if (!this.success) throw new Error ('Please set success(obj)');
        var xhr = new XMLHttpRequest ();
        xhr.open ('POST', this.url);
        xhr.setRequestHeader ('Content-Type', 'application/json');
        xhr.onload = () => {
          var response = JSON.parse (xhr.response);
          this.success (response);
          //TODO need to check response.status
        };
        xhr.onerror = () => {
          if (this.error) error ();
        };
        if (this.request) xhr.send (this.request);
      },
    };
  }) ();

  // generate Amazon Pay v2 function
  var amazonPayV2 = function (sandbox) {
    var widgetsStyle = {
      border: '1px solid #bbb',
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 10px 0 10px',
    };

    return {
      renderButton (createCheckoutSessionURL) {
        var renderConf = {
          merchantId: OffAmazonPayments.getMerchantId (),
          createCheckoutSession: {
            url: createCheckoutSessionURL,
            method: 'GET',
          },
          ledgerCurrency: 'JPY',
          checkoutLanguage: 'ja_JP',
          productType: 'PayAndShip',
          placement: 'Cart',
        };
        if (sandbox) renderConf.sandbox = true;

        amazon.Pay.renderButton (OffAmazonPayments.getBtnElmId (), renderConf);
      },
      renderAddress (url, checkoutSessionId, postJson) {
        try {
          if (typeof postJson === undefined) postJson = {};

          var postParam = JSON.stringify (postJson);
          post
            .url (url)
            .request (postParam)
            .success (function (obj) {
              // TODO if(!obj){}  
              var addressElm = document.getElementById (
                OffAmazonPayments.Widgets.getAddressElmId ()
              );
              var postalCode = obj.shippingAddress.postalCode;
              var address =
                obj.shippingAddress.stateOrRegion +
                obj.shippingAddress.addressLine1;
              if (obj.shippingAddress.addressLine2)
                address += obj.shippingAddress.addressLine2;
              if (obj.shippingAddress.addressLine3)
                address += obj.shippingAddress.addressLine3;
              var widgets = createNode ('div').parts (
                createNode ('div').text (obj.shippingAddress.name).styles ({
                  fontWeight: 'bold',
                }),
                createNode ('div').text (postalCode),
                createNode ('div').text (address)
              );
                
              var updateButton = createNode ('button')
                .styles ({
                  display: 'block',
                  position: 'relative',
                  fontSize: '1rem',
                  padding: '.375rem .75rem',
                  textAlign: 'center',
                  lineHeight: '1.5',
                  borderRadius: '.25rem',
                  color: '#fff',
                  background: '#6c757d',
                })
                .attrs ({
                  id: 'updateCheckoutDetails',
                })
                .text ('変更');

              createNode (addressElm)
                .styles (widgetsStyle)
                .parts (widgets, updateButton);

              amazon.Pay.bindChangeAction ('#updateCheckoutDetails', {
                amazonCheckoutSessionId: checkoutSessionId,
                changeAction: 'changeAddress',
              });
            })
            .exec ();
        } catch (e) {}
      },
      renderPayment () {
        var walletElm = document.getElementById (
          OffAmazonPayments.Widgets.getWalletElmId ()
        );
        createNode (walletElm).styles (widgetsStyle).parts (
          createNode ('div').text ('Amazon Pay').styles ({
            fontWeight: 'bold',
          })
        );
      },
    };
  };

  if (window.onAmazonPaymentsReady) {
    onAmazonPaymentsReady ();
  }

  var sandbox = false;
  var checkoutSessionId;
  return {
    sandbox: function () {
      sandbox = true;
      return this;
    },
    showButton: function (createCheckoutSessionURL, error) {
      try {
        amazonPayV2 (sandbox).renderButton (createCheckoutSessionURL);
      } catch (e) {
        // TODO if renderButton fails
        if (error) error (e);
      }
    },
    getReturnURL: function () {
      var returnURL = amazon.Login.getReturnURL ();
      return returnURL.match (/http/)
        ? returnURL
        : window.location.origin + '/' + returnURL;
      //TODO ./xxx.html
    },
    getCheckoutSessionId: function () {
      function getURLParameter (name) {
        return (
          decodeURIComponent (
            (new RegExp (
              '[?|&amp;|#]' + name + '=' + '([^&;]+?)(&|#|;|$)'
            ).exec (location.search) || [, ''])[1]
              .replace (/\+/g, '%20')
          ) || null
        );
      }

      checkoutSessionId = getURLParameter ('amazonCheckoutSessionId');
      return checkoutSessionId;
    },
    showAddress: function (url, postJson) {
      amazonPayV2 ().renderAddress (url, checkoutSessionId, postJson);
      return this;
    },
    showPayment: function () {
      amazonPayV2 ().renderPayment ();
      return this;
    },
  };
}) ();

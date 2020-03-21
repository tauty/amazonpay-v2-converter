/** override v1 OffAmazonPayments */
var OffAmazonPayments = (function () {
    // button
    var amznBtnId;
    var merchantId;
    amazon.Login = (function () {
      var returnURL;
      return {
        authorize: function (loginOptions, url) {
          returnURL = url;
        },
        getReturnURL: function () {
          return returnURL;
        },
      };
    }) ();
    // widgets
    var walletElmId;
    var addressBookElmId;
    return {
      Button: function (id, mid, obj) {
        amznBtnId = id;
        merchantId = mid;
        obj.authorization ();
      },
      getBtnElmId: function () {
        return amznBtnId;
      },
      getMerchantId: function () {
        return merchantId;
      },
      Widgets: {
        Wallet: function (obj) {
          return {
            bind: function (id) {
              OffAmazonPayments.Widgets.setWalletElmId (id);
            },
            getElmId: function () {
              return walletElmId;
            },
          };
        },
        setWalletElmId: function (id) {
          walletElmId = id;
        },
        getWalletElmId: function () {
          return walletElmId;
        },
        AddressBook: function (obj) {
          return {
            bind: function (id) {
              OffAmazonPayments.Widgets.setAddressElmId (id);
              this.executeReady ();
            },
            getElmId: function () {
              return addressBookElmId;
            },
            executeReady: function () {
              obj.onReady ({
                getAmazonOrderReferenceId: function () {},
              });
            },
          };
        },
        setAddressElmId: function (id) {
          addressBookElmId = id;
        },
        getAddressElmId: function () {
          return addressBookElmId;
        },
      },
    };
  }) ();
  
/** v1->v2 converter */
var amazonpayV2Converter = ( function () {

  if (window.onAmazonPaymentsReady) {
    onAmazonPaymentsReady();
  }

  setObjectAssign();
  setLoadingIconStyle();
  
  return {
    showButton: function ( createCheckoutSessionURL, buttonParams ) {
      payButton( createCheckoutSessionURL ).parameters( buttonParams );
    },
    getReturnURL: function () {
      var returnURL = amazon.Login.getReturnURL ();
      return returnURL.match (/http/)
        ? returnURL
        : window.location.origin + '/' + returnURL;
    },
    getCheckoutSessionId: (function() {
      var amazonCheckoutSessionId = null;
      return function () {
        return amazonCheckoutSessionId || (
          decodeURIComponent(
            ( new RegExp(
              '[?|&amp;|#]amazonCheckoutSessionId=' + '([^&;]+?)(&|#|;|$)'
            ).exec( location.search ) || [, ''] )[1]
              .replace( /\+/g, '%20' )
          ) || null
        )
      }
    }) (),
    showAddress: function ( url, postJson, widgetsStyle, updateButtonStyle ) {
      payWidgets( widgetsStyle ).address( updateButtonStyle ).show( url, this.getCheckoutSessionId(), postJson );
      return this;
    },
    showPayment: function ( widgetsStyle ) {
      payWidgets( widgetsStyle ).payment().show();
      return this;
    }
  };

  /** functions */
  // This allows IE to use Object.assign method.
  function setObjectAssign () {
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
    element.attrs = function (attrObj) {
      for (var attr in attrObj) {
        var value = attrObj[attr];
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

  // add stylesheet for loading icon
  function setLoadingIconStyle () {
    var styleSheet = document.styleSheets[0];
    var keyframes = '@keyframes loaderAnime {0% {transform: rotate(0deg);-ms-transform: rotate(0deg);-webkit-transform: rotate(0deg);-moz-transform: rotate(0deg);}100% {transform: rotate(360deg);-ms-transform: rotate(360deg);-webkit-transform: rotate(360deg);-moz-transform: rotate(360deg);}}';
    styleSheet.insertRule( keyframes, styleSheet.cssRules.length );    
  }

  // post request
  function post() {
    var _url;
    var _request;
    var _output;
    return {
      url: function (url) {
        _url = url;
        return this;
      },
      request: function (obj) {
        _request = obj;
        return this;
      },
      output: function (func) {
        _output = func;
        return this;
      },
      exec: function () {
        if ( !( _url && _output && _request ) ) {
          alert( 'invalid post pamrameter.' );
          _output();
          return;
        }
        
        var xhr = new XMLHttpRequest ();
        xhr.open( 'POST', _url );
        xhr.setRequestHeader( 'Content-Type', 'application/json' );
        xhr.onload = () => {
          try {
            if (xhr.status === 200) {
              var response = JSON.parse( xhr.response );
              _output( response );
            } else {
              throw new Error(xhr);
            }
          } catch ( e ) {
            if ( e ) console.error( e );
            _output();
          }
        };
        xhr.onerror = () => {
          _output();
        };
        xhr.send( _request );
      },
    };
  }

  // show Amazon Pay buttion
  function payButton ( createCheckoutSessionURL ) {
    // add loading div
    var payButton = document.getElementById( OffAmazonPayments.getBtnElmId() );
    payButton.addEventListener( 'click', function () {
      var loadingElm = createNode( 'div' ).styles({
          width: '1.5em',
          height: '1.5em',
          borderTop: '0.3em solid rgba(140, 139, 139, 0.5)',
          borderRight: '0.3em solid rgba(140, 139, 139, 0.5)',
          borderBottom: '0.3em solid rgba(140, 139, 139, 0.5)',
          borderLeft: '0.3em solid rgba(255, 255, 255, 0.1)',
          animation: 'loaderAnime 1s infinite linear',
          borderRadius: '50%',
          position: 'absolute',
          top: '1em',
          right: '0',
          bottom: '0',
          left: '0',
          margin: 'auto',
          zIndex: '10000'
      });
      payButton.insertAdjacentElement( 'afterend', loadingElm );
      createNode( payButton ).styles( {
        pointerEvents: 'none',
        opacity: '0.4'
      });
    });

    return {
      parameters: function ( buttonParams ) {
        buttonParams = buttonParams || {};

        var renderConf = {
          merchantId: OffAmazonPayments.getMerchantId (),
          createCheckoutSession: {
            url: createCheckoutSessionURL
          },
          ledgerCurrency: buttonParams.ledgerCurrency || 'JPY',
          checkoutLanguage: buttonParams.checkoutLanguage || 'ja_JP',
          productType: buttonParams.productType || 'PayAndShip',
          placement: buttonParams.placement || 'Cart'
        };
    
        renderConf.sandbox = buttonParams.sandbox ? true : false;
        amazon.Pay.renderButton ('#' + OffAmazonPayments.getBtnElmId (), renderConf);   
      }
    }
  }

  // show Amazon Pay Widgets
  function payWidgets ( widgetsStyle ) {
    return {
      address: function ( updateButtonStyle ) {

        var addressElm = document.getElementById (
          OffAmazonPayments.Widgets.getAddressElmId ()
        );
  
        var loadingElm = createNode( 'div' ).styles( {
          width: '3em',
          height: '3em',
          borderTop: '0.3em solid rgba(140, 139, 139, 0.5)',
          borderRight: '0.3em solid rgba(140, 139, 139, 0.5)',
          borderBottom: '0.3em solid rgba(140, 139, 139, 0.5)',
          borderLeft: '0.3em solid #f3f3f3',
          animation: 'loaderAnime 1s infinite linear',
          borderRadius: '50%',
          position: 'relative',
          margin: 'auto',
          zIndex: '10000'
        });
        var addressNode = createNode( addressElm )
          .styles( getWidgetsStyle( widgetsStyle ) )
          .parts( loadingElm ); // set loading icon  
                
        return {
          show: function (url, checkoutSessionId, postJson) {
            postJson = postJson || {};
            try {
              var postParam = JSON.stringify (postJson);
              post()
                .url (url)
                .request (postParam)
                .output( function ( response ) {
                  addressNode.removeChild(addressNode.firstChild); // remove loading icon
                  if ( response && response.shippingAddress ) {
                    setAddress( checkoutSessionId, response.shippingAddress, addressNode );
                  } else {
                    setErrorMessage( '住所情報を取得できません。他のお支払い方法をお選びください。', addressNode ); //TODO translate this error message
                  }
                })
                .exec ();
            } catch ( e ) {
              console.error(e);
            }
          }
        }

        function getUpdateButtion () {
          updateButtonStyle = updateButtonStyle || {
            display: 'block',
            position: 'relative',
            fontSize: '1rem',
            padding: '.375rem .75rem',
            textAlign: 'center',
            lineHeight: '1.5',
            borderRadius: '.25rem',
            color: '#fff',
            background: '#6c757d',
          }
            
          return createNode( 'button' )
            .styles( updateButtonStyle )
            .attrs( {
              id: 'updateCheckoutDetails',
            } )
            .text( '変更' );//TODO translate this error message
        }

        function setErrorMessage ( message, addressNode ) {
          addressNode.parts( createNode( 'div' ).text( message ) ).styles( {
            color: '#ff0000'
          });
        };

        function setAddress ( checkoutSessionId, shippingAddress, addressNode ) {
          var postalCode = shippingAddress.postalCode;
          var address = shippingAddress.stateOrRegion + shippingAddress.addressLine1;
            address += shippingAddress.addressLine2 || '';
            address += shippingAddress.addressLine3 || '';
          var widgets = createNode( 'div' ).parts(
            createNode( 'div' ).text( shippingAddress.name ).styles( {
              fontWeight: 'bold',
            } ),
            createNode( 'div' ).text( postalCode ),
            createNode( 'div' ).text( address )
          );
          addressNode.parts( widgets, getUpdateButtion( updateButtonStyle ) );

          amazon.Pay.bindChangeAction( '#updateCheckoutDetails', {
            amazonCheckoutSessionId: checkoutSessionId,
            changeAction: 'changeAddress',
          } );
        };
      },
      payment: function () {
        var walletElm = document.getElementById (
          OffAmazonPayments.Widgets.getWalletElmId ()
        );

        return {
          show: function () {
            createNode( walletElm ).styles( getWidgetsStyle( widgetsStyle ) ).parts(
              createNode ('div').text ('Amazon Pay').styles ({
                fontWeight: 'bold',
              })
            );           
          }
        }
      }
    }

    function getWidgetsStyle (styleObj) {
      return styleObj || {
        border: '1px solid #bbb',
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 10px 0 10px',
      };
    }
  }
} )();
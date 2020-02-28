# Amazon Pay V2 Converter
You can easily convert v1 into v2 by just using this sample code.

## Requirements
* implemented amazon pay based on [Code Generator](http://amzn.github.io/amazon-pay-sdk-samples/code_generator/?region=JP&ld=APJPLPADirect)
* [set up for v2 integration](https://amazonpaycheckoutintegrationguide.s3.amazonaws.com/amazon-pay-checkout/get-set-up-for-integration.html)

## How To Use
### 1. deploy Amazon Pay V2 API on your AWS

#### 1-1. click this button

|region|button|
|---|:---:|
|ap-northeast-1|<a href="https://console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/new?stackName=v2handler&amp;templateURL=https://amazonpay-v2-handler.s3-ap-northeast-1.amazonaws.com/v2handler-api.yml" rel="nofollow" target="_blank"><img src="https://user-images.githubusercontent.com/61146815/75303877-48976f00-5885-11ea-98e0-ad390e8cb2e9.png" alt="image" style="max-width:100%;"></a>|

#### 1-2. click 'next' button
<img src="https://user-images.githubusercontent.com/61146815/75250132-01749400-581b-11ea-8b14-baf329cb5c4e.png" width="500px">

#### 1-3. input these fields and click 'next' buttion
<img src="https://user-images.githubusercontent.com/61146815/75250647-23224b00-581c-11ea-89e3-3f49ffd644b8.png" width="500px">

#### 1-4. click 'next' button
<img src="https://user-images.githubusercontent.com/61146815/75250883-bfe4e880-581c-11ea-9b54-161ea2c5265b.png" width="500px">

#### 1-5. check these checkbox and click 'create stack' button
<img src="https://user-images.githubusercontent.com/61146815/75250973-f6bafe80-581c-11ea-899e-63a4520749a3.png" width="500px">

#### 1-6. wait until all events are completed...
<img src="https://user-images.githubusercontent.com/61146815/75363170-1590c200-58fd-11ea-99b5-00c4f9d9ff91.png" width="500px">

#### 1-7. get `API Endpoint` and `API Key` after all events are completed

##### API Endpoint
<img src="https://user-images.githubusercontent.com/61146815/75364199-a5833b80-58fe-11ea-871c-1c741ead3c60.png" width="500px">

##### API Key
<span><img src="https://user-images.githubusercontent.com/61146815/75365773-01e75a80-5901-11ea-867a-0d8bb7d57bf5.png" width="500px"><img src="https://user-images.githubusercontent.com/61146815/75364465-204c5680-58ff-11ea-983a-d1b2871d9e79.png" width="200px">
</span>

#### 1-8. test the connection by using `API Endpoint` and `API Key`

```
curl -X POST -H "Content-Type: application/json" -d '{"action":"create"}' --header 'x-api-key:${API Key}' ${API Endpoint}

ex.
curl -X POST -H "Content-Type: application/json" -d '{"action":"create"}' --header 'x-api-key:XXXXXXXXXXXXXXXXXXXXXXXXXX' https://XXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/Prod/
```

<br/>

### 2. implement source codes to execute this api on your server

* You can check [how to request this api](https://github.com/amazonpay-labs/amazonpay-v2-handler)

<p>if you use PHP on your server ...<p>

<p>ex. execute Create Checkout Session API</p>


```
<?php

    $result = execute('https://XXXXXXXXX.execute-api.ap-northeast-1.amazonaws.com/Prod', array("action" => "create"));
    echo $result;


    function execute($url, $requestJson) {

        $header = [
            'Content-Type: application/json',
            'x-api-key: XXXXXXXXXXXXXXXXXXXXXXXXXX' # API Key
        ];

        $curl = curl_init();

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'POST'); // post
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($requestJson));
        curl_setopt($curl, CURLOPT_HTTPHEADER, $header); // header
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, true);
        
        $response = curl_exec($curl);
        
        $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE); 
        $header = substr($response, 0, $header_size);
        $body = substr($response, $header_size);
        $result = json_decode($body, true); 
        
        curl_close($curl);

        return json_encode($result);
    }
```

<br/>

### 3. Download [amazonpayV2Converter.js](https://XXX/amazonpayV2Converter.js) Add the script tags on your EC site
#### 3-1. Add the script tags on the Cart Page with Amazon Pay Button

```
...
<script type="text/javascript">
window.onAmazonLoginReady = function() {
amazon.Login.setClientId(
    'amzn1.application-oa2-client.XXX'
);
};

window.onAmazonPaymentsReady = function() {
showLoginButton();
};

function showLoginButton() {
OffAmazonPayments.Button('AmazonPayButton', ‘XXX', {
  ..    
});
}
</script>

<!-- remove this tag -->
<script type="text/javascript" 
src="https://static-fe.payments-amazon.com/OffAmazonPayments/jp/sandbox/lpa/js/Widgets.js" 
async></script>
<!-- remove this tag -->

<!-- add this tag -->
<script src="https://static-fe.payments-amazon.com/checkout.js"></script>
<script src="amazonpayV2Converter.js"></script>
<script>
var createCheckoutSessionURL = 'https://XXX';
amazonpayV2Converter.sandbox().renderButton(createCheckoutSessionURL);
</script>
<!-- add this tag -->

...
```

#### 3-2. Add the script tags on the Cart Page with Amazon Pay Address Widgets or Wallet Widgets

```
<script type="text/javascript">
window.onAmazonLoginReady = function() {
amazon.Login.setClientId("amzn1.application-oa2-client.5e1a4059588e47909368d628ba92eb5a");

window.onAmazonPaymentsReady = function() {
　showAddressBookWidget();
};

function showAddressBookWidget() {
  // AddressBook
  new OffAmazonPayments.Widgets.AddressBook({
  ...

function showWalletWidget(orderReferenceId) {
  // Wallet
  new OffAmazonPayments.Widgets.Wallet({
  ...
</script>

<!-- remove this tag -->
<script type="text/javascript" 
src="https://static-fe.payments-amazon.com/OffAmazonPayments/jp/sandbox/lpa/js/Widgets.js" 
async></script>
<!-- remove this tag -->

<!-- add this tag -->
<script src="https://static-fe.payments-amazon.com/checkout.js"></script>
<script src="amazonpayV2Converter.js"></script>
<script>
var getCheckoutSessionURL = 'https://XXX';
amazonpayV2Converter.sandbox().showAddress(getCheckoutSessionURL, {
          "action": "get",
          "checkoutSessionId": amazonpayV2Converter.getCheckoutSessionId()
        }).showPayment();
</script>
<!-- add this tag -->

...
```

<br/>

## License
Amazon Pay V2 Converter is made available under the [MIT License](https://opensource.org/licenses/mit-license.php).

## Credits
Amazon Pay V2 Converter is created and maintained by itoshige, tauty.
feel free to pull requests!

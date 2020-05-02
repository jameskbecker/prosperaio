/*!
 * jQuery Cookie Plugin v1.3.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function(e) {
  if (typeof define === "function" && define.amd) {
    define(["jquery"], e)
  } else {
    e(jQuery)
  }
})(function(e) {
  function n(e) {
    return e
  }

  function r(e) {
    return decodeURIComponent(e.replace(t, " "))
  }

  function i(e) {
    if (e.indexOf('"') === 0) {
      e = e.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    }
    try {
      return s.json ? JSON.parse(e) : e
    } catch (t) {}
  }
  var t = /\+/g;
  var s = e.cookie = function(t, o, u) {
    if (o !== undefined) {
      u = e.extend({}, s.defaults, u);
      if (typeof u.expires === "number") {
        var a = u.expires,
          f = u.expires = new Date;
        f.setDate(f.getDate() + a)
      }
      o = s.json ? JSON.stringify(o) : String(o);
      return document.cookie = [s.raw ? t : encodeURIComponent(t), "=", s.raw ? o : encodeURIComponent(o), u.expires ? "; expires=" + u.expires.toUTCString() : "", u.path ? "; path=" + u.path : "", u.domain ? "; domain=" + u.domain : "", u.secure ? "; secure" : ""].join("")
    }
    var l = s.raw ? n : r;
    var c = document.cookie.split("; ");
    var h = t ? undefined : {};
    for (var p = 0, d = c.length; p < d; p++) {
      var v = c[p].split("=");
      var m = l(v.shift());
      var g = l(v.join("="));
      if (t && t === m) {
        h = i(g);
        break
      }
      if (!t) {
        h[m] = i(g)
      }
    }
    return h
  };
  s.defaults = {};
  e.removeCookie = function(t, n) {
    if (e.cookie(t) !== undefined) {
      e.cookie(t, "", e.extend(n, {
        expires: -1
      }));
      return true
    }
    return false
  }
})

if (!window.console) {
  window.console = {
    log: function(txt) {
      alert(txt);
    }
  };
}

// ================================
//          GLOBAL PART
// ================================

function redirectToAbsoluteURL(relativeURL) {
  var loc = relativeURL;
  var b = document.getElementsByTagName('base');
  if (b && b[0] && b[0].href) {
    if (b[0].href.substr(b[0].href.length - 1) == '/' && loc.charAt(0) == '/')
      loc = loc.substr(1);
    loc = b[0].href + loc;
  }

  location.href = loc;
}

var msgType2ElementMapping = {
  'error': '#general_error_container',
  'info': '#general_info_container'
};

function showMessage(message, msgType, append) {
  if (message == null) return;

  jQuery(msgType2ElementMapping[msgType]).hide();

  var msgTextArea = jQuery(msgType2ElementMapping[msgType] + ' span');
  if (!append) {
    msgTextArea.empty();
  }
  msgTextArea.append(message);
  msgTextArea.append('\n');
  jQuery(msgType2ElementMapping[msgType]).show();
}

function showErrorMessage(message) {
  if (message.length > 0) {
    $('html, body').animate({
      scrollTop: $('body').offset().top
    }, "fast");
    showMessage(message[0], 'error', true);
    showErrorMessage(message.slice(1));
    return true;
  }
  return false;
}

function showFieldErrors(showFieldErrors) {

  if (showFieldErrors != null) {

    var regex = new RegExp('\\.', 'g');
    for (var key in showFieldErrors) {
      Address.updateClassOnAddressError('#' + key.replace(regex, '_'));
    }

    return true;
  }
  return false;
}

function showInfoMessage(message) {
  if (message.length > 0) {
    showMessage(message[0], 'info', true);
    showInfoMessage(message.slice(1));
    return true;
  }
  return false;
}

function replaceall(str, replace, with_this) {
  var str_hasil = "";
  for (var i = 0; i <= str.length; i++) {
    if (str[i] == replace) {
      var temp = with_this;
    } else {
      var temp = str[i];
    }
    str_hasil += temp;
  }
  return str_hasil;
}

function clearMessageContainers() {
  $('#actionErrorContainer').hide();
  $('#general_error_container span').empty();
  $('#general_info_container span').empty();
  $('#general_error_container').hide();
  $('#general_info_container').hide();
  $('.errorInput').removeClass('errorInput');
}

function setCheckboxValue(input) {
  if (input.is(':checked')) {
    input.val('true');
  } else {
    input.val('false');
  }
}

function toggleSearchIcon() {
  var filterHidden = $(".facets").is(":hidden");

  if (!filterHidden) {
    $(".facets").toggle();
  }

  $("#navi-btn").toggleClass("btn_pressed");
}

var seoPageSorting = false;

var Pager = {
  setPage: function(nextPage) {
    $("#currentPage").val(nextPage);
    $("#filterElement").val("PAGER_PAGE");

    var url = window.location.href;

    if (url != null && url.indexOf('pager.currentPage') != -1) {
      var urlParams = $("#searchForm").serialize();
      var returnURL = 'catalog/search?' + urlParams;

      //alert('returnURL=' + returnURL);

      window.location.href = returnURL;
    } else {
      submitSearch();
    }
  },
  setSize: function(pageSize) {
    $("#pageSize").val(pageSize);
    $("#filterElement").val("PAGER_SIZE");
    submitSearch();
  },
  setSorting: function(sorting) {
    seoPageSorting = true;
    $("#pageSorting").val(sorting);
    $("#filterElement").val("PAGER_SORT");
    submitSearch();
  },

  getPageURL: function(nextPage) {

    //$("#currentPage").val(nextPage);
    //$("#filterElement").val("PAGER_PAGE");

    var url = window.location.href;

    var returnURL = null;
    if (url != null && url.indexOf('pager.currentPage') != -1) {
      var urlParams = $("#searchForm").serialize();
      returnURL = 'catalog/search?' + urlParams;
    } else {

      //$("#currentPage").val(nextPage);
      //$("#filterElement").val("PAGER_PAGE");

      returnURL = catalogSearchURL();
      if (returnURL == null) {
        var urlParams = $("#searchForm").serialize();
        returnURL = 'catalog/search?' + urlParams;
      }
    }

    return returnURL;
  }
};

// Popup.country_notification()
var Popup = {
  bind: function(id, headlineKey, contentKey) {
    jQuery(document).ready(function() {
      $('#' + id).click(function() {
        $.floatbox({
          boxConfig: {
            width: '885px'
          },
          ajax: {
            url: 'support/popup/headlineKey/' +
              headlineKey + '/contentKey/' + contentKey,
            before: "<p><img src='../css/images/loader.gif' /></p>",
            finish: function() {}
          },
          fade: true
        });
      });
    });

  },
  display: function(headlineKey, contentKey) {
    $.floatbox({
      boxConfig: {
        width: '885px'
      },
      ajax: {
        type: "GET",
        url: 'support/popup/headlineKey/' +
          headlineKey + '/contentKey/' + contentKey,
        before: "<p><img src='../css/images/loader.gif' /></p>",
        finish: function() {}
      },
      fade: true
    });

  },

  displayLayer: function(headlineKey, contentKey) {
    $.floatbox({
      boxConfig: {
        width: '885px'
      },
      ajax: {
        type: "GET",
        url: 'support/layer/headlineKey/' +
          headlineKey + '/contentKey/' + contentKey,
        before: "<p><img src='../css/images/loader.gif' /></p>",
        finish: function() {}
      },
      fade: true
    });

  },

  country_notification_displayed: false,

  country_notification_ajax: function() {
    if (Popup.country_notification_displayed) {
      return;
    }

    $(document).ready(function() {
      $('#country_notification').load('user/country-check', jQuery.param({}),
        function(responseText, textStatus, XmlHttpRequest) {
          var isSupportedCountry = XmlHttpRequest.getResponseHeader('userLoginStatus.supportedCountry');
          //                    alert('isSupportedCountry ' + isSupportedCountry);
          if (isSupportedCountry == 'false') {
            Popup.country_notification();
          }
        });
    });
  },

  country_notification: function() {
    if (Popup.country_notification_displayed) {
      return;
    }

    Popup.country_notification_displayed = true;
    $.floatbox({
      boxConfig: {
        width: '520px'
      },
      content: $('#country_notification').html(),
      fade: true
    });
  },

  showDynamicSizeLayer: function() {

    $.floatbox({
      /*
      boxConfig: {
          width: '540px'
      },*/

      box: 'floatbox-sizebox',
      bg: 'floatbox-sizebox-background',
      boxConfig: {
        width: '955px'
      },
      content: $('#floatbox-sizebox-sizeMatrix').html(),
      fade: true
    });
  },

  //  legacy access
  showSizeLayer: function(sizeTable, defaultTable) {
    var brandSize = 'page/' + sizeTable.replace(' ', '-').replace('.', '');
    var def = 'defaultPage/' + defaultTable.replace(' ', '-').replace('.', '');

    $.floatbox({
      boxConfig: {
        width: '955px'
      },
      ajax: {
        type: "GET",
        url: 'support/size_layer/' + brandSize + "/" + def,
        before: "<p><img src='../css/images/loader.gif' /></p>",
        finish: function() {}
      },
      fade: true
    });
  }
};

//---

//-------------------------------------------
var Payment = {

  preferredPayment: function(paymentMethod) {
    Payment.hideWarning();
    Payment.uncheckCC();
  },

  preferredCC: function(name) {
    Payment.hideWarning();
  },

  updateShipment: function(paymentMethod) {
    promotedItemInBasket = jQuery('#promotedItemInBasket').val();
    jQuery.ajax({
      url: 'checkout/payment/method/shippingCosts/timestamp/' + Number(new Date()),
      data: {
        'wizard.selectedPayment': paymentMethod
      },
      success: function(response) {
        var basketCosts = eval('(' + response + ')');

        // If either condition is true, then further processing should not happen
        if (basketCosts == null || basketCosts.shipping == null) {
          return;
        }

        // Hide all related shipping costs, basket total, and basket total VAT
        jQuery('#shippingCosts').hide();
        jQuery('#oldShippingCosts').hide();
        jQuery('#promotedShippingCosts').hide();
        jQuery('#basketTotalVat').hide();
        jQuery('#promotedBasketTotalVat').hide();
        jQuery('#basketTotal').hide();
        jQuery('#oldBasketTotal').hide();
        jQuery('#promotedBasketTotal').hide();

        //            var msg =   'shippmentOnlyPromoted=' + basketCosts.shipping.shippmentOnlyPromoted + '\n' +
        //                        'freeShipping=' + basketCosts.shipping.freeShipping + '\n' +
        //                        'promoted=' + basketCosts.shipping.promoted + '\n';
        //
        //            alert(msg);

        jQuery('#shippingCosts').html(basketCosts.shipping.formattedShippingCosts);
        jQuery('#oldShippingCosts').html(basketCosts.shipping.formattedShippingCosts);
        jQuery('#promotedShippingCosts').html(basketCosts.shipping.formattedPromotedShippingCosts);

        jQuery('#basketTotalVat').html(basketCosts.shipping.formattedVAT);
        //            jQuery('#oldBasketTotalVat').html(basketCosts.shipping.formattedVAT);
        jQuery('#promotedBasketTotalVat').html(basketCosts.shipping.formattedPromotedVAT);

        jQuery('#basketTotal').html(basketCosts.shipping.formattedBasketTotal);
        jQuery('#oldBasketTotal').html(basketCosts.shipping.formattedBasketTotal);
        jQuery('#promotedBasketTotal').html(basketCosts.shipping.formattedPromotedBasketTotal);

        if (basketCosts.shipping.shippmentOnlyPromoted || basketCosts.shipping.promoted) {
          //                jQuery('#oldBasketTotalVat').show();
          jQuery('#promotedBasketTotalVat').show();

          jQuery('#oldBasketTotal').show();
          jQuery('#promotedBasketTotal').show();

          if (basketCosts.shipping.shippmentOnlyPromoted) {
            jQuery('#oldShippingCosts').show();
            jQuery('#promotedShippingCosts').show();
          } else {
            jQuery('#shippingCosts').show();
          }
        } else {
          jQuery('#shippingCosts').show();
          jQuery('#basketTotalVat').show();
          jQuery('#basketTotal').show();
        }
      }
    });
  },

  define_payment_method: function(paymentMethod) {
    Payment.hideWarning();

    if (paymentMethod != 'CREDIT_CARD') {
      Payment.uncheckCC();
    }

    //        if(!validProm) {
    //            Coupon.validatePayment(paymentMethod);
    //        }

    //        Payment.updateShipment(paymentMethod);
    //        var paymentOption = jQuery('#payment input:radio:checked').val();

    // also applyPromotion and update shippment

    $('#summary_part').load('checkout/process/method/summaryReload',
      jQuery.param({
        'wizard.selectedPayment': paymentMethod
      }),

      function(responseText, textStatus, XmlHttpRequest) {
        OverLayer.hide();
      }
    );
  },

  processPayment: function(saferpayDisabled) {

    var paymentOption = jQuery('#payment input:radio:checked').val();
    if (paymentOption == null) {
      x_show('paymentNoOptionSelected');
      return;
    }

    /**
     * 3 is the payment code type for payment cards.
     * 6 is PayPal
     */
    var ccnum = jQuery('#ccNumber').val();
    if ((paymentOption != 3) || (ccnum != null && ccnum.substring(0, 5) == 'xxxx ')) {
      jQuery('#payment').submit();
      return;
    }

    /**
     * Validate credit card fields. Validation cannot be done server-side because creditcard
     * processing is what we actually want to avoid.
     */
    var cbCardRadio = $('#cbCard');

    if (jQuery.trim(jQuery('#payment_cardHolder').val()) == jQuery('#payment_cardHolder').attr('title') // there should be check if not empty && number only
      ||
      jQuery.trim(ccnum) == jQuery('#ccNumber').attr('title') ||
      jQuery.trim(jQuery('#cvc').val()) == jQuery('#cvc').attr('title') //cb exist only for FR
      ||
      ($('#visaCard').attr('checked') == false && $('#mcCard').attr('checked') == false && $('#amCard').attr('checked') == false && (cbCardRadio.length == 0 || cbCardRadio.attr('checked') == false)) ||
      $('#payment_sfpCardExpiryMonth').attr('selectedIndex') == 0 ||
      $('#payment_sfpCardExpiryYear').attr('selectedIndex') == 0
    ) {

      class_hide('alertBox1');
      x_show('paymentCardAlertBoxEmpty');
      return;
    }

    if (saferpayDisabled) {
      jQuery('#payment').attr('action', 'checkout/paymentCard/method/noSaferpayProcess');
      jQuery('#payment').submit();
      return;
    }

    var promoParam = '';
    if (jQuery('#promoCodeId').val() != '') {
      promoParam = '/promotionCode/' + jQuery('#promoCodeId').val();
    }

    jQuery.ajax({
      url: 'checkout/paymentCard/method/loadSecureCardRegistrationUrl/timestamp/' + Number(new Date()) + promoParam,
      cache: 'false',
      dataType: "text",
      success: function(response) {
        if (response == '') {
          class_hide('alertBox1');
          x_show('paymentCardAlertBoxDisable');
          return false;
        } else if (response.indexOf('promo_error') >= 0) {
          class_hide('alertBox1');
          jQuery('#paymentCardAlertPromoFailedMessage').replaceWith(response.replace("promo_error", ""));
          x_show('paymentCardAlertPromoFailed');
          return false;
        }

        jQuery('#payment').attr('action', response);
        jQuery('#payment').submit();
      },
      error: function() {
        class_hide('alertBox1');
        x_show('paymentCardAlertBoxDisable');
      }
    });
  },

  selectCC: function(paymentMethod) {
    $('#wizard_selectedPaymentOption3').attr('checked', 'checked');
    $('#cardTypeName').val(paymentMethod);
    //        jQuery.ajax({
    //            url: 'user/paymentCard/method/cardType',
    //            data: {'cardTypeName':paymentMethod} ,
    //            success: function(response) { }
    //         })
  },

  checkCC: function() {
    $('#wizard_selectedPaymentOption3').attr('checked', 'checked');
    Payment.define_payment_method('CREDIT_CARD');
    //        Payment.updateShipment('CREDIT_CARD');
  },

  uncheckCC: function() {
    $('#visaCard').attr('checked', '');
    $('#mcCard').attr('checked', '');
    $('#cbCard').attr('checked', '');
    $('#amCard').attr('checked', '');
  },

  hideWarning: function() {
    $('#paymentAlertBox').hide();
    $('#paymentCardAlertBox').hide();
    $('#paymentCardAlertBoxEmpty').hide();
    $('#paymentNoOptionSelected').hide();
    $('#paymentCardAlertPromoFailed').hide();
    // TODO [JH] maybe its easier to call
    //        class_hide('alertBox1');
  },

  preselectPM: function(option, cardType) {
    switch (option) {
      case 1:
        $('#wizard_selectedPaymentOption1').attr('checked', 'checked');
        break;
      case 3:
        $('#wizard_selectedPaymentOption3').attr('checked', 'checked');
        break;
      case 4:
        $('#wizard_selectedPaymentOption4').attr('checked', 'checked');
        break;
      case 5:
        $('#wizard_selectedPaymentOption5').attr('checked', 'checked');
        break;
      default:
        break;
    }
  }
};

var SaferPay = {

  ccType: '',
  ccNumber: '',
  ccExpiryMonth: '',
  ccExpiryYear: '',
  ccCardHolder: '',
  ccCVC: '',
  ccURL: '',

  processPaymentMethod: function() {

    document.getElementById('payment_submit_btn').disabled = true; // to prevent the dreaded double-click
    document.body.style.cursor = 'wait';

    var paymentMethod = $("input[name=PaymentMethod]:checked").val();

    // for credit cards 'payment' form (holding CC data) is submitted to SaferPay (in creditCardSelected() func)
    if (paymentMethod == 'CREDIT_CARD') {
      SaferPay.creditCardSelected();
    } else {
      // for other payment methods 'options' form (holding just the chosen payment) is submitted to KX
      jQuery('#options').submit();
    }
  },
  processPaymentSummary: function() {

    document.getElementById('payment_submit_btn').disabled = true; // to prevent the dreaded double-click
    document.body.style.cursor = 'wait';

    var paymentMethod = $("input[name=PaymentMethod]:checked").val();

    if (!paymentMethod) {
      jQuery('#paymentNoOptionSelected').fadeIn('normal');
      $("html, body").animate({
        scrollTop: 0
      }, "slow");
      document.getElementById('payment_submit_btn').disabled = false;
      document.body.style.cursor = 'default';
      return;
    }

    // for credit cards 'payment' form (holding CC data) is submitted to SaferPay (in creditCardSelected() func)
    if (paymentMethod == 'CREDIT_CARD') {
      SaferPay.creditCardSelected();
    } else {
      // for other payment methods 'options' form (holding just the chosen payment) is submitted to KX
      // jQuery('#options').submit();

      // ajax to get the info and then submit it ?
      // set the info
      // ajax to jQuery('#options').submit();
      // checkout/paymentSummarySubmit

      SaferPay.submitPaymentSummaryForm();

    }
  },

  submitPaymentSummaryForm: function() {
    var formData = $('#options').serialize();

    $.ajax({
      url: 'checkout/paymentSummarySubmit',
      data: formData,
      type: 'POST',
      dataType: "json",
      contentType: "application/x-www-form-urlencoded;charset=utf-8",

      success: function(response, textStatus, jqXHR) {
        if (response.success == false && response.state == "reservation_invalid_state") {
          var msg = (response.errorMessages != undefined && response.errorMessages != null && response.errorMessages[0] != null && response.errorMessages[0] != undefined) ? response.errorMessages[0] : "The checkout cannot be processed, because the contents of the basket have changed. Please start it again.";
          alert(msg);
          document.body.style.cursor = 'default';
          document.getElementById('payment_submit_btn').disabled = false;
        } else {
          var paymentInfo = response.data;

          console.log("payment data: " + paymentInfo.url + ", DATA: " + paymentInfo.data);

          $("#orderSubmitForm").attr('action', paymentInfo.url);
          $("#orderSubmitForm").attr('method', paymentInfo.method);
          $("#orderSubmit_DATA").val(paymentInfo.data);
          $("#orderSubmit_SIGNATURE").val(paymentInfo.signature);

          SaferPay.submitAndSubscribe();
        }
      },

      error: function(response) {
        showErrorMessage(response['errorMessages']);
        showInfoMessage(response['infoMessages']);
        showFieldErrors(response['fieldErrors']);

        document.body.style.cursor = 'default';
        document.getElementById('payment_submit_btn').disabled = false;
      }
    });
  },

  submitAndSubscribe: function() {

    document.getElementById('payment_submit_btn').disabled = true;
    document.body.style.cursor = 'wait';

    var selected = $('#subscriptionChck').is(':checked');

    if (selected) {
      var subscriptionUrl = $("#subscriptionUrl").val();
      jQuery.ajax({
        url: subscriptionUrl,
        dataType: "json",
        success: function(response) {
          $("#orderSubmitForm").submit();
        },
        error: function(response) {
          console.error('Could not parse products: ' + response);
          $("#orderSubmitForm").submit();
        }
      });
    } else {
      $("#orderSubmitForm").submit();
    }
  },
  creditCardSelected: function() {
    if (payWithNewCard) {
      var mandatoryFieldMsg = ' ' + $("#mandatoryFieldMsg").val() + '\n';
      var notANumberMsg = ' ' + $("#notANumberMsg").val() + '\n';
      var insufLengthMsg = ' ' + $("#insufLengthMsg").val() + '\n';
      var errorMsgs = '';

      var creditType = $("#cust_ccType");
      var creditNumber = $("#cust_ccNumber");
      var creditExpiryMonth = $("#cust_ccExpiryMonth");
      var creditExpiryYear = $("#cust_ccExpiryYear");
      var creditCardHolder = $("#cust_ccCardHolder");
      var creditCvc = $("#cust_ccCVC");

      // CC type validation
      if (creditType.val() == null) {
        errorMsgs += creditType.attr('title') + mandatoryFieldMsg;
        SaferPay.markField(creditType);
      } else {
        SaferPay.unmarkField(creditType);
      }

      // CC number validation
      if (creditNumber.val() == '') {
        errorMsgs += creditNumber.attr('placeholder') + mandatoryFieldMsg;
        SaferPay.markField(creditNumber);
      } else if (isNaN(creditNumber.val())) {
        errorMsgs += creditNumber.attr('placeholder') + notANumberMsg;
        SaferPay.markField(creditNumber);
      } else if (creditNumber.val().length < 16) {
        errorMsgs += creditNumber.attr('placeholder') + insufLengthMsg;
        SaferPay.markField(creditNumber);
      } else {
        SaferPay.unmarkField(creditNumber);
      }

      // CC expiry month validation
      if (creditExpiryMonth.val() == null) {
        errorMsgs += creditExpiryMonth.attr('title') + mandatoryFieldMsg;
        SaferPay.markField(creditExpiryMonth);
      } else {
        SaferPay.unmarkField(creditExpiryMonth);
      }

      // CC expiry year validation
      if (creditExpiryYear.val() == null) {
        errorMsgs += creditExpiryYear.attr('title') + mandatoryFieldMsg;
        SaferPay.markField(creditExpiryYear);
      } else {
        SaferPay.unmarkField(creditExpiryYear);
      }

      // CC holder validation
      if (creditCardHolder.val() == '') {
        errorMsgs += creditCardHolder.attr('placeholder') + mandatoryFieldMsg;
        SaferPay.markField(creditCardHolder);
      } else {
        SaferPay.unmarkField(creditCardHolder);
      }

      // CC CVC validation
      if (creditCvc.val() == '') {
        errorMsgs += creditCvc.attr('placeholder') + mandatoryFieldMsg;
        SaferPay.markField(creditCvc);
      } else if (isNaN(creditCvc.val())) {
        errorMsgs += creditCvc.attr('placeholder') + notANumberMsg;
        SaferPay.markField(creditCvc);
      } else if (creditCvc.val().length < 3) {
        errorMsgs += creditCvc.attr('placeholder') + insufLengthMsg;
        SaferPay.markField(creditCvc);
      } else {
        SaferPay.unmarkField(creditCvc);
      }

      if (errorMsgs != '') {
        alert(errorMsgs);
        document.body.style.cursor = 'default';
        document.getElementById('payment_submit_btn').disabled = false;
        return;
      }

      SaferPay.ccType = creditType.val();
      SaferPay.ccNumber = creditNumber.val();
      SaferPay.ccExpiryMonth = creditExpiryMonth.val();
      SaferPay.ccExpiryYear = creditExpiryYear.val();
      SaferPay.ccCardHolder = creditCardHolder.val();
      SaferPay.ccCVC = creditCvc.val();

      $('input[name=cardType][value=' + SaferPay.ccType + ']').prop('checked', true);
      $("#saferpay_ccNumber").val(SaferPay.ccNumber);
      $("#saferpay_ccExpiryMonth").val(SaferPay.ccExpiryMonth);
      $("#saferpay_ccExpiryYear").val(SaferPay.ccExpiryYear);
      $("#saferpay_ccCardHolder").val(SaferPay.ccCardHolder);
      $("#saferpay_ccCVC").val(SaferPay.ccCVC);
    }

    console.log("computeCreditCardRegistrationUrl");

    jQuery.ajax({
      url: 'checkout/computeCreditCardRegistrationUrl/timestamp/' + Number(new Date()),
      cache: 'false',
      dataType: "json",
      data: {
        payWithAlias: !payWithNewCard
      },
      type: 'POST',
      success: function(response, textStatus, jqXHR) {
        console.log("computeCreditCardRegistrationUrl response: " + JSON.stringify(response));
        if (response.state && response.state.indexOf('NOT_VALID') >= 0) {
          var errMsg = jqXHR.getResponseHeader('KX_ERR_MSG');
          if (errMsg == null || errMsg == '') {
            errMsg = $("#productNotDeliverableMsg").val();
          }
          alert(errMsg);
          SaferPay.ccURL = null;

          document.body.style.cursor = 'default';
          document.getElementById('payment_submit_btn').disabled = false;
        } else if (response.state && response.state.indexOf("reservation_invalid_state") > -1) {
          var errMsg = $("#ccPaymentFailedMsg").val();
          try {
            if (response.errorMessages[0] != null && response.errorMessages[0] != undefined) {
              errMsg = response.errorMessages[0];
            }
          } catch (err) {
            console.error("Could not parse to Json: " + response);
          }
          alert(errMsg);
          SaferPay.ccURL = null;
          document.body.style.cursor = 'default';
          document.getElementById('payment_submit_btn').disabled = false;
        } else if (response.state && response.state.indexOf('promo_error') >= 0) {
          alert($("#ccPaymentFailedMsg").val());
          SaferPay.ccURL = null;

          document.body.style.cursor = 'default';
          document.getElementById('payment_submit_btn').disabled = false;

        } else if (response.paymentMeansRequired === 'false') {
          SaferPay.ccURL = response.redirectUrl;

          //submit the redirectUrl to Kickz Server
          $("#saferpayUrl").val(SaferPay.ccURL);
          $("#cardTypeCode").val(SaferPay.ccType);

          console.log('submitPaymentSummaryForm: ' + SaferPay.ccURL);
          SaferPay.submitPaymentSummaryForm();
        } else if (response.paymentMeansRequired === 'true') {
          SaferPay.ccURL = response.redirectUrl;

          var formData = $('#payment').serializeArray();
          // add flag to ensure AJAX handling on server
          formData.push({
            name: "FromAjax",
            value: true
          });
          $.post(SaferPay.ccURL, $.param(formData))
            .done(function(data, textStatus, jqXHR) {
              //submit the redirectUrl to Kickz Server
              $("#saferpayUrl").val(data.RedirectUrl);
              $("#cardTypeCode").val(SaferPay.ccType);
              var saveCcDataForNextCheckout = $('#saveCcDataForNextCheckout').is(':checked');
              $("#saveCcDataForNextCheckout").val(saveCcDataForNextCheckout);
              // jQuery('#options').submit();

              console.log('submitPaymentSummaryForm: ' + data.RedirectUrl);
              SaferPay.submitPaymentSummaryForm();
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
              var error = $.parseJSON(jqXHR.responseText);
              var errMsg = $("#validationFailedMsg").val();
              if (!error) {
                errMsg = SaferPay.getLocalizedText(error.ErrorName);
              }
              alert(errMsg);

              document.body.style.cursor = 'default';
              document.getElementById('payment_submit_btn').disabled = false;
            });
        } else {
          var errMsg = jqXHR.getResponseHeader('KX_ERR_MSG');
          if (errMsg == null || errMsg == '') {
            errMsg = $("#ccPaymentFailedMsg").val();
          }
          alert(errMsg);
          SaferPay.ccURL = null;

          document.body.style.cursor = 'default';
          document.getElementById('payment_submit_btn').disabled = false;
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        document.body.style.cursor = 'default';
        document.getElementById('payment_submit_btn').disabled = false;

        class_hide('alertBox1');
        x_show('paymentCardAlertBoxDisable');
      }
    });
  },

  markField: function(obj) {
    obj.removeClass('bccc');
    obj.addClass('errorInput');
  },

  unmarkField: function(obj) {
    obj.removeClass('errorInput');
    obj.addClass('bccc');
  },

  getLocalizedText: function(name) {
    if (name == 'VALIDATION_FAILED') {
      return $("#validationFailedMsg").val();
    } else if (name == 'CARD_CHECK_FAILED') {
      return $("#cardCheckFailedMsg").val();
    } else if (name == 'CARD_EXPIRED') {
      return $("#cardExpiredMsg").val();
    } else if (name == 'COMMUNICATION_FAILED') {
      return $("#communicationFailedMsg").val();
    } else if (name == 'COMMUNICATION_TIMEOUT') {
      return $("#communicationTimeOutMsg").val();
    } else if (name == 'PAYMENTMEANS_INVALID') {
      return $("#paymentMeansInvalidMsg").val();
    } else {
      return $("#validationFailedMsg").val();
    }
  }
}

var Confirmation = {

  submit_status: 0,
  hint_submit_status: 0,

  invState: '',
  delState: '',

  submit: function(saferpayDisabled) {

    if (!Confirmation.disable_submit()) {
      return;
    }

    $('#termsAlertBox').hide();
    $('#cvcAlertBox').hide();

    if ($('#AGBsRadio2').is(':checked')) {

      var ccChecked = $('#wizard_selectedPaymentOption3').is(':checked');

      var ccnum = jQuery('#ccNumber').val();

      if (!ccChecked) {
        Confirmation.addressCheck(1, saferpayDisabled);

      } else if (ccnum != null && ccnum.substring(0, 5) == 'xxxx ') {

        if (Confirmation.credit_card_check()) {
          Confirmation.addressCheck(1, saferpayDisabled);
        }

      } else {

        if (Confirmation.credit_card_check()) {
          Confirmation.addressCheck(2, saferpayDisabled);
        }
      }

    } else {
      $('#termsMessage').show();
      $('#termsAlertBox').show('slow');

      Confirmation.enable_submit();
    }
  },

  submit_hint_address: function(saferpayDisabled) {

    Confirmation.set_state();

    if (Confirmation.disable_hint_submit()) {

      var ccChecked = $('#wizard_selectedPaymentOption3').is(':checked');
      var ccnum = jQuery('#ccNumber').val();

      if (!ccChecked) {
        Confirmation.submit_form();
      } else if (ccnum != null && ccnum.substring(0, 5) == 'xxxx ') {
        if (Confirmation.credit_card_check()) {
          Confirmation.submit_form();
        }
      } else {
        Confirmation.submit_credit_card(saferpayDisabled);
      }
    }
  },

  addressCheck: function(cal_method, saferpayDisabled) {

    var countryIsoCode = $('#wizard_invoiceAddress_countryIsoCode').val();
    var street = $('#wizard_invoiceAddress_street').val();
    var houseNumber = $('#wizard_invoiceAddress_houseNumber').val();
    var zip = $('#wizard_invoiceAddress_zip').val();
    var city = $('#wizard_invoiceAddress_city').val();

    // UK, US, CAN only
    var county = null;

    // if countryIsoCode then select by the code
    if (countryIsoCode == 'us') {
      county = $('#wizard_invoiceAddress_USA_state').val();
    } else if (countryIsoCode == 'ca') {
      county = $('#wizard_invoiceAddress_Canada_state').val();
    } else if (countryIsoCode == 'gb') {
      if ($('#wizard_invoiceAddress_state').length > 0) {
        county = $('#wizard_invoiceAddress_state').val();
      }
    }

    var diffAddress = $('#differentAddressHidden').val();

    var del_countryIsoCode = $('#wizard_deliveryAddress_countryIsoCode').val();
    var del_street = $('#wizard_deliveryAddress_street').val();
    var del_houseNumber = $('#wizard_deliveryAddress_houseNumber').val();
    var del_zip = $('#wizard_deliveryAddress_zip').val();
    var del_city = $('#wizard_deliveryAddress_city').val();

    var del_county = null;
    if (del_countryIsoCode == 'us') {
      del_county = $('#wizard_deliveryAddress_USA_state').val();
    } else if (del_countryIsoCode == 'ca') {
      del_county = $('#wizard_deliveryAddress_Canada_state').val();
    } else if (del_countryIsoCode == 'gb') {
      if ($('#wizard_deliveryAddress_state').length > 0) {
        del_county = $('#wizard_deliveryAddress_state').val();
      }
    }

    jQuery.ajax({
      url: 'checkout/process/method/addressHint',
      contentType: "application/json; charset=utf-8",
      data: {
        'wizard.invoiceAddress.countryIsoCode': countryIsoCode,
        'wizard.invoiceAddress.street': street,
        'wizard.invoiceAddress.houseNumber': houseNumber,
        'wizard.invoiceAddress.zip': zip,
        'wizard.invoiceAddress.city': city,
        'wizard.invoiceAddress.state': county,
        'wizard.order.differentDeliveryAddress': diffAddress,
        'addressSupport.userDeliveryAddress.countryIsoCode': del_countryIsoCode,
        'addressSupport.userDeliveryAddress.street': del_street,
        'addressSupport.userDeliveryAddress.houseNumber': del_houseNumber,
        'addressSupport.userDeliveryAddress.zip': del_zip,
        'addressSupport.userDeliveryAddress.city': del_city,
        'addressSupport.userDeliveryAddress.state': del_county
      },

      success: function(result, textStatus, jqXHR) {

        if (result == 'ok') {

          if (cal_method == 1) {

            // form is submitted and also called validateSubmit before
            Confirmation.submit_form();
          } else {
            Confirmation.submit_credit_card(saferpayDisabled);
          }

        } else {

          var displayBothAddress = jqXHR.getResponseHeader('KX_displayBothAddress');

          Confirmation.invState = jqXHR.getResponseHeader('KX_invoice_state');
          Confirmation.delState = jqXHR.getResponseHeader('KX_delivery_state');

          var box_width = '700px';
          if (displayBothAddress == 'false') {
            box_width = '450px';
          }

          $.floatbox({
            boxConfig: {
              width: box_width
            },
            content: result,
            fade: true
          });

          Confirmation.enable_submit();
        }
      }
    });
  },

  set_state: function() {
    // it should be set only if user select google address

    if ($('#hintInvoiceAddressSelected').val() == "true") {
      if (Confirmation.invState != '') {
        $('select[name="wizard.invoiceAddress.state"]').val(Confirmation.invState);
      }
    }

    if ($('#hintDeliveryAddressSelected').val() == "true") {
      if (Confirmation.delState != '') {
        $('select[name="wizard.deliveryAddress.state"]').val(Confirmation.delState);
      }
    }
  },

  submit_form: function() {
    // TODO this will submit even the cvc.. we should remove / disable it from the submitted inputs
    $('#payment').submit();
  },

  submit_credit_card: function(saferpayDisabled) {

    if (!Confirmation.credit_card_check()) {
      return;
    }

    if (saferpayDisabled) {
      jQuery('#payment').attr('action', 'checkout/process/method/creditCardNoSaferpayProcess');
      jQuery('#payment').submit();
      return;
    }

    //        var promoParam = '';
    //        if (jQuery('#promoCodeId').val() != '') {
    //            promoParam = '/promotionActionSupport.promotionCodeString/' + $('#promoCodeId').val();
    //        }

    //        var promoCode = $('#promoCodeId').val();
    //        data: {'promotionActionSupport.promotionCodeString': promoCode} ,

    jQuery.ajax({
      url: 'checkout/process/method/creditCardRegistrationUrl/timestamp/' + Number(new Date()),
      cache: 'false',
      dataType: "text",
      success: function(response, textStatus, jqXHR) {

        Confirmation.enable_submit();
        $('.close-floatbox').click();

        if (response == '') {
          class_hide('alertBox1');
          x_show('paymentCardAlertBoxDisable');
          return false;
        } else if (response == 'NOT_VALID') {
          class_hide('alertBox1');

          var errMsg = jqXHR.getResponseHeader('KX_ERR_MSG');
          $('#paymentProductInvalidMessage').replaceWith(errMsg);
          x_show('paymentProductInvalid');

          return false;
        } else if (response.indexOf('promo_error') >= 0) {
          class_hide('alertBox1');
          jQuery('#paymentCardAlertPromoFailedMessage').replaceWith(response.replace("promo_error", ""));
          x_show('paymentCardAlertPromoFailed');
          return false;
        }

        // this will submit to the saferpay
        jQuery('#payment').attr('action', response);
        jQuery('#payment').submit();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        class_hide('alertBox1');
        x_show('paymentCardAlertBoxDisable');
      }
    });
  },

  /**
   * Validate credit card fields. Validation cannot be done server-side because creditcard
   * processing is what we actually want to avoid.
   */
  credit_card_check: function() {

    var cvc = $('#cvc');
    if (cvc.val() == null || jQuery.trim(cvc.val()) == '' || cvc.val() == cvc.attr('title')) {
      class_hide('alertBox1');
      x_show('paymentMissingCVC');

      Confirmation.enable_submit();
      return false;
    }

    /**
     * Validate credit card fields. Validation cannot be done server-side because creditcard
     * processing is what we actually want to avoid.
     */
    var cbCardRadio = $('#cbCard');

    if (jQuery.trim(jQuery('#payment_cardHolder').val()) == jQuery('#payment_cardHolder').attr('title') // there should be check if not empty && number only
      ||
      jQuery.trim(jQuery('#ccNumber').val()) == jQuery('#ccNumber').attr('title') ||
      ($('#visaCard').attr('checked') == false && $('#mcCard').attr('checked') == false && $('#amCard').attr('checked') == false && (cbCardRadio.length == 0 || cbCardRadio.attr('checked') == false)) ||
      $('#payment_sfpCardExpiryMonth').attr('selectedIndex') == 0 ||
      $('#payment_sfpCardExpiryYear').attr('selectedIndex') == 0
    ) {

      class_hide('alertBox1');
      x_show('paymentCardAlertBoxEmpty');

      Confirmation.enable_submit();
      return false;
    }
    return true;
  },

  disable_submit: function() {
    Confirmation.submit_status = Confirmation.submit_status + 1;
    if (Confirmation.submit_status == 1) {
      Confirmation.submit_to_enable(false);
      return true;
    }
    return false;
  },

  enable_submit: function() {
    Confirmation.hint_submit_status = 0;
    Confirmation.submit_status = 0;
    Confirmation.submit_to_enable(true);
  },

  submit_to_enable: function(enable) {
    var btn = $('#checkout_submit_btn');
    if (enable) {
      btn.removeAttr('disabled');
      btn.attr('class', 'confirm_order btn green_btn');
    } else {
      btn.attr('disabled', 'disabled');
      btn.attr('class', 'confirm_order btn green_btn in_progress');
    }
  },

  disable_hint_submit: function() {
    Confirmation.hint_submit_status = Confirmation.hint_submit_status + 1;
    if (Confirmation.hint_submit_status == 1) {
      Confirmation.hint_address_submit_to_enable(false);
      return true;
    }
    return false;
  },

  hint_address_submit_to_enable: function(enable) {
    var btn = $('#hintAddrSubmit');
    if (enable) {
      btn.removeAttr('disabled');
      btn.attr('class', 'btn green_btn');
    } else {
      btn.attr('disabled', 'disabled');
      btn.attr('class', 'btn green_btn in_progress');
      Confirmation.disable_submit();
    }
  }

};

//-------------------------------------------

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({
          value: str
        });
      }
    });

    cb(matches);
  };
};

var suggestList = [];
var suggestMap = new Object();
var suggestDatum = new Object();
var needInit = true;

var QuickSearch = {
  timeout: null,
  delay: 50,
  minChars: 1,

  notTooShortPattern: null,
  init: function(delay, minChars) {
    this.delay = delay;
    this.minChars = minChars;
    this.notTooShortPattern = new RegExp('(\\S{' + this.minChars + '}\\s*|\\S+\\s+)$');
  },

  searchTerm: function() {
    return escapeHtmlEntities($('#quicksearchfield').val());
  },

  // Special case initialization e.g. for search based on not found URL
  initQueryString: function(queryString) {
    if (queryString != null && queryString.length > 0) {
      jQuery('#quicksearchfield').val(queryString);
      this.displayResults();
    }
  },
  cancelTimeout: function() {
    if (this.timeout != null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  },
  restartTimeout: function() {
    this.cancelTimeout();
    this.timeout = window.setTimeout('QuickSearch.onTimeout()', this.delay);
  },
  onTimeout: function() {
    this.displayResults();
  },
  displayResults: function() {
    // To avoid the need to disable the button
    if (!this.isTooShortText()) {

      var quickStr = QuickSearch.searchTerm();
      jQuery('#quickresult').load('catalog/quicksearch', jQuery.param({
        queryString: quickStr,
        pageRange: 10 //20
      }), function(responseText, textStatus, XmlHttpRequest) {
        if (textStatus == 'success') {

          var noResult = XmlHttpRequest.getResponseHeader('KX_no_result');

          if (noResult == null || noResult != "true") {

            var suggestion = XmlHttpRequest.getResponseHeader('KX_suggestion');

            if (suggestion != null) {

              var newSugList = suggestion.split(",");

              for (var i = 0; i < newSugList.length; i++) {
                var str = newSugList[i];

                if (i == 0 && needInit) {
                  $(".tt-hint").val(str);

                  var raw = new Object();

                  raw["value"] = str;

                  suggestDatum["raw"] = raw;
                  suggestDatum["value"] = str;
                  suggestDatum["datasetName"] = "suggestList";

                  needInit = false;
                }

                if (!(str in suggestMap)) {
                  suggestMap[str] = true;
                  suggestList.push(str);
                }
              }
            }

          }

          showQuickSearchResult();
        }
      });
    }
  },
  closeResults: function() {
    hideQuickSearchResult();
    jQuery('#quickresultbody').html('');
    document.getElementById('quicksearch').className = 'topSearch';
  },
  onTextChange: function() { // Key press or page loaded

    var searchTerm = QuickSearch.searchTerm();
    if (searchTerm == '--v') {
      alert('version: ' + $('#hidden_app_version').text() + '\nSession: ' + $('#hidden_app_tomcat').text() + '\nIP: ' + $('#hidden_app_ip').text());
      $('#quicksearchfield').val('');
      $('#quickresult').hide();
      return;
    }

    if (this.isTooShortText()) {
      QuickSearch.cancelTimeout();
      QuickSearch.closeResults();
    } else {
      QuickSearch.restartTimeout();
    }
  },
  onClickSubmit: function() {
    if (this.canSubmit()) {
      jQuery('#searchForm').get(0).submit();
      return true;
    } else {
      return false;
    }
  },
  onSubmit: function() {
    return this.canSubmit();
  },
  canSubmit: function() {
    return !this.isInitialState() && jQuery.trim(QuickSearch.searchTerm()).length > 0;
  },

  isTooShortText: function() {
    return QuickSearch.searchTerm().length < 3;
  }
};

//-------------------------------------------
function showQuickSearchResult() {
  jQuery('#quickresult').slideDown('fast');
}

//-------------------------------------------
function hideQuickSearchResult() {
  jQuery('#quickresult').slideUp('normal');
}

function registerNewsleter() {
  if ($('#newsletterCheckbox').attr('checked')) {
    $('#newsletterHidden').val('true');
  } else {
    $('#newsletterHidden').val('false');
  }
}

function populateSelectForMonth(elName, month) {
  var el = $('#' + elName).get(0);
  var days = new Array(31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
  el.options.length = 1;
  var numDays = days[month - 1];
  for (i = 1; i <= numDays; i++) {
    el.options[el.options.length] = new Option(i < 10 ? '0' + i.toString() : i.toString(), i.toString());
  }
}

//-------------------------------------------
var SubmitLock = {
  globalLock: false,

  isLocked: function() {
    if (this.globalLock) {
      return true;
    } else {
      this.globalLock = true;
      return false;
    }
  }
};

//-------------------------------------------
var ProductDetails = {
  changeSizeAffectedLinks: function(ignoreCaptcha, variantId, oldPrice, currentPrice, discount, discountText, sizeValue, sizeIdSelected, sizeLength,
    deliveryImmediately, anotherStock, forcedTime, almostEmptyStock, stockMessage, idprefix, supplierArticleNum,
    isShowingWarehouses, warehouses, online, countrySizeMapKeySet, isOnlineListProductVariant, isNotFutureApprovedCountdown) {

    $('#productVariantIdAjax').val(variantId);

    var isOnlineListProductVariantArray = isOnlineListProductVariant.replace('[', '').replace(']', '').split(', ');
    var countryEnumArray = countrySizeMapKeySet.replace('[', '').replace(']', '').split(', ');
    for (i = 0; i < countryEnumArray.length; i++) {
      var inactive = '';
      for (k = 1; k <= sizeLength; k++) {
        inactive = isOnlineListProductVariantArray[k - 1] === 'true' ? '' : 'OutOfStockOnline';
        var sizeButton = jQuery('#' + countryEnumArray[i] + '-' + k);
        if (sizeButton.attr('class') != 'chooseSizeLink') {
          sizeButton.attr('class', 'chooseSizeLink' + inactive + ' chooseSizeLinkActive' + inactive);
        }
      }
      inactive = online === 'true' ? '' : 'OutOfStockOnline';
      jQuery('#' + countryEnumArray[i] + '-' + sizeIdSelected).attr('class', 'chooseSizeLink' + inactive +
        ' chooseSizeLinkActive' + inactive + ' chooseSizeLinkSelected' + inactive);
    }

    jQuery('#selectedSize').html(sizeValue);
    jQuery('.currentPriceId').html(currentPrice + '*');

    if (discount > 0) {
      jQuery('#discountId').html(discountText);
      jQuery('#oldPriceId').html(oldPrice);
      jQuery('#salePriceId').show();
      jQuery('#normalPriceId').hide();
      jQuery('#discountId').show();
    } else {
      jQuery('#discountId').html('');
      jQuery('#oldPriceId').html('');
      jQuery('#salePriceId').hide();
      jQuery('#normalPriceId').show();
      jQuery('#discountId').hide();
    }

    jQuery('#vatMessageId').show();
    jQuery('#availabilityId').show();

    if (forcedTime == 'true') {
      jQuery('#forcedDelivery').show();
      jQuery('#delivery_immediately').hide();
      jQuery('#delivery_delayed').hide();
    } else if (deliveryImmediately == 'true') { // centralStock (1-3 days)
      jQuery('#delivery_immediately').show();
      jQuery('#delivery_delayed').hide();
      jQuery('#forcedDelivery').hide();
    } else if (anotherStock == 'true') { // anotherStock - (6-8 days)
      jQuery('#delivery_immediately').hide();
      jQuery('#delivery_delayed').show();
      jQuery('#forcedDelivery').hide();
    } else {
      jQuery('#delivery_immediately').hide();
      jQuery('#delivery_delayed').hide();
      jQuery('#forcedDelivery').hide();
    }

    if (almostEmptyStock == 'false') { // stock still available
      jQuery('#quantityBar').hide();
    } else {
      jQuery('#quantityBarCount').html(stockMessage);
      jQuery('#quantityBar').show();
    }

    // jQuery('#addToBasketProductSize').html(sizeValue);

    var addToWishList = jQuery('#addToWishList');

    addToWishList.unbind('click');
    addToWishList.bind('click', function() {
      ProductDetails.addToWishlist(variantId);
    });

    addToWishList.attr('onmouseover', '');
    addToWishList.attr('onmouseout', '');

    jQuery('#supplierArtNumSpan').html(supplierArticleNum);

    if (isShowingWarehouses === 'true' && warehouses !== '') {
      var string = unescape(warehouses);
      var warehouseArray = JSON.parse(string);
      warehouseArray.sort(function(a, b) {
        if (a.warehouseName < b.warehouseName)
          return 1;
        if (a.warehouseName > b.warehouseName)
          return -1;
        return 0;
      });
      var warehousesContent = "";
      warehouseArray.forEach(function(warehouse) {
        var className = 'warehouseListItem';
        var visible = warehouse.isOutOfStock === 'false' ? 'visible' : 'hidden';
        if (warehouse.isOutOfStock === 'true') {
          className += ' warehouseListItemOutOfStock';
        }
        if (warehouse.warehouseNumber === '2') {
          className += ' onlineWarehouseListItem';
        }
        warehousesContent += "<div class='" + className + "'><img class='warehouseTick' style='visibility: " + visible +
          "' src='/images/tick.svg'/>" +
          "<div>" +
          warehouse.warehouseName +
          "</div></div>";
      })
      jQuery('#warehouseList').html(warehousesContent);
      jQuery('.warehouseContainer').show();
    }
    if (isNotFutureApprovedCountdown === 'true') {
      var addToBasket = jQuery('#addToBasket');
      var addToWishList = jQuery('#addToWishList');
      var formAddToBasket = jQuery('.addToCardAjaxForm');
      if (online === 'true') {
        addToBasket.unbind('click');
        addToBasket.bind('click', function() {
          ProductDetails.addToBasket(ignoreCaptcha, variantId, sizeValue);
        });
        addToBasket.attr('onmouseover', '');
        addToBasket.attr('onmouseout', '');
        addToBasket.css("background-color", "#47c178");
        addToBasket.removeAttr("disabled");
        addToWishList.removeAttr("disabled");
        addToWishList.show();
      } else {
        addToBasket.css("background-color", "silver");
        addToBasket.attr("disabled", "disabled");
        addToWishList.attr("disabled", "disabled");
        addToWishList.hide();
      }
    }
  },
  changeSizeAffectedLinksQty: function(variantId, oldPrice, currentPrice, discount, discountText, sizeValue, sizeIdSelected, sizeLength,
    deliveryImmediately, anotherStock, forcedTime, almostEmptyStock, stockMessage, idprefix) {

    $('#productVariantIdAjax').val(variantId);

    for (i = 1; i <= sizeLength; i++) {
      if (jQuery('#' + idprefix + i).attr('class') != 'sizeLink') {
        jQuery('#' + idprefix + i).attr('class', 'sizeLink');
      }
    }
    jQuery('#' + idprefix + sizeIdSelected).attr('class', 'sizeLink sizeLinkSelected');

    if (discount > 0) {
      jQuery('#discountId').html(discountText);
      jQuery('#oldPriceId').html(oldPrice);
      jQuery('#salePriceId').show();
      jQuery('#normalPriceId').hide();
      jQuery('#discountId').show();
    } else {
      jQuery('#discountId').html('');
      jQuery('#oldPriceId').html('');
      jQuery('#salePriceId').hide();
      jQuery('#normalPriceId').show();
      jQuery('#discountId').hide();
    }

    jQuery('#vatMessageId').show();

    if (forcedTime == 'true') {
      jQuery('#delivery_forced').show();
      jQuery('#delivery_immediately').hide();
      jQuery('#delivery_delayed').hide();
    } else if (deliveryImmediately == 'true') { // centralStock (1-3 days)
      jQuery('#delivery_forced').hide();
      jQuery('#delivery_immediately').show();
      jQuery('#delivery_delayed').hide();
    } else if (anotherStock == 'true') { // anotherStock - (6-8 days)
      jQuery('#delivery_forced').hide();
      jQuery('#delivery_immediately').hide();
      jQuery('#delivery_delayed').show();
    } else {
      jQuery('#delivery_forced').hide();
      jQuery('#delivery_immediately').hide();
      jQuery('#delivery_delayed').hide();
    }

    var addToBasket = jQuery('#addToBasket');
    addToBasket.unbind('click');
    addToBasket.bind('click', function() {
      ProductDetails.addToBasket(variantId);
    });
    addToBasket.attr('onmouseover', '');
    addToBasket.attr('onmouseout', '');
    addToBasket.show();

    var addToWishList = jQuery('#addToWishList');
    addToWishList.unbind('click');
    addToWishList.bind('click', function() {
      ProductDetails.addToWishlist(variantId);
    });
    addToWishList.attr('onmouseover', '');
    addToWishList.attr('onmouseout', '');
  },
  addFacebookLink: function(homepage) {
    u = encodeURIComponent(homepage + location.pathname);
    t = encodeURIComponent(document.title);
    window.open('http://www.facebook.com/sharer.php?u=' + u + '&t=' + t, 'sharer', 'toolbar=0,status=0,width=626,height=436');
    return false;
  },
  populateIcon: function() {
    if (jQuery('#recFrom').val() == 'chuck@norris') {
      jQuery('.prod_preview_img').attr('src', 'http://kickz.com/images/empty_brand_logo.gif');
    }
    if (jQuery('#recFrom').val() == 'riddic') {
      jQuery('.productDetailPic').attr('src', 'http://kickz.com/images/default_campg.jpg');
    }
    if (jQuery('#recFrom').val() == 'terminator') {
      jQuery('.productDetailPic').attr('src', 'http://kickz.com/images/default_catg.jpg');
    }
    if (jQuery('#recFrom').val() == '-X-') {
      Effect.showBC();
    }
  },
  formSend: function(inputData, klass) {
    jQuery.ajax({
      url: 'catalog/recommendation',
      data: inputData,
      success: function(response) {
        jQuery('.formSuccess').hide();
        jQuery('.formFailure').hide();
        if (response == "true") {
          jQuery('.formSuccess' + klass).show(2000, null);
        } else {
          jQuery('.formFailure' + klass).show(2000, null);
        }
      },
      error: function() {
        jQuery('#ajaxErrorMessage').show();
      }
    });
  },
  collectRecommendationInput: function(variantId) {
    from = jQuery('#recFrom').val();

    var regExp1 = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;

    if (regExp1.test(from)) {
      $(".invalidEmail").hide();
      $("#socialActionItemHover").hide();

      body = jQuery('#recBody').val();
      to = jQuery('#recTo').val();
      cc = jQuery('#recCc').is(':checked') ? 'on' : 'off';
      subject = jQuery('#recSubject').val();
      name = jQuery('#recName').val();
      var result = {
        "mailName": name,
        "mailBody": body,
        "mailTo": to,
        "mailFrom": from,
        "mailCc": cc,
        "mailSubject": subject,
        "mailProductId": variantId
      };
      ProductDetails.formSend(result, '.recommendation');
    } else {
      $(".invalidEmail").show();
    }
  },
  collectAskInput: function(variantId) {
    from = jQuery('#askFrom').val();

    var regExp1 = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;

    if (!regExp1.test(from)) {
      $(".invalidEmail").fadeIn();
    } else {
      $(".invalidEmail").hide();
    }

    body = jQuery('#askBody').val();
    if ($.trim(body) == '') {
      $(".emptyMessage").fadeIn();
      $("#askBody").addClass("error");
    } else {
      $(".emptyMessage").hide();
      $("#askBody").removeClass("error");
    }
    if (regExp1.test(from) && $.trim(body) != '') {
      $("#socialActionItemHover2").hide();

      to = jQuery('#askTo').val();
      cc = jQuery('#askCc').is(':checked') ? 'on' : 'off';
      subject = jQuery('#askSubject').val();
      name = jQuery('#askName').val();
      var result = {
        "mailName": name,
        "mailBody": body,
        "mailTo": to,
        "mailFrom": from,
        "mailCc": cc,
        "mailSubject": subject,
        "mailProductId": variantId
      };
      ProductDetails.formSend(result, '.contact');
    }
  },
  showRecommendPopup: function() {
    $('.socialActionItemHover').hide();
    $('#socialActionItemHover').show();

    if ($('#recTo').val() != '') {
      $('#recTo-label').hide();
    }

    if ($('#recBody').val() != '') {
      $('#recBody-label').hide();
    }
  },

  sizeMatrixLen: 1,
  sizesSwitchInit: function(length) {
    ProductDetails.sizeMatrixLen = length;
  },

  sizeSwitch: function(euDiv, usDiv, changeToEuMsg, changeToUsMsg) {

    var eu_uk_SizeCont = jQuery('#' + euDiv);
    var usSizeCont = jQuery('#' + usDiv);

    if (eu_uk_SizeCont.css('display') == 'none') {
      usSizeCont.hide();
      eu_uk_SizeCont.show();
      jQuery('#changeSizeText').html(changeToUsMsg);
    } else {
      eu_uk_SizeCont.hide();
      usSizeCont.show();
      jQuery('#changeSizeText').html(changeToEuMsg);
    }
  },

  addToBasketClicked: false,
  addToBasket: function(ignoreCaptcha, variantId, sizeValue) {
    if (ProductDetails.addToBasketClicked) return;

    ProductDetails.addToBasketClicked = true;

    $('#addToBasket').attr("disabled", "disabled");

    if (ignoreCaptcha) {
      var addToCardAjaxFormData = $('#addToCardAjaxForm').serializeObject();
      $.ajax({
        url: 'cart/ajaxAdd',
        data: addToCardAjaxFormData,
        type: 'POST',
        dataType: "json",
        success: function(responseText, textStatus, XmlHttpRequest) {

          if (textStatus === "success") {
            $('#general_error_container').hide();
            $('#sandbox').hide();

            if (responseText.ttoken && responseText.ttoken !== '') {
              $("input[name='ttoken']").val(responseText.ttoken);
            }

            $('#grecaptcha').remove();

            if (responseText.isError != null && responseText.isError === true) {
              $('#error_container_message').text(responseText.msg);
              $('#general_error_container').show();
              ProductDetails.addToBasketClicked = false;

              $('#addToBasket').removeAttr("disabled");
              if ($("html").width() < 753) {
                $("html, body").animate({
                  scrollTop: 0
                }, "slow");
              }
              return;
            }

            try {

              var productColorVariant = responseText.prod;
              //KX-5653 - GTM: add to basket tracking
              var selectProductVariant = responseText.gtm;

              $("#summaryCount").html(productColorVariant.totalCount);
              $("#summaryPrice").html(productColorVariant.totalAmount);

              //make it clickable
              $("#basketCount").html(productColorVariant.totalCount);
              $("#basketPrice").html(productColorVariant.totalAmount);
              $("#basketProductQuantity").html(productColorVariant.quantity);

              jQuery('#addToBasketProductSize').html(sizeValue);

              var cartLink = $('#cartLink');
              if (cartLink) {
                cartLink.attr('href', 'cart');
              }

              if (productColorVariant.totalCount === 1) {
                $("#summaryCountOne").show();
              } else {
                $("#summaryCountMultiple").show();
              }

              // DISPLAY IN THE BASKET POPUP THE NEW ADDED PRODUCT
              $("#newProdAdded").show();
              $("#newProdAddedLink").attr('href', $('#PC_colorVarUrl').val());
              $("#newProdAddedImg").attr('src', $("#angleImg1").attr('src'));
              $("#newProdAddedName").html($("#prodNameId").html());
              $("#basketTotalId").html(productColorVariant.totalAmount);

              if ($("#variantColorId").length > 0) {
                $("#newProdAddedColor").html($("#variantColorId").html());
                $("#newProdAddedColor").show();
              }

              if ($("#salePriceId").attr('style') == 'display: none;') {
                $("#newProdAddedPrice").html($("#varPriceId").val());
                $("#newProdAddedPrice").show();
              } else {
                $("#newProdAddedPriceOld").html($("#oldPriceId").html());
                $("#newProdAddedPriceOld").show();

                $("#newProdAddedPriceRed").html($("#varPriceId").val());
                $("#newProdAddedPriceRed").show();
              }

              if (productColorVariant.totalCount == 1) {
                ProductDetails.initBasketHover();
              }

            } catch (err) {
              console.error('Could not parse products: ' + responseText, err);
            }

            $("div.added2basket").slideDown(500);
            $("html, body").animate({
              scrollTop: 0
            }, "slow");

            //KX-5653 - GTM: add to basket tracking
            addToBasketTracking(selectProductVariant);

          } else {
            $("div.added2basket").hide();
          }

          ProductDetails.addToBasketClicked = false;
          $('#addToBasket').removeAttr("disabled");

          if (responseText.ttoken && responseText.ttoken !== '') {
            $("input[name='ttoken']").val(responseText.ttoken);
          }
        },

        error: function(response) {
          ProductDetails.addToBasketClicked = false;
          $('#addToBasket').removeAttr("disabled");
        }
      });
    } else {
      window.grecaptcha.ready(function() {
        window.grecaptcha.execute('6LeAALIUAAAAAKgH4qzUAFxx1mUO5UlEsTGgsQYX', {
          action: 'pdptocart'
        }).then(function(token) {
          $('#addToCardAjaxForm').prepend('<input id="grecaptcha" type="hidden" name="g-recaptcha-response" value="' + token + '">');
          var addToCardAjaxFormData = $('#addToCardAjaxForm').serializeObject();

          $.ajax({
            url: 'cart/ajaxAdd',
            data: addToCardAjaxFormData,
            type: 'POST',
            dataType: "json",
            success: function(responseText, textStatus, XmlHttpRequest) {

              if (textStatus === "success") {
                $('#general_error_container').hide();
                $('#sandbox').hide();

                if (responseText.ttoken && responseText.ttoken !== '') {
                  $("input[name='ttoken']").val(responseText.ttoken);
                }

                $('#grecaptcha').remove();

                if (responseText.isError != null && responseText.isError === true) {
                  $('#error_container_message').text(responseText.msg);
                  $('#general_error_container').show();
                  ProductDetails.addToBasketClicked = false;

                  $('#addToBasket').removeAttr("disabled");
                  if ($("html").width() < 753) {
                    $("html, body").animate({
                      scrollTop: 0
                    }, "slow");
                  }
                  return;
                }

                try {

                  var productColorVariant = responseText.prod;
                  //KX-5653 - GTM: add to basket tracking
                  var selectProductVariant = responseText.gtm;

                  $("#summaryCount").html(productColorVariant.totalCount);
                  $("#summaryPrice").html(productColorVariant.totalAmount);

                  //make it clickable
                  $("#basketCount").html(productColorVariant.totalCount);
                  $("#basketPrice").html(productColorVariant.totalAmount);
                  $("#basketProductQuantity").html(productColorVariant.quantity);

                  jQuery('#addToBasketProductSize').html(sizeValue);

                  var cartLink = $('#cartLink');
                  if (cartLink) {
                    cartLink.attr('href', 'cart');
                  }

                  if (productColorVariant.totalCount === 1) {
                    $("#summaryCountOne").show();
                  } else {
                    $("#summaryCountMultiple").show();
                  }

                  // DISPLAY IN THE BASKET POPUP THE NEW ADDED PRODUCT
                  $("#newProdAdded").show();
                  $("#newProdAddedLink").attr('href', $('#PC_colorVarUrl').val());
                  $("#newProdAddedImg").attr('src', $("#angleImg1").attr('src'));
                  $("#newProdAddedName").html($("#prodNameId").html());
                  $("#basketTotalId").html(productColorVariant.totalAmount);

                  if ($("#variantColorId").length > 0) {
                    $("#newProdAddedColor").html($("#variantColorId").html());
                    $("#newProdAddedColor").show();
                  }

                  if ($("#salePriceId").attr('style') == 'display: none;') {
                    $("#newProdAddedPrice").html($("#varPriceId").val());
                    $("#newProdAddedPrice").show();
                  } else {
                    $("#newProdAddedPriceOld").html($("#oldPriceId").html());
                    $("#newProdAddedPriceOld").show();

                    $("#newProdAddedPriceRed").html($("#varPriceId").val());
                    $("#newProdAddedPriceRed").show();
                  }

                  if (productColorVariant.totalCount == 1) {
                    ProductDetails.initBasketHover();
                  }

                } catch (err) {
                  console.error('Could not parse products: ' + responseText, err);
                }

                $("div.added2basket").slideDown(500);
                $("html, body").animate({
                  scrollTop: 0
                }, "slow");

                //KX-5653 - GTM: add to basket tracking
                addToBasketTracking(selectProductVariant);

              } else {
                $("div.added2basket").hide();
              }

              ProductDetails.addToBasketClicked = false;
              $('#addToBasket').removeAttr("disabled");

              if (responseText.ttoken && responseText.ttoken !== '') {
                $("input[name='ttoken']").val(responseText.ttoken);
              }
            },

            error: function(response) {
              ProductDetails.addToBasketClicked = false;
              $('#addToBasket').removeAttr("disabled");
            }
          });
        });
      });
    }
  },

  initBasketHover: function() {

    $(".cart").hover(
      function() {
        jQuery('#basket_quickresult').show();

      },
      function() {
        jQuery('#basket_quickresult').hide();
      }
    );

    $("#basket_quickresult").hover(
      function() {
        jQuery('#basket_quickresult').show();
      },
      function() {
        jQuery('#basket_quickresult').hide();
      }
    );

  },

  clicked: false,

  addToWishlist: function(variantId) {

    if (!ProductDetails.clicked) {
      ProductDetails.clicked = true;

      var uri = 'cart/add-to-wishlist/variantId/' + variantId;

      // IE fix (IE for some reason doesn't use base tag on its own so here we read it manually)
      var b = document.getElementsByTagName('base');
      if (b && b[0] && b[0].href) {
        uri = b[0].href + uri;
      }

      location.href = uri;
    }
  }
};

//-------------------------------------------

var BasketContents = {
  updateItemOnChange: function(variantId) {
    var quantity = $('#liQuantityId-' + variantId).val();
    if (quantity != null) {
      for (i = 0; i < quantity.length; i++) {
        var c = quantity.charAt(i);
        if (c < '0' || c > '9') {
          return true;
        }

        if (c < 0) {
          window.location = 'cart/remove/variantId/' + variantId;
        }
      }

      if (quantity > 1000) {
        quantity = 1000;
      }

      window.location = 'cart/update/variantId/' + variantId + '/quantity/' + quantity;
      return false;
    }

    return true;
  }
};

var Address = {
  updateClassOnAddressError: function(key) {
    var errorInput = $(key);
    if (errorInput != null) {
      errorInput.attr('class', errorInput.attr('class') + ' errorInput');
    }
  },

  addressHint: function() {
    var formData = $('#registrationForm').serializeObject();

    $.ajax({
      url: 'user/addresshint',
      data: formData,
      type: 'POST',
      dataType: "json",
      contentType: "application/x-www-form-urlencoded;charset=utf-8",

      success: function(response) {
        Address.processAddressResponse(response);
      },

      error: function(response) {
        if (response.responseText) {
          Address.processAddressResponse(response.responseText);
        } else {
          showErrorMessage(response['errorMessages']);
          showInfoMessage(response['infoMessages']);
          showFieldErrors(response['fieldErrors']);
        }
      }
    });

    return true;
  },

  processAddressResponse: function(response) {
    // check if we get JSON response
    if (response.state == undefined) {
      //show address-hint JSP in a popup

      $('#myModal').html(response);
      $('#myModal').modal();

    } else {
      clearMessageContainers();

      if (response.success && (response.state == 'register')) {

        $('#addressCheckerValidationFinished').val('true');
        $('#registrationForm').submit();

      } else {
        showErrorMessage(response['errorMessages']);
        showInfoMessage(response['infoMessages']);
        showFieldErrors(response['fieldErrors']);
      }
    }
  }

};

//-------------------------------------------

function preventRepeatingSubmits() {
  if (typeof(jQuery) != 'undefined') {
    jQuery(document).ready(function() {
      jQuery("form").submit(function() {
        return !SubmitLock.isLocked();
      });

      jQuery("a[href*='submit()']").click(function() {
        return !SubmitLock.isLocked();
      });
    });
  }
}

function validateNumberInput(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode(key);
  var regex = /[0-9]|\./;
  if (!regex.test(key)) {
    theEvent.returnValue = false;
    theEvent.preventDefault();
  }
}

// -------------------

var Coupon = {

  validateInvoiceAddress: function(sel_country, checkbox) {
    var diffAddr = $('#differentAddressCheckbox').is(':checked');
    if (!diffAddr) {
      Coupon.validateAddress(sel_country);
    }
  },

  validateDeliveryAddress: function(sel_country) {
    Coupon.validateAddress(sel_country);
  },

  validateAddress: function(sel_country) {
    // To avoid the need to disable the button

    $('#addressCouponWarning').load('checkout/process/method/validateAddress',
      jQuery.param({
        country: sel_country
      }),
      function(responseText, textStatus, XmlHttpRequest) {
        if ('' != responseText) {
          $('#addressCouponWarning').show();
        } else {
          $('#addressCouponWarning').hide();
        }
      });
  },

  showWarning: function(type) {
    if (type == 1) {
      $('#addressNoCouponWarning').show();
    } else {
      $('#addressDeliveryCouponWarning').show();
    }
  },

  validatePayment: function(payment_method) {
    // To avoid the need to disable the button

    $('#container').load('checkout/process/method/applyPromotion',
      jQuery.param({
        paymentMethod: payment_method
      }),
      function(responseText, textStatus, XmlHttpRequest) {});
  },

  promoteOnEnter: function(e) {
    if (enterCheck(e)) {
      Coupon.promote();
    }
  },

  promote: function() {
    var code = $('#promoCodeId').val();

    $('#summary_part').load('checkout/process/method/promote',
      jQuery.param({
        'promotionActionSupport.promotionCodeString': code
      }),
      function(responseText, textStatus, XmlHttpRequest) {

        var resultCode = XmlHttpRequest.getResponseHeader('KX_voucher_result');

        if (resultCode == "ok") {
          var infoMessage = XmlHttpRequest.getResponseHeader('KX_voucher_info_message');

          $('#info_container_message').html(infoMessage);
          $('#general_info_container').show();
          $('#general_error_container').hide();
          $('#promo_form').hide();
        } else {
          var errorMessage = XmlHttpRequest.getResponseHeader('KX_voucher_error_message');

          $('#error_container_message').html(errorMessage);
          $('#general_error_container').show();

          $('#have_discount_code').attr("checked", "checked");
          $('#promoBox').show();
          $('#promoCodeId').focus();
        }

        if (typeof OverLayerStatus != 'undefined' && OverLayerStatus != 0) {
          OverLayer.resize($('#checkout_layer'));
        }
      });

    // in case everything is ok, we display ok message + remove the voucher input
    // in case reedem voucher has failed, we display error message + mike input visible + retourn focus to it
  }

};

var Payco = {
  promote: function() {

    var code = $('#promoCodeId').val();
    $.ajax({
      url: "checkout/addresses/method/promote",
      data: {
        "promotionActionSupport.promotionCodeString": code
      },
      success: function(response) {
        clearMessageContainers();

        if (!showErrorMessage(response['errorMessages'])) {
          if (showInfoMessage(response['infoMessages'])) {
            $('#promo_form').hide();
          }
        }
      }
    });
  },

  addressCheck: function() {
    //        $('#address_part').css('opacity', '0.3');
    $('input').each(function(idx, el) {
      if ($(el).attr('title') == $(el).val()) {
        $(el).val("");
      }
    });

    jQuery.ajax({
      url: 'checkout/addresses/method/addressHint?' + $('#payment').serialize(),
      contentType: "application/json; charset=utf-8",

      success: function(response) {
        Payco.processPaycoActionResponse(response);
      },

      error: function(jqXHR, textStatus, errorThrown) {
        alert('Error of submiting the form, please try again or contact kickz');
        $('#address_part').css('opacity', "1");
      }
    });

  },

  /*
  // TODO this is version that encode special characters that has to be then decoded on server side
  addressCheck: function() {
      $('#address_part').css('opacity', '0.3');
      $('input').each(function(idx,el){
          if ($(el).attr('title')==$(el).val()){
              $(el).val("");
          }
      });

      var countryIsoCode = $('#wizard_invoiceAddress_countryIsoCode').val();
      var street = $('#wizard_invoiceAddress_street').val();
      var houseNumber = $('#wizard_invoiceAddress_houseNumber').val();
      var zip = $('#wizard_invoiceAddress_zip').val();
      var city = $('#wizard_invoiceAddress_city').val();

      // UK, US, CAN only
      var county = null;

      // if countryIsoCode then select by the code
      if(countryIsoCode == 'us') {
          county = $('#wizard_invoiceAddress_USA_state').val();
      } else if (countryIsoCode == 'ca') {
          county = $('#wizard_invoiceAddress_Canada_state').val();
      } else if (countryIsoCode == 'gb') {
          if($('#wizard_invoiceAddress_state').length > 0) {
              county = $('#wizard_invoiceAddress_state').val();
          }
      }


      var diffAddress = $('#differentAddressHidden').val();

      var del_countryIsoCode = $('#wizard_deliveryAddress_countryIsoCode').val();
      var del_street = $('#wizard_deliveryAddress_street').val();
      var del_houseNumber = $('#wizard_deliveryAddress_houseNumber').val();
      var del_zip = $('#wizard_deliveryAddress_zip').val();
      var del_city = $('#wizard_deliveryAddress_city').val();


      var del_county = null;
      if(del_countryIsoCode == 'us') {
          del_county = $('#wizard_deliveryAddress_USA_state').val();
      } else if (del_countryIsoCode == 'ca') {
          del_county = $('#wizard_deliveryAddress_Canada_state').val();
      } else if (del_countryIsoCode == 'gb') {
          if($('#wizard_deliveryAddress_state').length > 0) {
              del_county = $('#wizard_deliveryAddress_state').val();
          }
      }

      jQuery.ajax({
          url: 'checkout/addresses/method/addressHint',
          type: "GET",
          contentType: "application/json; charset=utf-8",
          data: {
              'wizard.invoiceAddress.firstName': encodeURIComponent($('#wizard_invoiceAddress_firstName').val()),
              'wizard.invoiceAddress.lastName': encodeURIComponent($('#wizard_invoiceAddress_lastName').val()),
              'wizard.invoiceAddress.companyName': encodeURIComponent($('#wizard_invoiceAddress_companyName').val()),
              'wizard.invoiceAddress.countryIsoCode': countryIsoCode,
              'wizard.invoiceAddress.street': encodeURIComponent(street),
              'wizard.invoiceAddress.houseNumber': houseNumber,
              'wizard.invoiceAddress.zip': zip,
              'wizard.invoiceAddress.city': encodeURIComponent(city),
              'wizard.invoiceAddress.state': encodeURIComponent(county),
              'wizard.order.differentDeliveryAddress': diffAddress,
              'wizard.deliveryAddress.firstName': encodeURIComponent($('#wizard_deliveryAddress_firstName').val()),
              'wizard.deliveryAddress.lastName': encodeURIComponent($('#wizard_deliveryAddress_lastName').val()),
              'wizard.deliveryAddress.companyName': encodeURIComponent($('#wizard_deliveryAddress_companyName').val()),
              'wizard.deliveryAddress.countryIsoCode': del_countryIsoCode,
              'wizard.deliveryAddress.street': encodeURIComponent(del_street),
              'wizard.deliveryAddress.houseNumber': del_houseNumber,
              'wizard.deliveryAddress.zip': del_zip,
              'wizard.deliveryAddress.city': encodeURIComponent(del_city),
              'wizard.deliveryAddress.state': encodeURIComponent(del_county)
          },

          success: function(response) {
              Payco.processPaycoActionResponse(response);
          },

          error: function (jqXHR, textStatus, errorThrown) {
              alert('Error of submiting the form, please try again or contact kickz');
              $('#address_part').css('opacity', "1");
          }
      });
  }, */

  addressCheckXYZ: function() {
    $('#address_part').css('opacity', '0.3');
    $('input').each(function(idx, el) {
      if ($(el).attr('title') == $(el).val()) {
        $(el).val("");
      }
    });

    /*
        var streetVal = $('#wizard_invoiceAddress_street').val();
        var streetValEncoded = encodeURIComponent($('#wizard_invoiceAddress_street').val());
        alert(streetVal);
        alert(streetValEncoded);

//        $('#payment').serialize())

        jQuery.ajax({
            headers: {
                Accept : "text/plain; charset=utf-8",
                "Content-Type": "text/plain; charset=utf-8"
            },
            beforeSend : function(xhr) {
//                xhr.setRequestHeader('Accept', "text/html; charset=utf-8");
                xhr.overrideMimeType("text/plain;charset=utf-8");
            },
            url: 'checkout/addresses/method/addressHint?wizard.invoiceAddress.street=' + streetValEncoded,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
//            datatype: 'html',

            success: function(response) {
                Payco.processPaycoActionResponse(response);
            },

            error: function (jqXHR, textStatus, errorThrown) {
                alert('Error of submiting the form, please try again or contact kickz');
                $('#address_part').css('opacity', "1");
            }
        });

        */

  },

  submit: function() {
    $("#floatbox-box").fadeOut(1);
    $("#floatbox-background").fadeOut(1);
    $("#checkout_layer").hide();

    jQuery.ajax({
      url: 'checkout/addresses/method/submit',
      data: {
        "addressSupport.hintInvoiceAddressSelected": $('#hintInvoiceAddressSelected').val(),
        "addressSupport.hintDeliveryAddressSelected": $('#hintDeliveryAddressSelected').val()
      },
      success: function(response) {
        Payco.processPaycoActionResponse(response);
      },
      error: function(response) {
        Payco.processPaycoActionResponse(response);
      }
    });
  },

  processPaycoActionResponse: function(response) {
    // it returns eather json that contains errorMessages object or div for adress hint popup
    if (response.errorMessages == null || response.errorMessages == undefined) {
      //show address hint popup

      var box_width = '700px';
      $.floatbox({
        boxConfig: {
          width: box_width
        },
        content: response,
        fade: true
      });

    } else {
      clearMessageContainers();

      var paycoURL = response['paycoIframeURL'];

      if (paycoURL != null) {

        redirectToAbsoluteURL('checkout/processPayco');

      } else {
        showErrorMessage(response['errorMessages']);
        showInfoMessage(response['infoMessages']);
        showFieldErrors(response['fieldErrors']);

        //                $('#address_part').css('opacity', '1');
      }
    }
  }

  /*
  showFrame: function (frameURL) {
      if (frameURL != null) {

          $('#payco_part').css('opacity', '1');
          $('#real_payco').show();
          $('#fake_payco').hide();

          // define payco frame
          $('#payco_frame').attr('src',frameURL);

          // define html element in the frame as overflow:auto;
          // $("#payco_frame").contents().find("html").attr('style','overflow: visible');


          $('#address_part').css('opacity', '0.3');

          //disable input
          $('#payment input').attr('disabled',true);

          CheckoutSupport.setCheckoutExpiration();

      } else {
          $('#address_part').css('opacity', '1');
      }
  }*/

};

var Utf8 = {
  // public method for url decoding
  decode: function(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
};

//-------------------------------------------
// put in into the footer ??
// add the facebook SDK js library into the header
var FacebookConnect = {

  callback: null,
  tracker: null,

  registerLinks: function(baseHref) {
    var loginFBIcon = document.getElementById('FBLoginIcon');
    if (loginFBIcon) {
      loginFBIcon.href = 'javascript:void(0);';
      loginFBIcon.onclick = function() {
        FacebookConnect.login_register();
      };
    }

    var loginFBLink = document.getElementById('FBLoginLink');
    if (loginFBLink) {
      loginFBLink.href = 'javascript:void(0);';
      loginFBLink.onclick = function() {
        FacebookConnect.login_register();
      };
    }

    var loginFBLink2 = document.getElementById('FBLoginLink2');

    if (loginFBLink2) {
      loginFBLink2.onclick = function() {
        FacebookConnect.login_register();
      };
      if (loginFBLink2.href) {

      }
    }

    var loginFBLink3 = document.getElementById('FBLoginLink3');
    if (loginFBLink3) {

      FacebookConnect.callback = function() {
        location.href = baseHref + 'cart';
      };

      loginFBLink3.onclick = function() {
        FacebookConnect.login_register();
      };
    }
  },

  registerCheckoutLink: function() {
    var checkoutFBLink = document.getElementById('FBcheckoutLink');
    if (checkoutFBLink) {
      checkoutFBLink.href = 'javascript:void(0);';

      checkoutFBLink.onclick = function() {
        $(this).css("cursor", "progress");
        FacebookConnect.login_register_checkout();
      };
    }
  },

  unRegisterCheckoutLink: function() {
    var checkoutFBLink = document.getElementById('FBcheckoutLink');
    if (checkoutFBLink) {
      checkoutFBLink.href = 'user/facebook-login-redirect';
      checkoutFBLink.onclick = null;
    }
  },

  autologin: function(appIdValue, facebookLoginCheck) {
    // TODO [JH] - simplify to work on YES / NO -- login try, logged_in, logged_out, registration = DO_NOT_TRY_AGAIN
    if (facebookLoginCheck != 'LOGED_OUT________' && facebookLoginCheck != 'LOGGED_IN' && facebookLoginCheck != 'REGISTRATION' && facebookLoginCheck != 'LOGGED_ONLY_FB') {
      FB.init({
        appId: appIdValue,
        status: true,
        cookie: true
      });
      FacebookConnect.init();
    }
  },

  init: function() {

    FB.getLoginStatus(function(response) {
      if (response.session) {
        FacebookConnect.login(response.session.access_token, response.authResponse.userID, response);
      }
    });
  },

  asyncLoad: function() {
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        FacebookConnect.login(response.authResponse.accessToken, response.authResponse.userID, response);
      }
    });
  },

  login: function(access_token, userID, response) {
    if (access_token) {
      // avatar.setAttribute('src', 'http://graph.facebook.com/' + response.session.uid + '/picture');
      //                facebookUserStatus = response.session.uid;
      //

      // loaded_top_nav -> loaded_top_nav

      $('#loaded_top_nav').load('user/facebook-login',
        jQuery.param({
          accessToken: access_token
        }),
        function(responseText, textStatus, XmlHttpRequest) {
          if ('' != responseText) {
            var loadResult = $('#hiddenLoadResult').val();

            if (loadResult) {
              if (FacebookConnect.callback != null) {
                try {
                  FacebookConnect.callback();
                } catch (e) {
                  console.error('Facebook callback error', e);
                }
              }

              if (loadResult == 'true') {
                // $('#fullLogin').show();
              } else {
                $('#partialLogin').show();
              }

              $('#topNavigationBasketId').load('cart/load-basket', jQuery.param({}), function(responseText, textStatus, XmlHttpRequest) {});
              $('#loaded_top_nav').addClass('signed');

              ProductReview.reloadCommentTab();
            } else {

              var blockResult = $('#hiddenBlockResult').val();
              if (blockResult == 'true') {
                $('#userIsBlocked').show();
              }
            }

            Popup.country_notification_ajax();
          }
        });

    } else {
      // we have to tell shop to NOT try it again (every request)
      jQuery.ajax({
        url: 'user/facebook-not-logged',
        success: function(response) {},
        error: function() {}
      });

    }
  },

  login_checkout: function(access_token, userID) {
    if (access_token) {
      jQuery.ajax({
        data: {
          'accessToken': access_token
        },
        url: 'user/facebook-login-last_url',
        success: function(response) {
          if (response == 'USER_IS_BLOCKED') {
            $('#userIsBlocked').show();
          } else {
            window.location.href = response;
          }
        },
        error: function() {}
      });
    } else {
      FacebookConnect.unRegisterCheckoutLink();
    }
  },

  // login or register the FB APP
  login_register: function() {
    FB.getLoginStatus(function(response) {

      if (response.status == "connected") {

        FacebookConnect.login(response.authResponse.accessToken, response.authResponse.userID, response);

      } else {

        FB.login(function(response) {

          if (response.authResponse) {
            FacebookConnect.login(response.authResponse.accessToken, response.authResponse.userID, response);
          }
        }, {
          scope: 'email,read_stream,user_location'
        });
      }
    });
  },

  // login or register the FB APP
  login_register_checkout: function() {

    FB.getLoginStatus(function(response) {

      if (response.status == "connected") {

        FacebookConnect.login_checkout(response.authResponse.accessToken, response.authResponse.userID, response);

      } else {

        FB.login(function(response) {

          if (response.authResponse) {
            FacebookConnect.login_checkout(response.authResponse.accessToken, response.authResponse.userID, response);
          }
        }, {
          scope: 'email,read_stream,user_location'
        });
      }
    });
  },

  // init and then login
  init_login: function() {

    FB.init({
      appId: appIdValue,
      status: true,
      cookie: true
    });
    login_register();
  },

  register_tracker: function(_tracker) {

    FacebookConnect.tracker = _tracker;

    _tracker.trackSocial = function(opt_pageUrl, opt_trackerName) {
      _tracker.trackFacebook(opt_pageUrl, opt_trackerName);
    };

    _tracker.trackFacebook = function(opt_pageUrl, opt_trackerName) {

      try {
        if (FB && FB.Event && FB.Event.subscribe) {
          FB.Event.subscribe('edge.create', function(targetUrl) {

            _tracker._trackSocial('facebook', 'like', targetUrl, opt_pageUrl);

          });
          FB.Event.subscribe('edge.remove', function(targetUrl) {

            _tracker._trackSocial('facebook', 'unlike', targetUrl, opt_pageUrl);

          });
          FB.Event.subscribe('message.send', function(targetUrl) {

            _tracker._trackSocial('facebook', 'send', targetUrl, opt_pageUrl);

          });
        }
      } catch (e) {}
    };

  },

  track_facebook: function(opt_pageUrl, opt_trackerName) {
    if (FacebookConnect.tracker) {
      FacebookConnect.tracker.trackFacebook(opt_pageUrl, opt_trackerName);
    }
  }

};

//-------------------------------------------
var reloadComments = false;

var ProductReview = {

  loadReviews: function() {

    $('#kommentare').load('catalog/showComments',
      jQuery.param({
        id: $('#pcvId').val(),
        thumbImg: $('#PC_thumbImg').val(),
        showReviews: true
      }),
      function(responseText, textStatus, XmlHttpRequest) {}
    );
  },

  showMoreComments: function() {

    $('#kommentare').load('catalog/showMoreComments',
      jQuery.param({
        id: $('#pcvId').val(),
        reviewPage: $('#PC_reviewPage').val(),
        productErp: $('#PC_productErp').val(),
        showReviews: true,
        productReviewSize: $('#PC_productReviewSize').val()
      }),
      function(responseText, textStatus, XmlHttpRequest) {}
    );
  },

  showMoreCommentsQty: function() {

    $('#comments').load('catalog/showMoreCommentsQty',
      jQuery.param({
        id: $('#pcvId').val(),
        reviewPage: $('#PC_reviewPage').val(),
        productErp: $('#PC_productErp').val(),
        showReviews: true,
        productReviewSize: $('#PC_productReviewSize').val()
      }),
      function(responseText, textStatus, XmlHttpRequest) {}
    );
  },

  setToReloadTab: function() {
    reloadComments = true;
  },

  reloadCommentTab: function() {
    if (reloadComments) {
      reloadComments = false;
      $('#detail_id').click();
      $('#comments_id').click();
    }
  }
};

//-------------------------------------------

var RecentlyVisited = {
  loadItems: function(languageId) {
    // ~ we do load only once
    if ($("#recently-visited").hasClass("recently-visited-loaded")) {
      return;
    }

    // ~ load the data
    var items = [];
    $.getJSON('catalog/recently-visited', function(data) {
      $.each(data, function(i, product) {
        // ~ skip this product if it's the one the user got open at this point in time
        if ($.trim(document.URL).match(product.url + "$") == product.url) {
          return;
        }

        var prodName = $.trim(product.name).split('\"').join('&quot;');
        items.push(
          '<div style="float: left;" class="carouselElement"><div class="carouselPicture"><a href="' +
          product.url +
          '"><img onerror="this.src=\'/images/60.jpg\';this.onerror=null;" alt="' +
          prodName +
          '" title="' +
          prodName +
          '" src="' +
          product.imageUrl +
          '" class="prod_thumb_img"></a></div><div style="text-align: center;" class="carouselPrice"><a href="' +
          product.url +
          '">' +
          product.price +
          '</a></div></div>');
      });
      $('#recently-visited').children().remove();
      $('#recently-visited').append($(items.join('')));
      $('#recently-visited').addClass('recently-visited-loaded');
    });
  }
};

var Player = {

  thunder: function() {

    document.getElementById("musicPanel").innerHTML = '<embed src="/media/thunder.mp3" height="1px" width="1px" type="application/x-mplayer2" autostart="1" loop="0" volume="50"></embed>';

    //        '<audio src="/media/thunder.mp3" autoplay="autoplay"></audio>';
    // '<embed src="/media/thunder.mp3" height="1px" width="1px" type="application/x-mplayer2" autostart="1" loop="0" volume="50"></embed>';

  },

  music: function() {
    document.getElementById("musicPanel").innerHTML =
      '<embed src="/media/klavir.mp3" height="1px" width="1px" type="application/x-mplayer2" autostart="1" loop="0" volume="50"></embed>';

  }

  //        var thissound = document.getElementById(sound);
  //
  //         try {
  //             thissound.Play();
  //         }
  //         catch (ex1) {
  //             try {
  //                thissound.DoPlay();
  //             } catch (ex2) { }
  //         }

};

var container_style;

var Effect = {

  blink: function() {
    $('#main_container').fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
  },

  slide: function() {
    $('#main_container').hide(10).show(10).hide(10).show(10);

    //        $('#main_container').animate({marginLeft:'870px'},8000);
  },

  slide_classic: function() {
    container_style = document.getElementsByClassName('limited_container')[0].style;
    setTimeout("Effect.doMove()", 1000);
  },

  showBC: function() {
    var body_style = document.getElementsByTagName('body')[0].style;
    body_style.backgroundImage = "url(http://kickz.com/images/picturemissing228.jpg)";
    body_style.backgroundRepeat = "no-repeat";

    //            $('#main_container').animate({right:"-=30px"}, 2000);

    container_style = document.getElementsByClassName('limited_container')[0].style;
    setTimeout("Effect.doMove()", 2000);
    setTimeout("Player.thunder()", 6500);
  },

  doMove: function() {
    var ml = container_style.marginLeft;
    if (ml == null || ml == '') {
      ml = 0;
    } else {
      ml = ml.substr(0, ml.length - 2);
    }

    var len = parseInt(ml);
    if (len < 870) {
      if (len < 770) {
        container_style.marginLeft = (len + 15) + 'px';
        setTimeout("Effect.doMove()", 100);
      } else if (len < 820) {
        container_style.marginLeft = (len + 13) + 'px';
        setTimeout("Effect.doMove()", 80);
      } else {
        container_style.marginLeft = (len + 10) + 'px';
        setTimeout("Effect.doMove()", 70);
      }
    } else {
      setTimeout("Effect.blink()", 1000);
    }
  }
};

//-------------------------------------------

jQuery.fn.DefaultValue = function(klass, text) {
  return this.each(function() {
    //Make sure we're dealing with text-based form fields
    if (this.type != 'text' && this.type != 'password' && this.type != 'textarea')
      return;

    //Store field reference
    var fld_current = this;

    //Set value initially if none are specified
    if ($(this).val() == '') {
      $(this).addClass(klass);
      $(this).val(text);
    } else {
      //Other value exists - ignore
      return;
    }

    //Remove values on focus
    $(this).focus(function() {
      if ($(this).val() == text || $(this).val() == '') {
        $(this).removeClass(klass);
        $(this).val('');
      }
    });

    //Place values back on blur
    $(this).blur(function() {
      if ($(this).val() == text || $(this).val() == '') {
        $(this).addClass(klass);
        $(this).val(text);
      }
    });

    //Capture parent form submission
    //Remove field values that are still default
    $(this).parents("form").each(function() {
      //Bind parent form submit
      $(this).submit(function() {
        if ($(fld_current).val() == text) {
          $(fld_current).val('');
        }
      });
    });
  });
};

function x_show() {
  var show_type = "block";
  var show_id = "";
  if (x_show.arguments.length > 0) show_id = x_show.arguments[0];
  if (x_show.arguments.length > 1) show_type = x_show.arguments[1];
  if (show_id != "") {
    if (document.getElementById(show_id)) jQuery('#' + show_id).fadeIn('normal');
  }
}

function x_hide() {
  var hide_type = "none";
  var hide_id = "";
  if (x_hide.arguments.length > 0) hide_id = x_hide.arguments[0];
  if (x_hide.arguments.length > 1) hide_type = x_hide.arguments[1];
  if (hide_id != "") {
    if (document.getElementById(hide_id)) document.getElementById(hide_id).style.display = hide_type;
  }
}

function class_hide(className) {
  var divsToHide = document.getElementsByClassName(className);

  for (var i = 0, len = divsToHide.length; i < len; i++) {
    divsToHide[i].style.display = 'none';
  }
}

function x_focus() {
  var focus_id = "";
  if (x_focus.arguments.length > 0) focus_id = x_focus.arguments[0];
  if (focus_id != "") {
    if (document.getElementById(focus_id)) document.getElementById(focus_id).focus();
  }
}

function empty() {}

function loadSecurityQuestion(login) {
  var link = "user/forgot-password?login=" + login.login;
  $('#loginForm').attr("action", link);
  $('#loginForm').submit();
}

function showLocalizedSize() {
  $('#nonLocalizedSize').val(false);
  SearchPanel.resetSize();
}

function showNonLocalizedSize() {
  $('#nonLocalizedSize').val(true);
  SearchPanel.resetSize();
}

// 0 - disabled, 1 - payment + summary panels hidden, 2 - summary hidden
var OverLayerStatus = 0;

var OverLayer = {

  //    full_layer: function() {
  //
  //        var payment_part = $('#full_checkout_layer');
  //
  //        if(payment_part.is(':visible')) {
  //            payment_part.fadeOut();
  //        } else {
  //            payment_part.fadeIn();
  //        }
  //    },

  overPaymentSummary: function() {
    OverLayerStatus = 1;
    var layer = $('#checkout_layer');
    OverLayer.resize(layer);
    layer.fadeIn();
  },

  overSummary: function() {
    OverLayerStatus = 2;
    var layer = $('#checkout_layer');
    OverLayer.resize(layer);
    layer.fadeIn();
  },

  overLogin: function() {
    OverLayerStatus = 2;
    var layer = $('#shop_layer');
    OverLayer.resizeLogin(layer);
    layer.fadeIn();
  },

  resizeLogin: function(layer) {

    var summary_part = $('.account_middle_part');

    var containerHeight = $('#container').height();
    var messageHeight = $('#shop_messages').height();

    width = summary_part.outerWidth() + 20;
    position = summary_part.offset();

    layer.css('width', width);
    layer.css('height', containerHeight - messageHeight - 10);

    var scrollLeftOffset = $(window).scrollLeft();

    layer.css('left', position.left - 10 - scrollLeftOffset);

    var scrollTopOffset = $(window).scrollTop();

    layer.css('top', position.top - scrollTopOffset);
  },

  resize: function(layer) {

    var payment_part = $('#payment_part');
    var paymentExist = payment_part.length > 0;

    var summary_part = $('#summary_part');
    if (summary_part.length == 0) {
      summary_part = $('#payco_part');
    }

    var containerHeight = $('#container').height();
    var messageHeight = $('#checkout_messages').height();

    var width = paymentExist ? payment_part.outerWidth() : 0;
    var position = 0;

    // cover both panels
    if (OverLayerStatus == 1) {
      if (paymentExist) {
        width = payment_part.outerWidth() + summary_part.outerWidth() + 35;
        position = payment_part.offset();
      }
    } else {
      width = summary_part.outerWidth() + 20;
      position = summary_part.offset();
    }

    //        var winHeight = $(window).height();
    //        var docHeight = $(document.body).height() - 50;

    layer.css('width', width);
    layer.css('height', containerHeight - messageHeight - 10);

    var scrollLeftOffset = $(window).scrollLeft();

    layer.css('left', position.left - 10 - scrollLeftOffset);

    var scrollTopOffset = $(window).scrollTop();

    layer.css('top', position.top - scrollTopOffset);

    //        if(winHeight > docHeight) {
    //            layer.css('height', containerHeight);
    //            layer.css('top', position.top);
    //        } else {
    //            layer.css('height', '100%');
    //            layer.css('top', '0');
    //        }

  },

  hide: function() {
    OverLayerStatus = 0;
    $('#checkout_layer').fadeOut();
  }
};

function invisibleReCaptchaRendering(event) {

  var token = grecaptcha.getResponse(recaptchaId);

  // if no token, mean user is not validated yet
  if (!token) {
    // trigger validation
    event.preventDefault();
    window.grecaptcha.execute(recaptchaId);
    return;
  }
}

var CheckoutSupport = {

  addressHint: function(event, countryShopId, loginName) {
    if (countryShopId === '1' && loginName === 'true') {
      invisibleReCaptchaRendering(event);
    } else {
      onUserAddressVerified();
    }
  },

  dontSubmitHintAddresses: function() {
    document.getElementById('checkout_submit_btn').disabled = false; // to enable back the submit button
  },

  submitHintAddresses: function() {

    document.getElementById('hint_submit_btn').disabled = true; // to prevent the dreaded double-click
    document.body.style.cursor = 'wait';

    $("#myModal").modal('hide');
    $(".modal-backdrop").hide();

    jQuery.ajax({
      url: 'checkout/addresses/method/submit',
      data: {
        "addressSupport.hintInvoiceAddressSelected": $('#hintInvoiceAddressSelected').val(),
        "addressSupport.hintDeliveryAddressSelected": $('#hintDeliveryAddressSelected').val()
      },
      success: function(response) {
        document.body.style.cursor = 'default';

        if (response.success) {
          // redirectToAbsoluteURL('checkout/paymentOptions');
          redirectToAbsoluteURL('checkout/paymentSummary');
        } else {
          document.getElementById('checkout_submit_btn').disabled = false;
          document.getElementById('hint_submit_btn').disabled = false;

          clearMessageContainers();
          showErrorMessage(response['errorMessages']);
          showInfoMessage(response['infoMessages']);
          showFieldErrors(response['fieldErrors']);
        }
      },
      error: function(response) {
        showErrorMessage(response['errorMessages']);
        showInfoMessage(response['infoMessages']);
        showFieldErrors(response['fieldErrors']);
        document.body.style.cursor = 'default';
        document.getElementById('checkout_submit_btn').disabled = false;
        document.getElementById('hint_submit_btn').disabled = false;
      }
    });
  },

  processAddressesAjaxResponse: function(response) {
    // response returns either JSON error messages object or adress-hint JSP
    if (response.errorMessages == undefined || response.errorMessages == null) {
      //show address-hint JSP in a popup

      $('#myModal').html(response);
      $('#myModal').modal();

      /*
      var box_width = '700px';
      $.floatbox({
          boxConfig: {
              width: box_width
          },
          content: response,
          fade: true
      });*/

    } else {
      clearMessageContainers();

      if (response.success) {
        // redirectToAbsoluteURL('checkout/paymentOptions');
        redirectToAbsoluteURL('checkout/paymentSummary');
      } else {
        showErrorMessage(response['errorMessages']);
        showInfoMessage(response['infoMessages']);
        showFieldErrors(response['fieldErrors']);
      }
    }

  },

  addressHintSubmit: function() {
    $("#floatbox-box").fadeOut(1);
    $("#floatbox-background").fadeOut(1);
    $("#checkout_layer").hide();

    jQuery.ajax({
      url: 'checkout/addresses/method/submit',
      data: {
        "addressSupport.hintInvoiceAddressSelected": $('#hintInvoiceAddressSelected').val(),
        "addressSupport.hintDeliveryAddressSelected": $('#hintDeliveryAddressSelected').val()
      },
      success: function(response) {
        CheckoutSupport.processAddressesAjaxResponse(response);
      },
      error: function(response) {
        CheckoutSupport.processAddressesAjaxResponse(response);
      }
    });
  },

  setOrderExpiration: function(millis, orderNo, redirect) {

    console.log(orderNo + ' - ' + redirect);

    if ($.cookie('cookie_order_expired') == orderNo) {
      $.cookie('cookie_checkout_expired', true, {
        path: '/'
      });
      location.href = redirect;
    }

    setTimeout(function() {
      $.cookie('cookie_order_expired', orderNo, {
        path: '/'
      });
      $.cookie('cookie_checkout_expired', true, {
        path: '/'
      });
      //           window.open("http://local.kickz.com/en/", "_target");

      jQuery.ajax({
        url: 'checkout/expire',
        type: 'POST',
        data: {
          expiredOrder: orderNo
        },
        complete: function(response) {
          location.href = redirect;
        }
      });

    }, millis);
  },

  checkOrderExpiration: function(orderNo) {

    if ($.cookie('cookie_checkout_expired') == 'true') {
      $.removeCookie('cookie_checkout_expired', {
        path: '/'
      });
      $(function() {
        $('#checkoutExpired').show();
      });
    }
  },

  updateNonEUCountryWarning: function() {
    var isDeliveryAddrUsed = $('#differentAddressHidden').val() == 'true';
    var invCountry = $('#wizard_invoiceAddress_countryIsoCode').val();
    var delCountry = $('#wizard_deliveryAddress_countryIsoCode').val();

    // emptry string is in here to avoid displaying the message when no country is selected
    // (that is, emptry string is the ID of choose-a-country option)
    var euCountries = ['', 'at', 'be', 'bg', 'cy', 'cz', 'de', 'dk', 'ee', 'es', 'fi', 'fr', 'gb', 'gr',
      'hu', 'hr', 'ie', 'it', 'lt', 'lu', 'lv', 'mt', 'nl', 'pl', 'pt', 'ro', 'se', 'si', 'sk'
    ];

    if (!invCountry && !delCountry) {
      $('#nonEuCountrySelected').hide();
    } else {
      if ((isDeliveryAddrUsed && euCountries.indexOf(delCountry) == -1) ||
        (!isDeliveryAddrUsed && euCountries.indexOf(invCountry) == -1)) {
        $('#nonEuCountrySelected').show();
        this.warnNonEuCountry();
      } else {
        $('#nonEuCountrySelected').hide();
      }
    }
  },

  warnNonEuCountry: function() {
    $.floatbox({
      boxConfig: {
        width: '520px'
      },
      content: $('#non_eu_country_notification').html(),
      fade: true
    });
  },

  reloadPayment: function(sel_country, setDelivery, isPackstationEnabled) {
    // To avoid the need to disable the button

    var addressparam;
    var diffAddr = $('#differentAddressCheckbox').is(':checked');

    this.updateNonEUCountryWarning();

    if (setDelivery) {

      if (sel_country == 'us') {
        $('#delivery_USA_state').show();
        $('#wizard_deliveryAddress_USA_state').removeAttr("disabled");
      } else {
        $('#delivery_USA_state').hide();
        $('#wizard_deliveryAddress_USA_state').prop('disabled', 'disabled');
      }

      if (sel_country == 'ca') {
        $('#delivery_Canada_state').show();
        $('#wizard_deliveryAddress_Canada_state').removeAttr("disabled");
      } else {
        $('#delivery_Canada_state').hide();
        $('#wizard_deliveryAddress_Canada_state').prop('disabled', 'disabled');
      }

      if (sel_country == 'de') {
        if (isPackstationEnabled) {
          $('#delivery_packstation_chb').show();
          if ($('#packstationCheckbox').is(':checked')) {
            this.togglePackstation();
          }
        }
      } else if ($('#delivery_packstation_chb').is(":visible")) {
        $('#delivery_packstation_chb').hide();
        if ($('#packstationCheckbox').is(':checked')) {
          this.togglePackstation();
        }
      }

      addressparam = jQuery.param({
        'addressSupport.deliveryCountry': sel_country,
        'addressSupport.differentDeliveryAddress': diffAddr
      });
    } else {

      if (sel_country == 'us') {
        $('#invoice_USA_state').show();
        $('#wizard_invoiceAddress_USA_state').removeAttr("disabled");

      } else {
        $('#invoice_USA_state').hide();
        $('#wizard_invoiceAddress_USA_state').prop('disabled', 'disabled');
      }

      if (sel_country == 'ca') {
        $('#invoice_Canada_state').show();
        $('#wizard_invoiceAddress_Canada_state').removeAttr("disabled");
      } else {
        $('#invoice_Canada_state').hide();
        $('#wizard_invoiceAddress_Canada_state').prop('disabled', 'disabled');
      }

      addressparam = jQuery.param({
        'addressSupport.invoiceCountry': sel_country,
        'addressSupport.differentDeliveryAddress': diffAddr
      });
    }

    $('#payment_part').load('checkout/process/method/paymentReload',
      addressparam,
      function(responseText, textStatus, XmlHttpRequest) {

        var radios = $("input[name='wizard.selectedPayment']");
        var checked = radios.filter(":checked");

        if (checked != null && checked.val() != 'undefined') {
          // in case we have predefined payment, we should also reload payment part
          $('#summary_part').load('checkout/process/method/summaryReload');
          OverLayer.hide();
        } else {
          OverLayer.overSummary();
        }
      }
    );
  },

  togglePackstation: function() {
    if ($('#packstationCheckbox').is(':checked')) {
      $('#delivery_addressInfo_ul').insertBefore('#delivery_street_ul');
      $('#wizard_deliveryAddress_street').prop('readonly', 'true');
      $("#wizard_deliveryAddress_additionalAddressInfo").removeClass("optional");
    } else {
      $('#delivery_addressInfo_ul').insertAfter('#delivery_city_ul');
      $('#wizard_deliveryAddress_street').removeAttr('readonly');
      $("#wizard_deliveryAddress_additionalAddressInfo").addClass("optional");
    }
    // for better user experience 3 fields (street, houseNo & additionalAddressInfo) are remembered when switching between home & packstation delivery
    // this is done here with help of 3 hidden fields which store previously used values (and during the switch, values of normal & hidden fields are exchanged)
    // (additionally also field placeholders are switched in order to show proper field descriptions)
    var oldStreetVal = $('#oldStreet').val();
    var oldStreetPH = $('#oldStreet').prop('placeholder');
    var oldHouseNoVal = $('#oldHouseNo').val();
    var oldHouseNoPH = $('#oldHouseNo').prop('placeholder');
    var oldAdditInfoVal = $('#oldAdditInfo').val();
    var oldAdditInfoPH = $('#oldAdditInfo').prop('placeholder');

    $('#oldStreet').val($('#wizard_deliveryAddress_street').val());
    $('#oldStreet').prop('placeholder', $('#wizard_deliveryAddress_street').prop('placeholder'));
    $('#oldHouseNo').val($('#wizard_deliveryAddress_houseNumber').val());
    $('#oldHouseNo').prop('placeholder', $('#wizard_deliveryAddress_houseNumber').prop('placeholder'));
    $('#oldAdditInfo').val($('#wizard_deliveryAddress_additionalAddressInfo').val());
    $('#oldAdditInfo').prop('placeholder', $('#wizard_deliveryAddress_additionalAddressInfo').prop('placeholder'));

    $('#wizard_deliveryAddress_street').val(oldStreetVal);
    $('#wizard_deliveryAddress_street').prop('placeholder', oldStreetPH);
    $('#wizard_deliveryAddress_houseNumber').val(oldHouseNoVal);
    $('#wizard_deliveryAddress_houseNumber').prop('placeholder', oldHouseNoPH);
    $('#wizard_deliveryAddress_additionalAddressInfo').val(oldAdditInfoVal);
    $('#wizard_deliveryAddress_additionalAddressInfo').prop('placeholder', oldAdditInfoPH);
  },

  initPackstation: function() {
    if ($('#wizard_deliveryAddress_street').val() == 'Packstation' && $('#wizard_deliveryAddress_countryIsoCode').val() == 'de') {
      $('#packstationCheckbox').prop('checked', true);

      $('#oldStreet').val($('#wizard_deliveryAddress_street').val());
      $('#oldHouseNo').val($('#wizard_deliveryAddress_houseNumber').val());
      $('#oldAdditInfo').val($('#wizard_deliveryAddress_additionalAddressInfo').val());

      $('#wizard_deliveryAddress_street').val('');
      $('#wizard_deliveryAddress_houseNumber').val('');
      $('#wizard_deliveryAddress_additionalAddressInfo').val('');

      this.togglePackstation();
    }
  },

  toggleDifferentAddress: function() {
    var diffDelAddr = $('#differentAddressCheckbox').is(':checked');

    this.updateNonEUCountryWarning();

    if (diffDelAddr) {
      $('#differentAddressHidden').val('true');
      CheckoutSupport.removeEmptyValues();
      $('#delivery-address-section').css('opacity', '1');

    } else {
      $("#differentAddressHidden").val("false");
      $('#delivery-address-section').css('opacity', '0.3');
      CheckoutSupport.addEmptyValues();
    }

    if (OverLayerStatus != 0) {
      OverLayer.resize($('#checkout_layer'));
    }
  },

  addEmptyValues: function() {
    var delStreet = $('#wizard_deliveryAddress_street');
    if (delStreet.val() == delStreet.attr('title') || delStreet == '') {
      delStreet.val('_');
    }

    var delNO = $('#wizard_deliveryAddress_houseNumber');
    if (delNO.val() == delNO.attr('title') || delNO == '') {
      delNO.val('_');
    }

    var delZip = $('#wizard_deliveryAddress_zip');
    if (delZip.val() == delZip.attr('title') || delZip == '') {
      delZip.val('_');
    }

    var delCity = $('#wizard_deliveryAddress_city');
    if (delCity.val() == delCity.attr('title') || delCity == '') {
      delCity.val('_');
    }
  },

  removeEmptyValues: function() {

    var delStreet = $('#wizard_deliveryAddress_street');
    if (delStreet.val() == '_') {
      delStreet.val(delStreet.attr('title'));
    }

    var delNO = $('#wizard_deliveryAddress_houseNumber');
    if (delNO.val() == '_') {
      delNO.val(delNO.attr('title'));
    }

    var delZip = $('#wizard_deliveryAddress_zip');
    if (delZip.val() == '_') {
      delZip.val(delZip.attr('title'));
    }

    var delCity = $('#wizard_deliveryAddress_city');
    if (delCity.val() == '_') {
      delCity.val(delCity.attr('title'));
    }

  }
};

var onUserAddressVerified = function(reCaptchaToken) {
  document.getElementById('checkout_submit_btn').disabled = true; // to prevent the dreaded double-click

  document.body.style.cursor = 'wait';

  $('input').each(function(idx, el) {
    if ($(el).attr('title') == $(el).val()) {
      $(el).val("");
    }
  });

  var formData = $('#payment').serializeObject();

  $.ajax({
    url: 'checkout/addresses/method/addressHint',
    type: 'POST',
    dataType: "json",
    contentType: "application/x-www-form-urlencoded;charset=utf-8",
    data: formData,

    success: function(response) {
      if (response.success == false && response.state == "reservation_invalid_state") {
        var msg = (response.errorMessages != undefined && response.errorMessages != null && response.errorMessages[0] != null && response.errorMessages[0] != undefined) ? response.errorMessages[0] : "The checkout cannot be processed, because the contents of the basket have changed. Please start it again.";
        alert(msg);
      } else {
        CheckoutSupport.processAddressesAjaxResponse(response);
      }

      if (reCaptchaToken) {
        grecaptcha.reset();
      }

      document.getElementById('checkout_submit_btn').disabled = false;
      document.body.style.cursor = 'default';
    },

    error: function(jqXHR, textStatus, errorThrown) {
      var msg = 'Error of submiting the form: ' + textStatus + ': ' + errorThrown + ', please try again or contact kickz';
      console.log(msg);
      if (jqXHR.responseText) {
        CheckoutSupport.processAddressesAjaxResponse(jqXHR.responseText);
      } else {
        alert(msg);
      }
      document.getElementById('checkout_submit_btn').disabled = false;
      document.body.style.cursor = 'default';
    }
  });
};

$(window).resize(function() {
  if (typeof OverLayerStatus != 'undefined' && OverLayerStatus != 0) {
    OverLayer.resize($('#checkout_layer'));
  }
});

$(window).bind("scroll", function() {
  if (typeof OverLayerStatus != 'undefined' && OverLayerStatus != 0) {
    OverLayer.resize($('#checkout_layer'));
  }
});

// ================================
//         SEARCH PANEL PART
// ================================

var PanelNavigator = {

  focusToCatg: function(lastSelectedCatgId) {
    PanelNavigator.focusToEntity('categ_link_', lastSelectedCatgId);
  },

  focusToBrand: function(lastSelectedBrandId) {
    PanelNavigator.focusToEntity('brand_link_', lastSelectedBrandId);
  },

  focusToEntity: function(entityPrefixId, entityId) {

    var brand = $('#' + entityPrefixId + entityId);
    var linkName = brand.attr('name');
    var elementToFocusIdx = parseInt(linkName.substr(11, linkName.length - 1)) + 10;
    var findElements = document.getElementsByName(entityPrefixId + elementToFocusIdx);
    if (findElements.length == 0) {
      $('#' + entityPrefixId + 'last').focus();
    } else {
      findElements[0].focus();
    }
  }
};

function validateSeoPage() {
  var splitUrl = window.location.pathname.split('/');

  for (var i = 0; i < splitUrl.length; i++) {
    if (splitUrl[i] == 'shop') {
      return true;
    }
  }
  return false;
}

function submitSearch() {

  setSubmitCookie();

  var url = catalogSearchURL();

  //alert(url);

  if (url != null) {
    window.location.href = url;
  } else {
    $("#searchForm").submit();
  }
}

function catalogSearchURL() {

  try {

    var urlParametresBuffer = [];
    var nextPage = "1";
    // TODO we should check whether selCamp == sale_camp - or only one campaign possible ??
    if (!SearchPanel.ignoreAll) {

      var firstEntity = true;
      var saleAdded = false;
      var saleInput = document.getElementById("sale_camp");

      $('input:checkbox[name=selCamps]:checked').each(function() {

        var camp = $(this).data('name');

        if (!saleInput.checked && (camp == 'deadcheap' || camp == 'DEADCHEAP' || camp == 'sale' || camp == 'promos')) {
          console.log('disable sale campaign');
        } else {
          if (firstEntity) {
            urlParametresBuffer.push('/');
          } else {
            urlParametresBuffer.push(',');
          }
          firstEntity = false;

          var campName = $(this).data('name');
          urlParametresBuffer.push(campName);

          if (campName == 'sale' || campName == 'promos') {
            saleAdded = true;
          }
        }
      });

      if (saleInput.checked && !saleAdded) {
        var saleCamp = $('#sale_camp').val();
        if (firstEntity) {
          urlParametresBuffer.push('/');
        } else if (urlParametresBuffer.length > 0) {
          urlParametresBuffer.push(',');
        }

        urlParametresBuffer.push(saleCamp);
        console.log('enable sale: ' + saleCamp);
      }

      if (!SearchPanel.ignoreBrands) {
        firstEntity = true;
        $('input:checkbox[name=selBrands]:checked').each(function() {
          if (firstEntity) urlParametresBuffer.push('/');
          else urlParametresBuffer.push(',');
          firstEntity = false;
          urlParametresBuffer.push($(this).data('name'));
        });
      }

      firstEntity = true;
      if (!SearchPanel.ignoreGenders) {
        $('input:checkbox[name=selGenders]:checked').each(function() {
          if (firstEntity) urlParametresBuffer.push('/');
          else urlParametresBuffer.push(',');
          firstEntity = false;
          urlParametresBuffer.push($(this).data('name'));
        });
      }

      if (!SearchPanel.ignoreTopCategories) {
        firstEntity = true;
        var catgMap = {};
        $('input:checkbox[name=selTopCatgs]:checked').each(function() {
          var catgName = $(this).data('name');
          if (!(catgName in catgMap)) {
            catgMap[catgName] = catgName;
            if (firstEntity) urlParametresBuffer.push('/');
            else urlParametresBuffer.push(',');
            firstEntity = false;
            urlParametresBuffer.push(catgName);
          }
        });
      }

      if (!SearchPanel.ignoreSubCategories) {
        firstEntity = true;
        var catgMap = {};
        $('input:checkbox[name=selSecLvlcatgs]:checked').each(function() {
          var catgName = $(this).data('name');
          if (!(catgName in catgMap)) {
            catgMap[catgName] = catgName;
            if (firstEntity) urlParametresBuffer.push('/');
            else urlParametresBuffer.push(',');
            firstEntity = false;
            urlParametresBuffer.push(catgName);
          }
        });
      }

      // SIZES
      if (!SearchPanel.ignoreSizes) {
        var shoeSizeBuffer = [];
        $('input:checkbox[name=selShoeSizes]:checked').each(function() {
          if (shoeSizeBuffer.length > 0) {
            shoeSizeBuffer.push(',');
          }
          shoeSizeBuffer.push($(this).val());
        });
        if (shoeSizeBuffer.length > 0) {
          urlParametresBuffer.push('/');
          urlParametresBuffer.push($('#shoeSizeName').val());
          urlParametresBuffer.push('/');

          var strSizes = shoeSizeBuffer.join('');
          strSizes = strSizes.replace(/ /g, '-');
          strSizes = strSizes.replace(/\//g, ':');

          urlParametresBuffer.push(strSizes);
        }

        var clotingSizeBuffer = [];
        $('input:checkbox[name=selClothesSizes]:checked').each(function() {
          if (clotingSizeBuffer.length > 0) {
            clotingSizeBuffer.push(',');
          }
          clotingSizeBuffer.push($(this).val());
        });
        if (clotingSizeBuffer.length > 0) {
          urlParametresBuffer.push('/');
          urlParametresBuffer.push($('#clothesSizeName').val());
          urlParametresBuffer.push('/');

          var strSizes = clotingSizeBuffer.join('');
          strSizes = strSizes.replace(/ /g, '-');
          strSizes = strSizes.replace(/\//g, ':');

          urlParametresBuffer.push(strSizes);
        }

        var accsSizeBuffer = [];
        $('input:checkbox[name=selAccessoriesSizes]:checked').each(function() {
          if (accsSizeBuffer.length > 0) {
            accsSizeBuffer.push(',');
          }
          accsSizeBuffer.push($(this).val());
        });
        if (accsSizeBuffer.length > 0) {
          urlParametresBuffer.push('/');
          urlParametresBuffer.push($('#accessoriesSizeName').val());
          urlParametresBuffer.push('/');

          var strSizes = accsSizeBuffer.join('');
          strSizes = strSizes.replace(/ /g, '-');
          strSizes = strSizes.replace(/\//g, ':');

          urlParametresBuffer.push(strSizes);
        }

        var stuffSizeBuffer = [];
        $('input:checkbox[name=selStuffSizes]:checked').each(function() {
          if (stuffSizeBuffer.length > 0) {
            stuffSizeBuffer.push(',');
          }
          stuffSizeBuffer.push($(this).val());
        });
        if (stuffSizeBuffer.length > 0) {
          urlParametresBuffer.push('/');
          urlParametresBuffer.push($('#stuffSizeName').val());
          urlParametresBuffer.push('/');

          var strSizes = stuffSizeBuffer.join('');
          strSizes = strSizes.replace(/ /g, '-');
          strSizes = strSizes.replace(/\//g, ':');

          urlParametresBuffer.push(strSizes);
        }
      }

      // COLOURS
      if (!SearchPanel.ignoreColors) {
        firstEntity = true;
        $('input:checkbox[name=selColors]:checked').each(function() {
          if (firstEntity) urlParametresBuffer.push('/');
          else urlParametresBuffer.push(',');
          firstEntity = false;
          urlParametresBuffer.push($(this).data('name'));
        });
      }

      // PRICE RANGE
      if (!SearchPanel.ignorePrice) {
        var priceSetByUser = $("#priceSetByUser").val() == "true";
        if (priceSetByUser) {
          var priceLow = $('#amount').val();
          var priceHigh = $('#amount2').val();
          var maxPrice = $('#topLimitDoublePrice').val();

          var dotIdx = maxPrice.indexOf("\.");
          if (dotIdx != -1) {
            maxPrice = maxPrice.slice(0, dotIdx);
          }
          var altCurrency = $('#altCurrency').val();

          urlParametresBuffer.push('/');
          urlParametresBuffer.push($('#priceName').val());
          urlParametresBuffer.push('/');

          if (altCurrency != null && altCurrency != '') {
            urlParametresBuffer.push(altCurrency);
            urlParametresBuffer.push('/');
          }

          urlParametresBuffer.push(priceLow);
          urlParametresBuffer.push('-');
          urlParametresBuffer.push(priceHigh);
          urlParametresBuffer.push('-');
          urlParametresBuffer.push(maxPrice);
        }
      }

      // FULL TEXT
      var fulltext = $('#queryString').val();
      if (fulltext != null && fulltext != '' && fulltext != ', ') {
        urlParametresBuffer.push('/fulltext/');
        urlParametresBuffer.push(fulltext.replace(/ /g, '+'));
      }

      // SORTING
      var sorting = $('#pageSorting').val();
      if (sorting != null && sorting != '' && sorting != 'DATE_ADDED') {
        urlParametresBuffer.push('/');
        urlParametresBuffer.push(sorting);
      }

      // SIZE UNIT
      var sizeUnitSetByUser = $("#sizeUnitSetByUser").val() == "true";
      if (sizeUnitSetByUser) {
        var sizeUnit = $('select[name="selectedSizeUnitValue"]').val();
        urlParametresBuffer.push('/');
        urlParametresBuffer.push(sizeUnit);
      }

      nextPage = $("#currentPage").val();
    }

    var urlBuffer = [];
    if (seoPageSorting && validateSeoPage()) {
      var seoCatalogUrl = window.location.href.split('?');
      urlBuffer.push(seoCatalogUrl[0]);
      urlParametresBuffer.length = 0;
      if (sorting != null && sorting != '') {
        urlParametresBuffer.push('?sortBy=');
        urlParametresBuffer.push(sorting);
      }
      urlBuffer.push(urlParametresBuffer.join(''));

    } else {
      urlBuffer.push($('#protocolDomain').val());
      urlBuffer.push('/');
      urlBuffer.push($('#context').val());

      if (urlParametresBuffer.length > 0) {
        urlParametresBuffer.push('/');
        urlParametresBuffer.push('c');
        urlBuffer.push(urlParametresBuffer.join(''));
      } else {
        urlBuffer.push('/catalog/search');
      }
    }

    var url = urlBuffer.join('');

    if (nextPage != '1') {
      if (!validateSeoPage() || urlParametresBuffer.length == 0) {
        url += "?selectedPage=" + nextPage;
      } else {
        url += "&selectedPage=" + nextPage;
      }
    }

    seoPageSorting = false;

    //        console.log(url);
    //        alert(url);
    //        url = encodeURI(url);

    return url;

  } catch (err) {

    return null;
  }

}

function setSubmitCookie() {

  var nastaveni = {
    path: '/',
    expiresAt: new Date(),
    secure: false
  };

  var today = new Date();
  nastaveni.expiresAt.setTime(today.getTime() + 10000);
  $.cookie("cookie_form_submited", "true", nastaveni);
}

var SearchPanel = {

  ignoreGenders: false,
  ignoreTopCategories: false,
  ignoreSizes: false,
  ignoreSubCategories: false,
  ignoreColors: false,
  ignoreBrands: false,
  ignorePrice: false,
  ignoreAll: false,

  resetPrice: function() {
    $("#priceSetByUser").val("false");
    $("#filterReset").val("PRICE");
    $("#searchForm").submit();

    SearchPanel.ignorePrice = true;
    submitSearch();
  },
  resetBrands: function() {
    $("#filterReset").val("BRAND");
    $("#lastBrand").val("");

    SearchPanel.ignoreBrands = true;
    submitSearch();
  },
  resetSubcategories: function() {
    $("#filterReset").val("CATEGORY");
    $("#lastCatg").val("");

    SearchPanel.ignoreSubCategories = true;
    submitSearch();
  },
  resetCategories: function() {
    $("#filterReset").val("TOPCATEGORY");

    SearchPanel.ignoreTopCategories = true;
    submitSearch();
  },
  resetCategoryTree: function() {
    $("#filterReset").val("ALL");
    //        $("#filterReset").val("CATEGORY_TREE");

    SearchPanel.ignoreGenders = true;
    SearchPanel.ignoreTopCategories = true;
    SearchPanel.ignoreSubCategories = true;
    $('#sale_camp').removeAttr('checked');

    submitSearch();
  },
  resetAll: function() {
    SearchPanel.ignoreAll = true;
    submitSearch();

    /*
    $("#priceSetByUser").val("false");
    $("#lastBrand").val("");
    $("#lastCatg").val("");
    $("#filterReset").val("ALL");
    $("#searchForm").submit();
    */
  },
  setSize: function(sizeId) {
    $("#sizeId").val(sizeId);
    submitSearch();
  },
  resetSize: function(sizeId) {
    $("#filterReset").val("SIZE");

    SearchPanel.ignoreSizes = true;
    submitSearch();
  },
  resetColor: function() {
    $("#filterReset").val("COLOR");

    SearchPanel.ignoreColors = true;
    submitSearch();
  }
};

var inProgress = false;
var topAfterAnim = 0;

var ProdList = {

  animateDown: function(pageCount) {
    if (!inProgress) {
      inProgress = true;
      var pageNum = parseInt(pageCount);
      var slider = $('.brandographyTextSlider');

      if ((topAfterAnim / 69) < pageNum) {
        topAfterAnim = topAfterAnim + 69;
        slider.animate({
          top: '-=69px'
        }, 'fast'); // 128 original value
      }
      inProgress = false;
    }
  },

  animateUp: function() {
    if (!inProgress) {
      inProgress = true;
      var slider = $('.brandographyTextSlider');
      if ((topAfterAnim / 69) > 0) {
        topAfterAnim = topAfterAnim - 69;
        slider.animate({
          top: '+=69px'
        }, 'fast');
      }
      inProgress = false;
    }
  }
};

var KickzHelper = {

  sendQuestion: function() {

    $("#emailInfoMessage").hide();
    $("#emailErrorMessage").hide();

    var user_name = $('#contact_name').val();
    var user_email = $('#contact_email').val();
    var topic = $('#contact_topics').val();
    var question = $('#contact_message').val();
    var subj = $('#contact_subject').val();

    if (question == '' || topic == 'null') {
      return;
    }

    var whoToSend = (topic.indexOf("@") != -1) ? topic : $('#input-' + topic).val();

    //        alert("whoToSend = " + whoToSend + ", subj = " + subj);

    var regExp1 = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
    if (regExp1.test(user_email)) {

      var mail = {
        "name": user_name,
        "email": user_email,
        "question": question,
        "whoToSend": whoToSend,
        "subject": subj
      };

      jQuery.ajax({
        url: 'support/askQuestion',
        data: mail,
        success: function(response) {
          if (response == "ok") {
            location.href = "support/static/faq-contact?email=send";
          } else {
            $('#emailErrorMessage').show('fast');
          }
        },
        error: function() {
          $('#emailErrorMessage').show('fast');
        }
      });

    } else {
      // missing data
      $("#emailErrorMessage").show('fast');
    }

  }
};

function setFilterElement(name) {
  $("#filterElement").val(name);

  if ('PRICE' == name) {
    // if price has changed, notify the e-tracker
    var currentLowPrice = parseInt($("#amount").val());
    var currentHighPrice = parseInt($("#amount2").val());
    var maxPrice = $('#topLimitDoublePrice').val();
    var origLowPrice = parseInt($("#origLowPrice").val());
    var origHighPrice = parseInt($("#origHighPrice").val());

    if (currentLowPrice <= currentHighPrice && currentHighPrice <= maxPrice) {
      $("#priceSetByUser").val("true");
      if (typeof ET_Event !== 'undefined') {
        if (currentLowPrice > origLowPrice) {
          ET_Event.eventStart('Catalog%20Filter', 'Minimalpreis', 'Herauf%20geregelt');
        }
        if (currentHighPrice < origHighPrice) {
          ET_Event.eventStart('Catalog%20Filter', 'Maximalpreis', 'Herunter%20geregelt');
        }
      }
      submitSearch();
    } else {
      $("#error-label").error();
      $("#priceSetByUser").val("false");
    }
  } else {
    submitSearch();
  }
}

function checkChange(id, parentIdsArray, leaf, lvl) {

  $("#currentPage").val("1");
  var input = document.getElementById(id);

  var leafOrIgnore = leaf === undefined || leaf == true;

  if (input.checked && leafOrIgnore) {
    input.checked = '';
  } else {

    var topCatgSel = lvl !== undefined && lvl == 1;

    if (input.checked && topCatgSel) {
      SearchPanel.ignoreSubCategories = true;
      input.checked = '';
    } else {
      input.checked = 'checked';
    }

    if (parentIdsArray !== undefined && parentIdsArray != null) {
      for (var idx in parentIdsArray) {
        var parentId = parentIdsArray[idx];
        $('#' + parentId).prop('checked', true);
      }
    }

    $('._mt_' + id).find('input').prop('checked', false);
  }

  // trigger original onclick event on checkbox/radiobutton itself:
  var callFce = input.getAttribute("alt");
  if (callFce != null) {
    eval(callFce);
    //        alert(callFce);
  }
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none';
}

String.prototype.startsWith = function(str) {
  return (this.match("^" + str) == str);
};

function reduceList(input) {

  var name = input.value.toLowerCase();

  var brandInputs = document.getElementsByName("selBrands");

  for (var i = 0; i < brandInputs.length; i++) {
    var brandInput = brandInputs[i];
    var brandPanel = brandInput.parentNode;

    if (brandInput.title.startsWith(name)) {
      brandPanel.style.display = '';
    } else {
      brandPanel.style.display = 'none';
    }
  }
}

function showAll(input) {

  input.value = '';

  var brandInputs = document.getElementsByName("selBrands");

  for (var i = 0; i < brandInputs.length; i++) {
    var brandInput = brandInputs[i];
    var brandPanel = brandInput.parentNode;

    if (brandInput.title.startsWith(name)) {
      brandPanel.style.display = '';
    } else {
      brandPanel.style.display = 'none';
    }
  }
}

function enterCheck(e) {
  var keynum;

  if (window.event) {
    keynum = e.keyCode; // IE8 and earlier
  } else if (e.which) {
    keynum = e.which; // IE9/Firefox/Chrome/Opera/Safari
  }

  return keynum == 13;
}

//function for mini details page
function imgNotExist(img) {
  img.style.display = 'none';
}

function miniDetails(erpNumber) {
  $.floatbox({
    content: '',
    boxConfig: {
      width: '570px',
      zIndex: 9999
    },
    ajax: {
      url: 'catalog/productpopup?erpNumber=' + erpNumber,
      before: "<p><img src='../css/images/loader.gif' /></p>",
      finish: function(response) {
        var isFailed = response['errorMessages'];
        if (isFailed) {
          $('#floatbox-box').hide();
          $('#floatbox-background').hide();
        } else {
          $('#floatbox-box').append(response);
          $("#angleLink1").addClass("chooseColorLinkSelected");
        }
      }
    },
    fade: true
  });
}

function escapeHtmlEntities(str) {

  if (typeof jQuery !== 'undefined') {
    return jQuery('<div/>').text(str).html();
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

function getParameterByName(name) {

  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);

  var paramValue = results == null ? "" : results[1];
  finalRes = decodeURIComponent(paramValue);
  var finalRes = escapeHtmlEntities(finalRes);
  return finalRes;
}

function toggleBuyButton(selected) {

  var selected = $('#Agree').is(':checked');

  if (selected) {
    $('#payment_submit_btn').removeAttr('disabled');
  } else {
    $('#payment_submit_btn').attr('disabled', 'true');
  }
}

function labelForAgreeBlink() {
  var selected = $('#Agree').is(':checked');
  if (!selected) {
    $('#labelForAgree').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
  }
}

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] || o[this.name] == '') {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

var overlay = document.getElementById('overlay');
window.addEventListener('scroll', function(e) {

  if (!overlay) {
    overlay = document.getElementById('overlay');
  }
  var windowWidth = $(window).width();

  if (windowWidth < 768 && overlay) {
    overlay.style.position = 'absolute';
    overlay.style.left = window.pageXOffset + 'px';
    overlay.style.bottom = document.documentElement.clientHeight - (window.pageYOffset + window.innerHeight) + 'px';
    overlay.style["-webkit-transform"] = "scale(" + window.innerWidth / document.documentElement.clientWidth + ")";

    var navBarInverse = $('.navbar-inverse');
    var contentContainerNo3 = $('#contentContainerNo3');
    var reportScale = document.documentElement.clientWidth / window.innerWidth;
    if (reportScale > 1.3) {
      //zoomed in the page. Remove the attribute
      $(navBarInverse).css("position", "relative");
      $(contentContainerNo3).attr('style', 'margin-top: 70px !important');
    } else {
      $(navBarInverse).css("position", "fixed");
      // $(contentContainerNo3).attr('style', 'margin-top: 112px !important');
    }
  }

});

$(function() {
  $("#cookiePolicyBtn").on('click', function(e) {
    $('#cookiePolicyContainer').hide();
    $.cookie('kickz_visited', 'true', {
      path: '/',
      expires: 365 * 10
    });
  });

  $(document).ready(function() {
    var visited = $.cookie('kickz_visited');
    var lastProds = $.cookie('Usertype');
    //alert('visited: ' + visited);
    if (typeof lastProds === 'undefined' && typeof visited === 'undefined') {
      $('#cookiePolicyContainer').show();
    }
  });
});

var expandCollapse = function() {
  if ($(window).width() > 640) {
    $('#btn-action-filter').hide();
    doCloseFilter();
    displayFilterButton();
  } else {
    $('#btn-action-filter').show();
    displayFilterButton();
  }
}
$(window).resize(expandCollapse);

function displayFilterButton() {
  var filterChecked = $("#filterElement").val();

  if (filterChecked != null) {
    var splitPathName = window.location.pathname.split('/');
    if (filterChecked.length > 0 && splitPathName.length > 5) {
      $("#btn-action-filter").removeClass('btn-filter-in-active');
      $("#btn-action-filter").addClass('btn-filter-active');
    } else {
      $("#btn-action-filter").removeClass('btn-filter-active');
      $("#btn-action-filter").addClass('btn-filter-in-active');
    }
  }
}

function doFilter() {
  $("#btn-action-filter").removeClass('btn-filter-in-active');
  $("#btn-action-filter").addClass('btn-filter-active');
  $("#search_facets").css("display", "block");
}

function doCloseFilter() {
  $("#search_facets").css("display", "none");
}

function escapeHtml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) {
    return map[m];
  });
}

$(document).ready(function() {
  displayFilterButton();

  $('#search_facets').scroll(function() {
    if ($('#search_facets').scrollTop() != 0) {
      $('#btn-back-to-top').fadeIn();
    } else {
      $('#btn-back-to-top').fadeOut();
    }
  });

  $('#btn-back-to-top').click(function() {
    $('#search_facets').animate({
      scrollTop: 0
    }, 600);
    return false;
  });

  if ($(window).width() >= 768) {
    var soldOutMarkerSmallChecked = $(".soldOutMarkerSmall").val();
    if (soldOutMarkerSmallChecked != null) {
      $('.soldOutMarkerSmall').hide();
    }
  }
});

//---------------------------------------------------------
// KX-4611 Checkout: Address Page - Change Data Input Logic
//---------------------------------------------------------
function updateOptionFieldsIcon() {
  var optionFieldsIcon = $('#additional-information-icon');
  var newIcon = optionFieldsIcon.text() === '+' ? '-' : '+';
  optionFieldsIcon.text(newIcon);
}
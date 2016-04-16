/**********************
   Velocity UI Pack
**********************/

/* VelocityJS.org UI Pack (5.0.4). (C) 2014 Julian Shapiro. MIT @license: en.wikipedia.org/wiki/MIT_License. Portions copyright Daniel Eden, Christian Pucci. */

;(function (factory) {
    /* CommonJS module. */
    if (typeof require === "function" && typeof exports === "object" ) {
        module.exports = factory();
    /* AMD module. */
    } else if (typeof define === "function" && define.amd) {
        define([ "velocity" ], factory);
    /* Browser globals. */
    } else {
        factory();
    }
}(function() {
return function (global, window, document, undefined) {

    /*************
        Checks
    *************/

    if (!global.Velocity || !global.Velocity.Utilities) {
        window.console && console.log("Velocity UI Pack: Velocity must be loaded first. Aborting.");
        return;
    } else {
        var Velocity = global.Velocity,
            $ = Velocity.Utilities;
    }

    var velocityVersion = Velocity.version,
        requiredVersion = { major: 1, minor: 1, patch: 0 };

    function greaterSemver (primary, secondary) {
        var versionInts = [];

        if (!primary || !secondary) { return false; }

        $.each([ primary, secondary ], function(i, versionObject) {
            var versionIntsComponents = [];

            $.each(versionObject, function(component, value) {
                while (value.toString().length < 5) {
                    value = "0" + value;
                }
                versionIntsComponents.push(value);
            });

            versionInts.push(versionIntsComponents.join(""))
        });

        return (parseFloat(versionInts[0]) > parseFloat(versionInts[1]));
    }

    if (greaterSemver(requiredVersion, velocityVersion)){
        var abortError = "Velocity UI Pack: You need to update Velocity (jquery.velocity.js) to a newer version. Visit http://github.com/julianshapiro/velocity.";
        alert(abortError);
        throw new Error(abortError);
    }

    /************************
       Effect Registration
    ************************/

    /* Note: RegisterUI is a legacy name. */
    Velocity.RegisterEffect = Velocity.RegisterUI = function (effectName, properties) {
        /* Animate the expansion/contraction of the elements' parent's height for In/Out effects. */
        function animateParentHeight (elements, direction, totalDuration, stagger) {
            var totalHeightDelta = 0,
                parentNode;

            /* Sum the total height (including padding and margin) of all targeted elements. */
            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                if (stagger) {
                    /* Increase the totalDuration by the successive delay amounts produced by the stagger option. */
                    totalDuration += i * stagger;
                }

                parentNode = element.parentNode;

                $.each([ "height", "paddingTop", "paddingBottom", "marginTop", "marginBottom"], function(i, property) {
                    totalHeightDelta += parseFloat(Velocity.CSS.getPropertyValue(element, property));
                });
            });

            /* Animate the parent element's height adjustment (with a varying duration multiplier for aesthetic benefits). */
            Velocity.animate(
                parentNode,
                { height: (direction === "In" ? "+" : "-") + "=" + totalHeightDelta },
                { queue: false, easing: "ease-in-out", duration: totalDuration * (direction === "In" ? 0.6 : 1) }
            );
        }

        /* Register a custom redirect for each effect. */
        Velocity.Redirects[effectName] = function (element, redirectOptions, elementsIndex, elementsSize, elements, promiseData) {
            var finalElement = (elementsIndex === elementsSize - 1);

            if (typeof properties.defaultDuration === "function") {
                properties.defaultDuration = properties.defaultDuration.call(elements, elements);
            } else {
                properties.defaultDuration = parseFloat(properties.defaultDuration);
            }

            /* Iterate through each effect's call array. */
            for (var callIndex = 0; callIndex < properties.calls.length; callIndex++) {
                var call = properties.calls[callIndex],
                    propertyMap = call[0],
                    redirectDuration = (redirectOptions.duration || properties.defaultDuration || 1000),
                    durationPercentage = call[1],
                    callOptions = call[2] || {},
                    opts = {};

                /* Assign the whitelisted per-call options. */
                opts.duration = redirectDuration * (durationPercentage || 1);
                opts.queue = redirectOptions.queue || "";
                opts.easing = callOptions.easing || "ease";
                opts.delay = parseFloat(callOptions.delay) || 0;
                opts._cacheValues = callOptions._cacheValues || true;

                /* Special processing for the first effect call. */
                if (callIndex === 0) {
                    /* If a delay was passed into the redirect, combine it with the first call's delay. */
                    opts.delay += (parseFloat(redirectOptions.delay) || 0);

                    if (elementsIndex === 0) {
                        opts.begin = function() {
                            /* Only trigger a begin callback on the first effect call with the first element in the set. */
                            redirectOptions.begin && redirectOptions.begin.call(elements, elements);

                            var direction = effectName.match(/(In|Out)$/);

                            /* Make "in" transitioning elements invisible immediately so that there's no FOUC between now
                               and the first RAF tick. */
                            if ((direction && direction[0] === "In") && propertyMap.opacity !== undefined) {
                                $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                    Velocity.CSS.setPropertyValue(element, "opacity", 0);
                                });
                            }

                            /* Only trigger animateParentHeight() if we're using an In/Out transition. */
                            if (redirectOptions.animateParentHeight && direction) {
                                animateParentHeight(elements, direction[0], redirectDuration + opts.delay, redirectOptions.stagger);
                            }
                        }
                    }

                    /* If the user isn't overriding the display option, default to "auto" for "In"-suffixed transitions. */
                    if (redirectOptions.display !== null) {
                        if (redirectOptions.display !== undefined && redirectOptions.display !== "none") {
                            opts.display = redirectOptions.display;
                        } else if (/In$/.test(effectName)) {
                            /* Inline elements cannot be subjected to transforms, so we switch them to inline-block. */
                            var defaultDisplay = Velocity.CSS.Values.getDisplayType(element);
                            opts.display = (defaultDisplay === "inline") ? "inline-block" : defaultDisplay;
                        }
                    }

                    if (redirectOptions.visibility && redirectOptions.visibility !== "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                /* Special processing for the last effect call. */
                if (callIndex === properties.calls.length - 1) {
                    /* Append promise resolving onto the user's redirect callback. */
                    function injectFinalCallbacks () {
                        if ((redirectOptions.display === undefined || redirectOptions.display === "none") && /Out$/.test(effectName)) {
                            $.each(elements.nodeType ? [ elements ] : elements, function(i, element) {
                                Velocity.CSS.setPropertyValue(element, "display", "none");
                            });
                        }

                        redirectOptions.complete && redirectOptions.complete.call(elements, elements);

                        if (promiseData) {
                            promiseData.resolver(elements || element);
                        }
                    }

                    opts.complete = function() {
                        if (properties.reset) {
                            for (var resetProperty in properties.reset) {
                                var resetValue = properties.reset[resetProperty];

                                /* Format each non-array value in the reset property map to [ value, value ] so that changes apply
                                   immediately and DOM querying is avoided (via forcefeeding). */
                                /* Note: Don't forcefeed hooks, otherwise their hook roots will be defaulted to their null values. */
                                if (Velocity.CSS.Hooks.registered[resetProperty] === undefined && (typeof resetValue === "string" || typeof resetValue === "number")) {
                                    properties.reset[resetProperty] = [ properties.reset[resetProperty], properties.reset[resetProperty] ];
                                }
                            }

                            /* So that the reset values are applied instantly upon the next rAF tick, use a zero duration and parallel queueing. */
                            var resetOptions = { duration: 0, queue: false };

                            /* Since the reset option uses up the complete callback, we trigger the user's complete callback at the end of ours. */
                            if (finalElement) {
                                resetOptions.complete = injectFinalCallbacks;
                            }

                            Velocity.animate(element, properties.reset, resetOptions);
                        /* Only trigger the user's complete callback on the last effect call with the last element in the set. */
                        } else if (finalElement) {
                            injectFinalCallbacks();
                        }
                    };

                    if (redirectOptions.visibility === "hidden") {
                        opts.visibility = redirectOptions.visibility;
                    }
                }

                Velocity.animate(element, propertyMap, opts);
            }
        };

        /* Return the Velocity object so that RegisterUI calls can be chained. */
        return Velocity;
    };

    /*********************
       Packaged Effects
    *********************/

    /* Externalize the packagedEffects data so that they can optionally be modified and re-registered. */
    /* Support: <=ie8: 0="" 1="" 3="" 5="" 10="" 11="" 15="" 20="" 25="" 30="" 55="" 75="" 90="" 160="" 180="" 400="" 800="" 1000="" 1250="" 2000="" callouts="" will="" have="" no="" effect,="" and="" transitions="" simply="" fade="" in="" out.="" ie9="" android="" 2.3:="" most="" effects="" are="" fully="" supported,="" the="" rest="" all="" other="" browsers:="" full="" support.="" *="" velocity.registereffect.packagedeffects="{" animate.css="" "callout.bounce":="" {="" defaultduration:="" 550,="" calls:="" [="" translatey:="" -30="" },="" 0.25="" ],="" 0.125="" -15="" ]="" "callout.shake":="" 800,="" translatex:="" -11="" "callout.flash":="" 1100,="" opacity:="" 0,="" "easeinoutquad",="" 1,="" "easeinoutquad"="" "callout.pulse":="" 825,="" scalex:="" 1.1,="" scaley:="" 1.1="" 0.50,="" easing:="" "easeinexpo"="" }="" 0.50="" "callout.swing":="" 950,="" rotatez:="" 0.20="" -10="" -5="" "callout.tada":="" 1000,="" 0.9,="" -3="" 0.10="" "reverse",="" "transition.fadein":="" 500,="" "transition.fadeout":="" support:="" loses="" rotation="" 2.3="" (fades="" only).="" "transition.flipxin":="" 700,="" transformperspective:="" rotatey:="" -55="" reset:="" "transition.flipxout":="" "transition.flipyin":="" rotatex:="" -45="" "transition.flipyout":="" "transition.flipbouncexin":="" 900,="" 0.725,="" 400,="" -10,="" 0.80,="" "transition.flipbouncexout":="" "transition.flipbounceyin":="" 850,="" "transition.flipbounceyout":="" magic.css="" "transition.swoopin":="" transformoriginx:="" "100%",="" "50%"="" transformoriginy:="" "100%"="" -700="" translatez:="" "50%",="" "transition.swoopout":="" -700,="" 2.3.="" scales="" only.)="" "transition.whirlin":="" "easeinoutsine"="" "transition.whirlout":="" 750,="" "easeinoutquint",="" "swing"="" "transition.shrinkin":="" 1.5="" "transition.shrinkout":="" 600,="" 1.3,="" "transition.expandin":="" 0.625="" "transition.expandout":="" 0.5,="" "transition.bouncein":="" 1.05,="" 0.3="" 0.40="" "transition.bounceout":="" 0.95,="" 0.95="" 0.35="" 0.3,="" 0.30="" "transition.bounceupin":="" -30,="" 0.60,="" "easeoutcirc"="" "transition.bounceupout":="" "easeincirc",="" -1000="" 0.80="" "transition.bouncedownin":="" 30,="" "transition.bouncedownout":="" -20="" "transition.bounceleftin":="" -1250="" "transition.bounceleftout":="" "transition.bouncerightin":="" "transition.bouncerightout":="" "transition.slideupin":="" "transition.slideupout":="" -20,="" "transition.slidedownin":="" "transition.slidedownout":="" 20,="" "transition.slideleftin":="" "transition.slideleftout":="" 1050,="" "transition.sliderightin":="" "transition.sliderightout":="" "transition.slideupbigin":="" "transition.slideupbigout":="" -75,="" "transition.slidedownbigin":="" -75="" "transition.slidedownbigout":="" 75,="" "transition.slideleftbigin":="" "transition.slideleftbigout":="" "transition.sliderightbigin":="" "transition.sliderightbigout":="" "transition.perspectiveupin":="" -180="" "transition.perspectiveupout":="" "transition.perspectivedownin":="" "transition.perspectivedownout":="" "transition.perspectiveleftin":="" 2000,="" "transition.perspectiveleftout":="" "transition.perspectiverightin":="" "transition.perspectiverightout":="" };="" register="" packaged="" effects.="" for="" (var="" effectname="" velocity.registereffect.packagedeffects)="" velocity.registereffect(effectname,="" velocity.registereffect.packagedeffects[effectname]);="" *********************="" sequence="" running="" **********************="" note:="" calls="" must="" use="" velocity's="" single-object="" arguments="" syntax.="" velocity.runsequence="function" (originalsequence)="" var="" [],="" originalsequence);="" if="" (sequence.length=""> 1) {
            $.each(sequence.reverse(), function(i, currentCall) {
                var nextCall = sequence[i + 1];

                if (nextCall) {
                    /* Parallel sequence calls (indicated via sequenceQueue:false) are triggered
                       in the previous call's begin callback. Otherwise, chained calls are normally triggered
                       in the previous call's complete callback. */
                    var currentCallOptions = currentCall.o || currentCall.options,
                        nextCallOptions = nextCall.o || nextCall.options;

                    var timing = (currentCallOptions && currentCallOptions.sequenceQueue === false) ? "begin" : "complete",
                        callbackOriginal = nextCallOptions && nextCallOptions[timing],
                        options = {};

                    options[timing] = function() {
                        var nextCallElements = nextCall.e || nextCall.elements;
                        var elements = nextCallElements.nodeType ? [ nextCallElements ] : nextCallElements;

                        callbackOriginal && callbackOriginal.call(elements, elements);
                        Velocity(currentCall);
                    }

                    if (nextCall.o) {
                        nextCall.o = $.extend({}, nextCallOptions, options);
                    } else {
                        nextCall.options = $.extend({}, nextCallOptions, options);
                    }
                }
            });

            sequence.reverse();
        }

        Velocity(sequence[0]);
    };
}((window.jQuery || window.Zepto || window), window, document);
}));</=ie8:>
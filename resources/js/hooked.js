
var pages, timerTick, baseTickTimer, tickDecayTrigger, timerHalt, hookedEngineTimeout

//Hook engine if off by default
var hookEngineRunning = false

$(document).ready(function(){
    //$(".x-inner:not('.x-tabbar-inner')").css("background-color", "white")
    //$(".x-inner.x-tabbar-inner").css("background-color", "#374274")
    //$(".x-inner.x-toolbar-inner").css("background-color", "#374274")
    initVariables()
    console.log("App Hooked")
    console.log("Starting to look for page hook")    
    //start check for page hook engine
    hookCheckEngine(function(){
        //register observers
        registerListeners()
    })
})

function initVariables(){
    pages = []
    timerTick = 0
    baseTickTimer = 500
    tickDecayTrigger = 60
    timerHalt = 85
}

var pageHookElement = function(){
    return $(".hook")
} 

function hookCheckEngine(cb) {
    hookEngineRunning = true
    checkIfOnHooked(function(pageHooks){
        //detected page hook, lets get hook details
        calculateCurrentPages(pageHooks, function(){
            resetTick()            
            console.log("On hooked pages():", pages)
            return cb()
        })        
    })
}

//reset tick 
function resetTick(){
    //clear timeout for good measure
    clearTimeout(hookedEngineTimeout)
    //hooks detected, lets stop engine now
    hookEngineRunning = false
    //reset ticks
    timerTick = 0
}

function checkIfOnHooked(cb) {
    //bail
    checkForHaltCondition(function(halted){
        if (halted) {
            console.log("Giving up after ", timerTick ,"ticks")
            return cb(pageHookElement())
        } 
        //pause a half beat
        hookedEngineTimeout = 
            setTimeout(function(){
                //check if on a hooked page
                onHookedPage(function(onHooked){            
                    //hook detected, call engine callback method
                    if (onHooked) {                
                        return cb(pageHookElement())
                    } 
                    //fallthrough no hook detected, retrigger
                    return checkIfOnHooked(cb)
                })
            }, throttledTimer())
    })    
}

function throttledTimer() {
    timerTick++
    var timer = baseTickTimer
    if (timerTick >= tickDecayTrigger) {        
        timer = timer * (timerTick  - tickDecayTrigger)
    }
    //console.log("throttled timer tick", timerTick, "timer", timer)
    return timer
}
function checkForHaltCondition(cb){
    return cb(timerTick >= timerHalt)
}

function onHookedPage(cb) {
    //simple check to see if any hook element is visible
    var hooked = pageHookElement().is(":visible")
    console.log("Hook found?", hooked)
    return cb(hooked)
}

function filterOnlyVisible(elements){
    var filtered = elements.filter(
        function(index){
            return $(elements[index]).is(":visible") == true
        })
    return filtered
}

//parse hooked elements for data
function calculateCurrentPages(pageHooks, cb){
    pageHooks = filterOnlyVisible(pageHooks)
    var arrayLength = pageHooks.length
    //clear out previously parsed data
    pages = []
    //loop over element list
    for (var i = 0; i < arrayLength; i++) {
        var pageValue = pageHooks[i].getAttribute("data-page")
        //add to collection for use elsewhere
        pages[i] = {hook: pageHooks[i], page: pageValue}
        console.log("(DEBUG)", "page:", i, "is", pageValue)
    }
    return cb()
}

function registerListeners(){
    //content changed hook check
    console.log("Registered event listeners")
    var targetNodes         = $(".x-container")
    var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver
    var myObserver          = new MutationObserver (mutationHandler)
    var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true }
    //--- Add a target node to the observer. Can only add one node at a time.
    targetNodes.each (function () {
        myObserver.observe (this, obsConfig)
    })
    function mutationHandler (mutationRecords) {
        fireContentChangedHookCheck()
    }
}

function fireContentChangedHookCheck() {

    //if decay has been triggered reset
    if (timerTick > tickDecayTrigger) {
        console.log("decay triggered, lets reset to allow a new fast hook check")
        resetTick()        
    }

    //only start engine
    if (!hookEngineRunning) {
        console.log("safe to start content changed hook engine")
        hookCheckEngine(function(){
            console.log("Hook check complete")
        })
    }
}
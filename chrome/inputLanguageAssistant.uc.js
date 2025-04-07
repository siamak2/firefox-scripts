// ==UserScript==
// @name            Input Language Assistant
// @author          siamak2
// @onlyonce
// ==/UserScript==

// based on https://addons.mozilla.org/en-us/firefox/addon/input-language-assistant/

UC.inputLanguageAssistant =
{

Windows:
{
    init: function()
    {
        //console.log("Windows.init()\n");
        try
        {
            this.lib = ctypes.open("user32.dll");
            this.ActivateKeyboardLayout = this.lib.declare("ActivateKeyboardLayout",
                                                           ctypes.winapi_abi,
                                                           ctypes.voidptr_t,  // return HKL
                                                           ctypes.voidptr_t,  // HKL hkl
                                                           ctypes.uint32_t);  // UINT Flags
            this.KLF_SETFORPROCESS = 0x00000100;
            this.HKL_ENGLISH = ctypes.voidptr_t(0x00000409); // United States (US)
            return true;
        }
        catch (err)
        {
            //console.log(err + "\n");
            this.uninit();
            return false;
        }
    },
    
    uninit: function()
    {
        //console.log("Windows.uninit()\n");
        try
        {
            if (this.lib)
            {
                this.lib.close();
            }
        }
        catch (err)
        {
            //console.log(err + "\n");
        }
    },

    focus: function()
    {
        //console.log("Windows.focus()\n");
        try
        {
            if (this.ActivateKeyboardLayout)
            {
                this.hkl = this.ActivateKeyboardLayout(this.HKL_ENGLISH, this.KLF_SETFORPROCESS);
            }
        }
        catch (err)
        {
            //console.log(err + "\n");
        }
    },

    blur: function()
    {
        //console.log("Windows.blur()\n");
        try
        {
            if (this.ActivateKeyboardLayout && this.hkl)
            {
                this.ActivateKeyboardLayout(this.hkl, this.KLF_SETFORPROCESS);
            }
        }
        catch (err)
        {
            //console.log(err + "\n");
        }
    }
}, // Windows

MacOS:
{
//    CoreFoundation:
//    {
//        init: function()
//        {
//            console.log("MacOS.CoreFoundation.init()\n");
//            this.lib = ctypes.open("/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation");

//            this.CFStringRef = new ctypes.StructType("CFString").ptr;
//            this.CFStringGetLength = this.lib.declare("CFStringGetLength",
//                                                      ctypes.default_abi,
//                                                      ctypes.int32_t,
//                                                      this.CFStringRef);
//            this.CFStringGetCharacterAtIndex = this.lib.declare("CFStringGetCharacterAtIndex",
//                                                          ctypes.default_abi,
//                                                          ctypes.jschar,
//                                                          this.CFStringRef,
//                                                          ctypes.long);
//        },
//        
//        uninit: function()
//        {
//            console.log("MacOS.CoreFoundation.uninit()\n");
//            try
//            {
//                if (this.lib)
//                {
//                    this.lib.close();
//                }
//            }
//            catch (err)
//            {
//                console.log(err + "\n");
//            }
//        },

//        CFStringToJSString: function(cfstr)
//        {
//            try
//            {
//                var len = this.CFStringGetLength(cfstr);
//                var str = "";
//                for (var i = 0; i < len; i++)
//                {
//                    str += this.CFStringGetCharacterAtIndex(cfstr, i);
//                }
//                return str;
//            }
//            catch (err)
//            {
//                console.log(err + "\n");
//            }
//        }
//    }, // CoreFoundation
    
    HIToolbox:
    {
        init: function(CoreFoundation)
        {
            //console.log("MacOS.HIToolbox.init()\n");
            this.lib = ctypes.open("/System/Library/Frameworks/Carbon.framework/Frameworks/HIToolbox.framework/HIToolbox");
            this.TISInputSourceRef = new ctypes.StructType("TISInputSource").ptr;
            this.TISCopyCurrentASCIICapableKeyboardInputSource = this.lib.declare("TISCopyCurrentASCIICapableKeyboardInputSource",  
                                                                                  ctypes.default_abi,  
                                                                                  this.TISInputSourceRef);
            this.TISCopyCurrentKeyboardInputSource = this.lib.declare("TISCopyCurrentKeyboardInputSource",  
                                                                      ctypes.default_abi,  
                                                                      this.TISInputSourceRef);
            this.TISSelectInputSource = this.lib.declare("TISSelectInputSource",
                                                         ctypes.default_abi,  
                                                         ctypes.int32_t,
                                                         this.TISInputSourceRef);
//            this.TISGetInputSourceProperty = this.lib.declare("TISGetInputSourceProperty",
//                                                              ctypes.default_abi,  
//                                                              ctypes.voidptr_t,
//                                                              this.TISInputSourceRef,
//                                                              CoreFoundation.CFStringRef);
//            this.kTISPropertyInputSourceID = this.lib.declare("kTISPropertyInputSourceID",
//                                                              CoreFoundation.CFStringRef);
        },
    
        uninit: function()
        {
            //console.log("MacOS.HIToolbox.uninit()\n");
            try
            {
                if (this.lib)
                {
                    this.lib.close();
                }
            }
            catch (err)
            {
                //console.log(err + "\n");
            }
        }
    }, // HIToolbox

    init: function()
    {
        //console.log("MacOS.init()\n");
        try
        {
            //this.CoreFoundation.init();
            this.HIToolbox.init(this.CoreFoundation);
            this.asciiSource = this.HIToolbox.TISCopyCurrentASCIICapableKeyboardInputSource();
            //var id = ctypes.cast(this.HIToolbox.TISGetInputSourceProperty(this.englishSource, this.HIToolbox.kTISPropertyInputSourceID), this.CoreFoundation.CFStringRef);
            //console.log("ASCII source: " + this.CoreFoundation.CFStringToJSString(id) + "\n");
            return true;
        }
        catch (err)
        {
            //console.log(err + "\n");
            this.uninit();
            return false;
        }
    },
    
    uninit: function()
    {
        //console.log("MacOS.uninit()\n");
        this.HIToolbox.uninit();
        //this.CoreFoundation.uninit();
    },

    focus: function()
    {
        //console.log("MacOS.focus()\n");
        try
        {
            this.currentSource = this.HIToolbox.TISCopyCurrentKeyboardInputSource();
            //var id = ctypes.cast(this.HIToolbox.TISGetInputSourceProperty(this.currentSource, this.HIToolbox.kTISPropertyInputSourceID), this.CoreFoundation.CFStringRef);
            //console.log("Current source: " + this.CoreFoundation.CFStringToJSString(id) + "\n");
            if (this.asciiSource)
            {
                this.HIToolbox.TISSelectInputSource(this.asciiSource);
            }
//            var ptr = this.HIToolbox.TISGetInputSourceProperty(src, this.HIToolbox.kTISPropertyInputSourceLanguages);
//            console.log("ptr: " + ptr + "\n");
//            var arr = ctypes.cast(ptr, this.CoreFoundation.CFArrayRef);
//            console.log("arr: " + arr + "\n");
//            var count = this.CoreFoundation.CFArrayGetCount(arr);
//            console.log("count: " + count + "\n");
//            for (var i = 0; i < count; i++)
//            {
//                var val = this.CoreFoundation.CFArrayGetValueAtIndex(arr, i);
//                var cfstr = ctypes.cast(val, this.CoreFoundation.CFStringRef);
//                var jsstr = this.CoreFoundation.CFStringToJSString(cfstr);
//                console.log("arr[" + i + "]: " + jsstr + "\n");
//            }
        }
        catch (err)
        {
            //console.log(err + "\n");
        }
    },

    blur: function()
    {
        //console.log("MacOS.blur()\n");
        try
        {
            if (this.currentSource)
            {
                this.HIToolbox.TISSelectInputSource(this.currentSource);
            }
        }
        catch (err)
        {
            //console.log(err + "\n");
        }
    }
}, // MacOS

init: function ()
{
    try
    {
        //console.log("init\n");
        //console.log("platform: " + window.navigator.platform + "\n");

        Components.utils.import("resource://gre/modules/ctypes.jsm");

        if (this.Windows.init())
        {
            this.engine = this.Windows;
        }
        else if (this.MacOS.init())
        {
            this.engine = this.MacOS;
        }
        else
        {
            //console.log("Unsupported platform: " + window.navigator.platform + "\n");
            alert("Unsupported platform: " + window.navigator.platform);
            return;
        }

        var urlbar = window.document.getElementById('urlbar-input');
        if (urlbar)
        {
            urlbar.addEventListener("focus", function() { UC.inputLanguageAssistant.focus(); }, false);
            urlbar.addEventListener("blur", function() { UC.inputLanguageAssistant.blur(); }, false);
        }
    }
    catch (err)
    {
        //console.log(err + "\n");
    }
},

uninit: function ()
{
    //console.log("uninit\n");
    try
    {
        if (this.engine)
        {
            this.engine.uninit();
        }
    }
    catch (err)
    {
        //console.log(err + "\n");
    }
},

focus: function ()
{
    //console.log("focus\n");
    try
    {
        if (this.engine)
        {
            this.engine.focus();
        }
    }
    catch (err)
    {
        //console.log(err + "\n");
    }
},

blur: function ()
{
    //console.log("blur\n");
    try
    {
        if (this.engine)
        {
            this.engine.blur();
        }
    }
    catch (err)
    {
        //console.log(err + "\n");
    }
}

} // UC.inputLanguageAssistant

window.addEventListener("load", function() { UC.inputLanguageAssistant.init(); }, false);
window.addEventListener("unload", function() { UC.inputLanguageAssistant.uninit(); }, false);

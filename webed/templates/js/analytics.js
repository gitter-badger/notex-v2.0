var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-6838945-8']);
_gaq.push(['_setDomainName', 'notex.ch']);
_gaq.push(['_trackPageview']);

function ga_init () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == document.location.protocol
        ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
}